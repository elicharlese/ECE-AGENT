import React from 'react'
import { render, act, waitFor } from '@testing-library/react'
import { useConversations } from '@/hooks/use-conversations'

// Mock conversation-service function-level exports used by the hook
const getConversationsMock = jest.fn()
const createConversationMock = jest.fn()
const createConversationWithParticipantsMock = jest.fn()
const updateConversationMock = jest.fn()
const deleteConversationMock = jest.fn()
const pinConversationMock = jest.fn()
const archiveConversationMock = jest.fn()
const leaveConversationMock = jest.fn()
const inviteParticipantsMock = jest.fn()

jest.mock('@/services/conversation-service', () => ({
  getConversations: (...args: any[]) => getConversationsMock(...args),
  createConversation: (...args: any[]) => createConversationMock(...args),
  createConversationWithParticipants: (...args: any[]) => createConversationWithParticipantsMock(...args),
  updateConversation: (...args: any[]) => updateConversationMock(...args),
  deleteConversation: (...args: any[]) => deleteConversationMock(...args),
  pinConversation: (...args: any[]) => pinConversationMock(...args),
  archiveConversation: (...args: any[]) => archiveConversationMock(...args),
  leaveConversation: (...args: any[]) => leaveConversationMock(...args),
  inviteParticipants: (...args: any[]) => inviteParticipantsMock(...args),
}))

// Mock Supabase client for realtime channel
const removeChannelMock = jest.fn()
const onMock = jest.fn(function (this: any) { return this })
const subscribeMock = jest.fn(function (this: any) { return this })
const channelMock = jest.fn(() => ({ on: onMock, subscribe: subscribeMock }))

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    channel: () => channelMock(),
    removeChannel: () => removeChannelMock(),
  },
}))

describe('useConversations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  function TestHarness({ onReady }: { onReady: (hook: ReturnType<typeof useConversations>) => void }) {
    const hook = useConversations()
    React.useEffect(() => { onReady(hook) }, [hook, onReady])
    return null
  }

  const convA = { id: 'a', title: 'A', created_at: '', updated_at: '', user_id: 'u1' }
  const convB = { id: 'b', title: 'B', created_at: '', updated_at: '', user_id: 'u1' }

  test('initial fetch loads conversations', async () => {
    getConversationsMock.mockResolvedValueOnce([convA, convB])

    let hook: ReturnType<typeof useConversations> | null = null
    render(React.createElement(TestHarness, { onReady: (h: ReturnType<typeof useConversations>) => { hook = h } }))

    await waitFor(() => expect(getConversationsMock).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(hook!.conversations.map(c => c.id)).toEqual(['a', 'b']))
  })

  test('pinConversation calls service and refreshes', async () => {
    getConversationsMock.mockResolvedValueOnce([convA, convB]) // initial
    getConversationsMock.mockResolvedValueOnce([convA, convB]) // refresh

    let hook: ReturnType<typeof useConversations> | null = null
    render(React.createElement(TestHarness, { onReady: (h: ReturnType<typeof useConversations>) => { hook = h } }))

    await waitFor(() => expect(getConversationsMock).toHaveBeenCalled())

    await act(async () => {
      await hook!.pinConversation('a', true)
    })

    expect(pinConversationMock).toHaveBeenCalledWith('a', true)
    expect(getConversationsMock).toHaveBeenCalledTimes(2)
  })

  test('archiveConversation calls service and refreshes', async () => {
    getConversationsMock.mockResolvedValueOnce([convA]) // initial
    getConversationsMock.mockResolvedValueOnce([convA]) // refresh

    let hook: ReturnType<typeof useConversations> | null = null
    render(React.createElement(TestHarness, { onReady: (h: ReturnType<typeof useConversations>) => { hook = h } }))

    await waitFor(() => expect(getConversationsMock).toHaveBeenCalled())

    await act(async () => {
      await hook!.archiveConversation('a', true)
    })

    expect(archiveConversationMock).toHaveBeenCalledWith('a', true)
    expect(getConversationsMock).toHaveBeenCalledTimes(2)
  })

  test('leaveConversation removes from state', async () => {
    getConversationsMock.mockResolvedValueOnce([convA, convB])

    let hook: ReturnType<typeof useConversations> | null = null
    render(React.createElement(TestHarness, { onReady: (h: ReturnType<typeof useConversations>) => { hook = h } }))

    await waitFor(() => expect(getConversationsMock).toHaveBeenCalled())

    await act(async () => {
      await hook!.leaveConversation('a')
    })

    expect(leaveConversationMock).toHaveBeenCalledWith('a')
    expect(hook!.conversations.map(c => c.id)).toEqual(['b'])
  })

  test('inviteParticipants proxies to service', async () => {
    getConversationsMock.mockResolvedValueOnce([convA])

    let hook: ReturnType<typeof useConversations> | null = null
    render(React.createElement(TestHarness, { onReady: (h: ReturnType<typeof useConversations>) => { hook = h } }))

    await waitFor(() => expect(getConversationsMock).toHaveBeenCalled())

    await act(async () => {
      await hook!.inviteParticipants('a', ['x', 'y'])
    })

    expect(inviteParticipantsMock).toHaveBeenCalledWith('a', ['x', 'y'])
  })

  test('subscribes to supabase channel and removes on unmount', async () => {
    getConversationsMock.mockResolvedValueOnce([convA])

    const { unmount } = render(React.createElement(TestHarness, { onReady: () => {} }))

    await waitFor(() => expect(channelMock).toHaveBeenCalled())
    expect(subscribeMock).toHaveBeenCalled()

    unmount()
    expect(removeChannelMock).toHaveBeenCalled()
  })
})
