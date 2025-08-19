import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  // Allow auth callback routes to pass through
  if (req.nextUrl.pathname.startsWith('/auth/callback')) {
    return res
  }

  // Check for dev admin cookie in development
  const isDevAdmin = process.env.NODE_ENV === 'development' && req.cookies.get('dev_admin')?.value === 'true'
  
  // If dev admin, allow access to all routes except /auth
  if (isDevAdmin) {
    if (req.nextUrl.pathname === '/auth') {
      return NextResponse.redirect(new URL('/messages', req.url))
    }
    return res
  }

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
  if (session && req.nextUrl.pathname === '/auth') {
    return NextResponse.redirect(new URL('/messages', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
