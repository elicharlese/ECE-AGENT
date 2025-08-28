import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 400 })
  }

  const stripe = new Stripe(secret)

  let event: Stripe.Event
  try {
    const sig = req.headers.get('stripe-signature') as string
    const body = await req.text()
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      // Only process fully paid sessions
      if (session.payment_status !== 'paid') {
        return NextResponse.json({ skipped: 'not_paid' }, { status: 200 })
      }
      const credits = Number(session.metadata?.credits ?? '0')
      const userId = (session.metadata?.user_id as string | undefined) ?? (session.metadata?.userId as string | undefined)
      if (credits > 0 && userId) {
        const admin = getSupabaseAdmin()

        // Idempotency: check if we've already recorded this sessionId purchase
        const { data: existing } = await admin
          .from('credit_transactions')
          .select('id')
          .eq('user_id', userId)
          .eq('type', 'purchase')
          .contains('metadata', { sessionId: session.id })
          .limit(1)
          .maybeSingle?.() ?? { data: null }

        if (existing) {
          return NextResponse.json({ received: true, duplicate: true }, { status: 200 })
        }

        // Use RPC with service role to add credits and log transaction
        await admin.rpc('add_credits', {
          p_user_id: userId,
          p_amount: Math.floor(credits),
          p_metadata: {
            source: 'stripe',
            sessionId: session.id,
            mode: session.mode,
            amount_total: session.amount_total,
            currency: session.currency,
          },
        })
      }
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 })
  }
}
