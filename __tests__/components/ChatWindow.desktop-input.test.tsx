import React from 'react'
import { screen, fireEvent, waitFor, act } from '@testing-library/react'
import { renderWithAct } from '../utils/test-utils'

// Mock next/dynamic to avoid loading heavy components during tests
jest.mock('next/dynamic', () => () => (props: any) => null)

// Mock Next.js navigation to satisfy components that call useRouter/usePathname
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

// Prepare a controllable mobile hook
const mockUseIsMobile = jest.fn(() => false)
jest.mock('@/hooks/use-mobile', () => ({ useIsMobile: () => mockUseIsMobile() }))

// WebSocket hook mock with spies
const sendChatMessage = jest.fn()
const sendEditMessage = jest.fn()
jest.mock('@/hooks/use-websocket', () => ({
  useWebSocket: () => ({
    isConnected: true,
    messages: [],
    typingUsers: {},
    joinConversation: jest.fn(),
    sendChatMessage,
    sendTyping: jest.fn(),
    sendEditMessage,
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

// Mock message-bubble to expose a test-only Edit action triggering ChatWindow.onUpdateMessage
jest.mock('@/components/chat/message-bubble', () => ({
  MessageBubble: ({ message, onUpdateMessage }: any) => (
    <div>
      <div data-testid={`msg-${message.id}`}>{message.content}</div>
      <button onClick={() => onUpdateMessage(message.id, 'Hello edited')}>Edit</button>
    </div>
  ),
}))

// Controllable message service mock
const getMessagesMock = jest.fn()
const updateMessageMock = jest.fn()
jest.mock('@/services/message-service', () => ({
  messageService: {
    getMessages: (...args: any[]) => getMessagesMock(...args),
    updateMessage: (...args: any[]) => updateMessageMock(...args),
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
  mockUseIsMobile.mockReturnValue(false)
  // Default: resolve quickly with one message
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
  updateMessageMock.mockResolvedValue({})
})

describe('ChatWindow + DesktopMessageInput integration', () => {
  test('renders DesktopMessageInput on desktop (Message input present)', async () => {
    mockUseIsMobile.mockReturnValue(false)
    await renderWithAct(<ChatWindow {...baseProps} />)

    // Desktop textarea is labeled
    expect(await screen.findByLabelText(/message input/i)).toBeInTheDocument()
  })

  test('does not render Desktop aria-labeled input on mobile', async () => {
    jest.clearAllMocks()
    mockUseIsMobile.mockReturnValue(true)
    await renderWithAct(<ChatWindow {...baseProps} />)

    // Mobile textarea has no aria-label "Message input"
    await waitFor(() => {
      expect(screen.queryByLabelText(/message input/i)).not.toBeInTheDocument()
    })
  })

  test('keyboard shortcuts: Enter sends, Shift+Enter does not, Ctrl+Enter sends', async () => {
    await renderWithAct(<ChatWindow {...baseProps} />)
    const input = await screen.findByLabelText(/message input/i)

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

  test('credit usage UI: shows CreditBadge, BuyCreditsButton and estimate text', async () => {
    await renderWithAct(<ChatWindow {...baseProps} />)

    // Credit estimate
    expect(await screen.findByText(/est\. credits:\s*2/i)).toBeInTheDocument()

    // Buy Credits button
    expect(screen.getByRole('button', { name: /buy credits/i })).toBeInTheDocument()

    // Credit balance badge (42) - use more specific selector for mocked component
    expect(screen.getByTestId('credits-popover-mock')).toBeInTheDocument()
  })

  test('AI mode toggle updates badge and placeholder', async () => {
    await renderWithAct(<ChatWindow {...baseProps} />)
    const input = await screen.findByLabelText(/message input/i)

    // Initial placeholder
    expect((input as HTMLTextAreaElement).placeholder).toMatch(/type a message/i)

    const toggle = screen.getByRole('button', { name: /enable ai mode/i })
    fireEvent.click(toggle)

    // After enabling
    expect(screen.getByText(/ai mode/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /disable ai mode/i })).toBeInTheDocument()
    expect((input as HTMLTextAreaElement).placeholder).toMatch(/ask ai or type a message/i)
  })

  test('inline edit: optimistic update, persistence, and WS broadcast', async () => {
    await renderWithAct(<ChatWindow {...baseProps} />)

    // Original content visible
    const original = await screen.findByTestId('msg-m1')
    expect(original).toHaveTextContent('Original message')

    // Trigger our test-only Edit button in mocked MessageBubble
    fireEvent.click(screen.getByText('Edit'))

    // Optimistic content change should be immediate
    expect(screen.getByTestId('msg-m1')).toHaveTextContent('Hello edited')

    // Persistence and broadcast
    await waitFor(() => {
      expect(updateMessageMock).toHaveBeenCalledWith('m1', 'Hello edited')
      expect(sendEditMessage).toHaveBeenCalledWith('m1', 'Hello edited', 'abc')
    })
  })

  test('inline edit failure: reverts to previous content', async () => {
    updateMessageMock.mockRejectedValueOnce(new Error('DB down'))
    await renderWithAct(<ChatWindow {...baseProps} />)

    // Original content visible
    expect(await screen.findByTestId('msg-m1')).toHaveTextContent('Original message')

    // Trigger edit
    fireEvent.click(screen.getByText('Edit'))

    // Optimistic change first
    expect(screen.getByTestId('msg-m1')).toHaveTextContent('Hello edited')

    // Then revert after failure
    await waitFor(() => {
      expect(screen.getByTestId('msg-m1')).toHaveTextContent('Original message')
    })
  })

  test('skeleton loader shows while loading, then empty state when no messages', async () => {
    // Delay messages to assert skeletons
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

  test('action panel opens and tabs switch on desktop', async () => {
    await renderWithAct(<ChatWindow {...baseProps} />)

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

  test('selecting a GIF appends a new message on desktop', async () => {
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

    // Wait for GIFs to load
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
