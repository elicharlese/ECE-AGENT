export type UserTier = 'personal' | 'team' | 'enterprise'

export interface UserTierLimits {
  maxAgents: number
  maxConversations: number
  maxMessagesPerDay: number
  maxFileUploads: number
  maxFileSize: number // in MB
  customModels: boolean
  apiAccess: boolean
  prioritySupport: boolean
  sharedWorkspaces: boolean
  teamCollaboration: boolean
  customRateLimit?: number // requests per minute
  customLLMEndpoints: boolean
}

export interface UserProfile {
  id: string
  email: string
  name: string
  tier: UserTier
  createdAt: string
  updatedAt: string
  limits: UserTierLimits
  usage: UserUsage
  teamId?: string
  organizationId?: string
}

export interface UserUsage {
  agentsCreated: number
  conversationsToday: number
  messagesThisMonth: number
  filesUploaded: number
  apiCallsThisMonth: number
  lastActive: string
}

export interface TeamProfile {
  id: string
  name: string
  description?: string
  ownerId: string
  members: TeamMember[]
  sharedResources: SharedResource[]
  settings: TeamSettings
  createdAt: string
  updatedAt: string
}

export interface TeamMember {
  userId: string
  email: string
  name: string
  role: 'owner' | 'admin' | 'member'
  joinedAt: string
  permissions: TeamPermission[]
}

export interface TeamPermission {
  resource: 'agents' | 'models' | 'meetings' | 'settings'
  actions: ('create' | 'read' | 'update' | 'delete')[]
}

export interface SharedResource {
  id: string
  type: 'agent' | 'model' | 'tool' | 'template'
  name: string
  description?: string
  createdBy: string
  sharedWith: string[] // user IDs
  permissions: ResourcePermission[]
}

export interface ResourcePermission {
  userId: string
  actions: ('use' | 'modify' | 'share')[]
}

export interface TeamSettings {
  allowMemberInvites: boolean
  requireApprovalForSharing: boolean
  defaultPermissions: TeamPermission[]
  meetingIntegration: boolean
}

export interface EnterpriseProfile extends TeamProfile {
  customRateLimit: number
  customLLMEndpoints: LLMEndpoint[]
  dedicatedSupport: boolean
  slaAgreement?: string
  billingContact: string
  technicalContact: string
}

export interface LLMEndpoint {
  id: string
  name: string
  endpoint: string
  apiKey: string
  model: string
  provider: 'openai' | 'anthropic' | 'custom'
  isActive: boolean
  rateLimitOverride?: number
}

export const TIER_LIMITS: Record<UserTier, UserTierLimits> = {
  personal: {
    maxAgents: 3,
    maxConversations: 50,
    maxMessagesPerDay: 100,
    maxFileUploads: 10,
    maxFileSize: 5,
    customModels: false,
    apiAccess: false,
    prioritySupport: false,
    sharedWorkspaces: false,
    teamCollaboration: false,
    customLLMEndpoints: false
  },
  team: {
    maxAgents: 25,
    maxConversations: 500,
    maxMessagesPerDay: 1000,
    maxFileUploads: 100,
    maxFileSize: 25,
    customModels: true,
    apiAccess: true,
    prioritySupport: true,
    sharedWorkspaces: true,
    teamCollaboration: true,
    customLLMEndpoints: false
  },
  enterprise: {
    maxAgents: -1, // unlimited
    maxConversations: -1,
    maxMessagesPerDay: -1,
    maxFileUploads: -1,
    maxFileSize: 100,
    customModels: true,
    apiAccess: true,
    prioritySupport: true,
    sharedWorkspaces: true,
    teamCollaboration: true,
    customRateLimit: 1000,
    customLLMEndpoints: true
  }
}
