import { supabase } from '@/lib/supabase/client'

export interface Profile {
  user_id: string
  username: string
  full_name?: string | null
  avatar_url?: string | null
  cover_url?: string | null
  solana_address?: string | null
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
  const normalized = sanitizeUsername(username)
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    // Exact match on normalized username
    .eq('username', normalized)
    .single()

  if (error) {
    if ((error as any).code === 'PGRST116') return null
    console.error('getProfileByUsername error', error)
    throw new Error(error.message)
  }
  return data
}

// Identifier lookup helper: supports username, email (uses email local-part normalization), or user_id (UUID)
export async function getProfileByIdentifier(identifier: string): Promise<Profile | null> {
  const id = identifier.trim()
  if (!id) return null

  // user_id (UUID v4 or similar)
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
  if (isUUID) {
    return getProfileByUserId(id)
  }

  // email -> map to normalized username derived from local part
  if (id.includes('@')) {
    const local = id.split('@')[0] ?? ''
    return getProfileByUsername(local)
  }

  // fall back to username lookup
  return getProfileByUsername(id)
}

// List/search profiles with optional exclusion of the current user
export async function listProfiles(options?: { search?: string; excludeSelf?: boolean; limit?: number }): Promise<Profile[]> {
  const search = options?.search?.trim()
  const excludeSelf = options?.excludeSelf ?? true
  const limit = options?.limit ?? 100

  let query = supabase
    .from('profiles')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(limit)

  try {
    if (excludeSelf) {
      const { data: auth } = await supabase.auth.getUser()
      if (auth?.user?.id) {
        query = query.neq('user_id', auth.user.id)
      }
    }

    if (search && search.length > 0) {
      // If an email was typed, search by its local-part normalized like our username policy
      const normalized = search.includes('@')
        ? sanitizeUsername(search.split('@')[0] ?? '')
        : search
      const pattern = `%${normalized}%`
      // Search username OR full_name
      query = query.or(`username.ilike.${pattern},full_name.ilike.${pattern}`)
    }

    const { data, error } = await query
    if (error) {
      console.error('listProfiles error', error)
      return []
    }
    return data ?? []
  } catch (e) {
    console.error('listProfiles exception', e)
    return []
  }
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

export async function updateProfile(patch: Partial<Pick<Profile, 'username' | 'full_name' | 'avatar_url' | 'cover_url' | 'solana_address'>>): Promise<Profile> {
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

// Convenience wrapper API used by components like components/user/user-profile.tsx
export const profileService = {
  // Alias to get by user id
  async getProfile(userId: string) {
    return getProfileByUserId(userId)
  },
  async updateProfile(id: string, patch: Record<string, unknown>) {
    const { data: auth } = await supabase.auth.getUser()
    if (!auth?.user) throw new Error('Not authenticated')
    if (id && id !== auth.user.id) {
      throw new Error('Cannot update another user\'s profile')
    }
    const allowed: Array<keyof Profile> = ['username', 'full_name', 'avatar_url', 'cover_url', 'solana_address']
    const filtered = Object.fromEntries(
      Object.entries(patch).filter(([k]) => (allowed as string[]).includes(k))
    ) as Partial<Pick<Profile, 'username' | 'full_name' | 'avatar_url' | 'cover_url' | 'solana_address'>>
    return updateProfile(filtered)
  },
  getProfileByUserId,
  getProfileByUsername,
  getProfileByIdentifier,
  listProfiles,
  ensureProfile,
}
