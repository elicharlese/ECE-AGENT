"use client"

import { useState } from 'react'
import { useUser } from '@/contexts/user-context'
import { supabase } from '@/lib/supabase/client'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AgentBranding } from '@/components/agent-branding'

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
  const { login } = useUser()

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }
    
    setIsLoading(true)
    const success = await login(email, password)
    setIsLoading(false)
    
    if (!success) {
      setError('Login failed. Please check your credentials.')
    }
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
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="flex justify-center mb-6">
          <AgentBranding variant="default" size="lg" />
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white">
          Sign in to AGENT
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="space-y-4">
          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="flex w-full justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            {isLoading ? 'Signing in...' : 'Sign in with Google'}
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>
        </div>

        <form className="space-y-6 mt-6" onSubmit={handleEmailPasswordLogin}>
          <div>
            <Label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
              Email address
            </Label>
            <div className="mt-2">
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900 dark:text-white">
                Password
              </Label>
            </div>
            <div className="mt-2">
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {isLoading ? 'Signing in...' : 'Sign in with Email'}
            </Button>
          </div>
          
          <div>
            <Button
              type="button"
              onClick={handleEmailMagicLink}
              disabled={isLoading}
              variant="outline"
              className="flex w-full justify-center rounded-md bg-white px-3 py-1.5 text-sm font-semibold leading-6 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              {isLoading ? 'Sending...' : 'Send Magic Link'}
            </Button>
          </div>
        </form>
        
        <div className="mt-6">
          <SolanaLoginButton />
        </div>
        
        {error && (
          <div className="mt-4 text-red-500 text-sm text-center">{error}</div>
        )}
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Use the following credentials for testing:</p>
          <p className="font-mono">Email: test@example.com</p>
          <p className="font-mono">Password: password123</p>
        </div>
      </div>
    </div>
  )
}
