import { supabase } from '@/lib/supabase/client'
import { UserTier } from '@/src/types/billing'

export interface LiveKitUsageEvent {
  eventType: string
  roomId?: string
  participantId?: string
  userId?: string
  videoMinutes?: number
  audioMinutes?: number
  messages?: number
  dataTransferred?: number
  timestamp: Date
}

export class UsageTrackingService {
  // Track LiveKit usage from webhook events
  async trackLiveKitUsage(event: LiveKitUsageEvent) {
    // Log the webhook event
    const { data: logEntry, error: logError } = await supabase
      .from('livekit_webhook_logs')
      .insert({
        eventType: event.eventType,
        roomId: event.roomId,
        participantId: event.participantId,
        userId: event.userId,
        videoMinutes: event.videoMinutes,
        audioMinutes: event.audioMinutes,
        messages: event.messages,
        dataTransferred: event.dataTransferred,
        payload: event,
        processed: false
      })
      .select()
      .single()

    if (logError) {
      console.error('Failed to log LiveKit webhook event:', logError)
      return
    }

    // If we have a userId, update their usage
    if (event.userId) {
      await this.updateUserUsage(event.userId, {
        videoMinutes: event.videoMinutes || 0,
        audioMinutes: event.audioMinutes || 0,
        messages: event.messages || 0,
        dataTransferred: event.dataTransferred || 0
      })
    }

    // Mark the log entry as processed
    await supabase
      .from('livekit_webhook_logs')
      .update({
        processed: true,
        processedAt: new Date().toISOString()
      })
      .eq('id', logEntry.id)
  }

  // Update user usage metrics
  async updateUserUsage(
    userId: string,
    usage: {
      videoMinutes: number
      audioMinutes: number
      messages: number
      dataTransferred: number
    }
  ) {
    // Get or create user usage record
    let { data: userUsage } = await supabase
      .from('user_usage')
      .select('*')
      .eq('userId', userId)
      .single()

    if (!userUsage) {
      // Create new usage record
      const { data: newUsage, error } = await supabase
        .from('user_usage')
        .insert({
          userId,
          videoMinutesUsed: usage.videoMinutes,
          audioMinutesUsed: usage.audioMinutes,
          messagesSent: usage.messages,
          dataTransferredGB: usage.dataTransferred,
          currentCycleStart: new Date().toISOString(),
          currentCycleEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to create user usage record:', error)
        return
      }

      userUsage = newUsage
    } else {
      // Update existing usage record
      const { error } = await supabase
        .from('user_usage')
        .update({
          videoMinutesUsed: userUsage.videoMinutesUsed + usage.videoMinutes,
          audioMinutesUsed: userUsage.audioMinutesUsed + usage.audioMinutes,
          messagesSent: userUsage.messagesSent + usage.messages,
          dataTransferredGB: userUsage.dataTransferredGB + usage.dataTransferred,
          updatedAt: new Date().toISOString()
        })
        .eq('userId', userId)

      if (error) {
        console.error('Failed to update user usage:', error)
        return
      }
    }

    // Check for usage alerts
    await this.checkUsageAlerts(userId, userUsage)
  }

  // Check if user should receive usage alerts
  async checkUsageAlerts(userId: string, currentUsage: any) {
    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('userId', userId)
      .single()

    if (!profile) return

    const tier = profile.tier
    const limits = this.getTierLimits(tier)

    // Skip alerts for unlimited tiers
    if (limits.videoMinutes === -1) return

    // Check usage thresholds (80%, 90%, 100%)
    const thresholds = [0.8, 0.9, 1.0]

    for (const threshold of thresholds) {
      if (
        currentUsage.videoMinutesUsed >= limits.videoMinutes * threshold ||
        currentUsage.audioMinutesUsed >= limits.audioMinutes * threshold ||
        currentUsage.messagesSent >= limits.messages * threshold ||
        currentUsage.dataTransferredGB >= limits.dataGB * threshold
      ) {
        await this.createUsageAlert(userId, tier, currentUsage, threshold)
        break // Only send one alert per check
      }
    }
  }

  // Create usage alert (could be email, in-app notification, etc.)
  async createUsageAlert(
    userId: string,
    tier: UserTier,
    usage: any,
    threshold: number
  ) {
    const percentage = Math.round(threshold * 100)

    // Log the alert (in a real implementation, this might send an email or notification)
    console.log(`Usage Alert for user ${userId}: ${percentage}% of ${tier} plan limits reached`)

    // Store alert in database for dashboard display
    await supabase
      .from('usage_alerts')
      .insert({
        userId,
        tier,
        threshold: percentage,
        videoMinutesUsed: usage.videoMinutesUsed,
        audioMinutesUsed: usage.audioMinutesUsed,
        messagesSent: usage.messagesSent,
        dataTransferredGB: usage.dataTransferredGB,
        createdAt: new Date().toISOString()
      })
  }

  // Get tier limits
  getTierLimits(tier: UserTier) {
    const limits = {
      TRIAL: {
        videoMinutes: 5000,
        audioMinutes: 10000,
        messages: 100000,
        dataGB: 10
      },
      PERSONAL: {
        videoMinutes: 5000,
        audioMinutes: 10000,
        messages: 100000,
        dataGB: 10
      },
      TEAM: {
        videoMinutes: 50000,
        audioMinutes: 100000,
        messages: 1000000,
        dataGB: 100
      },
      ENTERPRISE: {
        videoMinutes: -1, // unlimited
        audioMinutes: -1,
        messages: -1,
        dataGB: -1
      }
    }

    return limits[tier] || limits.PERSONAL
  }

  // Get user usage summary
  async getUserUsageSummary(userId: string) {
    const { data: usage } = await supabase
      .from('user_usage')
      .select('*')
      .eq('userId', userId)
      .single()

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('userId', userId)
      .single()

    if (!usage || !profile) {
      return null
    }

    const limits = this.getTierLimits(profile.tier)
    const isUnlimited = limits.videoMinutes === -1

    // Calculate usage percentages
    const usagePercentages = {
      video: isUnlimited ? 0 : (usage.videoMinutesUsed / limits.videoMinutes) * 100,
      audio: isUnlimited ? 0 : (usage.audioMinutesUsed / limits.audioMinutes) * 100,
      messages: isUnlimited ? 0 : (usage.messagesSent / limits.messages) * 100,
      data: isUnlimited ? 0 : (usage.dataTransferredGB / limits.dataGB) * 100
    }

    return {
      currentUsage: {
        videoMinutes: usage.videoMinutesUsed,
        audioMinutes: usage.audioMinutesUsed,
        messages: usage.messagesSent,
        dataGB: usage.dataTransferredGB
      },
      limits,
      usagePercentages,
      isUnlimited,
      billingCycle: {
        start: usage.currentCycleStart,
        end: usage.currentCycleEnd
      }
    }
  }

  // Reset usage for new billing cycle
  async resetUsageForNewCycle(userId: string) {
    const newCycleEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now

    const { error } = await supabase
      .from('user_usage')
      .update({
        videoMinutesUsed: 0,
        audioMinutesUsed: 0,
        messagesSent: 0,
        dataTransferredGB: 0,
        videoMinutesOverage: 0,
        audioMinutesOverage: 0,
        messagesOverage: 0,
        dataOverageGB: 0,
        currentCycleStart: new Date().toISOString(),
        currentCycleEnd: newCycleEnd.toISOString(),
        lastResetAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .eq('userId', userId)

    if (error) {
      console.error('Failed to reset usage:', error)
      throw new Error('Failed to reset usage for new billing cycle')
    }
  }

  // Get usage analytics for admin dashboard
  async getUsageAnalytics(timeframe: 'day' | 'week' | 'month' = 'month') {
    const now = new Date()
    let startDate: Date

    switch (timeframe) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
    }

    // Get total usage across all users
    const { data: usageData } = await supabase
      .from('user_usage')
      .select('videoMinutesUsed, audioMinutesUsed, messagesSent, dataTransferredGB')
      .gte('updatedAt', startDate.toISOString())

    if (!usageData) return { totalUsers: 0, totalUsage: { videoMinutes: 0, audioMinutes: 0, messages: 0, dataGB: 0 } }

    const totalUsage = usageData.reduce(
      (acc, usage) => ({
        videoMinutes: acc.videoMinutes + usage.videoMinutesUsed,
        audioMinutes: acc.audioMinutes + usage.audioMinutesUsed,
        messages: acc.messages + usage.messagesSent,
        dataGB: acc.dataGB + usage.dataTransferredGB
      }),
      { videoMinutes: 0, audioMinutes: 0, messages: 0, dataGB: 0 }
    )

    return {
      totalUsers: usageData.length,
      totalUsage,
      timeframe,
      startDate: startDate.toISOString(),
      endDate: now.toISOString()
    }
  }

  // Validate usage against limits (for API calls)
  async validateUsage(
    userId: string,
    action: 'video' | 'audio' | 'message' | 'data',
    amount: number = 1
  ): Promise<{ allowed: boolean; reason?: string }> {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('tier')
      .eq('userId', userId)
      .single()

    if (!profile) {
      return { allowed: false, reason: 'User profile not found' }
    }

    // Enterprise users have unlimited usage
    if (profile.tier === 'ENTERPRISE') {
      return { allowed: true }
    }

    const { data: usage } = await supabase
      .from('user_usage')
      .select('*')
      .eq('userId', userId)
      .single()

    if (!usage) {
      return { allowed: true } // New users start with zero usage
    }

    const limits = this.getTierLimits(profile.tier)
    let currentUsage = 0
    let limit = 0

    switch (action) {
      case 'video':
        currentUsage = usage.videoMinutesUsed
        limit = limits.videoMinutes
        break
      case 'audio':
        currentUsage = usage.audioMinutesUsed
        limit = limits.audioMinutes
        break
      case 'message':
        currentUsage = usage.messagesSent
        limit = limits.messages
        break
      case 'data':
        currentUsage = usage.dataTransferredGB
        limit = limits.dataGB
        break
    }

    if (currentUsage + amount > limit) {
      return {
        allowed: false,
        reason: `${action} usage limit exceeded. Current: ${currentUsage}, Limit: ${limit}, Requested: ${amount}`
      }
    }

    return { allowed: true }
  }
}

export const usageTrackingService = new UsageTrackingService()