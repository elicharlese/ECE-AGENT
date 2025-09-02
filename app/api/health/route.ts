import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Health check response type
interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  uptime: number
  version: string
  services: {
    database: 'connected' | 'disconnected' | 'error'
    redis?: 'connected' | 'disconnected' | 'error'
    livekit?: 'connected' | 'disconnected' | 'error'
    external_apis?: 'operational' | 'degraded' | 'down'
  }
  environment: {
    node_env: string
    next_version: string
    platform: string
  }
  memory?: {
    used: number
    total: number
    percentage: number
  }
}

// Store application start time
const startTime = Date.now()

async function checkDatabaseHealth(): Promise<'connected' | 'disconnected' | 'error'> {
  try {
    const supabase = createClient()
    
    // Simple query to check database connectivity
    const { error } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.warn('Database health check failed:', error.message)
      return 'error'
    }
    
    return 'connected'
  } catch (error) {
    console.error('Database health check error:', error)
    return 'error'
  }
}

async function checkExternalAPIs(): Promise<'operational' | 'degraded' | 'down'> {
  try {
    // Check OpenRouter API (if configured)
    if (process.env.OPENROUTER_API_KEY) {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      })
      
      if (!response.ok) {
        return 'degraded'
      }
    }
    
    // Check LiveKit (if configured)
    if (process.env.LIVEKIT_URL) {
      // Simple connectivity check - you might want to implement a more thorough check
      return 'operational'
    }
    
    return 'operational'
  } catch (error) {
    console.warn('External API health check failed:', error)
    return 'degraded'
  }
}

function getMemoryUsage() {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const memUsage = process.memoryUsage()
    return {
      used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
    }
  }
  return undefined
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const detailed = url.searchParams.get('detailed') === 'true'
    
    // Run health checks
    const [dbStatus, apiStatus] = await Promise.all([
      checkDatabaseHealth(),
      checkExternalAPIs()
    ])
    
    // Determine overall health status
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    
    if (dbStatus === 'error') {
      overallStatus = 'unhealthy'
    } else if (dbStatus === 'disconnected' || apiStatus === 'down') {
      overallStatus = 'degraded'
    } else if (apiStatus === 'degraded') {
      overallStatus = 'degraded'
    }
    
    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - startTime,
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: dbStatus,
        external_apis: apiStatus,
      },
      environment: {
        node_env: process.env.NODE_ENV || 'development',
        next_version: process.env.NEXT_RUNTIME || 'nodejs',
        platform: process.platform || 'unknown',
      },
    }
    
    // Add memory info if detailed is requested
    if (detailed) {
      healthStatus.memory = getMemoryUsage()
    }
    
    // Return appropriate HTTP status code
    const statusCode = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503
    
    return NextResponse.json(healthStatus, { status: statusCode })
    
  } catch (error) {
    console.error('Health check failed:', error)
    
    const errorResponse: HealthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: Date.now() - startTime,
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: 'error',
        external_apis: 'down',
      },
      environment: {
        node_env: process.env.NODE_ENV || 'development',
        next_version: process.env.NEXT_RUNTIME || 'nodejs',
        platform: process.platform || 'unknown',
      },
    }
    
    return NextResponse.json(errorResponse, { status: 503 })
  }
}

// Support HEAD requests for load balancers
export async function HEAD() {
  return new Response(null, { status: 200 })
}
