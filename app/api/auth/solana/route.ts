export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { PublicKey } from '@solana/web3.js'
import { getSupabaseServer } from '@/lib/supabase/server'

const BodySchema = z.object({
  publicKey: z.string().min(32),
  signature: z.string().regex(/^[0-9a-fA-F]+$/), // hex
  message: z.string().regex(/^[0-9a-fA-F]+$/),   // hex
  timestamp: z.number().int(),
})

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.toLowerCase()
  const out = new Uint8Array(clean.length / 2)
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.substr(i * 2, 2), 16)
  }
  return out
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json()
    const parsed = BodySchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { publicKey, signature, message, timestamp } = parsed.data

    // Basic timestamp freshness check (5 minutes skew window)
    const now = Date.now()
    const maxSkewMs = 5 * 60 * 1000
    if (Math.abs(now - timestamp) > maxSkewMs) {
      return NextResponse.json({ error: 'Stale request' }, { status: 400 })
    }

    // Decode inputs
    const msgBytes = hexToBytes(message)
    const sigBytes = hexToBytes(signature)

    // Optional: sanity-check the plaintext content of the message
    try {
      const text = new TextDecoder().decode(msgBytes)
      if (!text.includes('Sign this message to authenticate with AGENT') || !text.includes('Timestamp:')) {
        return NextResponse.json({ error: 'Unexpected message contents' }, { status: 400 })
      }
      if (!text.includes(publicKey)) {
        return NextResponse.json({ error: 'Message/public key mismatch' }, { status: 400 })
      }
    } catch {
      // If decoding fails, still proceed with cryptographic verification
    }

    // Verify signature using Node WebCrypto (Ed25519)
    const pk = new PublicKey(publicKey)
    // Import the raw 32-byte public key for Ed25519
    // Note: Node 18+ supports Ed25519 in WebCrypto
    const subtle = (await import('crypto')).webcrypto.subtle
    const key = await subtle.importKey(
      'raw',
      pk.toBytes(),
      { name: 'Ed25519' },
      false,
      ['verify']
    )
    const ok = await subtle.verify({ name: 'Ed25519' }, key, sigBytes, msgBytes)
    if (!ok) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // If the request has an authenticated Supabase user, link the wallet to user metadata
    const supabase = await getSupabaseServer()
    const { data: userRes } = await supabase.auth.getUser()
    const currentUser = userRes?.user

    if (currentUser) {
      const existing = currentUser.user_metadata?.solana_public_key
      if (existing && existing !== publicKey) {
        // Prevent overwriting a different linked wallet without explicit user flow
        return NextResponse.json({ error: 'A different wallet is already linked' }, { status: 409 })
      }

      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          solana_public_key: publicKey,
          solana_linked_at: new Date().toISOString(),
        },
      })
      if (updateError) {
        return NextResponse.json({ error: 'Failed to link wallet' }, { status: 500 })
      }

      return NextResponse.json({ linked: true })
    }

    // Not authenticated: for now, we only support linking after sign-in.
    // If you want full wallet-first login, provision a service role flow to create/sign in users.
    return NextResponse.json({ error: 'Sign in required to link wallet' }, { status: 401 })
  } catch (e) {
    console.error('[/api/auth/solana] error', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
