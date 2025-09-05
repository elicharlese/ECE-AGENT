'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient()
      
      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(
        window.location.search
      )
      
      if (error) {
        console.error('Auth callback error:', error)
        router.push('/auth')
        return
      }

      // Check if there's a stored invitation redirect
      const invitationRedirect = localStorage.getItem('invitation_redirect')
      if (invitationRedirect) {
        localStorage.removeItem('invitation_redirect')
        router.push(invitationRedirect)
        return
      }

      // Default redirect to messages
      router.push('/messages')
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
          Authenticating...
        </h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Please wait while we complete your sign in.
        </p>
      </div>
    </div>
  )
}
