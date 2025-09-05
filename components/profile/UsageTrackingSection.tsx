'use client'

import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
  Select,
  Tabs,
  Tooltip
} from '@/libs/design-system';
import { Badge } from '@/libs/design-system'
import { Button } from '@/libs/design-system'

// TODO: Replace deprecated components: Progress
// 
// TODO: Replace deprecated components: Progress
// import { Progress } from '@/components/ui/progress'
import { TabsContent, TabsList, TabsTrigger } from '@/libs/design-system'
// TODO: Replace deprecated components: Tabs
// 
// TODO: Replace deprecated components: Tabs
// import { Tabs } from '@/components/ui/tabs'
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/libs/design-system'
// TODO: Replace deprecated components: Select
// 
// TODO: Replace deprecated components: Select
// import { Select } from '@/components/ui/select'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  MessageCircle,
  Bot,
  Upload,
  Calendar,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { UserProfile } from '@/src/types/user-tiers'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface UsageTrackingSectionProps {
  profile: UserProfile
}

interface UsageData {
  date: string
  messages: number
  agents: number
  files: number
  cost: number
}

interface UsageStats {
  totalMessages: number
  totalAgents: number
  totalFiles: number
  totalCost: number
  averageDailyUsage: number
  peakUsageDay: string
  costTrend: 'up' | 'down' | 'stable'
}

export function UsageTrackingSection({ profile }: UsageTrackingSectionProps) {
  const [timeRange, setTimeRange] = useState('30d')
  const [usageData, setUsageData] = useState<UsageData[]>([])
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUsageData()
  }, [timeRange])

  const loadUsageData = async () => {
    try {
      setIsLoading(true)
      // TODO: Load real usage data from API - currently using empty data for production readiness
      const mockData: UsageData[] = [] // Empty for production readiness

      setUsageData(mockData)

      // If no data, set safe defaults
      if (mockData.length === 0) {
        setUsageStats({
          totalMessages: 0,
          totalAgents: 0,
          totalFiles: 0,
          totalCost: 0,
          averageDailyUsage: 0,
          peakUsageDay: 'N/A',
          costTrend: 'stable',
        })
        return
      }

      // Calculate stats safely
      const totalMessages = mockData.reduce((sum, day) => sum + day.messages, 0)
      const totalAgents = mockData.reduce((sum, day) => sum + day.agents, 0)
      const totalFiles = mockData.reduce((sum, day) => sum + day.files, 0)
      const totalCost = mockData.reduce((sum, day) => sum + day.cost, 0)
      const averageDailyUsage = mockData.length ? totalMessages / mockData.length : 0
      const peakUsageDay = mockData.reduce(
        (max, day) => (day.messages > max.messages ? day : max),
        mockData[0]
      ).date

      // Simple cost trend calculation
      const mid = Math.floor(mockData.length / 2)
      const firstHalf = mockData.slice(0, mid)
      const secondHalf = mockData.slice(mid)
      const firstHalfAvg = firstHalf.length
        ? firstHalf.reduce((sum, day) => sum + day.cost, 0) / firstHalf.length
        : 0
      const secondHalfAvg = secondHalf.length
        ? secondHalf.reduce((sum, day) => sum + day.cost, 0) / secondHalf.length
        : 0
      const costTrend = secondHalfAvg > firstHalfAvg ? 'up' : secondHalfAvg < firstHalfAvg ? 'down' : 'stable'

      setUsageStats({
        totalMessages,
        totalAgents,
        totalFiles,
        totalCost,
        averageDailyUsage,
        peakUsageDay,
        costTrend,
      })
    } catch (error) {
      console.error('Failed to load usage data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportUsage = () => {
    // TODO: Implement usage data export
    console.log('Exporting usage data...')
  }

  const getUsagePercentage = (current: number, max: number) => {
    if (max === -1) return 0 // unlimited
    return Math.min((current / max) * 100, 100)
  }

  const getCostTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-green-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const pieData = usageStats ? [
    { name: 'Messages', value: usageStats.totalMessages, color: '#3b82f6' },
    { name: 'Agents', value: usageStats.totalAgents, color: '#10b981' },
    { name: 'Files', value: usageStats.totalFiles, color: '#f59e0b' }
  ] : []

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mr-2" />
          <span>Loading usage data...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Usage Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageStats?.totalMessages || 0}</div>
            <p className="text-xs text-muted-foreground">
              {timeRange} period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageStats?.totalAgents || 0}</div>
            <p className="text-xs text-muted-foreground">
              Created this period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Files Uploaded</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageStats?.totalFiles || 0}</div>
            <p className="text-xs text-muted-foreground">
              This period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            {usageStats && getCostTrendIcon(usageStats.costTrend)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${usageStats?.totalCost?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">
              {usageStats?.costTrend === 'up' ? 'Increasing' :
               usageStats?.costTrend === 'down' ? 'Decreasing' : 'Stable'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Current Plan Limits */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Limits & Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Messages Today
                </span>
                <span>{profile.usage.conversationsToday} / {profile.limits.maxMessagesPerDay === -1 ? '∞' : profile.limits.maxMessagesPerDay}</span>
              </div>
              <Progress
                value={getUsagePercentage(profile.usage.conversationsToday, profile.limits.maxMessagesPerDay)}
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  AI Agents Created
                </span>
                <span>{profile.usage.agentsCreated} / {profile.limits.maxAgents === -1 ? '∞' : profile.limits.maxAgents}</span>
              </div>
              <Progress
                value={getUsagePercentage(profile.usage.agentsCreated, profile.limits.maxAgents)}
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Files Uploaded
                </span>
                <span>{profile.usage.filesUploaded} / {profile.limits.maxFileUploads === -1 ? '∞' : profile.limits.maxFileUploads}</span>
              </div>
              <Progress
                value={getUsagePercentage(profile.usage.filesUploaded, profile.limits.maxFileUploads)}
                className="h-2"
              />
            </div>
          </div>

          {/* Usage Warnings */}
          {profile.limits.maxMessagesPerDay !== -1 &&
           profile.usage.conversationsToday > profile.limits.maxMessagesPerDay * 0.8 && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">
                    Approaching Message Limit
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    You&apos;ve used {Math.round((profile.usage.conversationsToday / profile.limits.maxMessagesPerDay) * 100)}%
                    of your daily message limit.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Analytics */}
      <Tabs defaultValue="charts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Charts Tab */}
        <TabsContent value="charts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Daily Usage</CardTitle>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">7 days</SelectItem>
                      <SelectItem value="30d">30 days</SelectItem>
                      <SelectItem value="90d">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="messages" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="agents" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Cost']} />
                    <Line type="monotone" dataKey="cost" stroke="#f59e0b" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Breakdown Tab */}
        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={(props) => {
                        const p = props?.percent ?? 0
                        const n = typeof props?.name === 'string' ? props.name : String(props?.name ?? '')
                        return `${n} ${(p * 100).toFixed(0)}%`
                      }}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Average Daily Messages</span>
                  <span className="font-medium">{usageStats?.averageDailyUsage?.toFixed(1) || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Peak Usage Day</span>
                  <span className="font-medium">{usageStats?.peakUsageDay || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total Cost</span>
                  <span className="font-medium">${usageStats?.totalCost?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Cost per Message</span>
                  <span className="font-medium">
                    ${usageStats?.totalMessages ? (usageStats.totalCost / usageStats.totalMessages).toFixed(4) : '0.0000'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="messages" fill="#3b82f6" />
                  <Bar dataKey="agents" fill="#10b981" />
                  <Bar dataKey="files" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Consistent Usage</p>
                    <p className="text-sm text-muted-foreground">
                      Your usage patterns are stable with {usageStats?.averageDailyUsage?.toFixed(0) || 0} messages per day.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Cost Efficiency</p>
                    <p className="text-sm text-muted-foreground">
                      Your cost per message is ${usageStats?.totalMessages ? (usageStats.totalCost / usageStats.totalMessages).toFixed(4) : '0.0000'}.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Activity className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Peak Usage</p>
                    <p className="text-sm text-muted-foreground">
                      Your most active day was {usageStats?.peakUsageDay || 'N/A'} with high engagement.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.tier === 'personal' && (
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Consider Team Plan</p>
                      <p className="text-sm text-muted-foreground">
                        With your usage patterns, the Team plan could save you money with higher limits.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Optimize Usage</p>
                    <p className="text-sm text-muted-foreground">
                      Consider batching requests and using fewer, more comprehensive prompts.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Download className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Export Data</p>
                    <p className="text-sm text-muted-foreground">
                      Download your usage data for detailed analysis and optimization.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Export Usage Data</CardTitle>
                <Button variant="outline" onClick={handleExportUsage}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Export your usage data as CSV for detailed analysis, budgeting, or record keeping.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}