import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { resolvePackage } from '@/lib/pricing'
import { getSupabaseServer } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const secret = process.env.STRIPE_SECRET_KEY
    if (!secret) return NextResponse.json({ error: 'Stripe not configured' }, { status: 400 })

    const stripe = new Stripe(secret)
    const supabase = await getSupabaseServer()
    const { data: auth } = await supabase.auth.getUser()
    const userId = auth.user?.id
    const userEmail = auth.user?.email || undefined
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const body = await req.json().catch(() => ({})) as { packageId?: string; successUrl?: string; cancelUrl?: string }
    const pkg = body.packageId ? resolvePackage(body.packageId) : null
    if (!pkg) return NextResponse.json({ error: 'Invalid package' }, { status: 400 })

    const origin = typeof process.env.NEXT_PUBLIC_SITE_URL === 'string' && process.env.NEXT_PUBLIC_SITE_URL.length > 0
      ? process.env.NEXT_PUBLIC_SITE_URL
      : (typeof req.headers.get('origin') === 'string' ? (req.headers.get('origin') as string) : '')

    const success_url = body.successUrl || (origin ? `${origin}/billing/success` : undefined)
    const cancel_url = body.cancelUrl || (origin ? `${origin}/billing/cancel` : undefined)

    // Ensure a Stripe customer for this user (by email). This is idempotent by email.
    let customer: Stripe.Customer | null = null
    if (userEmail) {
      const existing = await stripe.customers.list({ email: userEmail, limit: 1 })
      customer = existing.data?.[0] || await stripe.customers.create({ email: userEmail, metadata: { userId } })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: success_url || 'https://stripe.com/success',
      cancel_url: cancel_url || 'https://stripe.com/cancel',
      customer: customer?.id,
      customer_email: customer ? undefined : userEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: pkg.label },
            unit_amount: Math.round(pkg.amountUsd * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        credits: String(pkg.credits),
        packageId: pkg.id,
      },
    })

    return NextResponse.json({ url: session.url }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 })
  }
}
