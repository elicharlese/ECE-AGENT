"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
  Tabs
} from '@/libs/design-system';
import { Badge } from '@/libs/design-system'
import { TabsContent, TabsList, TabsTrigger } from '@/libs/design-system'
// TODO: Replace deprecated components: Tabs
// 
// TODO: Replace deprecated components: Tabs
// import { Tabs } from '@/components/ui/tabs'

// TODO: Replace deprecated components: Progress
// 
// TODO: Replace deprecated components: Progress
// import { Progress } from '@/components/ui/progress'
import { BarChart3, TrendingUp, Users, Download, Star, Clock, AlertTriangle, CheckCircle } from "lucide-react"

export interface AppMetrics {
  appId: string
  appName: string
  totalDownloads: number
  activeUsers: number
  dailyActiveUsers: number
  weeklyActiveUsers: number
  monthlyActiveUsers: number
  retentionRates: {
    day1: number
    day7: number
    day30: number
  }
  averageRating: number
  totalReviews: number
  crashRate: number
  averageSessionTime: number
  popularityTrend: number[]
  downloadTrend: number[]
  ratingTrend: number[]
  topCountries: Array<{ country: string; users: number }>
  deviceBreakdown: Array<{ device: string; percentage: number }>
  featureUsage: Array<{ feature: string; usage: number }>
}

const mockMetrics: AppMetrics[] = [
  {
    appId: "smart-assistant-pro",
    appName: "Smart Assistant Pro",
    totalDownloads: 523847,
    activeUsers: 89234,
    dailyActiveUsers: 12456,
    weeklyActiveUsers: 45678,
    monthlyActiveUsers: 89234,
    retentionRates: {
      day1: 87.5,
      day7: 65.2,
      day30: 42.8,
    },
    averageRating: 4.9,
    totalReviews: 8934,
    crashRate: 0.02,
    averageSessionTime: 12.3,
    popularityTrend: [85, 87, 89, 92, 95, 94, 95],
    downloadTrend: [1200, 1450, 1680, 1890, 2100, 1950, 2200],
    ratingTrend: [4.7, 4.8, 4.8, 4.9, 4.9, 4.9, 4.9],
    topCountries: [
      { country: "United States", users: 25678 },
      { country: "United Kingdom", users: 12345 },
      { country: "Germany", users: 9876 },
      { country: "Canada", users: 8765 },
    ],
    deviceBreakdown: [
      { device: "Desktop", percentage: 45 },
      { device: "Mobile", percentage: 35 },
      { device: "Tablet", percentage: 20 },
    ],
    featureUsage: [
      { feature: "Natural Language Processing", usage: 89 },
      { feature: "Task Automation", usage: 76 },
      { feature: "Calendar Integration", usage: 65 },
      { feature: "Voice Commands", usage: 54 },
    ],
  },
  {
    appId: "secure-vote-plus",
    appName: "Secure Vote Plus",
    totalDownloads: 52341,
    activeUsers: 8934,
    dailyActiveUsers: 1245,
    weeklyActiveUsers: 4567,
    monthlyActiveUsers: 8934,
    retentionRates: {
      day1: 94.2,
      day7: 78.5,
      day30: 56.3,
    },
    averageRating: 4.7,
    totalReviews: 234,
    crashRate: 0.01,
    averageSessionTime: 8.7,
    popularityTrend: [70, 72, 75, 76, 78, 77, 78],
    downloadTrend: [150, 180, 200, 220, 250, 240, 260],
    ratingTrend: [4.5, 4.6, 4.6, 4.7, 4.7, 4.7, 4.7],
    topCountries: [
      { country: "United States", users: 3456 },
      { country: "European Union", users: 2345 },
      { country: "Canada", users: 1234 },
    ],
    deviceBreakdown: [
      { device: "Desktop", percentage: 70 },
      { device: "Mobile", percentage: 20 },
      { device: "Tablet", percentage: 10 },
    ],
    featureUsage: [
      { feature: "Secure Voting", usage: 95 },
      { feature: "Result Verification", usage: 87 },
      { feature: "Anonymous Participation", usage: 82 },
      { feature: "Multi-Party Computation", usage: 76 },
    ],
  },
]

interface AppAnalyticsDashboardProps {
  selectedAppId?: string
}

export function AppAnalyticsDashboard({ selectedAppId }: AppAnalyticsDashboardProps) {
  const [selectedApp, setSelectedApp] = useState<string>(selectedAppId || mockMetrics[0]?.appId || "")
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d")

  const currentMetrics = mockMetrics.find((m) => m.appId === selectedApp)

  if (!currentMetrics) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No analytics data available</p>
      </div>
    )
  }

  const getHealthStatus = (metrics: AppMetrics) => {
    const score =
      (metrics.retentionRates.day30 / 100) * 0.3 +
      (metrics.averageRating / 5) * 0.3 +
      (1 - metrics.crashRate) * 0.2 +
      Math.min(metrics.averageSessionTime / 15, 1) * 0.2

    if (score >= 0.8) return { status: "excellent", color: "text-green-600", icon: CheckCircle }
    if (score >= 0.6) return { status: "good", color: "text-blue-600", icon: TrendingUp }
    if (score >= 0.4) return { status: "fair", color: "text-yellow-600", icon: AlertTriangle }
    return { status: "poor", color: "text-red-600", icon: AlertTriangle }
  }

  const health = getHealthStatus(currentMetrics)
  const HealthIcon = health.icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AGENT - {currentMetrics.appName}</h2>
          <div className="flex items-center gap-4 mt-2">
            <div className={`flex items-center gap-2 ${health.color}`}>
              <HealthIcon className="h-4 w-4" />
              <span className="text-sm font-medium capitalize">{health.status} Health</span>
            </div>
            <Badge variant="outline">{currentMetrics.totalDownloads.toLocaleString()} downloads</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedApp}
            onChange={(e) => setSelectedApp(e.target.value)}
            className="p-2 border rounded-md text-sm"
          >
            {mockMetrics.map((metric) => (
              <option key={metric.appId} value={metric.appId}>
                {metric.appName}
              </option>
            ))}
          </select>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="p-2 border rounded-md text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Monthly active users</p>
            <div className="mt-2">
              <div className="text-xs text-gray-500 mb-1">
                Daily: {currentMetrics.dailyActiveUsers.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Weekly: {currentMetrics.weeklyActiveUsers.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Download className="h-4 w-4" />
              Downloads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics.totalDownloads.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Total downloads</p>
            <div className="mt-2">
              <div className="text-xs text-green-600">
                +{currentMetrics.downloadTrend[currentMetrics.downloadTrend.length - 1]} this week
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Star className="h-4 w-4" />
              Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics.averageRating}</div>
            <p className="text-xs text-gray-500">{currentMetrics.totalReviews.toLocaleString()} reviews</p>
            <div className="mt-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3 w-3 ${
                      star <= currentMetrics.averageRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Session Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentMetrics.averageSessionTime}m</div>
            <p className="text-xs text-gray-500">Average session</p>
            <div className="mt-2">
              <div className="text-xs text-gray-500">Crash rate: {(currentMetrics.crashRate * 100).toFixed(2)}%</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Popularity Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentMetrics.popularityTrend.map((value, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-xs w-12">Day {index + 1}</span>
                      <Progress value={value} className="flex-1" />
                      <span className="text-xs w-8">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Device Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentMetrics.deviceBreakdown.map((device) => (
                    <div key={device.device} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{device.device}</span>
                        <span>{device.percentage}%</span>
                      </div>
                      <Progress value={device.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Top Countries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentMetrics.topCountries.map((country, index) => (
                    <div key={country.country} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">#{index + 1}</span>
                        <span className="text-sm">{country.country}</span>
                      </div>
                      <span className="text-sm font-medium">{country.users.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">User Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Daily Active Users</span>
                    <span className="font-medium">{currentMetrics.dailyActiveUsers.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Weekly Active Users</span>
                    <span className="font-medium">{currentMetrics.weeklyActiveUsers.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Monthly Active Users</span>
                    <span className="font-medium">{currentMetrics.monthlyActiveUsers.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Session Time</span>
                    <span className="font-medium">{currentMetrics.averageSessionTime} minutes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="retention" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">User Retention Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{currentMetrics.retentionRates.day1}%</div>
                  <p className="text-sm text-gray-500">Day 1 Retention</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{currentMetrics.retentionRates.day7}%</div>
                  <p className="text-sm text-gray-500">Day 7 Retention</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{currentMetrics.retentionRates.day30}%</div>
                  <p className="text-sm text-gray-500">Day 30 Retention</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Feature Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentMetrics.featureUsage.map((feature) => (
                  <div key={feature.feature} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{feature.feature}</span>
                      <span>{feature.usage}%</span>
                    </div>
                    <Progress value={feature.usage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Crash Rate</span>
                    <span
                      className={`font-medium ${currentMetrics.crashRate < 0.05 ? "text-green-600" : "text-red-600"}`}
                    >
                      {(currentMetrics.crashRate * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Rating</span>
                    <span className="font-medium">{currentMetrics.averageRating}/5.0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Reviews</span>
                    <span className="font-medium">{currentMetrics.totalReviews.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Health Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${health.color}`}>
                    {Math.round(
                      ((currentMetrics.retentionRates.day30 / 100) * 0.3 +
                        (currentMetrics.averageRating / 5) * 0.3 +
                        (1 - currentMetrics.crashRate) * 0.2 +
                        Math.min(currentMetrics.averageSessionTime / 15, 1) * 0.2) *
                        100,
                    )}
                  </div>
                  <p className="text-sm text-gray-500 capitalize">{health.status} Health</p>
                  <div className="mt-4 space-y-2 text-xs text-left">
                    <div>Retention: {currentMetrics.retentionRates.day30}%</div>
                    <div>Rating: {currentMetrics.averageRating}/5.0</div>
                    <div>Stability: {((1 - currentMetrics.crashRate) * 100).toFixed(1)}%</div>
                    <div>Engagement: {Math.min((currentMetrics.averageSessionTime / 15) * 100, 100).toFixed(1)}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
