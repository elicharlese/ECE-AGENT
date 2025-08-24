import { createBrowserClient } from '@supabase/ssr'

// Get Supabase URL and anon key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Derive a cookie path based on either the "next" query param (on auth callback) or the current URL.
// Supports two conventions:
// 1) Compact: "/u123/..."
// 2) Nested:  "/u/123/..."
function computeCookiePath(): string {
  if (typeof window === 'undefined') return '/'
  try {
    const url = new URL(window.location.href)
    const pathname = url.pathname
    // Critical: ensure cookies are visible on the callback page where the PKCE
    // exchange happens. Cookies set to a subpath (e.g., /messages) are NOT
    // readable on /auth/callback, which can cause an apparent "hang".
    if (pathname.startsWith('/auth/callback')) return '/'
    const sourcePath = pathname
    const segments = sourcePath.split('/').filter(Boolean)
    const first = segments[0]
    const second = segments[1]
    const compact = /^u[\w-]+$/ // e.g., u1, u-abc, u123
    const idSeg = /^[\w-]+$/
    if (first === 'u' && second && idSeg.test(second)) return `/${first}/${second}`
    if (first && compact.test(first)) return `/${first}`
    return '/'
  } catch {
    return '/'
  }
}

// Create Supabase browser client that also manages cookies for SSR compatibility
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    // We handle PKCE exchange explicitly on the callback page to avoid duplicate handling
    detectSessionInUrl: false,
  },
  cookieOptions: {
    // Allow cookies over http locally to avoid dev redirect loops
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: computeCookiePath(),
  },
})
