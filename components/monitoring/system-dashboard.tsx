'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Activity,
  Database,
  Server,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  HardDrive,
  Zap
} from 'lucide-react'
import { log } from '@/lib/logger'

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  uptime: number
  version: string
  services: {
    database: 'connected' | 'disconnected' | 'error'
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

interface SystemMetrics {
  health: HealthStatus | null
  lastUpdated: Date | null
  isLoading: boolean
  error: string | null
}

export function SystemDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    health: null,
    lastUpdated: null,
    isLoading: true,
    error: null
  })

  const fetchHealthStatus = async () => {
    try {
      setMetrics(prev => ({ ...prev, isLoading: true, error: null }))
      
      const startTime = Date.now()
      const response = await fetch('/api/health?detailed=true')
      const endTime = Date.now()
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`)
      }
      
      const healthData: HealthStatus = await response.json()
      
      log.info('Health check completed', {
        status: healthData.status,
        responseTime: endTime - startTime,
        uptime: healthData.uptime
      })
      
      setMetrics({
        health: healthData,
        lastUpdated: new Date(),
        isLoading: false,
        error: null
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      log.error('Failed to fetch health status', error)
      
      setMetrics(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))
    }
  }

  useEffect(() => {
    fetchHealthStatus()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealthStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'operational':
        return 'text-green-600 bg-green-100'
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100'
      case 'unhealthy':
      case 'error':
      case 'disconnected':
      case 'down':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'operational':
        return <CheckCircle className="h-4 w-4" />
      case 'degraded':
        return <AlertTriangle className="h-4 w-4" />
      case 'unhealthy':
      case 'error':
      case 'disconnected':
      case 'down':
        return <WifiOff className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const formatUptime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  if (metrics.error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Monitoring Unavailable
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {metrics.error}
            </p>
            <Button onClick={fetchHealthStatus} disabled={metrics.isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${metrics.isLoading ? 'animate-spin' : ''}`} />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            System Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Real-time monitoring and health status
          </p>
        </div>
        <Button
          onClick={fetchHealthStatus}
          disabled={metrics.isLoading}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${metrics.isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${getStatusColor(metrics.health?.status || 'unknown')}`}>
                {getStatusIcon(metrics.health?.status || 'unknown')}
              </div>
              <div>
                <p className="text-sm font-medium">Overall Status</p>
                <p className="text-xs text-gray-500 capitalize">
                  {metrics.health?.status || 'Unknown'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Uptime</p>
                <p className="text-xs text-gray-500">
                  {metrics.health ? formatUptime(metrics.health.uptime) : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-medium">Version</p>
                <p className="text-xs text-gray-500">
                  {metrics.health?.version || 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <span className="text-xs font-medium">
                  {metrics.health?.environment.node_env?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium">Environment</p>
                <p className="text-xs text-gray-500 capitalize">
                  {metrics.health?.environment.node_env || 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="environment">Environment</TabsTrigger>
        </TabsList>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Database Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(metrics.health?.services.database || 'unknown')}>
                    {getStatusIcon(metrics.health?.services.database || 'unknown')}
                    <span className="ml-1 capitalize">
                      {metrics.health?.services.database || 'Unknown'}
                    </span>
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Supabase
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* External APIs Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="h-5 w-5" />
                  External APIs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(metrics.health?.services.external_apis || 'unknown')}>
                    {getStatusIcon(metrics.health?.services.external_apis || 'unknown')}
                    <span className="ml-1 capitalize">
                      {metrics.health?.services.external_apis || 'Unknown'}
                    </span>
                  </Badge>
                  <span className="text-sm text-gray-500">
                    OpenRouter, LiveKit
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          {metrics.health?.memory && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  Memory Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Heap Usage</span>
                    <span>
                      {formatBytes(metrics.health.memory.used * 1024 * 1024)} / 
                      {formatBytes(metrics.health.memory.total * 1024 * 1024)}
                    </span>
                  </div>
                  <Progress value={metrics.health.memory.percentage} className="h-2" />
                  <p className="text-xs text-gray-500">
                    {metrics.health.memory.percentage}% of available memory
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Environment Tab */}
        <TabsContent value="environment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Platform</p>
                  <p className="text-sm text-gray-500">{metrics.health?.environment.platform || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Next.js Version</p>
                  <p className="text-sm text-gray-500">{metrics.health?.environment.next_version || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Node Environment</p>
                  <p className="text-sm text-gray-500 capitalize">{metrics.health?.environment.node_env || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Updated</p>
                  <p className="text-sm text-gray-500">
                    {metrics.lastUpdated ? metrics.lastUpdated.toLocaleTimeString() : 'Never'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
