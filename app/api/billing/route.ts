import { NextRequest, NextResponse } from 'next/server'
import { billingService } from '@/services/billing-service-enhanced'
import { usageTrackingService } from '@/services/usage-tracking-service-enhanced'
import { supabase } from '@/lib/supabase/client'

// GET /api/billing - Get user's billing summary
export async function GET(request: NextRequest) {
  try {
    // Get user from session (simplified - would use proper auth)
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 })
    }

    const billingSummary = await billingService.getBillingSummary(userId)
    const usageSummary = await usageTrackingService.getUserUsageSummary(userId)

    return NextResponse.json({
      billing: billingSummary,
      usage: usageSummary
    })

  } catch (error) {
    console.error('Billing API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/billing - Handle billing operations
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...params } = body

    switch (action) {
      case 'upgrade_tier':
        const { newTier } = params
        if (!['PERSONAL', 'TEAM', 'ENTERPRISE'].includes(newTier)) {
          return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
        }

        const upgradeResult = await billingService.upgradeTier(userId, newTier as any)
        return NextResponse.json(upgradeResult)

      case 'cancel_subscription':
        const cancelResult = await billingService.cancelSubscription(userId, params.reason)
        return NextResponse.json(cancelResult)

      case 'generate_invoice':
        const invoice = await billingService.generateMonthlyInvoice(userId)
        return NextResponse.json({ invoice })

      case 'process_payment':
        const { amount, paymentMethod, paymentDetails } = params

        let paymentResult
        if (paymentMethod === 'STRIPE') {
          paymentResult = await billingService.processStripePayment(
            userId,
            amount,
            paymentDetails.stripePaymentId,
            paymentDetails.description
          )
        } else if (['CRYPTO_ETH', 'CRYPTO_USDC', 'CRYPTO_SOL'].includes(paymentMethod)) {
          paymentResult = await billingService.processCryptoPayment(
            userId,
            amount,
            paymentDetails.txHash,
            paymentDetails.token,
            paymentDetails.description
          )
        } else {
          return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 })
        }

        return NextResponse.json({ payment: paymentResult })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Billing API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}