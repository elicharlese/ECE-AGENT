import { supabase } from '@/lib/supabase/client'

export interface Profile {
  user_id: string
  username: string
  full_name?: string | null
  avatar_url?: string | null
  created_at: string
  updated_at: string
}

const sanitizeUsername = (raw: string) =>
  raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '-')
    .replace(/^-+|-+$/g, '')

export async function getProfileByUserId(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    if ((error as any).code === 'PGRST116') return null
    console.error('getProfileByUserId error', error)
    throw new Error(error.message)
  }
  return data
}

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', username)
    .single()

  if (error) {
    if ((error as any).code === 'PGRST116') return null
    console.error('getProfileByUsername error', error)
    throw new Error(error.message)
  }
  return data
}

export async function ensureProfile(): Promise<Profile> {
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) throw new Error('Not authenticated')

  const existing = await getProfileByUserId(auth.user.id)
  if (existing) return existing

  // Derive a username from email or user id
  const base = auth.user.email ? sanitizeUsername(auth.user.email.split('@')[0]) : `user-${auth.user.id.slice(0, 8)}`

  // Ensure unique username
  let candidate = base || `user-${auth.user.id.slice(0, 8)}`
  for (let i = 0; i < 5; i++) {
    const { data: taken } = await supabase
      .from('profiles')
      .select('user_id')
      .ilike('username', candidate)
      .maybeSingle()

    if (!taken) break
    candidate = `${base}-${Math.floor(1000 + Math.random() * 9000)}`
  }

  const { data, error } = await supabase
    .from('profiles')
    .insert({ user_id: auth.user.id, username: candidate, full_name: auth.user.user_metadata?.full_name ?? null, avatar_url: auth.user.user_metadata?.avatar_url ?? null })
    .select()
    .single()

  if (error) {
    console.error('ensureProfile insert error', error)
    throw new Error(error.message)
  }
  return data
}

export async function updateProfile(patch: Partial<Pick<Profile, 'username' | 'full_name' | 'avatar_url'>>): Promise<Profile> {
  const { data: auth } = await supabase.auth.getUser()
  if (!auth?.user) throw new Error('Not authenticated')

  const updates: any = { ...patch }
  if (patch.username) updates.username = sanitizeUsername(patch.username)

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', auth.user.id)
    .select()
    .single()

  if (error) {
    console.error('updateProfile error', error)
    throw new Error(error.message)
  }
  return data
}
