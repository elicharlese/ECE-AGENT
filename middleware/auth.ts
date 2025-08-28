import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function withAuth(request: NextRequest) {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  // Add user ID to request headers for downstream handlers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', session.user.id)
  requestHeaders.set('x-user-email', session.user.email || '')

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

// Rate limiting middleware
export function withRateLimit(
  limit: number = 10,
  windowMs: number = 60000
) {
  const requests = new Map<string, { count: number; resetTime: number }>()

  return async function (request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const now = Date.now()
    
    const record = requests.get(ip)
    
    if (!record || now > record.resetTime) {
      requests.set(ip, {
        count: 1,
        resetTime: now + windowMs,
      })
      return NextResponse.next()
    }
    
    if (record.count >= limit) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }
    
    record.count++
    return NextResponse.next()
  }
}

// Profile data validation middleware
export function validateProfileData(data: any) {
  const errors: string[] = []
  
  // Display name validation
  if (data.displayName) {
    if (typeof data.displayName !== 'string') {
      errors.push('Display name must be a string')
    } else if (data.displayName.length < 1 || data.displayName.length > 50) {
      errors.push('Display name must be between 1 and 50 characters')
    }
  }
  
  // Username validation
  if (data.username) {
    if (typeof data.username !== 'string') {
      errors.push('Username must be a string')
    } else {
      const usernameRegex = /^[a-z0-9_]{3,20}$/
      if (!usernameRegex.test(data.username)) {
        errors.push('Username must be 3-20 characters and contain only lowercase letters, numbers, and underscores')
      }
    }
  }
  
  // Bio validation
  if (data.bio) {
    if (typeof data.bio !== 'string') {
      errors.push('Bio must be a string')
    } else if (data.bio.length > 500) {
      errors.push('Bio must not exceed 500 characters')
    }
  }
  
  // Avatar URL validation
  if (data.avatarUrl) {
    if (typeof data.avatarUrl !== 'string') {
      errors.push('Avatar URL must be a string')
    } else {
      try {
        new URL(data.avatarUrl)
      } catch {
        errors.push('Avatar URL must be a valid URL')
      }
    }
  }
  
  return errors
}
