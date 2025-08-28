import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mock next/dynamic to avoid loading heavy components during tests
jest.mock('next/dynamic', () => () => (props: any) => null)

// Mock Next.js navigation to satisfy components that call useRouter/usePathname
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn(), back: jest.fn() }),
  usePathname: () => '/messages',
  useSearchParams: () => ({ get: () => null }),
}))

// Mock hooks used by ChatWindow
const mockInviteParticipants = jest.fn()
jest.mock('@/hooks/use-conversations', () => ({
  useConversations: () => ({
    conversations: [
      { id: 'abc', title: 'Test Conversation', created_at: '', updated_at: '', user_id: 'user-1' },
    ],
    loading: false,
    error: null,
    inviteParticipants: mockInviteParticipants,
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

// Mock InviteUsersDialog to immediately invoke onInviteUsers when opened
jest.mock('@/components/chat/invite-users-dialog', () => ({
  InviteUsersDialog: ({ isOpen, onClose, onInviteUsers }: any) => {
    if (isOpen) {
      // Trigger a mixed set: username, email, wallet
      const users = [
        { identifier: '@alice', type: 'username' },
        { identifier: 'bob@example.com', type: 'email' },
        { identifier: 'SoL1111111111111111111111111111111111111', type: 'wallet' },
      ]
      // Fire and close once
      onInviteUsers(users)
      onClose?.()
    }
    return null
  },
}))

// Mock profile-service resolvers used by handleInviteUsers
import { getProfileByUsername, getProfileByIdentifier } from '@/services/profile-service'
jest.mock('@/services/profile-service', () => ({
  getProfileByUsername: jest.fn(),
  getProfileByIdentifier: jest.fn(),
}))

// Mock Supabase client used by ChatWindow for this test
jest.mock('@/lib/supabase/client', () => {
  const supabase = {
    from: (table: string) => ({
      select: (_sel: string, _opts?: any) => ({
        eq: (col: string, _val: string) => {
          // Participant count head:true path
          if (table === 'conversation_participants' && col === 'conversation_id') {
            return Promise.resolve({ count: 3 })
          }
          // Wallet lookup path
          if (table === 'profiles' && col === 'solana_address') {
            return {
              limit: async (_n: number) => ({ data: [{ user_id: 'user-wallet' }], error: null }),
            }
          }
          return {
            limit: async (_n: number) => ({ data: null, error: null }),
          }
        },
      }),
    }),
  }
  return { supabase }
})

import { ChatWindow } from '@/components/chat/chat-window'

describe('ChatWindow invite flow', () => {
  beforeEach(() => {
    mockInviteParticipants.mockReset()
    ;(getProfileByUsername as jest.Mock).mockReset()
    ;(getProfileByIdentifier as jest.Mock).mockReset()

    // Resolve username '@alice' -> 'user-alice'
    ;(getProfileByUsername as jest.Mock).mockImplementation(async (uname: string) => {
      if (uname.replace(/^@/, '') === 'alice' || uname === 'alice') {
        return { user_id: 'user-alice' }
      }
      return null
    })

    // Resolve email 'bob@example.com' -> 'user-bob'
    ;(getProfileByIdentifier as jest.Mock).mockImplementation(async (identifier: string) => {
      if (identifier === 'bob@example.com') {
        return { user_id: 'user-bob' }
      }
      return null
    })
  })

  const baseProps = {
    chatId: 'abc',
    onToggleSidebar: () => {},
    sidebarCollapsed: false,
  }

  test('resolves identifiers and calls inviteParticipants with user IDs', async () => {
    render(<ChatWindow {...baseProps} />)

    // Wait until group detection enables the Invite button
    const inviteBtn = await screen.findByTitle(/invite users/i)
    fireEvent.click(inviteBtn)

    await waitFor(() => {
      expect(mockInviteParticipants).toHaveBeenCalledTimes(1)
      expect(mockInviteParticipants).toHaveBeenCalledWith('abc', expect.arrayContaining([
        'user-alice', // from username
        'user-bob',   // from email
        'user-wallet' // from wallet MSW handler
      ]))
    })
  })
})
