import { redirect } from 'next/navigation'
import { ClientChatApp } from './ClientChatApp'
import { getSupabaseServer } from '@/lib/supabase/server'

export default async function MessagesPage() {
  // Authoritative session check via Supabase server client to avoid false negatives.
  const supabase = await getSupabaseServer()
  const { data: { session } } = await supabase.auth.getSession()
  console.log('[messages/page] session?', Boolean(session))
  if (!session) {
    redirect('/auth?returnTo=/messages')
  }

  return <ClientChatApp />
}
