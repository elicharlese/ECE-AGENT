import React from 'react'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuickChatMount } from '@/components/chat/QuickChatMount'

// Stub websocket hook to avoid network/auth during tests
jest.mock('@/hooks/use-websocket', () => ({
  useWebSocket: () => ({
    sendChatMessage: jest.fn(),
    joinConversation: jest.fn(),
    messages: [],
  }),
}))

// Haptics no-op
jest.mock('@/hooks/use-haptics', () => ({
  useHaptics: () => ({ triggerHaptic: () => {} }),
}))

describe('QuickChatMount window.quickChat API and events', () => {
  test('exposes show/hide/toggle and reacts to quickchat:* events', async () => {
    render(<QuickChatMount />)

    // Initially visible minimized bar should render a search region
    expect(await screen.findByRole('search', { name: /quick chat/i })).toBeInTheDocument()

    // API available
    const qc = (window as any).quickChat
    expect(qc).toBeTruthy()
    expect(typeof qc.show).toBe('function')
    expect(typeof qc.hide).toBe('function')
    expect(typeof qc.toggle).toBe('function')

    // Hide via event
    fireEvent(window, new Event('quickchat:hide'))
    await waitFor(() => {
      expect(screen.queryByRole('search', { name: /quick chat/i })).not.toBeInTheDocument()
    })

    // Show via API
    await act(async () => {
      qc.show()
    })
    await waitFor(() => {
      expect(screen.getByRole('search', { name: /quick chat/i })).toBeInTheDocument()
    })

    // Toggle via event (should hide)
    fireEvent(window, new Event('quickchat:toggle'))
    await waitFor(() => {
      expect(screen.queryByRole('search', { name: /quick chat/i })).not.toBeInTheDocument()
    })

    // Toggle via API (should show)
    await act(async () => {
      qc.toggle()
    })
    await waitFor(() => {
      expect(screen.getByRole('search', { name: /quick chat/i })).toBeInTheDocument()
    })
  })
})
