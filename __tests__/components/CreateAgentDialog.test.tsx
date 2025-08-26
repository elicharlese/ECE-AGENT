import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/__tests__/msw/server'

// Mock Supabase browser client to avoid env checks during tests
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({ insert: jest.fn() })),
    auth: { getUser: jest.fn(async () => ({ data: { user: { id: 'u' } }, error: null })) },
  },
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock Dialog primitives to simple elements to avoid portal/autoFocus issues in JSDOM
jest.mock('@/components/ui/dialog', () => {
  const React = require('react')
  return {
    Dialog: ({ children }: any) => <div data-testid="dialog">{children}</div>,
    DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
    DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
    DialogTitle: ({ children }: any) => <h1 data-testid="dialog-title">{children}</h1>,
    DialogOverlay: ({ children }: any) => <div data-testid="dialog-overlay">{children}</div>,
    DialogPortal: ({ children }: any) => <>{children}</>,
    DialogTrigger: ({ children }: any) => <button>{children}</button>,
    DialogFooter: ({ children }: any) => <div>{children}</div>,
    DialogDescription: ({ children }: any) => <p>{children}</p>,
    DialogClose: ({ children }: any) => <button>{children}</button>,
  }
})

import { CreateAgentDialog } from '@/components/agents/CreateAgentDialog'

const { toast } = jest.requireMock('sonner') as { toast: { success: jest.Mock, error: jest.Mock } }

describe('CreateAgentDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('submits successfully and closes dialog', async () => {
    const onOpenChange = jest.fn()
    const onCreated = jest.fn()

    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
    render(
      <QueryClientProvider client={client}>
        <CreateAgentDialog open={true} onOpenChange={onOpenChange} onCreated={onCreated} />
      </QueryClientProvider>
    )

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Agent A' } })

    fireEvent.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false)
      expect(onCreated).toHaveBeenCalledWith(expect.objectContaining({ id: expect.any(String), name: 'Agent A' }))
      expect(toast.success).toHaveBeenCalled()
    })
  })

  it('shows error toast on failure and keeps dialog open', async () => {
    const onOpenChange = jest.fn()
    const onCreated = jest.fn()

    // Force server to return 400 for POST /api/agents regardless of input
    server.use(
      http.post('/api/agents', () => {
        return HttpResponse.json({ error: 'Invalid' }, { status: 400 })
      })
    )

    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
    render(
      <QueryClientProvider client={client}>
        <CreateAgentDialog open={true} onOpenChange={onOpenChange} onCreated={onCreated} />
      </QueryClientProvider>
    )

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'A' } }) // invalid due to zod min(2)
    // Fix to valid input to reach server error path
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Agent B' } })

    fireEvent.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
      expect(onOpenChange).not.toHaveBeenCalled()
      expect(onCreated).not.toHaveBeenCalled()
    })
  })
})
