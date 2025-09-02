'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Activity,
  Database,
  Server,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap
} from 'lucide-react'

interface SystemHealth {
  database: 'healthy' | 'warning' | 'error'
  livekit: 'healthy' | 'warning' | 'error'
  billing: 'healthy' | 'warning' | 'error'
  server: 'healthy' | 'warning' | 'error'
  uptime: number
  lastChecked: Date
  details?: {
    database?: {
      connectionTime: number
      lastError?: string
    }
    livekit?: {
      webhookHealth: boolean
      lastWebhookReceived?: Date
    }
    billing?: {
      stripeStatus: boolean
      pendingInvoices: number
    }
    server?: {
      memoryUsage: number
      cpuUsage: number
    }
  }
}

interface AdminHealthMetricsProps {
  systemHealth: SystemHealth | null
}

export function AdminHealthMetrics({ systemHealth }: AdminHealthMetricsProps) {
  if (!systemHealth) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Loading health metrics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      case 'error': return <XCircle className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="space-y-6">
      {/* Overall System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            System Overview
          </CardTitle>
          <CardDescription>
            Real-time system health and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Uptime</span>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{formatUptime(systemHealth.uptime)}</div>
              <p className="text-xs text-muted-foreground">
                Last checked: {systemHealth.lastChecked.toLocaleTimeString()}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Memory Usage</span>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">
                {systemHealth.details?.server?.memoryUsage?.toFixed(1) || '0'}%
              </div>
              <Progress
                value={systemHealth.details?.server?.memoryUsage || 0}
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">CPU Usage</span>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">
                {systemHealth.details?.server?.cpuUsage?.toFixed(1) || '0'}%
              </div>
              <Progress
                value={systemHealth.details?.server?.cpuUsage || 0}
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Status</span>
                {getStatusIcon(systemHealth.server)}
              </div>
              <Badge
                variant="outline"
                className={getStatusColor(systemHealth.server)}
              >
                {systemHealth.server.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Database Health */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon(systemHealth.database)}
              <Badge
                variant="outline"
                className={getStatusColor(systemHealth.database)}
              >
                {systemHealth.database.toUpperCase()}
              </Badge>
            </div>

            {systemHealth.details?.database?.connectionTime && (
              <p className="text-xs text-muted-foreground">
                Connection time: {systemHealth.details.database.connectionTime}ms
              </p>
            )}

            {systemHealth.details?.database?.lastError && (
              <Alert className="mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Database Error</AlertTitle>
                <AlertDescription className="text-xs">
                  {systemHealth.details.database.lastError}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* LiveKit Health */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LiveKit</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon(systemHealth.livekit)}
              <Badge
                variant="outline"
                className={getStatusColor(systemHealth.livekit)}
              >
                {systemHealth.livekit.toUpperCase()}
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground">
              Webhook Health: {systemHealth.details?.livekit?.webhookHealth ? 'Active' : 'Inactive'}
            </p>

            {systemHealth.details?.livekit?.lastWebhookReceived && (
              <p className="text-xs text-muted-foreground">
                Last webhook: {systemHealth.details.livekit.lastWebhookReceived.toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Billing Health */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Billing</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon(systemHealth.billing)}
              <Badge
                variant="outline"
                className={getStatusColor(systemHealth.billing)}
              >
                {systemHealth.billing.toUpperCase()}
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground">
              Stripe Status: {systemHealth.details?.billing?.stripeStatus ? 'Connected' : 'Disconnected'}
            </p>

            {systemHealth.details?.billing?.pendingInvoices !== undefined && (
              <p className="text-xs text-muted-foreground">
                Pending Invoices: {systemHealth.details.billing.pendingInvoices}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {(systemHealth.database === 'error' || systemHealth.livekit === 'error' || systemHealth.billing === 'error') && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Critical System Issues Detected</AlertTitle>
          <AlertDescription className="text-red-700">
            One or more critical services are experiencing issues. Please check the service status above and take immediate action.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}