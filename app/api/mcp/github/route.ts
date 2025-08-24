import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const REMOTE_MCP_URL = 'https://api.githubcopilot.com/mcp/'

function getPat(req: NextRequest): string | null {
  const pat = req.headers.get('x-github-pat') || req.headers.get('authorization')
  if (!pat) return null
  return pat.startsWith('Bearer ') ? pat : `Bearer ${pat}`
}

// POST – initialize or send request over MCP HTTP
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const pat = getPat(req)
    if (!pat) {
      return NextResponse.json({ error: 'Missing GitHub PAT or Authorization header' }, { status: 400 })
    }

    const body = await req.text()

    const upstream = await fetch(REMOTE_MCP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: pat,
        // Forward session if provided by client
        ...(req.headers.get('mcp-session-id')
          ? { 'Mcp-Session-Id': String(req.headers.get('mcp-session-id')) }
          : {}),
      },
      body: body || '{}',
    })

    const text = await upstream.text()
    const headers = new Headers()
    headers.set('Content-Type', upstream.headers.get('content-type') || 'application/json')
    const upstreamSessionId = upstream.headers.get('Mcp-Session-Id')
    if (upstreamSessionId) headers.set('Mcp-Session-Id', upstreamSessionId)
    headers.set('Access-Control-Expose-Headers', 'Mcp-Session-Id')

    return new NextResponse(text, { status: upstream.status, headers })
  } catch (err) {
    console.error('MCP proxy POST error:', err)
    return NextResponse.json({ error: 'MCP proxy POST failed' }, { status: 500 })
  }
}

// GET – stream SSE notifications
export async function GET(req: NextRequest): Promise<Response> {
  try {
    const pat = getPat(req)
    const sessionId = req.headers.get('mcp-session-id')

    if (!pat) {
      return NextResponse.json({ error: 'Missing GitHub PAT or Authorization header' }, { status: 400 })
    }
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing Mcp-Session-Id header' }, { status: 400 })
    }

    const upstream = await fetch(REMOTE_MCP_URL, {
      method: 'GET',
      headers: {
        Authorization: pat,
        'Mcp-Session-Id': sessionId,
      },
    })

    const headers = new Headers()
    headers.set('Content-Type', upstream.headers.get('content-type') || 'text/event-stream')
    headers.set('Cache-Control', 'no-cache')
    headers.set('Connection', 'keep-alive')
    headers.set('Access-Control-Expose-Headers', 'Mcp-Session-Id')
    const upstreamSessionId = upstream.headers.get('Mcp-Session-Id')
    if (upstreamSessionId) headers.set('Mcp-Session-Id', upstreamSessionId)

    if (!upstream.body) {
      return new NextResponse('Upstream returned no body', { status: 502 })
    }

    // Pass-through streaming body
    return new Response(upstream.body, { status: upstream.status, headers })
  } catch (err) {
    console.error('MCP proxy GET error:', err)
    return new NextResponse('MCP proxy GET failed', { status: 500 })
  }
}

// DELETE – terminate session upstream
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const pat = getPat(req)
    const sessionId = req.headers.get('mcp-session-id')

    if (!pat || !sessionId) {
      return NextResponse.json({ error: 'Missing credentials or session id' }, { status: 400 })
    }

    const upstream = await fetch(REMOTE_MCP_URL, {
      method: 'DELETE',
      headers: {
        Authorization: pat,
        'Mcp-Session-Id': sessionId,
      },
    })

    const text = await upstream.text()
    const headers = new Headers()
    headers.set('Content-Type', upstream.headers.get('content-type') || 'application/json')
    headers.set('Access-Control-Expose-Headers', 'Mcp-Session-Id')

    return new NextResponse(text, { status: upstream.status, headers })
  } catch (err) {
    console.error('MCP proxy DELETE error:', err)
    return NextResponse.json({ error: 'MCP proxy DELETE failed' }, { status: 500 })
  }
}
