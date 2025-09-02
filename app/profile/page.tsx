"use client"

import { useEffect } from 'react'
import { ProfileManager } from '@/components/profile/ProfileManager'
import { useUserTier } from '@/hooks/use-user-tier'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function ProfilePage() {
  const {
    profile,
    teamProfile,
    enterpriseProfile,
    loading,
    error,
    upgradeTier,
    refreshProfile
  } = useUserTier()

  const handleTierUpgrade = async (newTier: 'personal' | 'team' | 'enterprise') => {
    try {
      await upgradeTier(newTier)
    } catch (error) {
      console.error('Failed to upgrade tier:', error)
    }
  }

  const handleCreateTeam = async (teamName: string) => {
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          name: teamName,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create team')
      }

      await refreshProfile()
    } catch (error) {
      console.error('Failed to create team:', error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading profile...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-500">Error loading profile: {error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p>No profile found. Please try refreshing the page.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Profile Management</h1>
        <p className="text-muted-foreground">
          Manage your account settings, tier, and features
        </p>
      </div>

      <ProfileManager
        currentProfile={profile}
        teamProfile={teamProfile ?? undefined}
        enterpriseProfile={enterpriseProfile ?? undefined}
        onTierUpgrade={handleTierUpgrade}
        onCreateTeam={handleCreateTeam}
      />
    </div>
  )
}
