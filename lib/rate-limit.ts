import { NextRequest, NextResponse } from 'next/server'
import { log } from './logger'

// Rate limit configuration
interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  skipSuccessfulRequests?: boolean // Skip rate limiting for successful requests
  skipFailedRequests?: boolean // Skip rate limiting for failed requests
}

// In-memory store for rate limiting (use Redis in production)
interface RateLimitEntry {
  count: number
  resetTime: number
}

class MemoryStore {
  private store = new Map<string, RateLimitEntry>()

  get(key: string): RateLimitEntry | undefined {
    const entry = this.store.get(key)
    if (entry && Date.now() > entry.resetTime) {
      this.store.delete(key)
      return undefined
    }
    return entry
  }

  set(key: string, entry: RateLimitEntry): void {
    this.store.set(key, entry)
  }

  increment(key: string, windowMs: number): RateLimitEntry {
    const now = Date.now()
    const resetTime = now + windowMs
    const existing = this.get(key)

    if (existing) {
      existing.count++
      return existing
    }

    const newEntry: RateLimitEntry = { count: 1, resetTime }
    this.set(key, newEntry)
    return newEntry
  }

  // Cleanup expired entries (call periodically)
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key)
      }
    }
  }
}

const store = new MemoryStore()

// Cleanup expired entries every 5 minutes
if (typeof globalThis !== 'undefined') {
  setInterval(() => store.cleanup(), 5 * 60 * 1000)
}

// Default rate limit configurations
export const rateLimitConfigs = {
  // Strict limits for auth endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
  },
  
  // API endpoints
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
  },
  
  // Chat/WebSocket endpoints
  chat: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 120, // 120 messages per minute
  },
  
  // File uploads
  upload: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 uploads per minute
  },
  
  // General endpoints
  general: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
  },
}

// Get client identifier (IP address)
function getClientIdentifier(request: NextRequest): string {
  // Try different headers for client IP
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const clientIp = request.headers.get('x-client-ip')
  
  // Use the first available IP, fallback to a default
  const ip = forwarded?.split(',')[0]?.trim() || 
             realIp || 
             clientIp || 
             'unknown'
  
  // For authenticated requests, you could also include user ID
  // const userId = await getUserIdFromRequest(request)
  // return userId ? `${ip}:${userId}` : ip
  
  return ip
}

// Create rate limit key
function createRateLimitKey(identifier: string, endpoint: string): string {
  return `${identifier}:${endpoint}`
}

// Rate limiting middleware function
export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = rateLimitConfigs.general
): Promise<{ success: true } | { success: false; response: NextResponse }> {
  const identifier = getClientIdentifier(request)
  const endpoint = new URL(request.url).pathname
  const key = createRateLimitKey(identifier, endpoint)
  
  const entry = store.increment(key, config.windowMs)
  
  // Check if limit exceeded
  if (entry.count > config.maxRequests) {
    const resetTime = new Date(entry.resetTime)
    const retryAfter = Math.ceil((entry.resetTime - Date.now()) / 1000)
    
    log.warn(`Rate limit exceeded for ${identifier} on ${endpoint}`, {
      count: entry.count,
      limit: config.maxRequests,
      retryAfter,
      userAgent: request.headers.get('user-agent'),
    })
    
    const response = NextResponse.json(
      {
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': resetTime.toISOString(),
        },
      }
    )
    
    return { success: false, response }
  }
  
  // Add rate limit headers to successful requests
  const remaining = Math.max(0, config.maxRequests - entry.count)
  const resetTime = new Date(entry.resetTime)
  
  // Log rate limit info for monitoring
  if (entry.count > config.maxRequests * 0.8) {
    log.info(`Rate limit approaching for ${identifier} on ${endpoint}`, {
      count: entry.count,
      limit: config.maxRequests,
      remaining,
    })
  }
  
  return { success: true }
}

// Higher-order function to create rate-limited API routes
export function withRateLimit(
  config: RateLimitConfig = rateLimitConfigs.api
) {
  return function rateLimitWrapper(
    handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse> | NextResponse
  ) {
    return async function rateLimitedHandler(
      request: NextRequest,
      ...args: any[]
    ): Promise<NextResponse> {
      const result = await rateLimit(request, config)
      
      if (!result.success) {
        return result.response
      }
      
      return handler(request, ...args)
    }
  }
}

// Utility function to get rate limit status
export function getRateLimitStatus(identifier: string, endpoint: string): RateLimitEntry | null {
  const key = createRateLimitKey(identifier, endpoint)
  return store.get(key) || null
}

// Export types
export type { RateLimitConfig, RateLimitEntry }
