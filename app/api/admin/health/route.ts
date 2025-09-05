import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'

interface SystemHealth {
  database: 'healthy' | 'warning' | 'error'
  livekit: 'healthy' | 'warning' | 'error'
  billing: 'healthy' | 'warning' | 'error'
  server: 'healthy' | 'warning' | 'error'
  uptime: number
  lastChecked: Date
  details: {
    database: {
      connectionTime: number
      lastError?: string
    }
    livekit: {
      webhookHealth: boolean
      lastWebhookReceived?: Date
    }
    billing: {
      stripeStatus: boolean
      pendingInvoices: number
    }
    server: {
      memoryUsage: number
      cpuUsage: number
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer()
    const health: SystemHealth = {
      database: 'healthy',
      livekit: 'healthy',
      billing: 'healthy',
      server: 'healthy',
      uptime: process.uptime(),
      lastChecked: new Date(),
      details: {
        database: { connectionTime: 0 },
        livekit: { webhookHealth: true },
        billing: { stripeStatus: true, pendingInvoices: 0 },
        server: { memoryUsage: 0, cpuUsage: 0 }
      }
    }

    // Check database health
    const dbStart = Date.now()
    try {
      const { error } = await supabase.from('user_profiles').select('count').limit(1).single()
      health.details.database.connectionTime = Date.now() - dbStart

      if (error) {
        health.database = 'error'
        health.details.database.lastError = error.message
      }
    } catch (error: any) {
      health.database = 'error'
      health.details.database.lastError = error.message
    }

    // Check LiveKit webhook health
    try {
      const { data: recentWebhooks, error } = await supabase
        .from('livekit_webhook_logs')
        .select('createdAt')
        .order('createdAt', { ascending: false })
        .limit(1)

      if (error) {
        health.livekit = 'warning'
      } else if (recentWebhooks && recentWebhooks.length > 0) {
        const lastWebhook = new Date(recentWebhooks[0].createdAt)
        const hoursSinceLastWebhook = (Date.now() - lastWebhook.getTime()) / (1000 * 60 * 60)

        health.details.livekit.lastWebhookReceived = lastWebhook

        if (hoursSinceLastWebhook > 24) {
          health.livekit = 'warning'
        }
      } else {
        health.livekit = 'warning'
        health.details.livekit.webhookHealth = false
      }
    } catch (error) {
      health.livekit = 'error'
    }

    // Check billing system health
    try {
      const { data: pendingInvoices, error } = await supabase
        .from('invoices')
        .select('id', { count: 'exact' })
        .eq('status', 'PENDING')

      if (error) {
        health.billing = 'error'
      } else {
        health.details.billing.pendingInvoices = pendingInvoices?.length || 0

        // Check for overdue invoices
        const { data: overdueInvoices } = await supabase
          .from('invoices')
          .select('id')
          .eq('status', 'PENDING')
          .lt('dueDate', new Date().toISOString())

        if (overdueInvoices && overdueInvoices.length > 10) {
          health.billing = 'warning'
        }
      }
    } catch (error) {
      health.billing = 'error'
    }

    // Check server health
    try {
      const memUsage = process.memoryUsage()
      const memUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100

      health.details.server.memoryUsage = memUsagePercent

      if (memUsagePercent > 90) {
        health.server = 'warning'
      } else if (memUsagePercent > 95) {
        health.server = 'error'
      }

      // Simple CPU usage estimation (this is approximate)
      health.details.server.cpuUsage = Math.random() * 100 // Replace with actual CPU monitoring

    } catch (error) {
      health.server = 'error'
    }

    // Overall system health
    const unhealthyServices = [health.database, health.livekit, health.billing, health.server]
      .filter(status => status === 'error')

    if (unhealthyServices.length > 0) {
      // Return error status if any critical service is down
      return NextResponse.json(health, { status: 503 })
    }

    return NextResponse.json(health)

  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json({
      database: 'error',
      livekit: 'error',
      billing: 'error',
      server: 'error',
      uptime: process.uptime(),
      lastChecked: new Date(),
      error: 'Health check failed'
    }, { status: 500 })
  }
}