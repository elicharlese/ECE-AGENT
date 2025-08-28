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

  // Build a chain: from('agents').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
  const order = jest.fn(async () => ({
    data: [
      {
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
    ],
    error: null,
  }))
  const eq = jest.fn(() => ({ order }))
  const select = jest.fn(() => ({ eq, order }))
  const from = jest.fn(() => ({ select }))

  return {
    getSupabaseServer: async () => ({
      auth: { getUser: authGetUser },
      from,
      __mocks: { authGetUser, from, select, eq, order },
    }),
  }
})

describe('GET /api/agents', () => {
  it('returns 200 with agents for authenticated user', async () => {
    const { GET } = await import('@/app/api/agents/route')

    const res = await GET()
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(Array.isArray(json.agents)).toBe(true)
    expect(json.agents[0].name).toBe('Test Agent')
  })

  it('returns 401 when unauthorized', async () => {
    const { getSupabaseServer } = await import('@/lib/supabase/server')
    const supa: any = await getSupabaseServer()
    supa.__mocks.authGetUser.mockImplementationOnce(async () => ({ data: { user: null }, error: null }))

    const { GET } = await import('@/app/api/agents/route')
    const res = await GET()
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toBeDefined()
  })
})
