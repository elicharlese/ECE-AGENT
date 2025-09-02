import { createBrowserClient } from '@supabase/ssr'

// Get Supabase URL and anon key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Create Supabase browser client that also manages cookies for SSR compatibility
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    // Let the SDK handle PKCE and OTP detection directly from the URL
    detectSessionInUrl: true,
  },
  cookieOptions: {
    // Allow cookies over http locally to avoid dev redirect loops
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    // IMPORTANT: Use root path so auth cookies are sent on all routes
    path: '/',
  },
})

// Export createClient function for compatibility
export function createClient() {
  return supabase
}
