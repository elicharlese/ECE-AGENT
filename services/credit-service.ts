import { supabase } from '@/lib/supabase/client'
import type { CreditBalance } from '@/src/types/credits'

export async function getCreditBalance(): Promise<CreditBalance> {
  const { data: auth } = await supabase.auth.getUser()
  const userId = auth.user?.id
  if (!userId) return { userId: '', balance: 0 }

  const { data, error } = await supabase
    .from('user_credits')
    .select('balance')
    .eq('user_id', userId)
    .single()

  if (error || !data) return { userId, balance: 0 }
  return { userId, balance: data.balance }
}

export async function consumeCredits(amount: number, metadata: Record<string, any> = {}): Promise<number> {
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Invalid amount')
  const { data: auth } = await supabase.auth.getUser()
  const userId = auth.user?.id
  if (!userId) throw new Error('Not authenticated')

  const { data, error } = await supabase.rpc('consume_credits', {
    p_user_id: userId,
    p_amount: Math.floor(amount),
    p_metadata: metadata,
  })

  if (error) throw error
  return data as number
}
