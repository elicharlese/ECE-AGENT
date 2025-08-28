import { NextResponse } from "next/server"
import Stripe from "stripe"
import { validateEnv } from "@/lib/env-validation"
import { getSupabaseServer } from "@/lib/supabase/server"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    validateEnv()

    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 400 })
    }

    const stripe = new Stripe(secretKey)

    const body = await req.json().catch(() => ({})) as { amount?: number }
    const amount = Number(body?.amount)
    if (!Number.isInteger(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const supabase = await getSupabaseServer()
    const { data: auth } = await supabase.auth.getUser()
    const userId = auth.user?.id || null

    const url = new URL(req.url)
    const origin = `${url.protocol}//${url.host}`

    const successUrl = `${origin}/messages?credits_success=1&credits_added=${amount}`
    const cancelUrl = `${origin}/messages`

    const centsPerCredit = parseInt(process.env.CENTS_PER_CREDIT || "1", 10)
    const currency = (process.env.CREDITS_CURRENCY || "USD").toLowerCase()

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: `${amount} Credits`,
              description: "AI credits for ECE-AGENT",
            },
            unit_amount: centsPerCredit,
          },
          quantity: amount,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        type: "credits",
        credits: String(amount),
        user_id: userId ?? "",
      },
    })

    return NextResponse.json({ url: session.url }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 })
  }
}
