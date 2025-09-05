import { supabase } from '@/lib/supabase/client'

export interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
  user_id: string
  agent_id?: string
  last_message?: string
  unread_count?: number
  // Per-user flags (merged from membership for current user)
  is_archived?: boolean | null
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
  // Helper to prevent indefinite hangs when network/env is misconfigured
  const withTimeout = <T,>(p: PromiseLike<T>, ms = 5000): Promise<T> =>
    new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('timeout')), ms)
      Promise.resolve(p).then(
        (v: T) => {
          clearTimeout(t)
          resolve(v)
        },
        (e: any) => {
          clearTimeout(t)
          reject(e)
        }
      )
    })

  // Avoid querying if not authenticated
  let auth
  try {
    const res = await withTimeout(supabase.auth.getUser(), 3000)
    auth = res.data
  } catch (e) {
    console.warn('getConversations auth check failed/timeout, returning empty')
    return []
  }
  if (!auth?.user) return []

  // Fetch conversation ids where the user is a participant
  let memberRows: { conversation_id: string; is_archived?: boolean | null }[] | null = null
  let memberErr: any = null
  try {
    const res = await withTimeout<any>(
      supabase
        .from('conversation_participants')
        .select('conversation_id')  // Remove 'is_archived' since column doesn't exist
        .eq('user_id', auth.user.id) as unknown as PromiseLike<any>,
      4000
    )
    memberRows = (res?.data ?? null) as any
    memberErr = (res as any)?.error ?? null
  } catch (e) {
    memberErr = e
  }

  if (memberErr) {
    console.warn('getConversations membership error', memberErr)
  }

  // Also include conversations created by the user (policy allows select by creator)
  let ownRows: { id: string }[] | null = null
  let ownErr: any = null
  try {
    const res = await withTimeout<any>(
      supabase
        .from('conversations')
        .select('id')
        .eq('user_id', auth.user.id) as unknown as PromiseLike<any>,
      4000
    )
    ownRows = (res?.data ?? null) as any
    ownErr = (res as any)?.error ?? null
  } catch (e) {
    ownErr = e
  }
  if (ownErr) {
    console.warn('getConversations own-rows error', ownErr)
  }

  // Build unique set of conversation IDs from both sources
  const idsSet = new Set<string>()
  for (const r of memberRows || []) idsSet.add(r.conversation_id)
  for (const r of ownRows || []) idsSet.add(r.id)
  const ids = Array.from(idsSet)
  if (!ids.length) return []

  // Fetch only necessary columns and cap results for faster initial render
  let data: Conversation[] | null = null
  let error: any = null
  try {
    const res = await withTimeout<any>(
      supabase
        .from('conversations')
        .select('id, title, created_at, updated_at, user_id, agent_id')
        .in('id', ids)
        .order('updated_at', { ascending: false })
        .limit(50) as unknown as PromiseLike<any>,
      5000
    )
    data = (res?.data ?? null) as any
    error = (res as any)?.error ?? null
  } catch (e) {
    error = e
  }

  if (error) {
    const shape = {
      code: (error as any)?.code,
      message: (error as any)?.message,
      details: (error as any)?.details,
      hint: (error as any)?.hint,
    }
    console.warn('getConversations: returning empty due to error', shape)
    return []
  }

  // Merge per-user membership flags into conversation objects
  const flagsByConv = new Map<string, { is_archived?: boolean | null }>()
  for (const r of memberRows || []) {
    flagsByConv.set(r.conversation_id, { is_archived: r.is_archived ?? null })
  }

  const merged: Conversation[] = (data || []).map((c) => ({
    ...c,
    ...(flagsByConv.get(c.id) || {}),
  }))

  return merged
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

export async function createConversationWithParticipants(
  title: string,
  participantIds: string[] = [],
  agentId?: string,
): Promise<Conversation> {
  const res = await fetch('/api/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify({ title, participantIds, agentId }),
  })

  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = (json && (json.error || json.message)) || 'Failed to create conversation'
    throw new Error(msg)
  }
  return json.conversation as Conversation
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

  // Ensure membership row exists for creator (non-blocking best-effort)
  try {
    await supabase
      .from('conversation_participants')
      .insert({ conversation_id: data.id, user_id: auth.user.id, role: 'owner' })
  } catch (e) {
    console.warn('Failed to ensure creator membership row (non-blocking):', e)
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

// Membership helpers

export async function archiveConversation(conversationId: string, archived: boolean): Promise<void> {
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) throw new Error('Not authenticated')
  const { error } = await supabase
    .from('conversation_participants')
    .update({ is_archived: archived })
    .eq('conversation_id', conversationId)
    .eq('user_id', auth.user.id)
  if (error) {
    console.error('Error archiving conversation:', error)
    throw new Error(error.message)
  }
}

export async function leaveConversation(conversationId: string): Promise<void> {
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) throw new Error('Not authenticated')
  const { error } = await supabase
    .from('conversation_participants')
    .delete()
    .eq('conversation_id', conversationId)
    .eq('user_id', auth.user.id)
  if (error) {
    console.error('Error leaving conversation:', error)
    throw new Error(error.message)
  }
}

export async function inviteParticipants(conversationId: string, userIds: string[]): Promise<void> {
  if (!userIds || userIds.length === 0) return
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) throw new Error('Not authenticated')
  const rows = userIds
    .filter((u) => !!u && u !== auth.user!.id)
    .map((u) => ({ conversation_id: conversationId, user_id: u, role: 'member' as const }))
  if (rows.length === 0) return
  const { error } = await supabase.from('conversation_participants').insert(rows)
  if (error && (error as any)?.code !== '23505') {
    // 23505 unique_violation -> already a member; ignore silently
    console.error('Error inviting participants:', error)
    throw new Error((error as any).message || 'Failed to invite participants')
  }
}

// Aggregate service for compatibility with components importing `{ conversationService }`
export const conversationService = {
  getConversations,
  getConversationById,
  createConversation,
  createConversationWithParticipants,
  updateConversation,
  deleteConversation,
  archiveConversation,
  leaveConversation,
  inviteParticipants,
}
