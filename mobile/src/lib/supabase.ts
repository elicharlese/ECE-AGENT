import { createClient } from '@supabase/supabase-js'
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

if (!supabaseUrl || !supabaseAnonKey) {
  // Do not throw on import in RN; warn so UI can handle gracefully
  // eslint-disable-next-line no-console
  console.warn(
    '[mobile/supabase] Missing env vars. Define EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_* fallbacks).'
  )
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  auth: {
    flowType: 'pkce',
    persistSession: true,
    autoRefreshToken: true,
  },
})
