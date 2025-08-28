import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ConversationMenu } from '@/components/chat/ConversationMenu'

// Mock dropdown menu to render inline without portal behavior
jest.mock('@/components/ui/dropdown-menu', () => {
  const React = require('react')
  return {
    DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
    DropdownMenuTrigger: ({ children }: any) => <div data-testid="dropdown-trigger">{children}</div>,
    DropdownMenuContent: ({ children }: any) => <div role="menu">{children}</div>,
    DropdownMenuItem: ({ children, onClick }: any) => (
      <button type="button" onClick={onClick} role="menuitem">{children}</button>
    ),
    DropdownMenuSeparator: ({}) => <hr />,
    DropdownMenuLabel: ({ children }: any) => <div>{children}</div>,
    DropdownMenuCheckboxItem: ({ children, checked, onCheckedChange }: any) => {
      const [local, setLocal] = React.useState(!!checked)
      return (
        <button
          type="button"
          aria-pressed={local}
          onClick={() => {
            const next = !local
            setLocal(next)
            onCheckedChange?.(next)
          }}
        >
          {children}
        </button>
      )
    },
  }
})

// Mock alert dialog to render inline content and expose action buttons as simple buttons
jest.mock('@/components/ui/alert-dialog', () => {
  const React = require('react')
  return {
    AlertDialog: ({ children }: any) => <div data-testid="alert-dialog">{children}</div>,
    AlertDialogTrigger: ({ children }: any) => <div>{children}</div>,
    AlertDialogContent: ({ children }: any) => <div>{children}</div>,
    AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
    AlertDialogFooter: ({ children }: any) => <div>{children}</div>,
    AlertDialogTitle: ({ children }: any) => <div>{children}</div>,
    AlertDialogDescription: ({ children }: any) => <div>{children}</div>,
    AlertDialogAction: ({ children, onClick }: any) => (
      <button type="button" onClick={onClick}>{children}</button>
    ),
    AlertDialogCancel: ({ children, onClick }: any) => (
      <button type="button" onClick={onClick}>{children}</button>
    ),
  }
})

// Mock user selector dialog to expose a simple confirm button
jest.mock('@/components/chat/UserSelectorDialog', () => ({
  UserSelectorDialog: ({ onConfirm }: any) => (
    <div data-testid="user-selector-dialog">
      <button type="button" onClick={() => onConfirm(['u1', 'u2'])}>Confirm Invite</button>
    </div>
  ),
}))

// Router mock
const pushMock = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: jest.fn(), prefetch: jest.fn(), back: jest.fn() }),
}))

// Toast mock
const toastMock = jest.fn()
jest.mock('@/components/ui/use-toast', () => ({
  toast: (args: any) => toastMock(args),
}))

// Supabase client mock for loading flags
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: { is_pinned: false, is_archived: false }, error: null }),
          }),
        }),
      }),
    }),
  },
}))

// Conversation service delete mock
const deleteConversationMock = jest.fn()
jest.mock('@/services/conversation-service', () => ({
  conversationService: {
    deleteConversation: (...args: any[]) => deleteConversationMock(...args),
  },
}))

// useConversations spies
const pinSpy = jest.fn()
const archiveSpy = jest.fn()
const leaveSpy = jest.fn()
const inviteSpy = jest.fn()

jest.mock('@/hooks/use-conversations', () => ({
  useConversations: () => ({
    pinConversation: (...args: any[]) => pinSpy(...args),
    archiveConversation: (...args: any[]) => archiveSpy(...args),
    leaveConversation: (...args: any[]) => leaveSpy(...args),
    inviteParticipants: (...args: any[]) => inviteSpy(...args),
  }),
}))

describe('ConversationMenu', () => {
  const baseProps = {
    chatId: 'chat-1',
    currentUserId: 'user-1',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const openMenu = () => {
    // No-op since our mocked dropdown renders content inline
    const trigger = screen.getByRole('button', { name: /conversation options/i })
    fireEvent.click(trigger)
  }

  test('pin -> calls pinConversation(chatId, true) and shows toast', async () => {
    render(<ConversationMenu {...baseProps} />)
    openMenu()

    fireEvent.click(await screen.findByText(/pin conversation/i))

    await waitFor(() => {
      expect(pinSpy).toHaveBeenCalledWith('chat-1', true)
      expect(toastMock).toHaveBeenCalled()
    })
  })

  test('archive -> calls archiveConversation(chatId, true), navigates, onEnded("archived")', async () => {
    const onEnded = jest.fn()
    render(<ConversationMenu {...baseProps} onEnded={onEnded} />)
    openMenu()

    fireEvent.click(await screen.findByText(/archive conversation/i))

    await waitFor(() => {
      expect(archiveSpy).toHaveBeenCalledWith('chat-1', true)
      expect(pushMock).toHaveBeenCalledWith('/messages')
      expect(onEnded).toHaveBeenCalledWith('archived')
    })
  })

  test('non-creator End chat -> leaveConversation and navigate', async () => {
    render(<ConversationMenu {...baseProps} creatorUserId="creator-xyz" />)
    openMenu()

    fireEvent.click(await screen.findByText(/end chat/i))
    fireEvent.click(screen.getByRole('button', { name: /leave/i }))

    await waitFor(() => {
      expect(leaveSpy).toHaveBeenCalledWith('chat-1')
      expect(pushMock).toHaveBeenCalledWith('/messages')
      expect(deleteConversationMock).not.toHaveBeenCalled()
    })
  })

  test('creator End chat -> deleteConversation', async () => {
    render(<ConversationMenu {...baseProps} creatorUserId="user-1" />)
    openMenu()

    fireEvent.click(await screen.findByText(/end chat/i))
    fireEvent.click(screen.getByRole('button', { name: /^delete$/i }))

    await waitFor(() => {
      expect(deleteConversationMock).toHaveBeenCalledWith('chat-1')
      expect(leaveSpy).not.toHaveBeenCalled()
    })
  })

  test('invite participants -> opens selector and confirms with ids', async () => {
    render(<ConversationMenu {...baseProps} />)
    openMenu()

    fireEvent.click(await screen.findByText(/invite participants/i))
    fireEvent.click(await screen.findByText(/confirm invite/i))

    await waitFor(() => {
      expect(inviteSpy).toHaveBeenCalledWith('chat-1', ['u1', 'u2'])
    })
  })
})
