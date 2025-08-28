import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChatWindow } from '@/components/chat/chat-window'

// Mock next/dynamic to avoid loading heavy components during tests
jest.mock('next/dynamic', () => () => (props: any) => null)

// Mock Next.js navigation to satisfy components that call useRouter/usePathname
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn(), back: jest.fn() }),
  usePathname: () => '/messages',
  useSearchParams: () => ({ get: () => null }),
}))

// Mock hooks used by ChatWindow
jest.mock('@/hooks/use-conversations', () => ({
  useConversations: () => ({
    conversations: [
      { id: 'abc', title: 'Test Conversation', created_at: '', updated_at: '', user_id: 'user-1' },
    ],
    loading: false,
    error: null,
    fetchConversations: jest.fn(),
    createConversation: jest.fn(),
    createConversationWithParticipants: jest.fn(),
    updateConversation: jest.fn(),
    deleteConversation: jest.fn(),
  }),
}))

jest.mock('@/hooks/use-websocket', () => ({
  useWebSocket: () => ({
    isConnected: true,
    messages: [],
    typingUsers: {},
    joinConversation: jest.fn(),
    sendChatMessage: jest.fn(),
    sendTyping: jest.fn(),
  }),
}))

jest.mock('@/hooks/use-mobile', () => ({ useIsMobile: () => false }))
jest.mock('@/hooks/use-haptics', () => ({ useHaptics: () => ({ triggerHaptic: () => undefined }) }))

// Mock UserProfile to simply render the provided user name (header title)
jest.mock('@/components/chat/user-profile', () => ({
  UserProfile: ({ user }: any) => <div>{user.name}</div>,
}))

// Basic smoke tests for header rendering and popout behavior

describe('ChatWindow', () => {
  const baseProps = {
    chatId: 'abc',
    onToggleSidebar: () => {},
    sidebarCollapsed: false,
  }

  test('renders header with conversation title from useConversations()', () => {
    render(<ChatWindow {...baseProps} />)
    expect(screen.getByText('Test Conversation')).toBeInTheDocument()
  })

  test('popout button opens /messages?c=<id>&popout=1 in a new window', () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null)
    render(<ChatWindow {...baseProps} />)

    const btn = screen.getByRole('button', { name: /open in new window/i })
    fireEvent.click(btn)

    const expectedUrl = new URL('/messages', window.location.origin)
    expectedUrl.searchParams.set('c', 'abc')
    expectedUrl.searchParams.set('popout', '1')

    expect(openSpy).toHaveBeenCalledTimes(1)
    expect(openSpy).toHaveBeenCalledWith(expectedUrl.toString(), '_blank', 'noopener,noreferrer,width=520,height=720')

    openSpy.mockRestore()
  })
})
