import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getSupabaseServer } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const secret = process.env.STRIPE_SECRET_KEY
    if (!secret) return NextResponse.json({ error: 'Stripe not configured' }, { status: 400 })

    const stripe = new Stripe(secret)
    const supabase = await getSupabaseServer()
    const { data: auth } = await supabase.auth.getUser()
    const user = auth.user
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const originHeader = req.headers.get('origin') || ''
    const origin = typeof process.env.NEXT_PUBLIC_SITE_URL === 'string' && process.env.NEXT_PUBLIC_SITE_URL.length > 0
      ? process.env.NEXT_PUBLIC_SITE_URL
      : originHeader

    // Find or create a customer by email
    const email = user.email || undefined
    let customerId: string | undefined
    if (email) {
      const existing = await stripe.customers.list({ email, limit: 1 })
      const customer = existing.data?.[0] || await stripe.customers.create({ email, metadata: { userId: user.id } })
      customerId = customer.id
    }

    if (!customerId) return NextResponse.json({ error: 'No customer found' }, { status: 400 })

    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: origin ? `${origin}/settings/billing` : 'https://stripe.com/return',
    })

    return NextResponse.json({ url: portal.url }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 })
  }
}
