import { NextRequest, NextResponse } from 'next/server'
import { usageTrackingService } from '@/services/usage-tracking-service-enhanced'

// GET /api/usage - Get user's usage summary
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || 'month'
    const format = searchParams.get('format') || 'json'

    if (timeframe === 'report') {
      // Generate detailed usage report
      const startDate = new Date(searchParams.get('startDate') || Date.now() - 30 * 24 * 60 * 60 * 1000)
      const endDate = new Date(searchParams.get('endDate') || Date.now())

      const report = await usageTrackingService.generateUsageReport(userId, startDate, endDate)

      if (format === 'csv') {
        const csvData = (await usageTrackingService.exportUsageData(userId, 'csv')) as string
        return new Response(csvData, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="usage-report.csv"'
          }
        })
      }

      return NextResponse.json({ report })
    }

    // Get current usage summary
    const usageSummary = await usageTrackingService.getUserUsageSummary(userId)

    if (!usageSummary) {
      return NextResponse.json({ error: 'Usage data not found' }, { status: 404 })
    }

    return NextResponse.json({ usage: usageSummary })

  } catch (error) {
    console.error('Usage API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/usage - Handle usage operations
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...params } = body

    switch (action) {
      case 'validate_usage':
        const { type, amount } = params
        const validation = await usageTrackingService.validateUsage(userId, type, amount)
        return NextResponse.json(validation)

      case 'reset_cycle':
        await usageTrackingService.resetUsageForNewCycle(userId)
        return NextResponse.json({ success: true, message: 'Usage cycle reset' })

      case 'export_data':
        const format = params.format || 'json'
        const exportData = await usageTrackingService.exportUsageData(userId, format)

        if (format === 'csv') {
          const csvData = exportData as string
          return new Response(csvData, {
            headers: {
              'Content-Type': 'text/csv',
              'Content-Disposition': 'attachment; filename="usage-data.csv"'
            }
          })
        }

        return NextResponse.json({ data: exportData })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Usage API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}