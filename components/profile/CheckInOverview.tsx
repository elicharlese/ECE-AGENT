"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  MessageSquare, 
  FileText, 
  AtSign, 
  Calendar, 
  CheckSquare, 
  TrendingUp,
  Clock,
  Users
} from "lucide-react"
import { useUser } from "@/hooks/use-user"
import { UI_CONSTANTS } from "@/lib/ui-constants"

interface CheckInStats {
  unreadMessages: number
  newMentions: number
  recentDocs: number
  upcomingEvents: number
  pendingTasks: number
  activeConversations: number
}

export function CheckInOverview() {
  const { user } = useUser()
  const [stats, setStats] = useState<CheckInStats>({
    unreadMessages: 0,
    newMentions: 0,
    recentDocs: 0,
    upcomingEvents: 0,
    pendingTasks: 0,
    activeConversations: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Simulate API call - replace with actual data fetching
        // Use near-zero delay during tests to avoid waitFor timeouts
        const delay = process.env.NODE_ENV === 'test' ? 0 : 500
        await new Promise(resolve => setTimeout(resolve, delay))
        
        setStats({
          unreadMessages: 12,
          newMentions: 3,
          recentDocs: 8,
          upcomingEvents: 5,
          pendingTasks: 7,
          activeConversations: 4
        })
      } catch (error) {
        console.error('Failed to fetch check-in stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const quickActions = [
    {
      label: "View Messages",
      icon: MessageSquare,
      count: stats.unreadMessages,
      href: "/messages",
      color: "bg-blue-500"
    },
    {
      label: "Check Mentions",
      icon: AtSign,
      count: stats.newMentions,
      href: "/profile?tab=mentions",
      color: "bg-purple-500"
    },
    {
      label: "Review Docs",
      icon: FileText,
      count: stats.recentDocs,
      href: "/profile?tab=docs",
      color: "bg-green-500"
    },
    {
      label: "Calendar",
      icon: Calendar,
      count: stats.upcomingEvents,
      href: "/profile?tab=calendar",
      color: "bg-orange-500"
    }
  ]

  if (loading) {
    return (
      <div className={`grid ${UI_CONSTANTS.spacing.xl} ${UI_CONSTANTS.grid.cols4}`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className={UI_CONSTANTS.padding.card}>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card>
        <CardContent className={UI_CONSTANTS.padding.card}>
          <div className={`flex items-center ${UI_CONSTANTS.spacing.lg}`}>
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Welcome back!
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Here&apos;s what&apos;s happening in your workspace
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className={`grid ${UI_CONSTANTS.spacing.lg} ${UI_CONSTANTS.grid.cols4}`}>
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Card key={action.label} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className={UI_CONSTANTS.padding.cardCompact}>
                <div className="flex items-center justify-between">
                  <div className={`flex items-center ${UI_CONSTANTS.spacing.md}`}>
                    <div className={`h-10 w-10 rounded-lg ${action.color} flex items-center justify-center text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {action.label}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {action.count} items
                      </p>
                    </div>
                  </div>
                  {action.count > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {action.count}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Activity Summary */}
      <div className={`grid ${UI_CONSTANTS.spacing.xl} ${UI_CONSTANTS.grid.cols2}`}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Activity Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">Active Conversations</span>
              <span className="font-semibold">{stats.activeConversations}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">Pending Tasks</span>
              <span className="font-semibold">{stats.pendingTasks}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">Upcoming Events</span>
              <span className="font-semibold">{stats.upcomingEvents}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-gray-600 dark:text-gray-300">
                New message in #general
              </span>
              <span className="text-xs text-gray-500 ml-auto">2m ago</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-gray-600 dark:text-gray-300">
                Document &quot;Project Plan&quot; updated
              </span>
              <span className="text-xs text-gray-500 ml-auto">15m ago</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="h-2 w-2 rounded-full bg-purple-500" />
              <span className="text-gray-600 dark:text-gray-300">
                Mentioned in team discussion
              </span>
              <span className="text-xs text-gray-500 ml-auto">1h ago</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
