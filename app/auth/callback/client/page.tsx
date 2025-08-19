"use client"

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Signing you in...')

  useEffect(() => {
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/messages'
    
    // Check if this is a dev admin login
    const isDevAdmin = typeof window !== 'undefined' && 
      process.env.NODE_ENV === 'development' && 
      document.cookie.includes('dev_admin=true')

    if (isDevAdmin) {
      // For dev admin, just redirect immediately
      setStatus('success')
      setMessage('Dev admin signed in! Redirecting...')
      router.replace(next)
      return
    }

    if (!code) {
      setStatus('error')
      setMessage('Missing authorization code')
      router.replace('/auth?message=Missing%20authorization%20code')
      return
    }

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    ;(async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        setStatus('error')
        setMessage('Could not authenticate user')
        router.replace('/auth?message=Could%20not%20authenticate%20user')
      } else {
        setStatus('success')
        setMessage('Signed in! Redirecting...')
        router.replace(next)
      }
    })()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="bg-white/90 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl p-8 w-full max-w-md text-center">
        <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl">A</div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          {status === 'loading' ? 'Completing sign-in' : status === 'success' ? 'Success' : 'Authentication error'}
        </h1>
        <p className="text-gray-600 text-sm">{message}</p>
      </div>
    </div>
  )
}
