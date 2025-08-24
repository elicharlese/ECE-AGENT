import { NextResponse } from 'next/server'

// Minimal, pass-through middleware to avoid Edge runtime issues
export function middleware() {
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Exclude API routes and Next internals; apply to everything else
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
}
