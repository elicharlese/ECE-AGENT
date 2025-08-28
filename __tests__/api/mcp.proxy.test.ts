// Mock NextResponse.json to produce a standard Response with JSON body
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, init?: ResponseInit & { status?: number }) =>
      new Response(JSON.stringify(data), {
        status: (init as any)?.status ?? 200,
        headers: { 'content-type': 'application/json' },
      }),
  },
}))

describe('MCP GitHub Proxy', () => {
  it('POST /api/mcp/github returns 400 when PAT header missing', async () => {
    const { POST } = await import('@/app/api/mcp/github/route')

    const req = new Request('http://localhost/api/mcp/github', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hello: 'world' }),
    })

    const res = await POST(req as any)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toMatch(/Missing GitHub PAT/i)
  })
})
