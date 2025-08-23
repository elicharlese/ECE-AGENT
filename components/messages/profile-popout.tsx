"use client"

import type React from 'react'
import { useState, useEffect, useRef } from 'react'
import { X, User, Mail, Phone, Globe, Twitter, Github, Linkedin, Wallet, Copy, Check, Camera } from 'lucide-react'
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
  const [coverUploading, setCoverUploading] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)

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

  const handleCoverSelect = () => coverInputRef.current?.click()

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return
      setCoverUploading(true)

      const { data: auth } = await supabase.auth.getUser()
      const uid = auth?.user?.id
      if (!uid) throw new Error('Not authenticated')

      const ext = file.name.split('.').pop() || 'jpg'
      const path = `covers/${uid}-${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage.from('profiles').upload(path, file, { upsert: true })
      if (uploadErr) throw uploadErr

      const { data: pub } = supabase.storage.from('profiles').getPublicUrl(path)
      const url = pub.publicUrl

      await profileService.updateProfile(uid, { cover_url: url })
      setProfile((prev: any) => ({ ...prev, cover_url: url }))
    } catch (err) {
      console.error('Cover upload failed', err)
    } finally {
      setCoverUploading(false)
      if (e.target) e.target.value = ''
    }
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
        {/* Header with cover image (editable) */}
        <div className="relative h-32">
          {profile?.cover_url ? (
            <img src={profile.cover_url} alt="Profile cover" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500" />
          )}

          {/* Cover controls */}
          <div className="absolute inset-x-0 top-0 flex justify-end p-3">
            <button
              onClick={onClose}
              className="p-2 bg-black/20 backdrop-blur rounded-full hover:bg-black/30 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          <div className="absolute bottom-3 right-3">
            <button
              onClick={handleCoverSelect}
              className="px-2.5 py-1.5 text-xs font-medium bg-white/80 hover:bg-white rounded-md shadow-sm flex items-center gap-1"
              aria-label="Change cover photo"
              disabled={coverUploading}
            >
              <Camera className="w-4 h-4" />
              {coverUploading ? 'Uploading…' : 'Change cover'}
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverChange}
            />
          </div>
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
