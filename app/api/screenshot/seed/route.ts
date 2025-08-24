import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Ensure Node.js runtime for server SDK
export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const tokenHeader = req.headers.get('x-seed-token') || ''
    const allowedToken = process.env.SCREENSHOT_SEED_TOKEN

    if (!allowedToken || tokenHeader !== allowedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    let email = process.env.SCREENSHOT_USER_EMAIL || ''
    let password = process.env.SCREENSHOT_USER_PASSWORD || ''

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Supabase admin env not configured' }, { status: 500 })
    }

    // Try to read optional email/password from body
    try {
      const body = await req.json().catch(() => null) as { email?: string; password?: string } | null
      if (body?.email) email = body.email
      if (body?.password) password = body.password
    } catch {}

    if (!email || !password) {
      return NextResponse.json({ error: 'Screenshot user credentials not provided' }, { status: 400 })
    }

    // Create admin client with service role key (server-only)
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Try create user idempotently (will error if exists)
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (error) {
      // If user already exists, treat as success
      const alreadyExists =
        typeof error.message === 'string' && /already exists|duplicate/i.test(error.message)
      if (!alreadyExists) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ ok: true, userId: data?.user?.id ?? null })
  } catch (e) {
    console.error('Seed error', e)
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const tokenHeader = req.headers.get('x-seed-token') || ''
    const allowedToken = process.env.SCREENSHOT_SEED_TOKEN

    if (!allowedToken || tokenHeader !== allowedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Supabase admin env not configured' }, { status: 500 })
    }

    const body = await req.json().catch(() => null) as { userId?: string } | null
    const userId = body?.userId
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { error } = await admin.auth.admin.deleteUser(userId)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Seed delete error', e)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
