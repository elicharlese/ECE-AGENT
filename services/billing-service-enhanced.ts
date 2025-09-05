import { supabase } from '@/lib/supabase/client'

// Define types locally to avoid import issues
export type UserTier = 'TRIAL' | 'PERSONAL' | 'TEAM' | 'ENTERPRISE'
export type PaymentMethod = 'STRIPE' | 'CRYPTO_ETH' | 'CRYPTO_USDC' | 'CRYPTO_SOL'
export type BillingAction = 'SUBSCRIPTION_CREATED' | 'SUBSCRIPTION_UPDATED' | 'SUBSCRIPTION_CANCELLED' | 'USAGE_OVERAGE' | 'MANUAL_ADJUSTMENT' | 'REFUND'

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

  // Create or update user profile with trial
  async createOrUpdateUserProfile(userId: string, email: string, name: string) {
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('userId', userId)
      .single()

    if (existingProfile) {
      // Update existing profile
      const { error } = await supabase
        .from('user_profiles')
        .update({
          email,
          name,
          updatedAt: new Date().toISOString()
        })
        .eq('userId', userId)

      if (error) throw new Error(`Failed to update profile: ${error.message}`)
      return existingProfile
    } else {
      // Create new profile with trial
      const trialExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

      const { data: newProfile, error } = await supabase
        .from('user_profiles')
        .insert({
          userId,
          email,
          name,
          tier: 'TRIAL',
          trialExpiresAt: trialExpiresAt.toISOString()
        })
        .select()
        .single()

      if (error) throw new Error(`Failed to create profile: ${error.message}`)

      // Create initial usage record
      await supabase
        .from('user_usage')
        .insert({
          userId,
          currentCycleStart: new Date().toISOString(),
          currentCycleEnd: trialExpiresAt.toISOString()
        })

      return newProfile
    }
  }

  // Handle trial expiration and conversion
  async handleTrialExpiration(userId: string) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('userId', userId)
      .single()

    if (!profile || profile.tier !== 'TRIAL') return

    const trialExpired = new Date(profile.trialExpiresAt) < new Date()

    if (trialExpired) {
      // Convert to Personal tier
      await this.upgradeTier(userId, 'PERSONAL')

      // Log the conversion
      await supabase
        .from('billing_history')
        .insert({
          userId,
          action: 'SUBSCRIPTION_CREATED',
          tier: 'PERSONAL',
          amount: TIER_PRICING.PERSONAL,
          description: 'Automatic conversion from trial to Personal plan',
          paymentMethod: 'STRIPE'
        })

      return { converted: true, newTier: 'PERSONAL' }
    }

    return { converted: false }
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

  // Process Stripe payment
  async processStripePayment(
    userId: string,
    amount: number,
    stripePaymentId: string,
    description: string = 'Subscription payment'
  ) {
    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        userId,
        amount,
        currency: 'USD',
        status: 'COMPLETED',
        paymentMethod: 'STRIPE',
        stripePaymentId,
        processedAt: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to process Stripe payment: ${error.message}`)
    }

    // Log billing history
    await supabase
      .from('billing_history')
      .insert({
        userId,
        action: 'SUBSCRIPTION_CREATED',
        amount,
        description,
        paymentMethod: 'STRIPE',
        stripePaymentId
      })

    return payment
  }

  // Process crypto payment
  async processCryptoPayment(
    userId: string,
    amount: number,
    txHash: string,
    token: 'ETH' | 'USDC' | 'SOL',
    description: string = 'Crypto payment'
  ) {
    const paymentMethodMap = {
      ETH: 'CRYPTO_ETH' as PaymentMethod,
      USDC: 'CRYPTO_USDC' as PaymentMethod,
      SOL: 'CRYPTO_SOL' as PaymentMethod
    }

    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        userId,
        amount,
        currency: 'USD',
        status: 'COMPLETED',
        paymentMethod: paymentMethodMap[token],
        cryptoTxHash: txHash,
        cryptoToken: token,
        processedAt: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to process crypto payment: ${error.message}`)
    }

    // Log billing history
    await supabase
      .from('billing_history')
      .insert({
        userId,
        action: 'SUBSCRIPTION_CREATED',
        amount,
        description,
        paymentMethod: paymentMethodMap[token],
        cryptoTxHash: txHash
      })

    return payment
  }

  // Generate monthly invoice
  async generateMonthlyInvoice(userId: string) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('userId', userId)
      .single()

    if (!profile) {
      throw new Error('User profile not found')
    }

    const { data: usage } = await supabase
      .from('user_usage')
      .select('*')
      .eq('userId', userId)
      .single()

    if (!usage) {
      throw new Error('User usage not found')
    }

    // Calculate billing period
    const billingPeriodStart = new Date(usage.currentCycleStart)
    const billingPeriodEnd = new Date(usage.currentCycleEnd)

    // Calculate costs
    const tier = asUserTier(profile.tier)
    const subscriptionCost = this.getSubscriptionCost(tier)
    const overageCost = this.calculateOverageCost(
      tier,
      usage.videoMinutesUsed,
      usage.audioMinutesUsed,
      usage.messagesSent,
      usage.dataTransferredGB
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
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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
      // Add overage line items
      const limits = TIER_LIMITS[tier]

      if (usage.videoMinutesUsed > limits.videoMinutes) {
        const overageVideo = usage.videoMinutesUsed - limits.videoMinutes
        lineItems.push({
          invoiceId: invoice.id,
          description: `Video Minutes Overage (${overageVideo} mins)`,
          quantity: overageVideo,
          unitPrice: LIVEKIT_PRICING.VIDEO_MINUTES,
          amount: overageVideo * LIVEKIT_PRICING.VIDEO_MINUTES,
          category: 'VIDEO_MINUTES'
        })
      }

      if (usage.audioMinutesUsed > limits.audioMinutes) {
        const overageAudio = usage.audioMinutesUsed - limits.audioMinutes
        lineItems.push({
          invoiceId: invoice.id,
          description: `Audio Minutes Overage (${overageAudio} mins)`,
          quantity: overageAudio,
          unitPrice: LIVEKIT_PRICING.AUDIO_MINUTES,
          amount: overageAudio * LIVEKIT_PRICING.AUDIO_MINUTES,
          category: 'AUDIO_MINUTES'
        })
      }

      if (usage.messagesSent > limits.messages) {
        const overageMessages = usage.messagesSent - limits.messages
        lineItems.push({
          invoiceId: invoice.id,
          description: `Messages Overage (${overageMessages} msgs)`,
          quantity: overageMessages,
          unitPrice: LIVEKIT_PRICING.MESSAGES,
          amount: overageMessages * LIVEKIT_PRICING.MESSAGES,
          category: 'MESSAGES'
        })
      }

      if (usage.dataTransferredGB > limits.dataGB) {
        const overageData = usage.dataTransferredGB - limits.dataGB
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

  // Get billing summary for user
  async getBillingSummary(userId: string) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('userId', userId)
      .single()

    if (!profile) {
      throw new Error('User profile not found')
    }

    const { data: usage } = await supabase
      .from('user_usage')
      .select('*')
      .eq('userId', userId)
      .single()

    const { data: pendingInvoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('userId', userId)
      .eq('status', 'PENDING')
      .order('createdAt', { ascending: false })

    const { data: recentPayments } = await supabase
      .from('payments')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false })
      .limit(5)

    const tier = asUserTier(profile.tier)

    return {
      profile,
      usage,
      limits: TIER_LIMITS[tier],
      pendingInvoices: pendingInvoices || [],
      recentPayments: recentPayments || [],
      nextBillingDate: usage?.currentCycleEnd,
      trialStatus: profile.tier === 'TRIAL' ? {
        expiresAt: profile.trialExpiresAt,
        daysRemaining: Math.ceil((new Date(profile.trialExpiresAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
      } : null
    }
  }

  // Cancel subscription
  async cancelSubscription(userId: string, reason?: string) {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        tier: 'TRIAL', // Downgrade to trial/free
        updatedAt: new Date().toISOString()
      })
      .eq('userId', userId)

    if (error) {
      throw new Error(`Failed to cancel subscription: ${error.message}`)
    }

    // Log cancellation
    await supabase
      .from('billing_history')
      .insert({
        userId,
        action: 'SUBSCRIPTION_CANCELLED',
        description: `Subscription cancelled${reason ? `: ${reason}` : ''}`,
        paymentMethod: 'STRIPE'
      })

    return { success: true, message: 'Subscription cancelled successfully' }
  }
}

export const billingService = new BillingService()