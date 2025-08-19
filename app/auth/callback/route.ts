import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/messages'

  if (code) {
    const cookieStore = await cookies()
    const pendingCookies: { name: string; value: string; options: any }[] = []
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            // Capture cookies and attach them to the eventual response
            cookiesToSet.forEach((c) => pendingCookies.push(c))
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      console.log('[auth/callback] Server exchange succeeded')
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      const redirectUrl = isLocalEnv
        ? `${origin}${next}`
        : forwardedHost
        ? `https://${forwardedHost}${next}`
        : `${origin}${next}`
      const response = NextResponse.redirect(redirectUrl)
      // Attach cookies to response
      pendingCookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      return response
    } else {
      console.error('[auth/callback] Server exchange failed:', error?.message)
      // Fallback: perform client-side exchange in the browser (avoids any server cookie issues)
      const params = new URLSearchParams()
      params.set('code', code)
      if (next) params.set('next', next)
      return NextResponse.redirect(`${origin}/auth/callback/client?${params.toString()}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth?message=Could not authenticate user`)
}
