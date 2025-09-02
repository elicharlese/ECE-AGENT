import { useState, useEffect } from 'react'
import { UserProfile, TeamProfile, EnterpriseProfile, UserTier } from '@/src/types/user-tiers'

interface UseUserTierReturn {
  profile: UserProfile | null
  teamProfile: TeamProfile | null
  enterpriseProfile: EnterpriseProfile | null
  loading: boolean
  error: string | null
  upgradeTier: (tier: UserTier) => Promise<void>
  updateUsage: (usage: Partial<UserProfile['usage']>) => Promise<void>
  validateUsage: (action: 'message' | 'agent' | 'storage', amount?: number) => Promise<{ allowed: boolean; reason?: string }>
  refreshProfile: () => Promise<void>
}

export function useUserTier(): UseUserTierReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [teamProfile, setTeamProfile] = useState<TeamProfile | null>(null)
  const [enterpriseProfile, setEnterpriseProfile] = useState<EnterpriseProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/user-tiers')
      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }

      const data = await response.json()
      setProfile(data.profile)

      // Fetch team profile if user has team tier
      if (data.profile?.tier === 'team') {
        const teamsResponse = await fetch('/api/teams')
        if (teamsResponse.ok) {
          const teamsData = await teamsResponse.json()
          if (teamsData.teams && teamsData.teams.length > 0) {
            // Get the first team profile (user could be in multiple teams)
            const teamId = teamsData.teams[0].team_id
            const teamResponse = await fetch(`/api/teams?teamId=${teamId}`)
            if (teamResponse.ok) {
              const teamData = await teamResponse.json()
              setTeamProfile(teamData.team)
            }
          }
        }
      }

      // Fetch enterprise profile if user has enterprise tier
      if (data.profile?.tier === 'enterprise') {
        const enterpriseResponse = await fetch('/api/enterprise')
        if (enterpriseResponse.ok) {
          const enterpriseData = await enterpriseResponse.json()
          setEnterpriseProfile(enterpriseData.enterprise)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const upgradeTier = async (tier: UserTier) => {
    try {
      const response = await fetch('/api/user-tiers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'upgrade',
          tier,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to upgrade tier')
      }

      const data = await response.json()
      setProfile(data.profile)
      
      // Refresh related profiles
      await fetchProfile()
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to upgrade tier')
    }
  }

  const updateUsage = async (usage: Partial<UserProfile['usage']>) => {
    try {
      const response = await fetch('/api/user-tiers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateUsage',
          usage,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update usage')
      }

      // Update local state
      if (profile) {
        setProfile({
          ...profile,
          usage: { ...profile.usage, ...usage }
        })
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update usage')
    }
  }

  const validateUsage = async (action: 'message' | 'agent' | 'storage', amount: number = 1) => {
    try {
      const response = await fetch('/api/user-tiers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'validateUsage',
          actionType: action,
          amount,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to validate usage')
      }

      const data = await response.json()
      return data.validation
    } catch (err) {
      return { allowed: false, reason: 'Validation failed' }
    }
  }

  const refreshProfile = async () => {
    await fetchProfile()
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  return {
    profile,
    teamProfile,
    enterpriseProfile,
    loading,
    error,
    upgradeTier,
    updateUsage,
    validateUsage,
    refreshProfile,
  }
}
