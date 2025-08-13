"use client"

import { useState } from 'react'
import { useUser } from '@/contexts/user-context'
import { supabase } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AgentBranding } from '@/components/agent-branding'
import { Loader2, Mail, Lock, Chrome } from 'lucide-react'

// Dynamically import Solana components to avoid SSR issues
const SolanaLoginButton = dynamic(
  () => import('@/components/solana-login-button').then(mod => mod.SolanaLoginButton),
  { ssr: false }
);

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'email' | 'password'>('email')
  const { login } = useUser()

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
    setIsLoading(true)
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
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
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-12 pb-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">A</span>
              </div>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Sign in to AGENT
            </h1>
            <p className="text-gray-600 text-sm">
              Enter your credentials to continue
            </p>
          </div>

          {/* Form Content */}
          <div className="px-8 pb-8">
            {step === 'email' ? (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Email address"
                    className="w-full h-12 px-4 text-base border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 bg-white"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Continue
                </Button>
              </form>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-sm font-medium">
                        {email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
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
                      className="w-full h-12 px-4 text-base border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 bg-white"
                      autoFocus
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !password}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
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
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Demo Credentials */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900 text-center mb-2">
                Demo Credentials
              </p>
              <div className="space-y-1 text-xs text-blue-700 text-center">
                <p><strong>Admin:</strong> admin / admin</p>
                <p><strong>Demo:</strong> test / test</p>
                <p><strong>Email:</strong> test@example.com / password123</p>
              </div>
            </div>

            {/* Alternative Sign In */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full h-12 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-colors"
                >
                  <Chrome className="mr-2 h-5 w-5" />
                  Continue with Google
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
