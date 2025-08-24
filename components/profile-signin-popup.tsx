"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { X, User } from 'lucide-react'

interface StoredProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  last_signin: string
}

interface ProfileSigninPopupProps {
  isOpen: boolean
  onClose: () => void
  onSignIn: (profile: StoredProfile) => void
}

export function ProfileSigninPopup({ isOpen, onClose, onSignIn }: ProfileSigninPopupProps) {
  const [profiles, setProfiles] = useState<StoredProfile[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadStoredProfiles()
    }
  }, [isOpen])

  const loadStoredProfiles = () => {
    try {
      const stored = localStorage.getItem('recent_profiles')
      if (stored) {
        const parsedProfiles = JSON.parse(stored) as StoredProfile[]
        // Sort by most recent sign-in
        const sortedProfiles = parsedProfiles.sort((a, b) => 
          new Date(b.last_signin).getTime() - new Date(a.last_signin).getTime()
        )
        setProfiles(sortedProfiles.slice(0, 3)) // Show max 3 recent profiles
      }
    } catch (error) {
      console.error('Error loading stored profiles:', error)
    }
  }

  const handleProfileSignIn = async (profile: StoredProfile) => {
    setIsLoading(true)
    
    const params = new URLSearchParams(window.location.search)
    const next = params.get('next') ?? '/messages'
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          login_hint: profile.email,
          hd: profile.email.split('@')[1]
        }
      }
    })
    
    if (error) {
      console.error('Profile sign-in error:', error)
    } else {
      onSignIn(profile)
    }
    
    setIsLoading(false)
  }

  const removeProfile = (profileId: string) => {
    try {
      const stored = localStorage.getItem('recent_profiles')
      if (stored) {
        const parsedProfiles = JSON.parse(stored) as StoredProfile[]
        const filtered = parsedProfiles.filter(p => p.id !== profileId)
        localStorage.setItem('recent_profiles', JSON.stringify(filtered))
        setProfiles(filtered.slice(0, 3))
      }
    } catch (error) {
      console.error('Error removing profile:', error)
    }
  }

  if (!isOpen || profiles.length === 0) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-xl shadow-2xl border border-white/20 rounded-2xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Choose an account
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-10 w-10 p-0 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="space-y-3">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-blue-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 cursor-pointer group"
                onClick={() => handleProfileSignIn(profile)}
              >
                <div className="flex items-center space-x-4 flex-1">
                  <Avatar className="h-12 w-12 ring-2 ring-gray-100 group-hover:ring-blue-200 transition-all duration-200">
                    <AvatarImage src={profile.avatar_url} alt={profile.full_name || profile.email} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-semibold">
                      {profile.full_name 
                        ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
                        : <User className="h-6 w-6" />
                      }
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-gray-900 truncate">
                      {profile.full_name || 'User'}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {profile.email}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeProfile(profile.id)
                  }}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full h-12 rounded-xl border-2 border-gray-200 hover:border-gray-300 font-semibold transition-all duration-200"
              disabled={isLoading}
            >
              Use another account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper function to store profile after successful sign-in
export function storeRecentProfile(user: any) {
  try {
    const profile: StoredProfile = {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name,
      avatar_url: user.user_metadata?.avatar_url,
      last_signin: new Date().toISOString()
    }
    
    const stored = localStorage.getItem('recent_profiles')
    let profiles: StoredProfile[] = []
    
    if (stored) {
      profiles = JSON.parse(stored)
    }
    
    // Remove existing profile with same ID
    profiles = profiles.filter(p => p.id !== profile.id)
    
    // Add new profile at the beginning
    profiles.unshift(profile)
    
    // Keep only the 5 most recent profiles
    profiles = profiles.slice(0, 5)
    
    localStorage.setItem('recent_profiles', JSON.stringify(profiles))
  } catch (error) {
    console.error('Error storing recent profile:', error)
  }
}
