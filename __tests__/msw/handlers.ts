import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/agents', () => {
    return HttpResponse.json({ agents: [] }, { status: 200 })
  }),

  http.post('/api/agents', async ({ request }) => {
    try {
      const body: any = await request.json()
      if (!body?.name || typeof body.name !== 'string' || body.name.length < 2) {
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
]
