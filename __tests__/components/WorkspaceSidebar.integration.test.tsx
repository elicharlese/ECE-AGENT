import React from 'react'
import { render, screen, waitFor, fireEvent, act, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { WorkspaceSidebar } from '@/components/workspace/workspace-sidebar'

// --- Mocks ---
const getMessagesMock = jest.fn()
let subscribeCb: ((msg: any) => void) | null = null

jest.mock('@/services/message-service', () => ({
  messageService: {
    getMessages: (...args: any[]) => getMessagesMock(...args),
  },
  subscribeToMessages: (chatId: string, cb: (msg: any) => void) => {
    subscribeCb = cb
    return () => {
      subscribeCb = null
    }
  },
}))

const getWorkspaceSettingsMock = jest.fn()
const setWorkspaceSettingsMock = jest.fn()
const getProfileMock = jest.fn()

jest.mock('@/services/profile-service', () => ({
  getWorkspaceSettings: (...args: any[]) => getWorkspaceSettingsMock(...args),
  setWorkspaceSettings: (...args: any[]) => setWorkspaceSettingsMock(...args),
  profileService: {
    getProfile: (...args: any[]) => getProfileMock(...args),
  },
}))

let onMcpHandler: ((evt: string) => void) | null = null
jest.mock('@/services/mcp-service', () => ({
  mcpService: {
    onMcpEvent: (handler: (evt: string) => void) => {
      onMcpHandler = handler
    },
    offMcpEvent: (handler: (evt: string) => void) => {
      if (onMcpHandler === handler) onMcpHandler = null
    },
    getMcpStatus: () => ({ connected: true, sessionId: 'sid-123', streaming: true, lastEventAt: Date.now() }),
  },
}))

function renderSidebar(chatId: string = 'chat1') {
  return render(
    <WorkspaceSidebar
      panelState="expanded"
      onSetPanelState={() => {}}
      chatId={chatId}
    />
  )
}

beforeEach(() => {
  getMessagesMock.mockReset()
  getWorkspaceSettingsMock.mockReset()
  setWorkspaceSettingsMock.mockReset()
  getProfileMock.mockReset()
  subscribeCb = null
  onMcpHandler = null
  // default mocks
  getWorkspaceSettingsMock.mockResolvedValue({})
  getMessagesMock.mockResolvedValue([])
})

// --- Tests ---

test('renders initial messages mapped as workspace items', async () => {
  getMessagesMock.mockResolvedValueOnce([
    { id: 'm1', content: 'hello world', created_at: new Date().toISOString(), role: 'user', user_id: 'u1' },
  ])
  getProfileMock.mockResolvedValueOnce({ user_id: 'u1', username: 'alice', full_name: 'Alice', avatar_url: null, cover_url: null, solana_address: null, settings: null, created_at: '', updated_at: '' })

  renderSidebar('chat1')

  await waitFor(() => expect(screen.getByText(/hello world/i)).toBeInTheDocument())
})

test('appends realtime inserted messages', async () => {
  renderSidebar('chat1')
  await waitFor(() => expect(subscribeCb).toBeTruthy())

  // simulate realtime insert
  await act(async () => {
    subscribeCb?.({ id: 'm2', content: 'realtime event', role: 'user', user_id: 'u2', timestamp: Date.now() })
  })

  await waitFor(() => expect(screen.getByText(/realtime event/i)).toBeInTheDocument())
})

test('persists settings to localStorage and profile', async () => {
  renderSidebar('chat1')

  // open settings tab explicitly by role
  const settingsTab = await screen.findByRole('tab', { name: /Settings/i })
  const user = userEvent.setup()
  await user.click(settingsTab)
  // wait for settings content to be mounted and scope queries to it
  const settingsPanel = await screen.findByText(/Workspace Settings/i)
  const settingsContainer = settingsPanel.closest('div') as HTMLElement

  // toggle via role/name in the Settings panel
  const cb = await within(settingsContainer).findByRole('checkbox', { name: /Auto-save workspace items/i })
  fireEvent.click(cb)

  await waitFor(() => {
    expect(setWorkspaceSettingsMock).toHaveBeenCalled()
  })

  const key = 'ws_settings_chat1'
  const stored = window.localStorage.getItem(key)
  expect(stored).toBeTruthy()
  const parsed = JSON.parse(stored as string)
  expect(parsed).toHaveProperty('autoSaveItems')
})

test('adds MCP streaming events as tool_execution items', async () => {
  renderSidebar('chat1')
  await waitFor(() => expect(onMcpHandler).toBeTruthy())

  await act(async () => {
    onMcpHandler?.('SSE: ping-ok')
  })

  await waitFor(() => expect(screen.getByText(/SSE: ping-ok/i)).toBeInTheDocument())
})
