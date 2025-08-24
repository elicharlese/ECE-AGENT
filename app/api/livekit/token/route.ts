import { NextResponse } from 'next/server'
import { AccessToken } from 'livekit-server-sdk'
import { LivekitTokenRequestSchema } from '@/src/types/livekit'

// Ensure Node.js runtime for server SDK
export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const parsed = LivekitTokenRequestSchema.safeParse(body)
    if (!parsed.success) {
      const { formErrors, fieldErrors } = parsed.error.flatten()
      const fieldErrorMessages = Object.entries(fieldErrors)
        .flatMap(([key, msgs]) => msgs?.map((m) => `${key}: ${m}`) ?? [])
      const message = [...formErrors, ...fieldErrorMessages].join(', ') || 'Invalid request body'
      return NextResponse.json({ error: message }, { status: 400 })
    }
    const { roomName, identity, metadata, grants } = parsed.data

    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET
    if (!apiKey || !apiSecret) {
      const missing: string[] = []
      if (!apiKey) missing.push('LIVEKIT_API_KEY')
      if (!apiSecret) missing.push('LIVEKIT_API_SECRET')
      return NextResponse.json(
        {
          error: `LiveKit API credentials not configured. Missing: ${missing.join(', ')}. Set these in your environment and restart the server.`,
        },
        { status: 400 }
      )
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity,
      metadata: metadata ? JSON.stringify(metadata) : undefined,
    })

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: grants?.canPublish ?? true,
      canSubscribe: grants?.canSubscribe ?? true,
      canPublishData: grants?.canPublishData ?? true,
    })

    const token = await at.toJwt()
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_WS_URL
      || process.env.LIVEKIT_WS_URL
      || process.env.LIVEKIT_URL
      || null

    if (!wsUrl) {
      return NextResponse.json(
        {
          error:
            'LiveKit WebSocket URL not configured. Set NEXT_PUBLIC_LIVEKIT_WS_URL (preferred) or LIVEKIT_WS_URL/LIVEKIT_URL.',
        },
        { status: 400 }
      )
    }

    return NextResponse.json({ token, wsUrl })
  } catch (err) {
    console.error('LiveKit token route error', err)
    return NextResponse.json({ error: 'Failed to mint LiveKit token' }, { status: 500 })
  }
}
