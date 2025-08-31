import React from 'react'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithAct } from '../utils/test-utils'

// Stub out next/dynamic heavy components
jest.mock('next/dynamic', () => () => (props: any) => null)

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn(), back: jest.fn() }),
  usePathname: () => '/messages',
  useSearchParams: () => ({ get: () => null }),
}))

// Controllable mobile hook
const mockUseIsMobile = jest.fn(() => false)
jest.mock('@/hooks/use-mobile', () => ({ useIsMobile: () => mockUseIsMobile() }))

// WebSocket hook mock
jest.mock('@/hooks/use-websocket', () => ({
  useWebSocket: () => ({
    isConnected: true,
    messages: [],
    typingUsers: {},
    joinConversation: jest.fn(),
    sendChatMessage: jest.fn(),
    sendTyping: jest.fn(),
    sendEditMessage: jest.fn(),
  }),
}))

// Conversations hook mock
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

// Supabase client mock (auth + participant count)
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

// Message service mock (empty initial list to keep UI simple)
const getMessagesMock = jest.fn()
jest.mock('@/services/message-service', () => ({
  messageService: {
    getMessages: (...args: any[]) => getMessagesMock(...args),
    updateMessage: jest.fn(async () => ({})),
  },
}))

// Feature flag + analytics mocks
const isFeatureEnabledMock = jest.fn()
const trackEventMock = jest.fn(async () => {})
jest.mock('@/lib/feature-flags', () => ({
  FEATURES: { IMMERSIVE_CHAT: 'immersive_chat' },
  isFeatureEnabled: (feature: string) => isFeatureEnabledMock(feature),
}))
jest.mock('@/lib/analytics', () => ({
  trackEvent: (...args: any[]) => (trackEventMock as any)(...args),
}))

import { ChatWindow } from '@/components/chat/chat-window'

const baseProps = {
  chatId: 'abc',
  onToggleSidebar: () => {},
  sidebarCollapsed: false,
}

beforeEach(() => {
  jest.clearAllMocks()
  localStorage.clear()
  mockUseIsMobile.mockReturnValue(false)
  isFeatureEnabledMock.mockImplementation((f: string) => f === 'immersive_chat' ? true : false)
  getMessagesMock.mockResolvedValue([])
})

describe('ChatWindow immersive 3D headset view', () => {
  test('toggle button is hidden when feature flag disabled', async () => {
    isFeatureEnabledMock.mockImplementation(() => false) // disable for all calls in this test
    await renderWithAct(<ChatWindow {...baseProps} />)

    expect(screen.queryByRole('button', { name: /enter 3d headset view/i })).not.toBeInTheDocument()
  })

  test('desktop-only: button visible on desktop and toggles 3D view + analytics + persistence', async () => {
    // desktop
    mockUseIsMobile.mockReturnValue(false)
    await renderWithAct(<ChatWindow {...baseProps} />)

    // Initially, input is visible and 3D region is not
    expect(await screen.findByLabelText(/message input/i)).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: /3d headset chat space/i })).not.toBeInTheDocument()

    const toggleBtn = screen.getByRole('button', { name: /enter 3d headset view/i })
    fireEvent.click(toggleBtn)

    // After toggle ON: input hidden, 3D region visible, aria label updates, analytics fired, localStorage set
    await waitFor(() => {
      expect(screen.getByRole('region', { name: /3d headset chat space/i })).toBeInTheDocument()
    })
    expect(screen.queryByLabelText(/message input/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /exit 3d headset view/i })).toBeInTheDocument()

    await waitFor(() => {
      expect(trackEventMock).toHaveBeenCalledWith({
        name: 'immersive_chat_toggle',
        properties: { chatId: 'abc', enabled: true },
      })
    })
    expect(localStorage.getItem('chat_immersive_3d_abc')).toBe('1')

    // Toggle OFF
    fireEvent.click(screen.getByRole('button', { name: /exit 3d headset view/i }))
    await waitFor(() => {
      expect(screen.queryByRole('region', { name: /3d headset chat space/i })).not.toBeInTheDocument()
    })
    expect(screen.getByLabelText(/message input/i)).toBeInTheDocument()
    expect(localStorage.getItem('chat_immersive_3d_abc')).toBe('0')
  })

  test('restores persisted state per chat on mount (desktop)', async () => {
    mockUseIsMobile.mockReturnValue(false)
    localStorage.setItem('chat_immersive_3d_abc', '1')

    await renderWithAct(<ChatWindow {...baseProps} />)

    // Restored to ON: 3D region present, input hidden, header shows Exit label
    await waitFor(() => {
      expect(screen.getByRole('region', { name: /3d headset chat space/i })).toBeInTheDocument()
    })
    expect(screen.queryByLabelText(/message input/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /exit 3d headset view/i })).toBeInTheDocument()
  })

  test('mobile disables 3D view and hides the toggle button even if persisted', async () => {
    // Simulate previously enabled state
    localStorage.setItem('chat_immersive_3d_abc', '1')

    // Mobile
    mockUseIsMobile.mockReturnValue(true)

    await renderWithAct(<ChatWindow {...baseProps} />)

    // No toggle button rendered
    expect(screen.queryByRole('button', { name: /3d headset/i })).not.toBeInTheDocument()

    // 3D view not shown; input is present
    await waitFor(() => {
      expect(screen.queryByRole('region', { name: /3d headset chat space/i })).not.toBeInTheDocument()
    })
    expect(screen.queryByLabelText(/message input/i)).not.toBeInTheDocument() // mobile input has no aria-label
  })
})
