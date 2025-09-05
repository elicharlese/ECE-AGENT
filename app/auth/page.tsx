import { redirect } from 'next/navigation'
import { getSupabaseServer } from '@/lib/supabase/server'
import { LoginForm } from '@/components/login-form'

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }> | { returnTo?: string }
}) {
  const sp = await (searchParams as Promise<{ returnTo?: string }> | { returnTo?: string })
  const returnTo = (sp as { returnTo?: string }).returnTo

  const supabase = await getSupabaseServer()
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    const safePath = returnTo && returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/messages'
    redirect(safePath)
  }

  return <LoginForm returnTo={returnTo ?? '/messages'} />
}
