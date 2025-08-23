"use client"

import { useEffect, useState, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Signing you in...')
  const didRunRef = useRef(false)

  useEffect(() => {
    const next = searchParams.get('next') ?? '/messages'
    const code = searchParams.get('code')

    // Handle provider errors (if present)
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')
    if (error) {
      setStatus('error')
      setMessage(errorDescription || 'Authentication failed')
      router.replace(`/auth?message=${encodeURIComponent(errorDescription || error)}`)
      return
    }

    // If we already have a session, redirect immediately
    let unmounted = false
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (!unmounted && data.session) {
        setStatus('success')
        setMessage('Signed in! Redirecting...')
        window.location.assign(next)
      }
    })()

    // Explicitly exchange the authorization code for a session and then wait
    // briefly until Supabase reports an active session to avoid redirect stalls.
    // We disabled detectSessionInUrl in the client to avoid duplicate handling.
    let cancelled = false
    const waitForSession = async (msTotal = 3000, step = 200) => {
      const start = Date.now()
      while (!cancelled && Date.now() - start < msTotal) {
        const { data } = await supabase.auth.getSession()
        if (data.session) return true
        await new Promise((r) => setTimeout(r, step))
      }
      return false
    }

    ;(async () => {
      try {
        if (didRunRef.current) return
        didRunRef.current = true
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
          if (data?.session) {
            // Redirect immediately if the session is already available
            setStatus('success')
            setMessage('Signed in! Redirecting...')
            window.location.assign(next)
            return
          }
        }
        if (cancelled) return
        // Poll for session quickly to ensure cookies are set
        const ok = await waitForSession(2500, 150)
        if (cancelled) return
        if (ok) {
          setStatus('success')
          setMessage('Signed in! Redirecting...')
          window.location.assign(next)
          return
        }
        // Fallback: still no session, bounce to /auth with message
        setStatus('error')
        setMessage('Authentication failed. Please try again.')
        router.replace('/auth?message=Could%20not%20authenticate%20user')
      } catch (err: any) {
        console.error('PKCE exchange failed:', err)
        if (!cancelled) {
          setStatus('error')
          setMessage('Authentication failed. Please try again.')
          router.replace('/auth?message=Could%20not%20authenticate%20user')
        }
      }
    })()

    // Also listen for auth state change as a final safety net
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        router.replace(next)
      }
    })

    // Short fallback in case navigation stalls (acts as a secondary guard)
    const timeoutId = window.setTimeout(async () => {
      if (cancelled) return
      const { data } = await supabase.auth.getSession()
      if (data.session) window.location.assign(next)
    }, 4000)

    return () => {
      cancelled = true
      unmounted = true
      sub.subscription.unsubscribe()
      window.clearTimeout(timeoutId)
    }
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

export default function AuthCallbackClientPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="bg-white/90 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl">A</div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h1>
          <p className="text-gray-600 text-sm">Please wait</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
