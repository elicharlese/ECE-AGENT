import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function getSupabaseServer() {
  // Next 15: cookies() is an async dynamic API; await it to access request cookies.
  const cookieStore: any = await (cookies as any)()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase env. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        try {
          return cookieStore?.get?.(name)?.value
        } catch {
          return undefined
        }
      },
      set(_name: string, _value: string, _options: any) {
        // No-op: cookie mutation is not allowed in Server Components.
      },
      remove(_name: string, _options: any) {
        // No-op: cookie mutation is not allowed in Server Components.
      },
    },
  })
}
