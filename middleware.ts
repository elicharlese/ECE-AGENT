import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  // Development fallback: if Supabase env vars are missing, allow access to /auth and block others
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    if (!req.nextUrl.pathname.startsWith('/auth')) {
      return NextResponse.redirect(new URL('/auth', req.url))
    }
    return res
  }

  const supabase = createServerClient(
    supabaseUrl!,
    supabaseAnonKey!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => req.cookies.set(name, value))
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is not signed in and the current path is not /auth redirect the user to /auth
  if (!session && !req.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  // If user is signed in and the current path is /auth redirect the user to /messages
  if (session && (req.nextUrl.pathname === '/auth' || req.nextUrl.pathname.startsWith('/auth'))) {
    return NextResponse.redirect(new URL('/messages', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|auth/callback|auth/callback/.*).*)'],
}
