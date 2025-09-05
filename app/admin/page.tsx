'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
  Tabs
} from '@/libs/design-system';
import { TabsContent, TabsList, TabsTrigger } from '@/libs/design-system'
// TODO: Replace deprecated components: Tabs
// 
// TODO: Replace deprecated components: Tabs
// import { Tabs } from '@/components/ui/tabs'
import { Badge } from '@/libs/design-system'
import { Button } from '@/libs/design-system'
import { Alert, AlertDescription, AlertTitle } from '@/libs/design-system'

// TODO: Replace deprecated components: Progress
// 
// TODO: Replace deprecated components: Progress
// import { Progress } from '@/components/ui/progress'

// TODO: Replace deprecated components: Separator
// 
// TODO: Replace deprecated components: Separator
// import { Separator } from '@/components/ui/separator'
import {
  Activity,
  Users,
  DollarSign,
  Database,
  Server,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  BarChart3,
  TrendingUp,
  Clock,
  Zap
} from 'lucide-react'
import { AdminHealthMetrics } from '@/components/admin/AdminHealthMetrics'
import { AdminUsageCharts } from '@/components/admin/AdminUsageCharts'
import { AdminUserManagement } from '@/components/admin/AdminUserManagement'
import { AdminBillingControls } from '@/components/admin/AdminBillingControls'

interface SystemHealth {
  database: 'healthy' | 'warning' | 'error'
  livekit: 'healthy' | 'warning' | 'error'
  billing: 'healthy' | 'warning' | 'error'
  server: 'healthy' | 'warning' | 'error'
  uptime: number
  lastChecked: Date
}

interface UsageStats {
  totalUsers: number
  activeUsers: number
  totalRevenue: number
  monthlyRevenue: number
  tierDistribution: {
    trial: number
    personal: number
    team: number
    enterprise: number
  }
  usageTrends: {
    videoMinutes: number[]
    audioMinutes: number[]
    messages: number[]
    dataGB: number[]
  }
}

export default function AdminDashboard() {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // Check admin authorization
  useEffect(() => {
    checkAdminAuthorization()
  }, [])

  // Load dashboard data
  useEffect(() => {
    if (isAuthorized) {
      loadDashboardData()
    }
  }, [isAuthorized])

  const checkAdminAuthorization = async () => {
    try {
      // Check if user has admin role
      const response = await fetch('/api/admin/auth', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        setIsAuthorized(true)
      } else {
        setIsAuthorized(false)
      }
    } catch (error) {
      console.error('Admin auth check failed:', error)
      setIsAuthorized(false)
    } finally {
      setIsLoading(false)
    }
  }

  const loadDashboardData = async () => {
    try {
      // Load system health
      const healthResponse = await fetch('/api/admin/health')
      if (healthResponse.ok) {
        const healthData = await healthResponse.json()
        setSystemHealth(healthData)
      }

      // Load usage statistics
      const usageResponse = await fetch('/api/admin/usage-stats')
      if (usageResponse.ok) {
        const usageData = await usageResponse.json()
        setUsageStats(usageData)
      }

      setLastRefresh(new Date())
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    }
  }

  const handleRefresh = () => {
    loadDashboardData()
  }

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'error': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
            <CardDescription className="text-center">
              You don&apos;t have permission to access the admin dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Monitor system health and manage application operations
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </div>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {systemHealth && getHealthStatusIcon(systemHealth.server)}
                <div className="text-2xl font-bold">
                  {systemHealth?.server === 'healthy' ? 'Healthy' : 'Issues'}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Uptime: {systemHealth ? `${Math.floor(systemHealth.uptime / 3600)}h ${Math.floor((systemHealth.uptime % 3600) / 60)}m` : 'N/A'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Database</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {systemHealth && getHealthStatusIcon(systemHealth.database)}
                <div className="text-2xl font-bold">
                  {systemHealth?.database === 'healthy' ? 'Connected' : 'Issues'}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Supabase connection status
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">LiveKit</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {systemHealth && getHealthStatusIcon(systemHealth.livekit)}
                <div className="text-2xl font-bold">
                  {systemHealth?.livekit === 'healthy' ? 'Active' : 'Issues'}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Real-time communication service
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Billing</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {systemHealth && getHealthStatusIcon(systemHealth.billing)}
                <div className="text-2xl font-bold">
                  {systemHealth?.billing === 'healthy' ? 'Active' : 'Issues'}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Payment processing status
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usageStats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                {usageStats?.activeUsers || 0} active this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${usageStats?.monthlyRevenue?.toFixed(2) || '0.00'}</div>
              <p className="text-xs text-muted-foreground">
                Total: ${usageStats?.totalRevenue?.toFixed(2) || '0.00'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Load</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Normal</div>
              <Progress value={65} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                65% capacity utilization
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="billing">Billing Controls</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AdminHealthMetrics systemHealth={systemHealth} />
          </TabsContent>

          <TabsContent value="usage" className="space-y-6">
            <AdminUsageCharts usageStats={usageStats} />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <AdminUserManagement />
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <AdminBillingControls />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}