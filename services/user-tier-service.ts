import { supabase } from '@/lib/supabase/client'
import { UserProfile, TeamProfile, EnterpriseProfile, UserTier, TIER_LIMITS, TeamMember, SharedResource, CustomLLMEndpoint } from '@/src/types/user-tiers'
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

  async createUserProfile(userId: string, tier: UserTier = 'personal'): Promise<UserProfile> {
    const baseProfile = await profileService.getProfileByUserId(userId)
    if (!baseProfile) {
      throw new Error('Base profile not found')
    }

    const userProfile: Omit<UserProfile, 'id'> = {
      userId,
      tier,
      limits: TIER_LIMITS[tier],
      usage: {
        messagesUsed: 0,
        agentsCreated: 0,
        storageUsed: 0
      },
      permissions: {
        canCreateAgents: true,
        canShareResources: tier !== 'personal',
        canManageTeam: tier === 'team' || tier === 'enterprise',
        canAccessCustomLLM: tier === 'enterprise',
        canSetRateLimits: tier === 'enterprise'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .insert(userProfile)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create user profile: ${error.message}`)
    }

    return data
  }

  async upgradeTier(userId: string, newTier: UserTier): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        tier: newTier,
        limits: TIER_LIMITS[newTier],
        permissions: {
          canCreateAgents: true,
          canShareResources: newTier !== 'personal',
          canManageTeam: newTier === 'team' || newTier === 'enterprise',
          canAccessCustomLLM: newTier === 'enterprise',
          canSetRateLimits: newTier === 'enterprise'
        },
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
    const teamProfile: Omit<TeamProfile, 'id' | 'members' | 'sharedResources'> = {
      name,
      description,
      ownerId,
      settings: {
        allowInvites: true,
        requireApproval: false,
        defaultRole: 'member'
      },
      billing: {
        plan: 'team',
        seats: 1,
        monthlyUsage: 0,
        billingCycle: 'monthly'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('team_profiles')
      .insert(teamProfile)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create team profile: ${error.message}`)
    }

    // Add owner as admin member
    await this.addTeamMember(data.id, ownerId, 'admin')

    return {
      ...data,
      members: [],
      sharedResources: []
    }
  }

  async addTeamMember(teamId: string, userId: string, role: TeamMember['role'] = 'member'): Promise<TeamMember> {
    const member: Omit<TeamMember, 'id'> = {
      teamId,
      userId,
      role,
      joinedAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('team_members')
      .insert(member)
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
    const resource: Omit<SharedResource, 'id'> = {
      teamId,
      resourceId,
      type: resourceType,
      sharedBy,
      sharedAt: new Date().toISOString(),
      permissions: ['read', 'write']
    }

    const { data, error } = await supabase
      .from('team_shared_resources')
      .insert(resource)
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
    const enterpriseProfile: Omit<EnterpriseProfile, 'id' | 'customLLMEndpoints'> = {
      organizationName,
      ownerId,
      rateLimits: {
        requestsPerMinute: 1000,
        requestsPerHour: 50000,
        requestsPerDay: 1000000,
        customLimits: {}
      },
      billing: {
        plan: 'enterprise',
        monthlySpend: 0,
        billingCycle: 'monthly',
        contractValue: 0
      },
      support: {
        tier: 'dedicated',
        contactEmail: '',
        slackChannel: '',
        dedicatedManager: ''
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('enterprise_profiles')
      .insert(enterpriseProfile)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create enterprise profile: ${error.message}`)
    }

    return {
      ...data,
      customLLMEndpoints: []
    }
  }

  async addCustomLLMEndpoint(enterpriseId: string, endpoint: Omit<CustomLLMEndpoint, 'id' | 'enterpriseId'>): Promise<CustomLLMEndpoint> {
    const llmEndpoint: Omit<CustomLLMEndpoint, 'id'> = {
      ...endpoint,
      enterpriseId,
      createdAt: new Date().toISOString()
    }

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

  async updateRateLimits(enterpriseId: string, rateLimits: EnterpriseProfile['rateLimits']): Promise<void> {
    const { error } = await supabase
      .from('enterprise_profiles')
      .update({
        rateLimits,
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
        if (usage.messagesUsed + amount > limits.maxMessagesPerDay) {
          return { allowed: false, reason: 'Daily message limit exceeded' }
        }
        break
      case 'agent':
        if (usage.agentsCreated + amount > limits.maxAgents) {
          return { allowed: false, reason: 'Agent limit exceeded' }
        }
        break
      case 'storage':
        if (usage.storageUsed + amount > limits.maxFileSize * 1024 * 1024) {
          return { allowed: false, reason: 'Storage limit exceeded' }
        }
        break
    }

    return { allowed: true }
  }

  // Tier Checking Utilities
  async canAccessFeature(userId: string, feature: keyof UserProfile['permissions']): Promise<boolean> {
    const profile = await this.getUserProfile(userId)
    return profile?.permissions[feature] ?? false
  }

  async getUserTier(userId: string): Promise<UserTier | null> {
    const profile = await this.getUserProfile(userId)
    return profile?.tier ?? null
  }
}

export const userTierService = new UserTierService()
