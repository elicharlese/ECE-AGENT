import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

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
  topUsers: Array<{
    userId: string
    email: string
    tier: string
    totalUsage: number
    revenue: number
  }>
  recentActivity: Array<{
    type: string
    description: string
    timestamp: Date
    userId?: string
  }>
}

export async function GET(request: NextRequest) {
  try {
    const stats: UsageStats = {
      totalUsers: 0,
      activeUsers: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
      tierDistribution: {
        trial: 0,
        personal: 0,
        team: 0,
        enterprise: 0
      },
      usageTrends: {
        videoMinutes: [],
        audioMinutes: [],
        messages: [],
        dataGB: []
      },
      topUsers: [],
      recentActivity: []
    }

    // Get user statistics
    const { data: userProfiles, error: userError } = await supabase
      .from('user_profiles')
      .select('tier, createdAt')

    if (!userError && userProfiles) {
      stats.totalUsers = userProfiles.length

      // Count users by tier
      userProfiles.forEach(profile => {
        switch (profile.tier) {
          case 'TRIAL':
            stats.tierDistribution.trial++
            break
          case 'PERSONAL':
            stats.tierDistribution.personal++
            break
          case 'TEAM':
            stats.tierDistribution.team++
            break
          case 'ENTERPRISE':
            stats.tierDistribution.enterprise++
            break
        }
      })

      // Calculate active users (users active in last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const { data: activeUsers } = await supabase
        .from('user_usage')
        .select('userId')
        .gt('updatedAt', thirtyDaysAgo.toISOString())

      stats.activeUsers = activeUsers?.length || 0
    }

    // Get revenue statistics
    const { data: payments, error: paymentError } = await supabase
      .from('payments')
      .select('amount, createdAt')
      .eq('status', 'COMPLETED')

    if (!paymentError && payments) {
      stats.totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0)

      // Calculate monthly revenue
      const thisMonth = new Date()
      thisMonth.setDate(1)
      thisMonth.setHours(0, 0, 0, 0)

      stats.monthlyRevenue = payments
        .filter(payment => new Date(payment.createdAt) >= thisMonth)
        .reduce((sum, payment) => sum + payment.amount, 0)
    }

    // Get usage trends for the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000)

      // Get usage for this day
      const { data: dailyUsage } = await supabase
        .from('livekit_webhook_logs')
        .select('videoMinutes, audioMinutes, messages, dataTransferred')
        .gte('createdAt', date.toISOString())
        .lt('createdAt', nextDate.toISOString())

      const dayStats = dailyUsage?.reduce(
        (acc, log) => ({
          videoMinutes: acc.videoMinutes + (log.videoMinutes || 0),
          audioMinutes: acc.audioMinutes + (log.audioMinutes || 0),
          messages: acc.messages + (log.messages || 0),
          dataGB: acc.dataGB + (log.dataTransferred || 0)
        }),
        { videoMinutes: 0, audioMinutes: 0, messages: 0, dataGB: 0 }
      ) || { videoMinutes: 0, audioMinutes: 0, messages: 0, dataGB: 0 }

      stats.usageTrends.videoMinutes.push(dayStats.videoMinutes)
      stats.usageTrends.audioMinutes.push(dayStats.audioMinutes)
      stats.usageTrends.messages.push(dayStats.messages)
      stats.usageTrends.dataGB.push(dayStats.dataGB)
    }

    // Get top users by usage
    const { data: topUsersData } = await supabase
      .from('user_usage')
      .select(`
        userId,
        videoMinutesUsed,
        audioMinutesUsed,
        messagesSent,
        dataTransferredGB,
        user_profiles!inner(email, tier)
      `)
      .order('videoMinutesUsed', { ascending: false })
      .limit(10)

    if (topUsersData) {
      stats.topUsers = topUsersData.map(user => ({
        userId: user.userId,
        email: user.user_profiles.email,
        tier: user.user_profiles.tier,
        totalUsage: user.videoMinutesUsed + user.audioMinutesUsed + user.messagesSent + user.dataTransferredGB,
        revenue: calculateUserRevenue(user.user_profiles.tier, user)
      }))
    }

    // Get recent activity
    const { data: recentPayments } = await supabase
      .from('payments')
      .select('userId, amount, createdAt')
      .order('createdAt', { ascending: false })
      .limit(5)

    const { data: recentSignups } = await supabase
      .from('user_profiles')
      .select('userId, email, createdAt')
      .order('createdAt', { ascending: false })
      .limit(5)

    // Combine and sort recent activities
    const activities = [
      ...(recentPayments?.map(p => ({
        type: 'payment',
        description: `Payment of $${p.amount} received`,
        timestamp: new Date(p.createdAt),
        userId: p.userId
      })) || []),
      ...(recentSignups?.map(s => ({
        type: 'signup',
        description: `New user ${s.email} signed up`,
        timestamp: new Date(s.createdAt),
        userId: s.userId
      })) || [])
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10)

    stats.recentActivity = activities

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Usage stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to calculate user revenue
function calculateUserRevenue(tier: string, usage: any): number {
  const baseRates = {
    video: 0.00072,
    audio: 0.00036,
    messages: 0.00012,
    data: 0.00012
  }

  const subscriptionCost = {
    PERSONAL: 9,
    TEAM: 29,
    ENTERPRISE: 99
  }[tier] || 0

  const usageCost =
    (usage.videoMinutesUsed || 0) * baseRates.video +
    (usage.audioMinutesUsed || 0) * baseRates.audio +
    (usage.messagesSent || 0) * baseRates.messages +
    (usage.dataTransferredGB || 0) * baseRates.data

  return subscriptionCost + usageCost
}