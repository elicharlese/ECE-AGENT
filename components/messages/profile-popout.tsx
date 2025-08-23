"use client"

import { useState, useEffect } from 'react'
import { X, User, Mail, Phone, Globe, Twitter, Github, Linkedin, Wallet, Copy, Check } from 'lucide-react'
import { profileService } from '@/services/profile-service'
import { supabase } from '@/lib/supabase/client'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDensity, type Density } from '@/contexts/density-context'

interface ProfilePopoutProps {
  userId: string
  onClose: () => void
}

export function ProfilePopout({ userId, onClose }: ProfilePopoutProps) {
  const [profile, setProfile] = useState<any>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { density, setDensity } = useDensity()

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await profileService.getProfileByUserId(userId)
        setProfile(data)
      } catch (error) {
        console.error('Failed to load profile:', error)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [userId])

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth'
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-2xl p-8 w-96">
          <div className="animate-pulse space-y-4">
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto" />
            <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-96 max-h-[90vh] overflow-hidden">
        {/* Header with gradient */}
        <div className="relative h-32 bg-gradient-to-r from-purple-500 to-blue-500">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur rounded-full hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Profile content */}
        <div className="relative px-6 pt-8 pb-8">
          <Tabs defaultValue="profile">

            <TabsContent value="profile">
              {/* Avatar */}
              <div className="-mt-16 mb-4">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gradient-to-r from-purple-500 to-blue-500 mx-auto flex items-center justify-center">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-white" />
                  )}
                </div>
              </div>

              {/* Name and username */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {profile?.full_name || 'User'}
                </h2>
                <p className="text-gray-600">@{profile?.username || 'username'}</p>
              </div>

              {/* Tabs */}
              <div className="flex justify-center mt-2 mb-6">
                <TabsList>
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
              </div>

              {/* Contact info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {profile?.email || 'No email'}
                    </span>
                  </div>
                  <button
                    onClick={() => profile?.email && copyToClipboard(profile.email, 'email')}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                  >
                    {copied === 'email' ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>

                {profile?.phone && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{profile.phone}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(profile.phone, 'phone')}
                      className="p-2 hover:bg-gray-200 rounded transition-colors"
                    >
                      {copied === 'phone' ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                )}

                {profile?.solana_address && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Wallet className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700 truncate max-w-[200px]">
                        {profile.solana_address}
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(profile.solana_address, 'wallet')}
                      className="p-2 hover:bg-gray-200 rounded transition-colors"
                    >
                      {copied === 'wallet' ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Social links */}
              <div className="flex justify-center gap-4 mb-6">
                {profile?.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <Globe className="w-5 h-5 text-gray-600" />
                  </a>
                )}
                {profile?.twitter && (
                  <a
                    href={`https://twitter.com/${profile.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <Twitter className="w-5 h-5 text-gray-600" />
                  </a>
                )}
                {profile?.github && (
                  <a
                    href={`https://github.com/${profile.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <Github className="w-5 h-5 text-gray-600" />
                  </a>
                )}
                {profile?.linkedin && (
                  <a
                    href={`https://linkedin.com/in/${profile.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <Linkedin className="w-5 h-5 text-gray-600" />
                  </a>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => (window.location.href = '/profile')}
                  className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full px-4 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                >
                  Sign Out
                </button>
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <div className="mt-2 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="density-select">UI density</Label>
                  <Select value={density} onValueChange={(v) => setDensity(v as Density)}>
                    <SelectTrigger id="density-select" className="w-full">
                      <SelectValue placeholder="Select density" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="comfortable">Comfortable</SelectItem>
                      <SelectItem value="airy">Airy</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Controls spacing in message lists and inputs.</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
