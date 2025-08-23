import { supabase } from '@/lib/supabase/client'
import type { Message } from '@/types/message'

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

export const messageService = {
  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: true })

      if (error) {
        console.error('getMessages error', error)
        return []
      }

      return (data || []).map((msg: DBMessage): Message => ({
        id: msg.id,
        conversation_id: msg.conversation_id,
        user_id: msg.user_id || 'system',
        content: msg.content,
        created_at: msg.timestamp,
        is_ai: msg.role === 'assistant',
        role: msg.role,
        edited_at: msg.edited_at,
        read_at: null,
        metadata: msg.metadata,
        type: 'text',
      }))
    } catch (error) {
      console.error('Failed to get messages:', error)
      return []
    }
  },

  async sendMessage(conversationId: string, content: string): Promise<Message> {
    const { data: auth } = await supabase.auth.getUser()
    if (!auth?.user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('messages')
      .insert({ 
        conversation_id: conversationId, 
        user_id: auth.user.id, 
        content, 
        role: 'user' 
      })
      .select()
      .single()

    if (error) {
      console.error('sendMessage error', error)
      throw new Error(error.message)
    }

    const msg: Message = {
      id: data.id,
      conversation_id: data.conversation_id,
      user_id: data.user_id || 'system',
      content: data.content,
      created_at: data.timestamp,
      is_ai: data.role === 'assistant',
      role: data.role,
      edited_at: data.edited_at,
      read_at: null,
      metadata: data.metadata,
      type: data.type,
    }
    return msg
  }
}

// Legacy exports for backward compatibility
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
