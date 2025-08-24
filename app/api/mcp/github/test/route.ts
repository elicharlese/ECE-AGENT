import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Best-effort parse for debugging; not strictly required
    let payload: unknown = null
    try {
      payload = await req.json()
    } catch {
      // ignore invalid JSON
    }

    return NextResponse.json(
      {
        ok: true,
        message:
          'MCP GitHub test endpoint is reachable. Use /api/mcp/github with X-GitHub-PAT and optional Mcp-Session-Id for real MCP requests.',
        echo: payload ?? null,
      },
      { status: 200 },
    )
  } catch (err) {
    console.error('MCP test route error:', err)
    return NextResponse.json({ ok: false, error: 'Test route failed' }, { status: 500 })
  }
}
