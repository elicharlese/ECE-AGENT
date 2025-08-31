import React from 'react'
import { screen, fireEvent, waitFor, act } from '@testing-library/react'
import { renderWithAct } from '../utils/test-utils'

// Mock next/dynamic to avoid loading heavy components during tests
jest.mock('next/dynamic', () => () => (props: any) => null)

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn(), back: jest.fn() }),
  usePathname: () => '/messages',
  useSearchParams: () => ({ get: () => null }),
}))

// Force credits UI on and a known per-request estimate
jest.mock('@/lib/pricing', () => ({
  CREDITS_ENABLED: true,
  CREDITS_PER_AI_REQUEST: 2,
}))

// Mock credits service to avoid network and provide stable balance
jest.mock('@/services/credit-service', () => ({
  getCreditBalance: jest.fn(async () => ({ balance: 42 })),
}))

// Mock conversations hook
jest.mock('@/hooks/use-conversations', () => ({
  useConversations: () => ({
    conversations: [
      { id: 'abc', title: 'Test Conversation', created_at: '', updated_at: '', user_id: 'user-1' },
    ],
    loading: false,
    error: null,
    inviteParticipants: jest.fn(),
  }),
}))

// Prepare a controllable mobile hook -> force mobile
const mockUseIsMobile = jest.fn(() => true)
jest.mock('@/hooks/use-mobile', () => ({ useIsMobile: () => mockUseIsMobile() }))

// WebSocket hook mock with spies
const sendChatMessage = jest.fn()
jest.mock('@/hooks/use-websocket', () => ({
  useWebSocket: () => ({
    isConnected: true,
    messages: [],
    typingUsers: {},
    joinConversation: jest.fn(),
    sendChatMessage,
    sendTyping: jest.fn(),
    sendEditMessage: jest.fn(),
  }),
}))

// Supabase client mock: auth.getUser and participant count query
jest.mock('@/lib/supabase/client', () => {
  const supabase = {
    auth: {
      getUser: async () => ({ data: { user: { id: 'me' } } }),
    },
    from: (_table: string) => ({
      select: (_sel: string, _opts?: any) => ({
        eq: (_col: string, _val: string) => Promise.resolve({ count: 1 }),
      }),
    }),
  }
  return { supabase }
})

// Keep MessageBubble simple (no edit UI needed for this suite)
jest.mock('@/components/chat/message-bubble', () => ({
  MessageBubble: ({ message }: any) => (
    <div>
      <div data-testid={`msg-${message.id}`}>{message.content}</div>
    </div>
  ),
}))

// Controllable message service mock
const getMessagesMock = jest.fn()
jest.mock('@/services/message-service', () => ({
  messageService: {
    getMessages: (...args: any[]) => getMessagesMock(...args),
  },
}))

import { ChatWindow } from '@/components/chat/chat-window'

const baseProps = {
  chatId: 'abc',
  onToggleSidebar: () => {},
  sidebarCollapsed: false,
}

beforeEach(() => {
  jest.clearAllMocks()
  mockUseIsMobile.mockReturnValue(true)
  // Resolve quickly with one message
  getMessagesMock.mockResolvedValue([
    {
      id: 'm1',
      conversation_id: 'abc',
      user_id: 'me',
      content: 'Original message',
      created_at: new Date().toISOString(),
      role: 'user',
      type: 'text',
      edited_at: null,
    },
  ])
})

describe('ChatWindow + MobileMessageInput parity', () => {
  test('renders MobileMessageInput on mobile and does not render Desktop aria-labeled input', async () => {
    await renderWithAct(<ChatWindow {...baseProps} />)

    // Desktop aria-labeled input should not exist on mobile
    await waitFor(() => {
      expect(screen.queryByLabelText(/message input/i)).not.toBeInTheDocument()
    })

    // But a textbox should exist for composing
    const input = screen.getByRole('textbox') as HTMLTextAreaElement
    expect(input).toBeInTheDocument()
  })

  test('keyboard shortcuts on mobile: Enter sends; Shift+Enter newline; Ctrl+Enter sends', async () => {
    await renderWithAct(<ChatWindow {...baseProps} />)

    const input = screen.getByRole('textbox') as HTMLTextAreaElement

    // Type something
    fireEvent.change(input, { target: { value: 'Hello' } })

    // Enter sends
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    expect(sendChatMessage).toHaveBeenCalledTimes(1)

    // Type again
    fireEvent.change(input, { target: { value: 'Hello again' } })

    // Shift+Enter should not send
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', shiftKey: true })
    expect(sendChatMessage).toHaveBeenCalledTimes(1)

    // Ctrl+Enter sends
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', ctrlKey: true })
    expect(sendChatMessage).toHaveBeenCalledTimes(2)
  })

  test('credits UI visible on mobile: estimate and Buy Credits', async () => {
    await renderWithAct(<ChatWindow {...baseProps} />)

    // Credit estimate
    expect(await screen.findByText(/est\. credits:\s*2/i)).toBeInTheDocument()

    // Buy Credits button
    expect(screen.getByRole('button', { name: /buy credits/i })).toBeInTheDocument()
  })

  test('AI mode placeholder is appropriate; toggles if available on mobile', async () => {
    await renderWithAct(<ChatWindow {...baseProps} />)
    const input = screen.getByRole('textbox') as HTMLTextAreaElement

    // Initial placeholder
    expect(input.placeholder.toLowerCase()).toMatch(/type a message|ask ai/i)

    const toggle = screen.queryByRole('button', { name: /enable ai mode/i })
    if (toggle) {
      fireEvent.click(toggle)
      // After enabling
      expect(screen.getByText(/ai mode/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /disable ai mode/i })).toBeInTheDocument()
      // Placeholder should mention AI or remain message-friendly
      expect(input.placeholder.toLowerCase()).toMatch(/ask ai|type a message/i)
    } else {
      // If no toggle on mobile, at least ensure placeholder remains sensible
      expect(input.placeholder.toLowerCase()).toMatch(/type a message|ask ai/i)
    }
  })

  test('skeleton loader shows while loading, then empty state on mobile when no messages', async () => {
    // Delay messages to assert skeletons, then resolve with []
    getMessagesMock.mockImplementationOnce(() => new Promise((resolve) => setTimeout(() => resolve([]), 50)))

    const { container } = await renderWithAct(<ChatWindow {...baseProps} />)

    // Skeletons present during load
    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0)

    // After load completes, skeletons go away and empty state shows
    await waitFor(() => {
      expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBe(0)
      expect(screen.getByText(/no messages yet\. say hello!/i)).toBeInTheDocument()
    })
  })

  test('action panel opens and tabs switch on mobile', async () => {
    const { container } = await renderWithAct(<ChatWindow {...baseProps} />)

    // Open the action panel via the + button
    const openActions = await screen.findByRole('button', { name: /open actions/i })
    fireEvent.click(openActions)

    // Default tab is Media
    expect(await screen.findByText(/media & content/i)).toBeInTheDocument()

    // Switch to Apps
    fireEvent.click(screen.getByRole('button', { name: /apps/i }))
    expect(await screen.findByText(/quick apps/i)).toBeInTheDocument()

    // Switch to Agents
    fireEvent.click(screen.getByRole('button', { name: /agents/i }))
    expect(await screen.findByText(/ai agents/i)).toBeInTheDocument()
  })

  test('selecting a GIF appends a new message on mobile', async () => {
    jest.useFakeTimers()
    const { container } = await renderWithAct(<ChatWindow {...baseProps} />)

    // Start with a single message from the backend
    await screen.findByTestId('msg-m1')
    expect(container.querySelectorAll('[data-testid^="msg-"]').length).toBe(1)

    // Open action panel
    fireEvent.click(await screen.findByRole('button', { name: /open actions/i }))
    expect(await screen.findByText(/media & content/i)).toBeInTheDocument()

    // Open GIF picker
    fireEvent.click(screen.getByRole('button', { name: /open gif picker/i }))

    // Wait for GIFs to load (debounced 0ms on initial, but search has 500ms delay)
    // Ensure popover content is present first
    await screen.findByPlaceholderText(/search gifs/i)
    await screen.findByText(/loading gifs/i)
    await act(async () => {
      jest.advanceTimersByTime(600)
    })

    // Click a GIF
    const gifButton = await screen.findByTitle('Happy Dance')
    fireEvent.click(gifButton)

    // Message count should increase
    await waitFor(() => {
      expect(container.querySelectorAll('[data-testid^="msg-"]').length).toBe(2)
    })

    jest.useRealTimers()
  })
})
