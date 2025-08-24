import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/messages'

  // Forward all OAuth parameters (including state, error, etc.) to the client handler.
  // This is critical for PKCE state verification.
  const params = new URLSearchParams(searchParams)
  if (!params.has('next')) {
    params.set('next', next)
  }
  if (code || params.get('error')) {
    return NextResponse.redirect(`${origin}/auth/callback/client?${params.toString()}`)
  }
  // No OAuth params present; send user to auth with an error
  return NextResponse.redirect(`${origin}/auth?message=Could not authenticate user`)
}
