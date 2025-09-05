import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import Constants from 'expo-constants'

// Prefer Expo public vars, but fall back to NEXT_PUBLIC_* if present in env
const extra = Constants?.expoConfig?.extra as
  | { [k: string]: any }
  | undefined

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  extra?.EXPO_PUBLIC_SUPABASE_URL ||
  extra?.supabaseUrl

const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  extra?.supabaseAnonKey

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!supabaseConfigured) {
  // Do not throw on import in RN; warn so UI can handle gracefully
  // eslint-disable-next-line no-console
  console.warn(
    '[mobile/supabase] Missing env vars. Define EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_* fallbacks).'
  )
}

let _supabase: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase
  if (!supabaseConfigured) {
    throw new Error('Supabase is not configured. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in mobile/.env.local or via app.config.ts extra.')
  }
  _supabase = createClient(supabaseUrl as string, supabaseAnonKey as string, {
    auth: {
      flowType: 'pkce',
      persistSession: true,
      autoRefreshToken: true,
    },
  })
  return _supabase
}

// Export the singleton instance for convenience (with error handling)
export const supabase = (() => {
  try {
    return getSupabase()
  } catch (error) {
    console.warn('[mobile/supabase] Failed to initialize:', error)
    // Return a mock client that throws on usage for graceful degradation
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: () => Promise.resolve({ data: { user: null }, error: new Error('Supabase not configured') }),
        signInWithOAuth: () => Promise.resolve({ error: new Error('Supabase not configured') }),
        signInWithOtp: () => Promise.resolve({ error: new Error('Supabase not configured') }),
        exchangeCodeForSession: () => Promise.resolve({ data: { session: null }, error: new Error('Supabase not configured') }),
      }
    } as any
  }
})()
