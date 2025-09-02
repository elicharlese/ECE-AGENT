"use client"

import { useState } from 'react'
import { useUser } from '@/contexts/user-context'
import { supabase } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Icon } from '@/components/icons/Icon'
import { SolanaWalletProvider } from '@/components/solana-wallet-provider'
import { useRouter } from 'next/navigation'

// Dynamically import Solana components to avoid SSR issues
const ConnectWalletButton = dynamic<{ className?: string }>(
  () => import('@/components/solana-login-button').then(mod => mod.ConnectWalletButton),
  { ssr: false }
);

export type LoginFormProps = { returnTo?: string; embedded?: boolean }

export function LoginForm({ returnTo, embedded = false }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'email' | 'password'>('email')
  const { login } = useUser()
  const router = useRouter()

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
    } else {
      // Navigate on successful login; server routes also validate cookies
      router.replace(returnTo ?? '/messages')
    }
  }

  const handleBackToEmail = () => {
    setStep('email')
    setPassword('')
    setError('')
  }

  const handleGoogleLogin = async () => {
    setError('')
    setIsLoading(true)
    
    const next = `${window.location.origin}/auth/callback${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: next
      }
    })
    
    setIsLoading(false)
    
    if (error) {
      setError('Google login failed. Please try again.')
      console.error('Google login error:', error)
    }
  }

  const handleEmailMagicLink = async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }
    
    setError('')
    setIsLoading(true)
    
    const next = `${window.location.origin}/auth/callback${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: next
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

  if (embedded) {
    return (
      <div className="w-full">
        {/* Header */}
        <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-5 text-center">
          <div className="mx-auto h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold shadow-md">
            A
          </div>
          <h1 className="mt-4 text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100">Welcome to AGENT</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300 text-sm">Sign in to access your AI-powered workspace</p>
        </div>

        {/* Form Content */}
        <div className="px-6 sm:px-8 pb-4 sm:pb-6">
          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div className="text-left">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email address</label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  className="w-full h-12 px-4 text-base border-gray-300 dark:border-gray-700 rounded-xl focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-900 dark:text-gray-100"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !email}
                className="w-full h-11 sm:h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium shadow-sm hover:opacity-95 transition"
              >
                Continue
              </Button>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 dark:text-gray-200 text-sm font-medium">
                      {email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {email}
                    </p>
                    <button
                      type="button"
                      onClick={handleBackToEmail}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Not you?
                    </button>
                  </div>
                </div>

                <div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Password"
                    className="w-full h-11 sm:h-12 px-4 text-base border-gray-300 dark:border-gray-700 rounded-xl focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-900 dark:text-gray-100"
                    autoFocus
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !password}
                className="w-full h-11 sm:h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium shadow-sm hover:opacity-95 transition"
              >
                {isLoading ? (
                  <>
                    <Icon name="loader" className="mr-2 h-4 w-4 animate-spin" />
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
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-xl">
              <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Alternative Sign In */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                variant="outline"
                className="w-full h-11 sm:h-12 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium rounded-xl transition-colors"
              >
                <Icon name="brand-google" className="mr-2 h-5 w-5" />
                Continue with Google
              </Button>
            </div>
            {/* Connect Wallet button styled like Google button */}
            <div className="mt-3">
              <SolanaWalletProvider>
                <ConnectWalletButton />
              </SolanaWalletProvider>
            </div>
          </div>

          {/* Removed bulky wallet card; replaced with simple Connect Wallet button above */}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-[#0b1020] dark:via-[#0a0f1a] dark:to-[#0b1020] flex items-center justify-center px-4 py-6 sm:p-6">
      <div className="w-full max-w-md">
        <div className="bg-white/90 dark:bg-gray-900/80 backdrop-blur rounded-3xl shadow-xl border border-white/60 dark:border-gray-800 overflow-hidden">
          {/* Header */}
          <div className="px-6 sm:px-8 pt-8 sm:pt-10 pb-5 sm:pb-6 text-center">
            <div className="mx-auto h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold shadow-md">
              A
            </div>
            <h1 className="mt-4 text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100">Welcome to AGENT</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-300 text-sm">Sign in to access your AI-powered workspace</p>
          </div>

          {/* Form Content */}
          <div className="px-6 sm:px-8 pb-6 sm:pb-8">
            {step === 'email' ? (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div className="text-left">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email address</label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="w-full h-12 px-4 text-base border-gray-300 dark:border-gray-700 rounded-xl focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-900 dark:text-gray-100"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full h-11 sm:h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium shadow-sm hover:opacity-95 transition"
                >
                  Continue
                </Button>
              </form>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 dark:text-gray-200 text-sm font-medium">
                        {email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {email}
                      </p>
                      <button
                        type="button"
                        onClick={handleBackToEmail}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        Not you?
                      </button>
                    </div>
                  </div>

                  <div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Password"
                      className="w-full h-11 sm:h-12 px-4 text-base border-gray-300 dark:border-gray-700 rounded-xl focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-900 dark:text-gray-100"
                      autoFocus
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !password}
                  className="w-full h-11 sm:h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium shadow-sm hover:opacity-95 transition"
                >
                  {isLoading ? (
                    <>
                      <Icon name="loader" className="mr-2 h-4 w-4 animate-spin" />
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
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-xl">
                <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* Alternative Sign In */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-800" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">Or continue with</span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full h-11 sm:h-12 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium rounded-xl transition-colors"
                >
                  <Icon name="brand-google" className="mr-2 h-5 w-5" />
                  Continue with Google
                </Button>
              </div>
              {/* Connect Wallet button styled like Google button */}
              <div className="mt-3">
                <SolanaWalletProvider>
                  <ConnectWalletButton />
                </SolanaWalletProvider>
              </div>
            </div>

            {/* Removed bulky wallet card; replaced with simple Connect Wallet button above */}
          </div>
        </div>
      </div>
    </div>
  )
}

