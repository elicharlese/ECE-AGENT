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

// Mock getSupabaseServer to simulate authenticated user and DB calls
jest.mock('@/lib/supabase/server', () => {
  const authGetUser = jest.fn(async () => ({ data: { user: { id: 'user-1' } }, error: null }))

  // Build a chain: from('agents').insert(payload).select('*').single()
  const single = jest.fn(async () => ({ data: null, error: null }))
  const select = jest.fn(() => ({ single }))
  const insert = jest.fn(() => ({ select }))
  const from = jest.fn(() => ({ insert }))

  return {
    getSupabaseServer: async () => ({
      auth: { getUser: authGetUser },
      from,
      __mocks: { authGetUser, from, insert, select, single },
    }),
  }
})

describe('POST /api/agents', () => {
  it('returns 400 on invalid payload (zod)', async () => {
    const { POST } = await import('@/app/api/agents/route')
    const req = new Request('http://localhost/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })

    const res = await POST(req as any)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBeDefined()
  })

  it('creates agent and returns 201 on valid payload', async () => {
    // Override the mock to return an inserted row
    const { getSupabaseServer } = await import('@/lib/supabase/server')
    const supa: any = await getSupabaseServer()
    supa.__mocks.single.mockImplementation(async () => ({
      data: {
        id: 'agent-1',
        user_id: 'user-1',
        name: 'Test Agent',
        description: null,
        model: 'gpt-4o-mini',
        avatar_url: null,
        capabilities: [],
        mcp_tools: [],
        status: 'online',
        system_prompt: null,
        created_at: new Date().toISOString(),
      },
      error: null,
    }))

    const { POST } = await import('@/app/api/agents/route')
    const req = new Request('http://localhost/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Agent' }),
    })

    const res = await POST(req as any)
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.agent).toBeDefined()
    expect(json.agent.name).toBe('Test Agent')
  })
})
