
export const FEATURES = {
  VIRTUAL_SCROLLING: 'virtual_scrolling',
  E2E_ENCRYPTION: 'e2e_encryption',
  MULTI_AGENT: 'multi_agent',
  ADVANCED_SEARCH: 'advanced_search',
  PERFORMANCE_MONITORING: 'performance_monitoring',
  LAZY_LOADING: 'lazy_loading',
  REALTIME_PRESENCE: 'realtime_presence',
  VOICE_MESSAGES: 'voice_messages',
  FILE_SHARING: 'file_sharing',
  MESSAGE_REACTIONS: 'message_reactions',
} as const

type FeatureFlag = keyof typeof FEATURES

interface FeatureFlagConfig {
  enabled: boolean
  rolloutPercentage?: number
  userGroups?: string[]
  metadata?: Record<string, unknown>
}

class FeatureFlagsManager {
  private static instance: FeatureFlagsManager
  private flags: Map<string, FeatureFlagConfig> = new Map()
  private userId?: string

  private constructor() {
    this.loadFlags()
  }

  static getInstance(): FeatureFlagsManager {
    if (!FeatureFlagsManager.instance) {
      FeatureFlagsManager.instance = new FeatureFlagsManager()
    }
    return FeatureFlagsManager.instance
  }

  private loadFlags() {
    // Load from environment variables for now
    // In production, this would fetch from a feature flag service
    const defaultFlags: Record<string, FeatureFlagConfig> = {
      [FEATURES.VIRTUAL_SCROLLING]: { 
        enabled: process.env.NEXT_PUBLIC_FF_VIRTUAL_SCROLLING === 'true',
        rolloutPercentage: 100 
      },
      [FEATURES.E2E_ENCRYPTION]: { 
        enabled: process.env.NEXT_PUBLIC_FF_E2E_ENCRYPTION === 'true',
        rolloutPercentage: 0 
      },
      [FEATURES.MULTI_AGENT]: { 
        enabled: process.env.NEXT_PUBLIC_FF_MULTI_AGENT === 'true',
        rolloutPercentage: 50 
      },
      [FEATURES.ADVANCED_SEARCH]: { 
        enabled: process.env.NEXT_PUBLIC_FF_ADVANCED_SEARCH === 'true',
        rolloutPercentage: 100 
      },
      [FEATURES.PERFORMANCE_MONITORING]: { 
        enabled: process.env.NEXT_PUBLIC_FF_PERFORMANCE_MONITORING === 'true',
        rolloutPercentage: 100 
      },
      [FEATURES.LAZY_LOADING]: { 
        enabled: true,
        rolloutPercentage: 100 
      },
      [FEATURES.REALTIME_PRESENCE]: { 
        enabled: false,
        rolloutPercentage: 0 
      },
      [FEATURES.VOICE_MESSAGES]: { 
        enabled: false,
        rolloutPercentage: 0 
      },
      [FEATURES.FILE_SHARING]: { 
        enabled: true,
        rolloutPercentage: 100 
      },
      [FEATURES.MESSAGE_REACTIONS]: { 
        enabled: true,
        rolloutPercentage: 100 
      },
    }

    Object.entries(defaultFlags).forEach(([key, config]) => {
      this.flags.set(key, config)
    })
  }

  setUserId(userId: string) {
    this.userId = userId
  }

  isEnabled(feature: string): boolean {
    const config = this.flags.get(feature)
    if (!config || !config.enabled) return false

    // Check rollout percentage
    if (config.rolloutPercentage !== undefined && config.rolloutPercentage < 100) {
      if (!this.userId) return false
      
      // Simple hash-based rollout
      const hash = this.hashString(this.userId + feature)
      const percentage = (hash % 100) + 1
      return percentage <= config.rolloutPercentage
    }

    return true
  }

  private hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  async updateFlag(feature: string, config: Partial<FeatureFlagConfig>) {
    const existing = this.flags.get(feature) || { enabled: false }
    this.flags.set(feature, { ...existing, ...config })
  }

  getAllFlags(): Record<string, FeatureFlagConfig> {
    const result: Record<string, FeatureFlagConfig> = {}
    this.flags.forEach((value, key) => {
      result[key] = value
    })
    return result
  }
}

// Export singleton instance methods
const manager = FeatureFlagsManager.getInstance()

export function isFeatureEnabled(feature: string): boolean {
  return manager.isEnabled(feature)
}

export function setFeatureFlagUserId(userId: string) {
  manager.setUserId(userId)
}

export function getAllFeatureFlags() {
  return manager.getAllFlags()
}

export async function updateFeatureFlag(feature: string, config: Partial<FeatureFlagConfig>) {
  return manager.updateFlag(feature, config)
}
