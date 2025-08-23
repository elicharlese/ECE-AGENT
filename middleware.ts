import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Minimal, pass-through middleware to avoid Edge runtime bundling of Supabase
export function middleware(_req: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Keep same path matching, but do not perform auth checks here
    '/((?!api/webhooks|auth/callback|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
}
