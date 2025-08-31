import { redirect } from 'next/navigation'
import { getSupabaseServer } from '@/lib/supabase/server'
import { LoginForm } from '@/components/login-form'
import type { Metadata } from 'next'
import { authPageMetadata } from '@/lib/seo-metadata'

export default async function AuthPage({ searchParams }: { searchParams: Promise<{ returnTo?: string }> }) {
  // Prefer an authoritative session check via Supabase server client.
  const supabase = await getSupabaseServer()
  const { data: { session } } = await supabase.auth.getSession()
  const sp = await searchParams
  const returnTo = sp?.returnTo && sp.returnTo.startsWith('/') ? sp.returnTo : undefined

  // Lightweight server log for diagnosing redirect loops
  console.log('[auth/page] session?', Boolean(session), 'returnTo:', returnTo || '(none)')

  if (session) {
    redirect(returnTo || '/messages')
  }

  return <LoginForm returnTo={returnTo} />
}
