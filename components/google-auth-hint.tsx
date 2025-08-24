"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { X, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface GoogleAuthHintProps {
  isVisible: boolean
  userProfile?: {
    email: string
    full_name?: string
    avatar_url?: string
  }
  onClose: () => void
  onContinue?: (email: string) => void
}

export function GoogleAuthHint({ isVisible, userProfile, onClose, onContinue }: GoogleAuthHintProps) {
  const [shouldShow, setShouldShow] = useState(false)

  useEffect(() => {
    if (isVisible && userProfile) {
      // Small delay to let the Google popup appear first
      const timer = setTimeout(() => setShouldShow(true), 1000)
      return () => clearTimeout(timer)
    } else {
      setShouldShow(false)
    }
  }, [isVisible, userProfile])

  useEffect(() => {
    if (shouldShow) {
      // Auto-hide after 8 seconds
      const timer = setTimeout(() => {
        setShouldShow(false)
        onClose()
      }, 8000)
      return () => clearTimeout(timer)
    }
  }, [shouldShow, onClose])

  if (!shouldShow || !userProfile) return null

  return (
    <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right-2 duration-500">
      <Card className="w-80 bg-white/95 backdrop-blur-xl shadow-2xl border border-white/20 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12 ring-2 ring-blue-100">
                <AvatarImage src={userProfile.avatar_url} alt={userProfile.full_name || userProfile.email} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-semibold">
                  {userProfile.full_name 
                    ? userProfile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
                    : <User className="h-6 w-6" />
                  }
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-gray-900 truncate">
                  Is this you?
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {userProfile.email}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShouldShow(false)
                onClose()
              }}
              className="h-10 w-10 p-0 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="text-sm text-gray-600 font-medium bg-blue-50 p-3 rounded-xl border border-blue-100">
            Select your account in the Google popup to continue
          </div>
          
          {/* Progress bar */}
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full"
              style={{
                width: '100%',
                animation: 'progress 8s linear forwards'
              }}
            />
          </div>

          {/* Quick continue CTA for returning users */}
          <Button
            className="mt-4 w-full h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700"
            onClick={() => {
              if (userProfile?.email) {
                onContinue?.(userProfile.email)
              }
              setShouldShow(false)
              onClose()
            }}
          >
            Continue as {userProfile?.email}
          </Button>
        </CardContent>
      </Card>
      
      <style jsx>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}

// Helper to get the most recent profile for the hint
export function getMostRecentProfile() {
  try {
    const stored = localStorage.getItem('recent_profiles')
    if (stored) {
      const profiles = JSON.parse(stored)
      if (profiles.length > 0) {
        // Return the most recent profile
        return profiles.sort((a: any, b: any) => 
          new Date(b.last_signin).getTime() - new Date(a.last_signin).getTime()
        )[0]
      }
    }
  } catch (error) {
    console.error('Error getting recent profile:', error)
  }
  return null
}
