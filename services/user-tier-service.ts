import { supabase } from '@/lib/supabase/client'
import { UserProfile, TeamProfile, EnterpriseProfile, UserTier, TIER_LIMITS, TeamMember, SharedResource, LLMEndpoint } from '@/src/types/user-tiers'
import { profileService } from './profile-service'

export class UserTierService {
  // User Profile Management
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }

      return data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  // TODO: Add input validation for userId and tier parameters
  // TODO: Add better error handling for edge cases
  // TODO: Ensure email is properly populated from baseProfile
  async createUserProfile(userId: string, tier: UserTier = 'personal'): Promise<UserProfile> {
    const baseProfile = await profileService.getProfileByUserId(userId)
    if (!baseProfile) {
      throw new Error('Base profile not found')
    }

    // Persist using the DB schema (unknown columns), but return a domain UserProfile
    const userProfileRow: any = {
      id: userId,
      email: '',
      name: baseProfile.full_name ?? baseProfile.username ?? '',
      tier,
      limits: TIER_LIMITS[tier],
      usage: {
        agentsCreated: 0,
        conversationsToday: 0,
        messagesThisMonth: 0,
        filesUploaded: 0,
        apiCallsThisMonth: 0,
        lastActive: new Date().toISOString()
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .insert(userProfileRow)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create user profile: ${error.message}`)
    }

    return (data as unknown) as UserProfile
  }

  async upgradeTier(userId: string, newTier: UserTier): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        tier: newTier,
        limits: TIER_LIMITS[newTier],
        updatedAt: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to upgrade tier: ${error.message}`)
    }

    return data
  }

  async updateUsage(userId: string, usage: Partial<UserProfile['usage']>): Promise<void> {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        usage,
        updatedAt: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      throw new Error(`Failed to update usage: ${error.message}`)
    }
  }

  // Team Profile Management
  async getTeamProfile(teamId: string): Promise<TeamProfile | null> {
    try {
      const { data, error } = await supabase
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
      ownerId,
      settings: {
        allowMemberInvites: true,
        requireApprovalForSharing: false,
        defaultPermissions: [],
        meetingIntegration: false
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('team_profiles')
      .insert(teamProfileRow)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create team profile: ${error.message}`)
    }

    // Add owner as admin member
    await this.addTeamMember(data.id, ownerId, 'admin')

    return ({
      ...data,
      members: [],
      sharedResources: []
    } as unknown) as TeamProfile
  }

  async addTeamMember(teamId: string, userId: string, role: TeamMember['role'] = 'member'): Promise<TeamMember> {
    const memberRow: any = {
      team_id: teamId,
      user_id: userId,
      role,
      joined_at: new Date().toISOString()
    }

    const { data, error } = await supabase
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
    const { error } = await supabase
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

    const { data, error } = await supabase
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
      const { data, error } = await supabase
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
      name: organizationName,
      ownerId,
      description: organizationName,
      settings: {
        allowMemberInvites: true,
        requireApprovalForSharing: false,
        defaultPermissions: [],
        meetingIntegration: true
      },
      customRateLimit: 1000,
      dedicatedSupport: true,
      billingContact: '',
      technicalContact: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('enterprise_profiles')
      .insert(enterpriseProfileRow)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create enterprise profile: ${error.message}`)
    }

    return ({
      ...data,
      customLLMEndpoints: []
    } as unknown) as EnterpriseProfile
  }

  async addCustomLLMEndpoint(enterpriseId: string, endpoint: Omit<LLMEndpoint, 'id'>): Promise<LLMEndpoint> {
    // Supabase row may include extra fields like enterpriseId/createdAt which are not part of domain LLMEndpoint
    const llmEndpoint = {
      ...endpoint,
      enterpriseId,
      createdAt: new Date().toISOString()
    } as any

    const { data, error } = await supabase
      .from('enterprise_llm_endpoints')
      .insert(llmEndpoint)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to add custom LLM endpoint: ${error.message}`)
    }

    return data
  }

  async updateRateLimits(enterpriseId: string, customRateLimit: number): Promise<void> {
    const { error } = await supabase
      .from('enterprise_profiles')
      .update({
        customRateLimit,
        updatedAt: new Date().toISOString()
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

export const userTierService = new UserTierService()
