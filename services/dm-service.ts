import { supabase } from '@/lib/supabase/client'
import type { Conversation } from '@/services/conversation-service'
import { ensureProfile, getProfileByIdentifier } from '@/services/profile-service'

async function findExistingDM(userA: string, userB: string): Promise<Conversation | null> {
  // Find conversation IDs that contain both participants
  const { data, error } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .in('user_id', [userA, userB])

  if (error) {
    console.error('findExistingDM error', error)
    throw new Error(error.message)
  }

  if (!data || data.length === 0) return null

  // Count occurrences per conversation_id
  const counts = new Map<string, number>()
  for (const row of data) {
    counts.set(row.conversation_id, (counts.get(row.conversation_id) || 0) + 1)
  }
  const candidateId = Array.from(counts.entries()).find(([, c]) => c >= 2)?.[0]
  if (!candidateId) return null

  const { data: conv, error: convErr } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', candidateId)
    .single()

  if (convErr) {
    if ((convErr as any).code === 'PGRST116') return null
    throw new Error(convErr.message)
  }
  return conv as Conversation
}

// Aggregate service for compatibility with components importing `{ dmService }`
export const dmService = {
  startDirectMessageByUsername,
}

export async function startDirectMessageByUsername(username: string): Promise<Conversation> {
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) throw new Error('Not authenticated')

  // Ensure current user has a profile
  await ensureProfile()

  // Find target profile by username, email, or user ID
  const target = await getProfileByIdentifier(username)
  if (!target) {
    throw new Error('User not found')
  }
  if (target.user_id === auth.user.id) {
    throw new Error('Cannot start a chat with yourself')
  }

  // Check for existing DM
  const existing = await findExistingDM(auth.user.id, target.user_id)
  if (existing) return existing

  // Create conversation with title as target username
  const { data: conv, error: convError } = await supabase
    .from('conversations')
    .insert({ title: target.username, agent_id: 'dm', user_id: auth.user.id })
    .select()
    .single()

  if (convError) {
    console.error('startDirectMessage insert conversation error', convError)
    throw new Error(convError.message)
  }

  // Add both participants
  const { error: partErr } = await supabase.from('conversation_participants').insert([
    { conversation_id: conv.id, user_id: auth.user.id, role: 'owner' },
    { conversation_id: conv.id, user_id: target.user_id, role: 'member' },
  ])
  if (partErr) {
    console.error('startDirectMessage insert participants error', partErr)
    throw new Error(partErr.message)
  }

  return conv as Conversation
}
