"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Users, 
  Bot, 
  Share2, 
  Calendar, 
  Settings, 
  Plus, 
  Crown,
  Shield,
  UserPlus,
  Trash2,
  Edit
} from 'lucide-react'
import { TeamProfile as TeamProfileType, TeamMember, SharedResource } from '@/src/types/user-tiers'

interface TeamProfileProps {
  profile: TeamProfileType
  currentUserId: string
  onInviteMember?: (email: string, role: string) => void
  onRemoveMember?: (userId: string) => void
  onShareResource?: (resourceId: string, userIds: string[]) => void
  onScheduleMeeting?: () => void
}

export function TeamProfile({ 
  profile, 
  currentUserId, 
  onInviteMember, 
  onRemoveMember, 
  onShareResource,
  onScheduleMeeting 
}: TeamProfileProps) {
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('member')
  const [showInviteDialog, setShowInviteDialog] = useState(false)

  const currentUser = profile.members.find(m => m.userId === currentUserId)
  const isOwnerOrAdmin = currentUser?.role === 'owner' || currentUser?.role === 'admin'

  const handleInvite = () => {
    if (inviteEmail && onInviteMember) {
      onInviteMember(inviteEmail, inviteRole)
      setInviteEmail('')
      setInviteRole('member')
      setShowInviteDialog(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-3 w-3" />
      case 'admin': return <Shield className="h-3 w-3" />
      default: return <Users className="h-3 w-3" />
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* Team Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {profile.name}
                <Badge variant="default">Team</Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{profile.description}</p>
              <p className="text-xs text-muted-foreground">
                Created {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
            {isOwnerOrAdmin && (
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Team Members ({profile.members.length})</CardTitle>
                {isOwnerOrAdmin && (
                  <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Invite Team Member</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="Email address"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                        />
                        <Select value={inviteRole} onValueChange={setInviteRole}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button onClick={handleInvite} className="w-full">
                          Send Invitation
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profile.members.map((member) => (
                  <div key={member.userId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${member.name}`} />
                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="gap-1">
                        {getRoleIcon(member.role)}
                        {member.role}
                      </Badge>
                      {isOwnerOrAdmin && member.userId !== currentUserId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveMember?.(member.userId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Shared Resources ({profile.sharedResources.length})</CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Share Resource
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profile.sharedResources.map((resource) => (
                  <div key={resource.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {resource.type === 'agent' && <Bot className="h-4 w-4" />}
                        {resource.type === 'model' && <Crown className="h-4 w-4" />}
                        {resource.type === 'tool' && <Settings className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium">{resource.name}</p>
                        <p className="text-sm text-muted-foreground">{resource.description}</p>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {resource.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        <Share2 className="h-3 w-3 mr-1" />
                        {resource.sharedWith.length} users
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Meetings Tab */}
        <TabsContent value="meetings" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Team Meetings</CardTitle>
                <Button size="sm" onClick={onScheduleMeeting}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No meetings scheduled</p>
                <p className="text-sm">Schedule your first team meeting to get started</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{profile.members.length}</p>
                    <p className="text-sm text-muted-foreground">Team Members</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{profile.sharedResources.length}</p>
                    <p className="text-sm text-muted-foreground">Shared Resources</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground">Meetings This Week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Team Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Allow member invites</span>
                  <Badge variant={profile.settings.allowMemberInvites ? "default" : "secondary"}>
                    {profile.settings.allowMemberInvites ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Require approval for sharing</span>
                  <Badge variant={profile.settings.requireApprovalForSharing ? "default" : "secondary"}>
                    {profile.settings.requireApprovalForSharing ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Meeting integration</span>
                  <Badge variant={profile.settings.meetingIntegration ? "default" : "secondary"}>
                    {profile.settings.meetingIntegration ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
