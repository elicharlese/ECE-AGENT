'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { LoginForm } from '@/components/login-form'

export default function AuthPage() {
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      if (data.session) {
        router.replace('/messages')
      }
    })()
    return () => {
      mounted = false
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <LoginForm />
    </div>
  )
}
