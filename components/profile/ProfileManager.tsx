"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Users, Building2, Crown, ArrowRight, Check } from 'lucide-react'
import { PersonalProfile } from './PersonalProfile'
import { TeamProfile } from './TeamProfile'
import { EnterpriseProfile } from './EnterpriseProfile'
import { UserProfile, TeamProfile as TeamProfileType, EnterpriseProfile as EnterpriseProfileType, UserTier, TIER_LIMITS } from '@/src/types/user-tiers'

interface ProfileManagerProps {
  currentProfile: UserProfile
  teamProfile?: TeamProfileType
  enterpriseProfile?: EnterpriseProfileType
  onTierUpgrade?: (newTier: UserTier) => void
  onCreateTeam?: (teamName: string) => void
}

export function ProfileManager({ 
  currentProfile, 
  teamProfile, 
  enterpriseProfile,
  onTierUpgrade,
  onCreateTeam 
}: ProfileManagerProps) {
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [selectedTier, setSelectedTier] = useState<UserTier>('team')

  const handleUpgrade = () => {
    if (onTierUpgrade) {
      onTierUpgrade(selectedTier)
      setShowUpgradeDialog(false)
    }
  }

  const getTierIcon = (tier: UserTier) => {
    switch (tier) {
      case 'personal': return <User className="h-4 w-4" />
      case 'team': return <Users className="h-4 w-4" />
      case 'enterprise': return <Building2 className="h-4 w-4" />
    }
  }

  const getTierColor = (tier: UserTier) => {
    switch (tier) {
      case 'personal': return 'bg-blue-500'
      case 'team': return 'bg-green-500'
      case 'enterprise': return 'bg-gradient-to-r from-purple-500 to-pink-500'
    }
  }

  const getPricingInfo = (tier: UserTier) => {
    switch (tier) {
      case 'personal': return { price: 'Free', period: '' }
      case 'team': return { price: '$29', period: '/month per user' }
      case 'enterprise': return { price: 'Custom', period: '/month' }
    }
  }

  const renderCurrentProfile = () => {
    if (currentProfile.tier === 'enterprise' && enterpriseProfile) {
      return (
        <EnterpriseProfile 
          profile={enterpriseProfile}
          currentUserId={currentProfile.id}
        />
      )
    }
    
    if (currentProfile.tier === 'team' && teamProfile) {
      return (
        <TeamProfile 
          profile={teamProfile}
          currentUserId={currentProfile.id}
        />
      )
    }
    
    return (
      <PersonalProfile 
        profile={currentProfile}
        onUpgrade={() => setShowUpgradeDialog(true)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Tier Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={currentProfile.tier} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal" className="gap-2">
                <User className="h-4 w-4" />
                Personal
              </TabsTrigger>
              <TabsTrigger value="team" className="gap-2" disabled={!teamProfile}>
                <Users className="h-4 w-4" />
                Team
              </TabsTrigger>
              <TabsTrigger value="enterprise" className="gap-2" disabled={!enterpriseProfile}>
                <Building2 className="h-4 w-4" />
                Enterprise
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Current Profile Content */}
      {renderCurrentProfile()}

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Upgrade Your Plan</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Personal Plan */}
            <Card className={`relative ${currentProfile.tier === 'personal' ? 'ring-2 ring-blue-500' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg bg-blue-500 text-white`}>
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Personal</h3>
                      <p className="text-sm text-muted-foreground">For individuals</p>
                    </div>
                  </div>
                  {currentProfile.tier === 'personal' && (
                    <Badge variant="default">Current</Badge>
                  )}
                </div>
                <div className="text-2xl font-bold">Free</div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{TIER_LIMITS.personal.maxAgents} AI Agents</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{TIER_LIMITS.personal.maxMessagesPerDay} messages/day</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{TIER_LIMITS.personal.maxFileSize}MB file uploads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Basic support</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Plan */}
            <Card className={`relative ${selectedTier === 'team' ? 'ring-2 ring-green-500' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg bg-green-500 text-white`}>
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Team</h3>
                      <p className="text-sm text-muted-foreground">For small teams</p>
                    </div>
                  </div>
                  {currentProfile.tier === 'team' && (
                    <Badge variant="default">Current</Badge>
                  )}
                </div>
                <div className="text-2xl font-bold">$29<span className="text-sm font-normal">/month per user</span></div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{TIER_LIMITS.team.maxAgents} AI Agents</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{TIER_LIMITS.team.maxMessagesPerDay} messages/day</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Shared workspaces</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Team collaboration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Custom models</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Priority support</span>
                  </div>
                </div>
                {currentProfile.tier === 'personal' && (
                  <Button 
                    className="w-full" 
                    onClick={() => setSelectedTier('team')}
                    variant={selectedTier === 'team' ? 'default' : 'outline'}
                  >
                    {selectedTier === 'team' ? 'Selected' : 'Select Team'}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className={`relative ${selectedTier === 'enterprise' ? 'ring-2 ring-purple-500' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white`}>
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Enterprise</h3>
                      <p className="text-sm text-muted-foreground">For large organizations</p>
                    </div>
                  </div>
                  {currentProfile.tier === 'enterprise' && (
                    <Badge variant="default">Current</Badge>
                  )}
                </div>
                <div className="text-2xl font-bold">Custom<span className="text-sm font-normal">/month</span></div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Unlimited everything</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Custom rate limits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Custom LLM endpoints</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Dedicated support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>SLA guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Custom integrations</span>
                  </div>
                </div>
                {currentProfile.tier !== 'enterprise' && (
                  <Button 
                    className="w-full" 
                    onClick={() => setSelectedTier('enterprise')}
                    variant={selectedTier === 'enterprise' ? 'default' : 'outline'}
                  >
                    {selectedTier === 'enterprise' ? 'Selected' : 'Contact Sales'}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {currentProfile.tier === 'personal' && (
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpgrade} className="gap-2">
                Upgrade to {selectedTier}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
