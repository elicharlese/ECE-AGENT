'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react'

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
  topUsers?: Array<{
    userId: string
    email: string
    tier: string
    totalUsage: number
    revenue: number
  }>
  recentActivity?: Array<{
    type: string
    description: string
    timestamp: Date
    userId?: string
  }>
}

interface AdminUsageChartsProps {
  usageStats: UsageStats | null
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function AdminUsageCharts({ usageStats }: AdminUsageChartsProps) {
  if (!usageStats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage Analytics</CardTitle>
          <CardDescription>Loading usage data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Prepare chart data
  const usageTrendData = usageStats.usageTrends.videoMinutes.map((video, index) => ({
    day: `Day ${index + 1}`,
    videoMinutes: video,
    audioMinutes: usageStats.usageTrends.audioMinutes[index] || 0,
    messages: usageStats.usageTrends.messages[index] || 0,
    dataGB: usageStats.usageTrends.dataGB[index] || 0
  }))

  const tierDistributionData = [
    { name: 'Trial', value: usageStats.tierDistribution.trial, color: COLORS[0] },
    { name: 'Personal', value: usageStats.tierDistribution.personal, color: COLORS[1] },
    { name: 'Team', value: usageStats.tierDistribution.team, color: COLORS[2] },
    { name: 'Enterprise', value: usageStats.tierDistribution.enterprise, color: COLORS[3] }
  ].filter(item => item.value > 0)

  const chartConfig = {
    videoMinutes: {
      label: 'Video Minutes',
      color: '#0088FE'
    },
    audioMinutes: {
      label: 'Audio Minutes',
      color: '#00C49F'
    },
    messages: {
      label: 'Messages',
      color: '#FFBB28'
    },
    dataGB: {
      label: 'Data (GB)',
      color: '#FF8042'
    }
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {usageStats.activeUsers} active this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${usageStats.monthlyRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total: ${usageStats.totalRevenue.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Revenue/User</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${usageStats.totalUsers > 0 ? (usageStats.totalRevenue / usageStats.totalUsers).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Per user lifetime value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usageStats.totalUsers > 0 ?
                ((usageStats.tierDistribution.personal + usageStats.tierDistribution.team + usageStats.tierDistribution.enterprise) / usageStats.totalUsers * 100).toFixed(1)
                : '0'
              }%
            </div>
            <p className="text-xs text-muted-foreground">
              Trial to paid conversion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="usage-trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="usage-trends">Usage Trends</TabsTrigger>
          <TabsTrigger value="tier-distribution">Tier Distribution</TabsTrigger>
          <TabsTrigger value="top-users">Top Users</TabsTrigger>
        </TabsList>

        <TabsContent value="usage-trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Trends (Last 30 Days)</CardTitle>
              <CardDescription>
                Daily usage metrics across all users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <LineChart data={usageTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="videoMinutes"
                    stroke="#0088FE"
                    strokeWidth={2}
                    name="Video Minutes"
                  />
                  <Line
                    type="monotone"
                    dataKey="audioMinutes"
                    stroke="#00C49F"
                    strokeWidth={2}
                    name="Audio Minutes"
                  />
                  <Line
                    type="monotone"
                    dataKey="messages"
                    stroke="#FFBB28"
                    strokeWidth={2}
                    name="Messages"
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Usage Trends</CardTitle>
              <CardDescription>
                Data transfer volume over the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <AreaChart data={usageTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="dataGB"
                    stroke="#FF8042"
                    fill="#FF8042"
                    fillOpacity={0.6}
                    name="Data (GB)"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tier-distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Tier Distribution</CardTitle>
                <CardDescription>
                  Breakdown of users by subscription tier
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <PieChart>
                    <Pie
                      data={tierDistributionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {tierDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tier Statistics</CardTitle>
                <CardDescription>
                  Detailed breakdown by tier
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {tierDistributionData.map((tier, index) => (
                  <div key={tier.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tier.color }}
                      />
                      <span className="text-sm font-medium">{tier.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{tier.value}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {usageStats.totalUsers > 0 ? ((tier.value / usageStats.totalUsers) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="top-users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Users by Usage</CardTitle>
              <CardDescription>
                Users with highest resource consumption
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usageStats.topUsers && usageStats.topUsers.length > 0 ? (
                <div className="space-y-4">
                  {usageStats.topUsers.map((user, index) => (
                    <div key={user.userId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{user.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Tier: <Badge variant="outline">{user.tier}</Badge>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${user.revenue.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.totalUsage.toLocaleString()} units
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No user data available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}