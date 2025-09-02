"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { User, MessageCircle, Bot, Upload, Crown } from 'lucide-react'
import { UserProfile, TIER_LIMITS } from '@/src/types/user-tiers'

interface PersonalProfileProps {
  profile: UserProfile
  onUpgrade?: () => void
}

export function PersonalProfile({ profile, onUpgrade }: PersonalProfileProps) {
  const limits = TIER_LIMITS[profile.tier]
  const usage = profile.usage

  const getUsagePercentage = (current: number, max: number) => {
    if (max === -1) return 0 // unlimited
    return Math.min((current / max) * 100, 100)
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.name}`} />
              <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                {profile.name}
                <Badge variant="secondary" className="capitalize">
                  <User className="h-3 w-3 mr-1" />
                  {profile.tier}
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <p className="text-xs text-muted-foreground">
                Member since {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
            {profile.tier === 'personal' && (
              <Button onClick={onUpgrade} className="gap-2">
                <Crown className="h-4 w-4" />
                Upgrade
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Usage Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Agents */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                AI Agents
              </span>
              <span>{usage.agentsCreated} / {limits.maxAgents === -1 ? '∞' : limits.maxAgents}</span>
            </div>
            <Progress value={getUsagePercentage(usage.agentsCreated, limits.maxAgents)} />
          </div>

          {/* Messages */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Messages Today
              </span>
              <span>{usage.conversationsToday} / {limits.maxMessagesPerDay === -1 ? '∞' : limits.maxMessagesPerDay}</span>
            </div>
            <Progress value={getUsagePercentage(usage.conversationsToday, limits.maxMessagesPerDay)} />
          </div>

          {/* File Uploads */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Files Uploaded
              </span>
              <span>{usage.filesUploaded} / {limits.maxFileUploads === -1 ? '∞' : limits.maxFileUploads}</span>
            </div>
            <Progress value={getUsagePercentage(usage.filesUploaded, limits.maxFileUploads)} />
          </div>
        </CardContent>
      </Card>

      {/* Plan Features */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span>Custom Models</span>
              <Badge variant={limits.customModels ? "default" : "secondary"}>
                {limits.customModels ? "Available" : "Upgrade"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>API Access</span>
              <Badge variant={limits.apiAccess ? "default" : "secondary"}>
                {limits.apiAccess ? "Available" : "Upgrade"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Priority Support</span>
              <Badge variant={limits.prioritySupport ? "default" : "secondary"}>
                {limits.prioritySupport ? "Available" : "Upgrade"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Team Collaboration</span>
              <Badge variant={limits.teamCollaboration ? "default" : "secondary"}>
                {limits.teamCollaboration ? "Available" : "Upgrade"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start">
              <Bot className="h-4 w-4 mr-2" />
              Create Agent
            </Button>
            <Button variant="outline" className="justify-start">
              <MessageCircle className="h-4 w-4 mr-2" />
              New Chat
            </Button>
            <Button variant="outline" className="justify-start">
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </Button>
            <Button variant="outline" className="justify-start" onClick={onUpgrade}>
              <Crown className="h-4 w-4 mr-2" />
              View Plans
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
