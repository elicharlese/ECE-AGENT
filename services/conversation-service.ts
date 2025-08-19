import { supabase } from '@/lib/supabase/client'

export interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
  user_id: string
}

export interface Message {
  id: string
  content: string
  timestamp: string
  senderId: string
  senderName: string
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'system' | 'app'
  isOwn: boolean
  status?: 'sent' | 'delivered' | 'read'
}

export async function getConversations(): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching conversations:', error)
    throw new Error(error.message)
  }

  return data || []
}

export async function getConversationById(id: string): Promise<Conversation | null> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching conversation:', error)
    throw new Error(error.message)
  }

  return data
}

export async function createConversation(title: string): Promise<Conversation> {
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) {
    throw new Error('Not authenticated')
  }
  const { data, error } = await supabase
    .from('conversations')
    .insert({ title, agent_id: 'dm', user_id: auth.user.id, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .select()
    .single()

  if (error) {
    console.error('Error creating conversation:', error)
    throw new Error(error.message)
  }

  return data
}

export async function updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation> {
  const { data, error } = await supabase
    .from('conversations')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating conversation:', error)
    throw new Error(error.message)
  }

  return data
}

export async function deleteConversation(id: string): Promise<void> {
  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting conversation:', error)
    throw new Error(error.message)
  }
}
