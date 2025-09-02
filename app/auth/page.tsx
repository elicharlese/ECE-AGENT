'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AuthHero } from '@/components/apps/auth/AuthHero'

export default function AuthPage() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        router.push('/messages')
      }
    }

    checkAuth()
  }, [router])

  return (
    <AuthHero className="relative min-h-[100svh] w-screen overflow-hidden bg-[#FAFAFA] dark:bg-slate-900" />
  )
}
