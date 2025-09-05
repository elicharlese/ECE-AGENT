import { supabase } from '@/lib/supabase/client'
import { UserTier, PaymentMethod, BillingAction, InvoiceStatus } from '@/types/billing'

// Pricing constants with 20% markup
export const LIVEKIT_PRICING = {
  VIDEO_MINUTES: 0.00072, // $0.0006 * 1.2
  AUDIO_MINUTES: 0.00036, // $0.0003 * 1.2
  MESSAGES: 0.00012,      // $0.0001 * 1.2
  DATA_GB: 0.00012        // $0.0001 * 1.2
}

export const TIER_PRICING = {
  PERSONAL: 9,
  TEAM: 29,
  ENTERPRISE: 99
}

export const TIER_LIMITS: Record<UserTier, {
  videoMinutes: number
  audioMinutes: number
  messages: number
  dataGB: number
}> = {
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

const USER_TIERS: readonly UserTier[] = ['TRIAL', 'PERSONAL', 'TEAM', 'ENTERPRISE'] as const
function asUserTier(value: any): UserTier {
  return USER_TIERS.includes(value as UserTier) ? (value as UserTier) : 'TRIAL'
}

export class BillingService {
  // Calculate usage costs with markup
  calculateUsageCost(
    videoMinutes: number,
    audioMinutes: number,
    messages: number,
    dataGB: number
  ): number {
    const videoCost = videoMinutes * LIVEKIT_PRICING.VIDEO_MINUTES
    const audioCost = audioMinutes * LIVEKIT_PRICING.AUDIO_MINUTES
    const messageCost = messages * LIVEKIT_PRICING.MESSAGES
    const dataCost = dataGB * LIVEKIT_PRICING.DATA_GB

    return videoCost + audioCost + messageCost + dataCost
  }

  // Calculate overage costs
  calculateOverageCost(
    userTier: UserTier,
    videoMinutes: number,
    audioMinutes: number,
    messages: number,
    dataGB: number
  ): number {
    const limits = TIER_LIMITS[userTier]

    // Unlimited tiers have no overage
    if (limits.videoMinutes === -1) {
      return 0
    }

    const overageVideo = Math.max(0, videoMinutes - limits.videoMinutes)
    const overageAudio = Math.max(0, audioMinutes - limits.audioMinutes)
    const overageMessages = Math.max(0, messages - limits.messages)
    const overageData = Math.max(0, dataGB - limits.dataGB)

    return this.calculateUsageCost(overageVideo, overageAudio, overageMessages, overageData)
  }

  // Get subscription cost
  getSubscriptionCost(tier: UserTier): number {
    if (tier === 'TRIAL') return 0
    return TIER_PRICING[tier as keyof typeof TIER_PRICING] || 0
  }

  // Create invoice for billing cycle
  async createInvoice(
    userId: string,
    billingPeriodStart: Date,
    billingPeriodEnd: Date,
    usage: {
      videoMinutes: number
      audioMinutes: number
      messages: number
      dataGB: number
    }
  ) {
    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('userId', userId)
      .single()

    if (!profile) {
      throw new Error('User profile not found')
    }

    // Calculate costs
    const tier = asUserTier(profile.tier)
    const subscriptionCost = this.getSubscriptionCost(tier)
    const overageCost = this.calculateOverageCost(
      tier,
      usage.videoMinutes,
      usage.audioMinutes,
      usage.messages,
      usage.dataGB
    )

    const subtotal = subscriptionCost + overageCost
    const taxAmount = subtotal * 0.08 // 8% tax
    const totalAmount = subtotal + taxAmount

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${userId.slice(-6)}`

    // Create invoice
    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert({
        userId,
        invoiceNumber,
        billingPeriodStart: billingPeriodStart.toISOString(),
        billingPeriodEnd: billingPeriodEnd.toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        subtotal,
        taxAmount,
        totalAmount,
        status: 'PENDING'
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create invoice: ${error.message}`)
    }

    // Create line items
    const lineItems = []

    if (subscriptionCost > 0) {
      lineItems.push({
        invoiceId: invoice.id,
        description: `${tier} Plan Subscription`,
        quantity: 1,
        unitPrice: subscriptionCost,
        amount: subscriptionCost,
        category: 'SUBSCRIPTION'
      })
    }

    if (overageCost > 0) {
      if (usage.videoMinutes > TIER_LIMITS[tier].videoMinutes) {
        const overageVideo = usage.videoMinutes - TIER_LIMITS[tier].videoMinutes
        lineItems.push({
          invoiceId: invoice.id,
          description: `Video Minutes Overage (${overageVideo} mins)`,
          quantity: overageVideo,
          unitPrice: LIVEKIT_PRICING.VIDEO_MINUTES,
          amount: overageVideo * LIVEKIT_PRICING.VIDEO_MINUTES,
          category: 'VIDEO_MINUTES'
        })
      }

      if (usage.audioMinutes > TIER_LIMITS[tier].audioMinutes) {
        const overageAudio = usage.audioMinutes - TIER_LIMITS[tier].audioMinutes
        lineItems.push({
          invoiceId: invoice.id,
          description: `Audio Minutes Overage (${overageAudio} mins)`,
          quantity: overageAudio,
          unitPrice: LIVEKIT_PRICING.AUDIO_MINUTES,
          amount: overageAudio * LIVEKIT_PRICING.AUDIO_MINUTES,
          category: 'AUDIO_MINUTES'
        })
      }

      if (usage.messages > TIER_LIMITS[tier].messages) {
        const overageMessages = usage.messages - TIER_LIMITS[tier].messages
        lineItems.push({
          invoiceId: invoice.id,
          description: `Messages Overage (${overageMessages} msgs)`,
          quantity: overageMessages,
          unitPrice: LIVEKIT_PRICING.MESSAGES,
          amount: overageMessages * LIVEKIT_PRICING.MESSAGES,
          category: 'MESSAGES'
        })
      }

      if (usage.dataGB > TIER_LIMITS[tier].dataGB) {
        const overageData = usage.dataGB - TIER_LIMITS[tier].dataGB
        lineItems.push({
          invoiceId: invoice.id,
          description: `Data Transfer Overage (${overageData} GB)`,
          quantity: overageData,
          unitPrice: LIVEKIT_PRICING.DATA_GB,
          amount: overageData * LIVEKIT_PRICING.DATA_GB,
          category: 'DATA_TRANSFER'
        })
      }
    }

    if (lineItems.length > 0) {
      await supabase
        .from('invoice_line_items')
        .insert(lineItems)
    }

    return invoice
  }

  // Process payment
  async processPayment(
    userId: string,
    amount: number,
    paymentMethod: PaymentMethod,
    paymentDetails?: {
      stripePaymentId?: string
      cryptoTxHash?: string
      cryptoToken?: string
    }
  ) {
    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        userId,
        amount,
        status: 'PENDING',
        paymentMethod,
        stripePaymentId: paymentDetails?.stripePaymentId,
        cryptoTxHash: paymentDetails?.cryptoTxHash,
        cryptoToken: paymentDetails?.cryptoToken
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create payment: ${error.message}`)
    }

    // Log billing history
    await supabase
      .from('billing_history')
      .insert({
        userId,
        action: 'USAGE_OVERAGE',
        amount,
        description: `Payment processed via ${paymentMethod}`,
        paymentMethod,
        stripePaymentId: paymentDetails?.stripePaymentId,
        cryptoTxHash: paymentDetails?.cryptoTxHash
      })

    return payment
  }

  // Check if user is within tier limits
  checkUsageLimits(
    userTier: UserTier,
    currentUsage: {
      videoMinutes: number
      audioMinutes: number
      messages: number
      dataGB: number
    }
  ): {
    withinLimits: boolean
    overages: {
      videoMinutes: number
      audioMinutes: number
      messages: number
      dataGB: number
    }
  } {
    const limits = TIER_LIMITS[userTier]

    // Unlimited tiers are always within limits
    if (limits.videoMinutes === -1) {
      return {
        withinLimits: true,
        overages: { videoMinutes: 0, audioMinutes: 0, messages: 0, dataGB: 0 }
      }
    }

    const overages = {
      videoMinutes: Math.max(0, currentUsage.videoMinutes - limits.videoMinutes),
      audioMinutes: Math.max(0, currentUsage.audioMinutes - limits.audioMinutes),
      messages: Math.max(0, currentUsage.messages - limits.messages),
      dataGB: Math.max(0, currentUsage.dataGB - limits.dataGB)
    }

    const withinLimits = Object.values(overages).every(overage => overage === 0)

    return { withinLimits, overages }
  }

  // Upgrade user tier
  async upgradeTier(userId: string, newTier: UserTier) {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        tier: newTier,
        updatedAt: new Date().toISOString()
      })
      .eq('userId', userId)

    if (error) {
      throw new Error(`Failed to upgrade tier: ${error.message}`)
    }

    // Log billing history
    await supabase
      .from('billing_history')
      .insert({
        userId,
        action: 'SUBSCRIPTION_UPDATED',
        tier: newTier,
        amount: this.getSubscriptionCost(newTier),
        description: `Upgraded to ${newTier} plan`,
        paymentMethod: 'STRIPE'
      })

    return { success: true, newTier }
  }

  // Get user billing summary
  async getBillingSummary(userId: string) {
    // Get user profile and usage
    const { data: profile } = await supabase
      .from('user_profiles')
      .select(`
        *,
        usage: user_usage(*)
      `)
      .eq('userId', userId)
      .single()

    if (!profile) {
      throw new Error('User profile not found')
    }

    // Get pending invoices
    const { data: pendingInvoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('userId', userId)
      .eq('status', 'PENDING')
      .order('createdAt', { ascending: false })

    // Calculate current costs
    const usage = profile.usage || {
      videoMinutesUsed: 0,
      audioMinutesUsed: 0,
      messagesSent: 0,
      dataTransferredGB: 0
    }

    const tier2 = asUserTier(profile.tier)
    const { withinLimits, overages } = this.checkUsageLimits(tier2, {
      videoMinutes: usage.videoMinutesUsed,
      audioMinutes: usage.audioMinutesUsed,
      messages: usage.messagesSent,
      dataGB: usage.dataTransferredGB
    })

    const subscriptionCost = this.getSubscriptionCost(tier2)
    const overageCost = this.calculateUsageCost(
      overages.videoMinutes,
      overages.audioMinutes,
      overages.messages,
      overages.dataGB
    )

    return {
      profile,
      usage,
      limits: TIER_LIMITS[tier2],
      withinLimits,
      overages,
      costs: {
        subscription: subscriptionCost,
        overage: overageCost,
        total: subscriptionCost + overageCost
      },
      pendingInvoices: pendingInvoices || []
    }
  }
}

export const billingService = new BillingService()