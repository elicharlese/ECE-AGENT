import { NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const supabase = await getSupabaseServer()
    const { data: auth } = await supabase.auth.getUser()
    const userId = auth.user?.id
    if (!userId) return NextResponse.json({ balance: 0 }, { status: 200 })

    const { data, error } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', userId)
      .single()

    if (error || !data) return NextResponse.json({ balance: 0 }, { status: 200 })
    return NextResponse.json({ balance: data.balance }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 })
  }
}
