import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NewConversationRequestSchema, NewConversationResponseSchema } from '@/types/conversation'

export const runtime = 'nodejs'

function getServerSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase env. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        // Support Next 14/15 where cookies() typing may be async
        const store: any = (cookies as any)()
        return store.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        const store: any = (cookies as any)()
        store.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        const store: any = (cookies as any)()
        store.set({ name, value: '', ...options })
      },
    },
  })
}

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => ({}))
    const parsed = NewConversationRequestSchema.safeParse(json)
    if (!parsed.success) {
      const { fieldErrors, formErrors } = parsed.error.flatten()
      const errs = [
        ...formErrors,
        ...Object.entries(fieldErrors).flatMap(([k, v]) => v?.map((m) => `${k}: ${m}`) ?? []),
      ]
      return NextResponse.json({ error: errs.join(', ') || 'Invalid request' }, { status: 400 })
    }
    const { title, participantIds, agentId } = parsed.data

    const supabase = getServerSupabase()
    const { data: auth, error: authError } = await supabase.auth.getUser()
    if (authError || !auth?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const now = new Date().toISOString()
    const { data: convo, error: convoErr } = await supabase
      .from('conversations')
      .insert({
        title,
        agent_id: agentId ?? 'dm',
        user_id: auth.user.id,
        created_at: now,
        updated_at: now,
      })
      .select('*')
      .single()

    if (convoErr || !convo) {
      return NextResponse.json(
        { error: convoErr?.message || 'Failed to create conversation' },
        { status: 500 },
      )
    }

    // Build participant rows (ensure creator owner + unique participants excluding creator)
    const uniqueIds = Array.from(new Set(participantIds || []))
      .filter((id) => id && id !== auth.user.id)

    const participantRows = [
      { conversation_id: convo.id, user_id: auth.user.id, role: 'owner' as const },
      ...uniqueIds.map((uid) => ({ conversation_id: convo.id, user_id: uid, role: 'member' as const })),
    ]

    // Insert participants (best effort: if policy blocks some, continue)
    let insertedParticipants: Array<{ conversation_id: string; user_id: string; role: string }> = []
    if (participantRows.length > 0) {
      const { data: parts, error: partsErr } = await supabase
        .from('conversation_participants')
        .insert(participantRows)
        .select('*')

      if (!partsErr && parts) {
        insertedParticipants = parts as typeof insertedParticipants
      }
      // If error, log and continue; RLS might reject adding others without permissions
      if (partsErr) console.warn('conversation_participants insert warning', partsErr)
    }

    const payload = { conversation: convo, participants: insertedParticipants }
    const validated = NewConversationResponseSchema.safeParse(payload)
    if (!validated.success) {
      // Should not happen; fallback to minimal
      return NextResponse.json({ conversation: convo })
    }

    return NextResponse.json(validated.data)
  } catch (e: any) {
    console.error('Create conversation API error', e)
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 })
  }
}
