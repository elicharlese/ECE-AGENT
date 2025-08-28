import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServer()
    const { data: auth } = await supabase.auth.getUser()
    const userId = auth.user?.id
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const body = await req.json().catch(() => ({})) as { amount?: number; metadata?: Record<string, any> }
    const amount = Math.floor(Number(body.amount || 0))
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    const { data, error } = await supabase.rpc('consume_credits', {
      p_user_id: userId,
      p_amount: amount,
      p_metadata: body.metadata || {},
    })

    if (error) {
      if ((error as any).message?.includes('INSUFFICIENT_CREDITS')) {
        return NextResponse.json({ error: 'INSUFFICIENT_CREDITS' }, { status: 402 })
      }
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ balance: data }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 })
  }
}
