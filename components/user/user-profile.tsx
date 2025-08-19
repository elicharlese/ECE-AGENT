'use client'

import React, { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Camera } from 'lucide-react'
import { profileService } from '@/services/profile-service'
import { supabase } from '@/lib/supabase/client'

interface UserProfileProps {
  userId?: string
  isEditable?: boolean
}

export function UserProfile({ userId, isEditable = false }: UserProfileProps) {
  const [profile, setProfile] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [userId])

  const loadProfile = async () => {
    try {
      setLoading(true)
      
      // Get current user if no userId provided
      let targetUserId = userId
      if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser()
        targetUserId = user?.id
      }

      if (!targetUserId) {
        console.error('No user ID available')
        return
      }

      const userProfile = await profileService.getProfile(targetUserId)
      setProfile(userProfile)
      setEditedProfile(userProfile)
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!editedProfile) return
    
    setSaving(true)
    try {
      const updated = await profileService.updateProfile(editedProfile.id, {
        username: editedProfile.username,
        full_name: editedProfile.full_name,
        bio: editedProfile.bio,
        location: editedProfile.location,
        website: editedProfile.website,
        phone: editedProfile.phone,
      })
      
      setProfile(updated)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save profile:', error)
      alert('Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-500">Loading profile...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-gray-500">Profile not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg">
          {isEditable && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Avatar */}
        <div className="relative px-6 pb-6">
          <div className="absolute -top-16">
            <div className="relative">
              <img
                src={profile.avatar_url || '/placeholder-user.jpg'}
                alt={profile.full_name || profile.username}
                className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover"
              />
              {isEditing && (
                <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Profile Actions */}
          {isEditing && (
            <div className="flex justify-end gap-2 mb-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                disabled={saving}
              >
                <X className="w-4 h-4 inline mr-1" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                disabled={saving}
              >
                <Save className="w-4 h-4 inline mr-1" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}

          {/* Profile Info */}
          <div className="mt-20 space-y-4">
            {/* Name and Username */}
            <div>
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editedProfile.full_name || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, full_name: e.target.value })}
                    placeholder="Full Name"
                    className="text-2xl font-bold w-full px-3 py-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    value={editedProfile.username || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, username: e.target.value })}
                    placeholder="Username"
                    className="text-gray-600 w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold">{profile.full_name || profile.username}</h2>
                  <p className="text-gray-600">@{profile.username}</p>
                </>
              )}
            </div>

            {/* Bio */}
            <div>
              {isEditing ? (
                <textarea
                  value={editedProfile.bio || ''}
                  onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                  placeholder="Bio"
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg resize-none"
                />
              ) : (
                profile.bio && <p className="text-gray-700">{profile.bio}</p>
              )}
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              {/* Email */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{profile.email}</span>
              </div>

              {/* Phone */}
              {(isEditing || profile.phone) && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedProfile.phone || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                      placeholder="Phone Number"
                      className="flex-1 px-2 py-1 border rounded"
                    />
                  ) : (
                    <span>{profile.phone}</span>
                  )}
                </div>
              )}

              {/* Location */}
              {(isEditing || profile.location) && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.location || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                      placeholder="Location"
                      className="flex-1 px-2 py-1 border rounded"
                    />
                  ) : (
                    <span>{profile.location}</span>
                  )}
                </div>
              )}

              {/* Joined Date */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="pt-4 border-t grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-gray-600">Messages</div>
              </div>
              <div>
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-gray-600">Conversations</div>
              </div>
              <div>
                <div className="text-2xl font-bold">Active</div>
                <div className="text-sm text-gray-600">Status</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
