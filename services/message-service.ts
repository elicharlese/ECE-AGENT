import { supabase } from '@/lib/supabase/client'

export interface DBMessage {
  id: string
  conversation_id: string
  user_id: string | null
  content: string
  role: 'user' | 'assistant' | 'system'
  timestamp: string
  edited_at: string | null
  is_deleted: boolean | null
  metadata: Record<string, any> | null
}

export async function listMessages(conversationId: string): Promise<DBMessage[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('timestamp', { ascending: true })

  if (error) {
    console.error('listMessages error', error)
    throw new Error(error.message)
  }
  return (data || []) as DBMessage[]
}

export async function sendMessage(conversationId: string, content: string): Promise<DBMessage> {
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, user_id: auth.user.id, content, role: 'user' })
    .select()
    .single()

  if (error) {
    console.error('sendMessage error', error)
    throw new Error(error.message)
  }
  return data as DBMessage
}

export type MessageInsertHandler = (msg: DBMessage) => void

export function subscribeToMessages(conversationId: string, onInsert: MessageInsertHandler) {
  const channel = supabase
    .channel(`messages-${conversationId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
      (payload) => {
        const newMsg = payload.new as DBMessage
        onInsert(newMsg)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
