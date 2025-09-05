import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
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

describe('MiniChatWidget behavior via QuickChatMount', () => {
  test('Enter on minimized bar opens feed-only popout and hides bar', async () => {
    render(<QuickChatMount />)

    const input = await screen.findByPlaceholderText(/ask anything/i)
    await userEvent.type(input, 'help{enter}')

    // Popout header appears
    expect(await screen.findByText('Quick Chat')).toBeInTheDocument()
    // Minimized bar input disappears
    expect(screen.queryByPlaceholderText(/ask anything/i)).not.toBeInTheDocument()

    // The popout container width aligns to computeBarWidth
    const header = screen.getByText('Quick Chat')
    const container = header.closest('div[style]') as HTMLDivElement
    expect(container).toBeTruthy()

    const expectedW = Math.min(720, (window.innerWidth || 1024) - 32)
    expect(container.style.width).toBe(`${expectedW}px`)
  })

  test('Header Close button minimizes back to bar', async () => {
    render(<QuickChatMount />)
    // Open popout
    fireEvent(window, new Event('quickchat:popout'))
    const header = await screen.findByText('Quick Chat')
    // Click Close button (title="Close")
    const closeBtn = header.parentElement?.parentElement?.querySelector('button[title="Close"]') as HTMLButtonElement
    expect(closeBtn).toBeTruthy()
    await userEvent.click(closeBtn)
    // Popout hidden, bar visible
    await waitFor(() => expect(screen.queryByText('Quick Chat')).not.toBeInTheDocument())
    expect(await screen.findByRole('search', { name: /quick chat/i })).toBeInTheDocument()
  })

  test('Hotkeys: ⌘Q/Ctrl+Q toggle popout; ⌘L focuses quick input when minimized', async () => {
    render(<QuickChatMount />)
    // Initially minimized, bar visible
    const bar = await screen.findByRole('search', { name: /quick chat/i })
    expect(bar).toBeInTheDocument()

    // ⌘Q opens popout
    fireEvent.keyDown(window, { key: 'q', code: 'KeyQ', metaKey: true })
    await waitFor(() => expect(screen.getByText('Quick Chat')).toBeInTheDocument())

    // Ctrl+Q minimizes back to bar
    fireEvent.keyDown(window, { key: 'q', code: 'KeyQ', ctrlKey: true })
    await waitFor(() => expect(screen.queryByText('Quick Chat')).not.toBeInTheDocument())
    expect(await screen.findByRole('search', { name: /quick chat/i })).toBeInTheDocument()

    // ⌘L focuses the quick input
    const input = screen.getByLabelText('Ask anything') as HTMLInputElement
    expect(input).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'l', code: 'KeyL', metaKey: true })
    await waitFor(() => expect(input).toHaveFocus())
  })

  test('Drag/resize persists to localStorage and clamps within viewport', async () => {
    // Ensure predictable viewport
    const origInner = Object.getOwnPropertyDescriptor(window, 'innerWidth')
    const origInnerH = Object.getOwnPropertyDescriptor(window, 'innerHeight')
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1200 })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 })

    const { unmount } = render(<QuickChatMount />)
    // Open popout to enable drag/resize
    fireEvent(window, new Event('quickchat:popout'))
    const headerText = await screen.findByText('Quick Chat')
    const container = headerText.closest('div[style]') as HTMLDivElement
    expect(container).toBeTruthy()

    // Drag: start at (300, 300) then move far negative to test clamping
    const headerEl = headerText.parentElement?.parentElement as HTMLDivElement
    fireEvent.mouseDown(headerEl, { clientX: 300, clientY: 300 })
    fireEvent.mouseMove(window, { clientX: -1000, clientY: -1000 })
    fireEvent.mouseUp(window)

    // Resize: grab handle and increase size
    const resizeHandle = container.querySelector('[class*="cursor-se-resize"]') as HTMLDivElement
    expect(resizeHandle).toBeTruthy()
    const prevWidth = parseInt(container.style.width)
    const prevHeight = parseInt(container.style.height)
    fireEvent.mouseDown(resizeHandle, { clientX: 0, clientY: 0 })
    fireEvent.mouseMove(window, { clientX: 200, clientY: 150 })
    fireEvent.mouseUp(window)

    // Read persisted state
    const raw = window.localStorage.getItem('miniChatWidgetState')
    expect(raw).toBeTruthy()
    const persisted = JSON.parse(raw as string) as { x: number; y: number; w: number; h: number }
    expect(persisted.x).toBeGreaterThanOrEqual(0)
    expect(persisted.y).toBeGreaterThanOrEqual(0)
    expect(persisted.w).toBeGreaterThanOrEqual(prevWidth)
    expect(persisted.h).toBeGreaterThanOrEqual(prevHeight)
    // Also clamp within viewport bounds (x + w <= innerWidth, y + h <= innerHeight)
    expect(persisted.x + persisted.w).toBeLessThanOrEqual(1200)
    expect(persisted.y + persisted.h).toBeLessThanOrEqual(800)

    // Unmount and remount to verify persistence is used (minimized on mount by prop, but size persists)
    unmount()
    render(<QuickChatMount />)
    // Open again and verify size at least matches persisted
    fireEvent(window, new Event('quickchat:popout'))
    const header2 = await screen.findByText('Quick Chat')
    const container2 = header2.closest('div[style]') as HTMLDivElement
    const w2 = parseInt(container2.style.width)
    const h2 = parseInt(container2.style.height)
    const viewportMaxW = Math.min(720, (window.innerWidth || 1024) - 32)
    // On apply, width should be clamped to viewportMaxW and not exceed persisted
    expect(w2).toBeLessThanOrEqual(persisted.w)
    expect(w2).toBeLessThanOrEqual(viewportMaxW)
    // Height should be within viewport bounds
    expect(h2).toBeLessThanOrEqual(window.innerHeight)

    // Restore viewport descriptors
    if (origInner) Object.defineProperty(window, 'innerWidth', origInner)
    if (origInnerH) Object.defineProperty(window, 'innerHeight', origInnerH)
  })

  test('CustomEvents control popout/minimize/toggle-popout', async () => {
    render(<QuickChatMount />)

    // Initially minimized bar
    expect(await screen.findByRole('search', { name: /quick chat/i })).toBeInTheDocument()

    // Popout event
    fireEvent(window, new Event('quickchat:popout'))
    await waitFor(() => expect(screen.getByText('Quick Chat')).toBeInTheDocument())

    // Minimize event
    fireEvent(window, new Event('quickchat:minimize'))
    await waitFor(() => expect(screen.queryByText('Quick Chat')).not.toBeInTheDocument())
    expect(screen.getByRole('search', { name: /quick chat/i })).toBeInTheDocument()

    // Toggle-popout event: should open
    fireEvent(window, new Event('quickchat:toggle-popout'))
    await waitFor(() => expect(screen.getByText('Quick Chat')).toBeInTheDocument())

    // Ensure API is present and functional
    const qc = (window as any).quickChat
    expect(typeof qc.popout).toBe('function')
    expect(typeof qc.minimize).toBe('function')
    expect(typeof qc.togglePopout).toBe('function')
  })

  test('Popout width updates on window resize to match bar width', async () => {
    const originalDesc = Object.getOwnPropertyDescriptor(window, 'innerWidth')
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1000 })
    render(<QuickChatMount />)

    // Open popout
    fireEvent(window, new Event('quickchat:popout'))
    const header = await screen.findByText('Quick Chat')
    let container = header.closest('div[style]') as HTMLDivElement
    expect(container.style.width).toBe(`${Math.min(720, 1000 - 32)}px`)

    // Shrink viewport and dispatch resize
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 400 })
    fireEvent(window, new Event('resize'))

    await waitFor(() => {
      container = header.closest('div[style]') as HTMLDivElement
      expect(container.style.width).toBe(`${Math.min(720, 400 - 32)}px`)
    })
    if (originalDesc) {
      Object.defineProperty(window, 'innerWidth', originalDesc)
    }
  })
})
