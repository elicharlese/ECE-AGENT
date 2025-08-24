"use client"

import { useState, useEffect } from 'react'
import { useUser } from '@/contexts/user-context'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Chrome } from 'lucide-react'
import { ProfileSigninPopup } from '@/components/profile-signin-popup'
import { GoogleAuthHint, getMostRecentProfile } from '@/components/google-auth-hint'
import { AuthWalletSection } from '@/components/auth/AuthWalletSection'

// Solana login removed - using Google OAuth only

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'email' | 'password'>('email')
  const [showProfilePopup, setShowProfilePopup] = useState(false)
  const [showGoogleHint, setShowGoogleHint] = useState(false)
  const [recentProfile, setRecentProfile] = useState<any>(null)
  const { login } = useUser()

  useEffect(() => {
    const checkStoredProfiles = async () => {
      try {
        const recentProfile = await getMostRecentProfile()
        if (recentProfile) {
          setRecentProfile(recentProfile)
          setShowGoogleHint(true)
        }
      } catch (error) {
        console.error('Error checking stored profiles:', error)
      }
    }
    
    checkStoredProfiles()
  }, [])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email) {
      setError('Please enter your email address')
      return
    }
    
    // Move to password step
    setStep('password')
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!password) {
      setError('Please enter your password')
      return
    }
    
    setIsLoading(true)
    const success = await login(email, password)
    setIsLoading(false)
    
    if (!success) {
      setError('The email or password you entered is incorrect.')
    }
  }

  const handleBackToEmail = () => {
    setStep('email')
    setPassword('')
    setError('')
  }

  const handleGoogleLogin = async () => {
    setError('')
    // If we have recent profiles, optimize flow:
    // - 1 profile: quick OAuth with login_hint + show hint
    // - 2+ profiles: open quick-select modal
    try {
      const stored = localStorage.getItem('recent_profiles')
      if (stored) {
        const profiles = JSON.parse(stored)
        if (Array.isArray(profiles) && profiles.length > 0) {
          if (profiles.length === 1 && profiles[0]?.email) {
            setShowGoogleHint(true)
            setIsLoading(true)

            const params = new URLSearchParams(window.location.search)
            const next = params.get('next') ?? '/messages'
            const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`

            const { error } = await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                redirectTo,
                queryParams: {
                  login_hint: profiles[0].email
                }
              }
            })

            setIsLoading(false)
            if (error) {
              setError('Google login failed. Please try again.')
              console.error('Google login error:', error)
              setShowGoogleHint(false)
            }
            return
          } else if (profiles.length >= 2) {
            setShowProfilePopup(true)
            return
          }
        }
      }
    } catch (e) {
      console.warn('Unable to read recent profiles from localStorage', e)
    }

    setIsLoading(true)
    
    // Show the "Is this you?" hint if we have a recent profile
    if (recentProfile) {
      setShowGoogleHint(true)
    }

    const params = new URLSearchParams(window.location.search)
    const next = params.get('next') ?? '/messages'
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: { prompt: 'select_account' }
      }
    })
    
    setIsLoading(false)
    
    if (error) {
      setError('Google login failed. Please try again.')
      console.error('Google login error:', error)
      setShowGoogleHint(false)
    }
  }

  const handleQuickContinue = async (emailHint: string) => {
    setError('')
    setIsLoading(true)

    const params = new URLSearchParams(window.location.search)
    const next = params.get('next') ?? '/messages'
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          login_hint: emailHint
        }
      }
    })

    setIsLoading(false)
    if (error) {
      setError('Google quick sign-in failed. Please try again.')
      console.error('Google quick sign-in error:', error)
    }
  }

  const handleEmailMagicLink = async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }
    
    setError('')
    setIsLoading(true)

    const params = new URLSearchParams(window.location.search)
    const next = params.get('next') ?? '/messages'
    const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo,
      }
    })
    
    setIsLoading(false)
    
    if (error) {
      setError('Failed to send magic link. Please try again.')
      console.error('Magic link error:', error)
    } else {
      setError('Magic link sent! Check your email.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      {/* Background boundary removed to avoid clash with page gradient */}
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/90 backdrop-blur-2xl rounded-3xl border border-white/30 overflow-hidden">
          {/* Header */}
          <div className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                {/* Smooth glow effect */}
                <div className="absolute -inset-2 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-3xl blur-lg opacity-30 animate-pulse"></div>
                {/* Main logo */}
                <div className="relative w-16 h-16 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <span className="text-white font-bold text-2xl drop-shadow-sm">A</span>
                </div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to AGENT
            </h1>
            <p className="text-gray-600 text-sm">
              Sign in to access your AI-powered workspace
            </p>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {step === 'email' ? (
              <form onSubmit={handleEmailSubmit} className="space-y-5 md:space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="w-full h-12 px-4 text-base border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/50 backdrop-blur-sm transition-all duration-200"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Continue
                </Button>
              </form>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-5 md:space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white text-sm font-semibold">
                        {email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {email}
                      </p>
                      <button
                        type="button"
                        onClick={handleBackToEmail}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Not you?
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter your password"
                      className="w-full h-12 px-4 text-base border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white/50 backdrop-blur-sm transition-all duration-200"
                      autoFocus
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !password}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            )}

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Alternative Sign In */}
            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <Button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full h-12 border-2 border-gray-200 hover:border-indigo-300 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 font-semibold rounded-xl transition-all duration-200 bg-white/70 backdrop-blur-sm"
                >
                  <Chrome className="mr-3 h-5 w-5 text-indigo-500" />
                  Continue with Google
                </Button>
                <AuthWalletSection />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProfileSigninPopup
        isOpen={showProfilePopup}
        onClose={() => setShowProfilePopup(false)}
        onSignIn={(profile) => {
          setShowProfilePopup(false)
          setIsLoading(true)
        }}
      />

      <GoogleAuthHint
        isVisible={showGoogleHint}
        userProfile={recentProfile}
        onClose={() => setShowGoogleHint(false)}
        onContinue={handleQuickContinue}
      />
    </div>
  )
}
