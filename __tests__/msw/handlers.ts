import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/agents', () => {
    return HttpResponse.json({ agents: [] }, { status: 200 })
  }),

  http.post('/api/agents', async ({ request }) => {
    try {
      const body = (await request.json()) as { name?: unknown }
      if (typeof body?.name !== 'string' || body.name.length < 2) {
        return HttpResponse.json({ error: 'Invalid' }, { status: 400 })
      }
      const id = `agent-${Date.now()}`
      return HttpResponse.json(
        {
          agent: {
            id,
            name: body.name,
            description: null,
            avatar_url: null,
            capabilities: [],
            mcp_tools: [],
            status: 'online',
          },
        },
        { status: 201 }
      )
    } catch (e) {
      return HttpResponse.json({ error: 'Invalid' }, { status: 400 })
    }
  }),

  // Profile endpoints used by ProfileSettings
  http.get('/api/profile', () => {
    return HttpResponse.json(
      {
        data: {
          username: 'olduser',
          full_name: 'Old Name',
          avatar_url: '',
          cover_url: '',
          solana_address: '',
        },
      },
      { status: 200 }
    )
  }),

  http.put('/api/profile', async ({ request }) => {
    try {
      type ProfilePayload = Partial<{
        username: string
        full_name: string
        avatar_url: string
        cover_url: string
        solana_address: string
      }>
      const body = (await request.json()) as unknown as ProfilePayload
      // Echo the updated payload back as the new server state
      return HttpResponse.json(
        {
          data: {
            username: typeof body?.username === 'string' ? body.username : '',
            full_name: typeof body?.full_name === 'string' ? body.full_name : '',
            avatar_url: typeof body?.avatar_url === 'string' ? body.avatar_url : '',
            cover_url: typeof body?.cover_url === 'string' ? body.cover_url : '',
            solana_address: typeof body?.solana_address === 'string' ? body.solana_address : '',
          },
        },
        { status: 200 }
      )
    } catch {
      return HttpResponse.json({ error: 'Invalid' }, { status: 400 })
    }
  }),

  // Credits API used by CreditsPopover and credit UI in inputs
  http.get(/\/api\/credits\/balance.*/i, () => {
    return HttpResponse.json({ balance: 42 }, { status: 200 })
  }),

  http.post('/api/credits/checkout', async () => {
    // Return a dummy checkout URL; tests won't actually navigate
    return HttpResponse.json({ url: 'https://example.com/checkout' }, { status: 200 })
  }),

  // Supabase GET for messages list used by messageService.getMessages
  http.get(/https:\/\/[a-z0-9-]+\.supabase\.co\/rest\/v1\/messages.*/i, () => {
    return HttpResponse.json([], {
      status: 200,
      headers: { 'Content-Range': '0-0/0', 'Content-Type': 'application/json' },
    })
  }),

  // Supabase HEAD count request for conversation participants used in ChatWindow
  // Matches any Supabase project URL
  http.head(/https:\/\/[a-z0-9-]+\.supabase\.co\/rest\/v1\/conversation_participants.*/i, () => {
    // Simulate a conversation with 3 participants so ChatWindow treats it as a group
    return HttpResponse.text('', {
      status: 200,
      headers: {
        // Supabase uses this header to derive the exact count when head: true
        // Format: "start-end/total"; body is empty for HEAD
        'Content-Range': '0-0/3',
      },
    })
  }),

  // Supabase GET for profiles wallet lookup with solana_address filter (more generic matcher)
  http.get(/https:\/\/[a-z0-9-]+\.supabase\.co\/rest\/v1\/profiles.*solana_address=/i, ({ request }) => {
    // For wallet lookups, return a single object for maybeSingle()
    // Debug: log to verify interception
    // eslint-disable-next-line no-console
    console.info('[MSW] wallet profiles lookup:', request.url)
    // eslint-disable-next-line no-console
    console.info('[MSW] wallet headers:', Object.fromEntries(request.headers))
    return HttpResponse.json(
      [{ user_id: 'user-wallet' }],
      { status: 200, headers: { 'Content-Range': '0-0/1', 'Content-Type': 'application/json' } }
    )
  }),

  // Fallback Supabase GET for profiles (catch-all)
  http.get(/https:\/\/[a-z0-9-]+\.supabase\.co\/rest\/v1\/profiles.*/i, ({ request }) => {
    // Always return a single object so supabase .maybeSingle() code paths work
    // Debug: log fallback interception
    // eslint-disable-next-line no-console
    console.info('[MSW] fallback profiles lookup:', request.url)
    // eslint-disable-next-line no-console
    console.info('[MSW] fallback headers:', Object.fromEntries(request.headers))
    return HttpResponse.json(
      [{ user_id: 'user-wallet' }],
      { status: 200, headers: { 'Content-Range': '0-0/1', 'Content-Type': 'application/json' } }
    )
  }),
]
