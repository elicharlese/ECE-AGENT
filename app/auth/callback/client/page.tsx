"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AuthCallbackClientPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'exchanging' | 'success' | 'error'>('exchanging')
  const [message, setMessage] = useState<string>('Signing you in…')

  useEffect(() => {
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/messages'
    if (!code) {
      setStatus('error')
      setMessage('Missing authorization code')
      router.replace('/auth?message=Missing%20authorization%20code')
      return
    }

    ;(async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        setStatus('error')
        setMessage('Could not authenticate user')
        router.replace('/auth?message=Could%20not%20authenticate%20user')
      } else {
        setStatus('success')
        setMessage('Signed in! Redirecting…')
        router.replace(next)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="bg-white/90 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl p-8 w-full max-w-md text-center">
        <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl">A</div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          {status === 'exchanging' ? 'Completing sign-in' : status === 'success' ? 'Success' : 'Authentication error'}
        </h1>
        <p className="text-gray-600 text-sm">{message}</p>
      </div>
    </div>
  )
}
