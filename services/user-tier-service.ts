import { supabase as browserSupabase } from '@/lib/supabase/client'
import { UserProfile, TeamProfile, EnterpriseProfile, UserTier, TIER_LIMITS, TeamMember, SharedResource, LLMEndpoint } from '@/src/types/user-tiers'
import { profileService } from './profile-service'

export class UserTierService {
  constructor(private sb: any) {}
  // User Profile Management
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data: row, error } = await this.sb
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        if ((error as any)?.code === 'PGRST116') return null
        throw error
      }

      if (!row) return null

      // Map DB row -> domain shape with sane defaults
      const base = await profileService.getProfileByUserId(userId, this.sb)
      const tier = (row as any).tier as UserTier
      const limits = {
        ...TIER_LIMITS[tier],
        ...((row as any).limits ?? {}),
      }
      const u = (row as any).usage ?? {}
      const usage = {
        agentsCreated: u.agentsCreated ?? 0,
        conversationsToday: u.conversationsToday ?? 0,
        messagesThisMonth: u.messagesThisMonth ?? 0,
        filesUploaded: u.filesUploaded ?? 0,
        apiCallsThisMonth: u.apiCallsThisMonth ?? 0,
        lastActive: u.lastActive ?? new Date().toISOString(),
      }

      const profile: UserProfile = {
        id: userId,
        email: '',
        name: base?.full_name ?? base?.username ?? '',
        tier,
        createdAt: (row as any).created_at ?? new Date().toISOString(),
        updatedAt: (row as any).updated_at ?? new Date().toISOString(),
        limits,
        usage,
        teamId: (row as any).team_id ?? undefined,
        organizationId: (row as any).organization_id ?? undefined,
      }

      return profile
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  // TODO: Add input validation for userId and tier parameters
  // TODO: Add better error handling for edge cases
  // TODO: Ensure email is properly populated from baseProfile
  async createUserProfile(userId: string, tier: UserTier = 'personal'): Promise<UserProfile> {
    const baseProfile = await profileService.getProfileByUserId(userId, this.sb)
    if (!baseProfile) {
      throw new Error('Base profile not found')
    }

    // Only insert columns that exist in the DB
    const usage = {
      agentsCreated: 0,
      conversationsToday: 0,
      messagesThisMonth: 0,
      filesUploaded: 0,
      apiCallsThisMonth: 0,
      lastActive: new Date().toISOString(),
    }

    const insertRow: any = {
      user_id: userId,
      tier,
      limits: TIER_LIMITS[tier],
      usage,
    }

    const { data: row, error } = await this.sb
      .from('user_profiles')
      .insert(insertRow)
      .select('*')
      .single()

    if (error) {
      throw new Error(`Failed to create user profile: ${error.message}`)
    }

    // Map to domain
    const profile: UserProfile = {
      id: userId,
      email: '',
      name: baseProfile.full_name ?? baseProfile.username ?? '',
      tier,
      createdAt: (row as any).created_at ?? new Date().toISOString(),
      updatedAt: (row as any).updated_at ?? new Date().toISOString(),
      limits: { ...TIER_LIMITS[tier] },
      usage,
    }

    return profile
  }

  async upgradeTier(userId: string, newTier: UserTier): Promise<UserProfile> {
    const baseProfile = await profileService.getProfileByUserId(userId, this.sb)
    const { data: row, error } = await this.sb
      .from('user_profiles')
      .update({
        tier: newTier,
        limits: TIER_LIMITS[newTier],
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select('*')
      .single()

    if (error) {
      throw new Error(`Failed to upgrade tier: ${error.message}`)
    }

    // Map to domain
    return {
      id: userId,
      email: '',
      name: baseProfile?.full_name ?? baseProfile?.username ?? '',
      tier: newTier,
      createdAt: (row as any).created_at ?? new Date().toISOString(),
      updatedAt: (row as any).updated_at ?? new Date().toISOString(),
      limits: { ...TIER_LIMITS[newTier] },
      usage: (row as any).usage ?? {
        agentsCreated: 0,
        conversationsToday: 0,
        messagesThisMonth: 0,
        filesUploaded: 0,
        apiCallsThisMonth: 0,
        lastActive: new Date().toISOString(),
      },
    }
  }

  async updateUsage(userId: string, usage: Partial<UserProfile['usage']>): Promise<void> {
    const { data: row } = await this.sb
      .from('user_profiles')
      .select('usage')
      .eq('user_id', userId)
      .maybeSingle()

    const current = (row as any)?.usage ?? {}
    const next = { ...current, ...usage }

    const { error } = await this.sb
      .from('user_profiles')
      .update({
        usage: next,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to update usage: ${error.message}`)
    }
  }

  // Team Profile Management
  async getTeamProfile(teamId: string): Promise<TeamProfile | null> {
    try {
      const { data, error } = await this.sb
        .from('team_profiles')
        .select(`
          *,
          members:team_members(*),
          shared_resources:team_shared_resources(*)
        `)
        .eq('id', teamId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }

      return data
    } catch (error) {
      console.error('Error fetching team profile:', error)
      return null
    }
  }

  async createTeamProfile(ownerId: string, name: string, description?: string): Promise<TeamProfile> {
    const teamProfileRow: any = {
      name,
      description,
      owner_id: ownerId,
      // keep JSONB fields minimal; DB has defaults
      settings: {
        allowMemberInvites: true,
        requireApprovalForSharing: false,
        defaultPermissions: [],
        meetingIntegration: false,
      },
      billing: {},
    }

    const { data: row, error } = await this.sb
      .from('team_profiles')
      .insert(teamProfileRow)
      .select('*')
      .single()

    if (error) {
      throw new Error(`Failed to create team profile: ${error.message}`)
    }

    // Add owner as admin member
    await this.addTeamMember(row.id, ownerId, 'admin')

    // Map DB row to domain
    const profile: TeamProfile = {
      id: row.id,
      name: row.name,
      description: row.description ?? undefined,
      ownerId: row.owner_id,
      members: [],
      sharedResources: [],
      settings: row.settings ?? {
        allowMemberInvites: true,
        requireApprovalForSharing: false,
        defaultPermissions: [],
        meetingIntegration: false,
      },
      createdAt: row.created_at ?? new Date().toISOString(),
      updatedAt: row.updated_at ?? new Date().toISOString(),
    }

    return profile
  }

  async addTeamMember(teamId: string, userId: string, role: TeamMember['role'] = 'member'): Promise<TeamMember> {
    const memberRow: any = {
      team_id: teamId,
      user_id: userId,
      role,
      joined_at: new Date().toISOString()
    }

    const { data, error } = await this.sb
      .from('team_members')
      .insert(memberRow)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to add team member: ${error.message}`)
    }

    return data
  }

  async removeTeamMember(teamId: string, userId: string): Promise<void> {
    const { error } = await this.sb
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to remove team member: ${error.message}`)
    }
  }

  async shareResource(teamId: string, resourceId: string, resourceType: SharedResource['type'], sharedBy: string): Promise<SharedResource> {
    const resourceRow: any = {
      team_id: teamId,
      resource_id: resourceId,
      type: resourceType,
      shared_by: sharedBy,
      shared_at: new Date().toISOString(),
      permissions: []
    }

    const { data, error } = await this.sb
      .from('team_shared_resources')
      .insert(resourceRow)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to share resource: ${error.message}`)
    }

    return data
  }

  // Enterprise Profile Management
  async getEnterpriseProfile(enterpriseId: string): Promise<EnterpriseProfile | null> {
    try {
      const { data, error } = await this.sb
        .from('enterprise_profiles')
        .select(`
          *,
          custom_llm_endpoints:enterprise_llm_endpoints(*)
        `)
        .eq('id', enterpriseId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }

      return data
    } catch (error) {
      console.error('Error fetching enterprise profile:', error)
      return null
    }
  }

  async createEnterpriseProfile(ownerId: string, organizationName: string): Promise<EnterpriseProfile> {
    const enterpriseProfileRow: any = {
      organization_name: organizationName,
      owner_id: ownerId,
      rate_limits: { rpm: 1000 },
      billing: {},
      support: { dedicatedSupport: true },
    }

    const { data: row, error } = await this.sb
      .from('enterprise_profiles')
      .insert(enterpriseProfileRow)
      .select('*')
      .single()

    if (error) {
      throw new Error(`Failed to create enterprise profile: ${error.message}`)
    }

    // Map to domain EnterpriseProfile
    const enterprise: EnterpriseProfile = {
      id: row.id,
      name: row.organization_name,
      description: row.organization_name,
      ownerId: row.owner_id,
      members: [],
      sharedResources: [],
      settings: {
        allowMemberInvites: true,
        requireApprovalForSharing: false,
        defaultPermissions: [],
        meetingIntegration: true,
      },
      createdAt: row.created_at ?? new Date().toISOString(),
      updatedAt: row.updated_at ?? new Date().toISOString(),
      customRateLimit: (row.rate_limits?.rpm as number) ?? 1000,
      customLLMEndpoints: [],
      dedicatedSupport: !!row.support?.dedicatedSupport,
      slaAgreement: undefined,
      billingContact: '',
      technicalContact: '',
    }

    return enterprise
  }

  async addCustomLLMEndpoint(enterpriseId: string, endpoint: Omit<LLMEndpoint, 'id'>): Promise<LLMEndpoint> {
    // Map domain -> DB columns
    const modelType = `${endpoint.provider}:${endpoint.model}`
    const insertRow: any = {
      enterprise_id: enterpriseId,
      name: endpoint.name,
      endpoint_url: endpoint.endpoint,
      api_key_encrypted: null,
      model_type: modelType,
      rate_limit: endpoint.rateLimitOverride ?? 100,
      is_active: endpoint.isActive,
    }

    const { data: row, error } = await this.sb
      .from('enterprise_llm_endpoints')
      .insert(insertRow)
      .select('*')
      .single()

    if (error) {
      throw new Error(`Failed to add custom LLM endpoint: ${error.message}`)
    }

    // Map DB -> domain
    const [prov, mod] = String(row.model_type ?? '').split(':') as [LLMEndpoint['provider'], string]
    const mapped: LLMEndpoint = {
      id: row.id,
      name: row.name,
      endpoint: row.endpoint_url,
      apiKey: '',
      model: mod || row.model_type,
      provider: (prov as any) || 'custom',
      isActive: !!row.is_active,
      rateLimitOverride: row.rate_limit ?? undefined,
    }
    return mapped
  }

  async updateRateLimits(enterpriseId: string, customRateLimit: number): Promise<void> {
    const { error } = await this.sb
      .from('enterprise_profiles')
      .update({
        rate_limits: { rpm: customRateLimit },
        updated_at: new Date().toISOString(),
      })
      .eq('id', enterpriseId)

    if (error) {
      throw new Error(`Failed to update rate limits: ${error.message}`)
    }
  }

  // Usage Validation
  async validateUsage(userId: string, action: 'message' | 'agent' | 'storage', amount: number = 1): Promise<{ allowed: boolean; reason?: string }> {
    const profile = await this.getUserProfile(userId)
    if (!profile) {
      return { allowed: false, reason: 'Profile not found' }
    }

    const { limits, usage } = profile

    switch (action) {
      case 'message':
        if (usage.messagesThisMonth + amount > limits.maxMessagesPerDay) {
          return { allowed: false, reason: 'Daily message limit exceeded' }
        }
        break
      case 'agent':
        if (usage.agentsCreated + amount > limits.maxAgents) {
          return { allowed: false, reason: 'Agent limit exceeded' }
        }
        break
      case 'storage':
        // Approximate: track by files uploaded
        if (usage.filesUploaded + amount > limits.maxFileUploads) {
          return { allowed: false, reason: 'File upload limit exceeded' }
        }
        break
    }

    return { allowed: true }
  }

  // Tier Checking Utilities
  async canAccessFeature(_userId: string, _feature: string): Promise<boolean> {
    // Permissions not modeled on UserProfile; always return false for now
    return false
  }

  async getUserTier(userId: string): Promise<UserTier | null> {
    const profile = await this.getUserProfile(userId)
    return profile?.tier ?? null
  }
}

export const createUserTierService = (sb: any) => new UserTierService(sb)
export const userTierService = new UserTierService(browserSupabase)
