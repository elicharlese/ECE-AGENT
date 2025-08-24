'use client'

import { useState, useEffect } from 'react'
import { User, Camera, Mail, Phone, MapPin, Calendar, Save, Edit2 } from 'lucide-react'

interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  location?: string
  bio?: string
  avatar_url?: string
  joined_date: string
}

export default function ProfileTestPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<UserProfile>({
    id: 'dev-admin-id',
    name: 'Dev Admin',
    email: 'admin@dev.local',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    bio: 'Full-stack developer passionate about building great products. Currently testing the AGENT platform.',
    avatar_url: undefined,
    joined_date: new Date().toISOString()
  })
  const [editedProfile, setEditedProfile] = useState(profile)

  useEffect(() => {
    // Demo-only: use localStorage in non-production builds only
    if (process.env.NODE_ENV !== 'production') {
      try {
        const devUser = typeof window !== 'undefined' ? localStorage.getItem('dev_user') : null
        if (devUser) {
          const userData = JSON.parse(devUser)
          setProfile(prev => ({
            ...prev,
            id: userData.id || prev.id,
            name: userData.name || prev.name,
            email: userData.email || prev.email
          }))
        }
      } catch (e) {
        console.error('Error loading user data:', e)
      }
    }
  }, [])

  const handleSave = () => {
    setProfile(editedProfile)
    // Demo-only persistence in non-production
    if (process.env.NODE_ENV !== 'production') {
      try {
        localStorage.setItem('dev_user', JSON.stringify(editedProfile))
      } catch {}
    }
    setIsEditing(false)
    
    // Show success message
    const successDiv = document.createElement('div')
    successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
    successDiv.textContent = 'Profile updated successfully!'
    document.body.appendChild(successDiv)
    setTimeout(() => successDiv.remove(), 3000)
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const handleAvatarUpload = () => {
    // Simulate avatar upload
    setEditedProfile(prev => ({
      ...prev,
      avatar_url: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(prev.name) + '&background=random'
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Demo-only banner */}
      <div className="max-w-4xl mx-auto mb-4">
        <div className="rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
          This page is demo-only and not used in production authentication flows. Local changes persist only in non-production builds.
        </div>
      </div>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">User Profile</h1>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-start gap-8">
            {/* Avatar Section */}
            <div className="flex-shrink-0">
              <div className="relative">
                {profile.avatar_url || editedProfile.avatar_url ? (
                  <img
                    src={editedProfile.avatar_url || profile.avatar_url || ''}
                    alt="Avatar"
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                {isEditing && (
                  <button
                    onClick={handleAvatarUpload}
                    className="absolute bottom-0 right-0 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Profile Details */}
            <div className="flex-1 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.name}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-lg font-semibold">{profile.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="inline w-4 h-4 mr-1" />
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-600">{profile.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="inline w-4 h-4 mr-1" />
                  Phone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedProfile.phone || ''}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add phone number"
                  />
                ) : (
                  <p className="text-gray-600">{profile.phone || 'Not provided'}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.location || ''}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add location"
                  />
                ) : (
                  <p className="text-gray-600">{profile.location || 'Not provided'}</p>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                {isEditing ? (
                  <textarea
                    value={editedProfile.bio || ''}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-gray-600">{profile.bio || 'No bio provided'}</p>
                )}
              </div>

              {/* Joined Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Member Since
                </label>
                <p className="text-gray-600">
                  {new Date(profile.joined_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Completion */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">Profile Completion</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Profile Picture</span>
              <span className={profile.avatar_url ? 'text-green-500' : 'text-gray-400'}>
                {profile.avatar_url ? '✓ Complete' : 'Incomplete'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Phone Number</span>
              <span className={profile.phone ? 'text-green-500' : 'text-gray-400'}>
                {profile.phone ? '✓ Complete' : 'Incomplete'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Location</span>
              <span className={profile.location ? 'text-green-500' : 'text-gray-400'}>
                {profile.location ? '✓ Complete' : 'Incomplete'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Bio</span>
              <span className={profile.bio ? 'text-green-500' : 'text-gray-400'}>
                {profile.bio ? '✓ Complete' : 'Incomplete'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
