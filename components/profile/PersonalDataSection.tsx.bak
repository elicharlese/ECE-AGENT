'use client'

import React, { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Separator,
  Switch
} from '@/libs/design-system';
import { Button } from '@/libs/design-system'
import { Input } from '@/libs/design-system'

// TODO: Replace deprecated components: Label
// 
// TODO: Replace deprecated components: Label
// import { Label } from '@/components/ui/label'

// TODO: Replace deprecated components: Switch
// 
// TODO: Replace deprecated components: Switch
// import { Switch } from '@/components/ui/switch'
import { Badge } from '@/libs/design-system'

// TODO: Replace deprecated components: Separator
// 
// TODO: Replace deprecated components: Separator
// import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/libs/design-system'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/libs/design-system'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Download,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Lock,
  Unlock
} from 'lucide-react'
import { UserProfile } from '@/src/types/user-tiers'

interface PersonalDataSectionProps {
  profile: UserProfile
}

export function PersonalDataSection({ profile }: PersonalDataSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'private',
    dataSharing: false,
    analyticsTracking: true,
    marketingEmails: false,
    twoFactorAuth: false
  })

  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    phone: '',
    location: '',
    bio: ''
  })

  const handleSave = async () => {
    try {
      // TODO: Implement API call to update profile
      console.log('Saving profile data:', formData)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save profile:', error)
    }
  }

  const handleExportData = async () => {
    try {
      const response = await fetch('/api/profile/export-data')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `profile-data-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Failed to export data:', error)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch('/api/profile/delete-account', {
        method: 'DELETE'
      })
      if (response.ok) {
        // Handle successful deletion
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Failed to delete account:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              ) : (
                <div className="flex items-center gap-2 p-2 border rounded-md">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.name}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              ) : (
                <div className="flex items-center gap-2 p-2 border rounded-md">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.email}</span>
                  <Badge variant="secondary" className="ml-auto">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              ) : (
                <div className="flex items-center gap-2 p-2 border rounded-md">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Not provided</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              {isEditing ? (
                <Input
                  id="location"
                  placeholder="Enter your &quot;personal&quot; data here"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              ) : (
                <div className="flex items-center gap-2 p-2 border rounded-md">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Not provided</span>
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Privacy & Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Profile Visibility</Label>
                <p className="text-sm text-muted-foreground">
                  Control who can see your profile information
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={privacySettings.profileVisibility === 'public' ? 'default' : 'secondary'}>
                  {privacySettings.profileVisibility === 'public' ? 'Public' : 'Private'}
                </Badge>
                <Button variant="outline" size="sm">
                  Change
                </Button>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={privacySettings.twoFactorAuth}
                  onCheckedChange={(checked) =>
                    setPrivacySettings({...privacySettings, twoFactorAuth: checked})
                  }
                />
                {privacySettings.twoFactorAuth ? (
                  <Lock className="h-4 w-4 text-green-500" />
                ) : (
                  <Unlock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Data Sharing</Label>
                <p className="text-sm text-muted-foreground">
                  Allow anonymous usage data to improve our services
                </p>
              </div>
              <Switch
                checked={privacySettings.dataSharing}
                onCheckedChange={(checked) =>
                  setPrivacySettings({...privacySettings, dataSharing: checked})
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Analytics Tracking</Label>
                <p className="text-sm text-muted-foreground">
                  Help us improve by tracking your usage patterns
                </p>
              </div>
              <Switch
                checked={privacySettings.analyticsTracking}
                onCheckedChange={(checked) =>
                  setPrivacySettings({...privacySettings, analyticsTracking: checked})
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Marketing Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates about new features and promotions
                </p>
              </div>
              <Switch
                checked={privacySettings.marketingEmails}
                onCheckedChange={(checked) =>
                  setPrivacySettings({...privacySettings, marketingEmails: checked})
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Export Your Data</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Download a copy of all your personal data and usage history.
              </p>
              <Button variant="outline" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Data Retention</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Your data is securely stored and automatically backed up.
              </p>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">GDPR Compliant</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800 dark:text-red-200">Account Deletion</AlertTitle>
            <AlertDescription className="text-red-700 dark:text-red-300">
              Once you delete your account, there is no going back. This action cannot be undone.
              All your data, including agents, conversations, and billing history will be permanently removed.
            </AlertDescription>
          </Alert>

          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-red-600">Delete Account</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove all your data from our servers.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                    What will be deleted:
                  </p>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                    <li>• All your AI agents and configurations</li>
                    <li>• Conversation history and messages</li>
                    <li>• Uploaded files and documents</li>
                    <li>• Billing history and payment methods</li>
                    <li>• Team memberships and shared resources</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-delete">
                    Type "DELETE" to confirm:
                  </Label>
                  <Input
                    id="confirm-delete"
                    placeholder="DELETE"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  Delete Account
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}