import React from 'react'
import { render, screen } from '@testing-library/react'
import { MCPToolsPanel } from '@/components/mcp/mcp-tools-panel'

jest.mock('@/services/mcp-service', () => {
  const mockTools = [
    {
      id: 'db-query',
      name: 'Database Query',
      description: 'Execute SQL queries',
      category: 'database',
      enabled: true,
    },
  ]
  const listeners: Array<(e: string) => void> = []
  return {
    mcpService: {
      getTools: jest.fn(() => mockTools),
      getGateways: jest.fn(() => []),
      getMcpStatus: jest.fn(() => ({ connected: false, sessionId: null, streaming: false, lastEventAt: null })),
      onMcpEvent: jest.fn((cb: (e: string) => void) => listeners.push(cb)),
      offMcpEvent: jest.fn((cb: (e: string) => void) => {
        const i = listeners.indexOf(cb)
        if (i >= 0) listeners.splice(i, 1)
      }),
      toggleTool: jest.fn(),
      connectGitHub: jest.fn(async () => ({})),
      disconnectGitHub: jest.fn(),
      startMcpStreaming: jest.fn(async () => {}),
      stopMcpStreaming: jest.fn(() => {}),
      executeTool: jest.fn(async () => ({ success: true })),
    },
  }
})

describe('MCPToolsPanel', () => {
  it('renders header and GitHub gateway section', () => {
    render(<MCPToolsPanel chatId="test-chat" />)

    expect(screen.getByText('MCP Tools')).toBeInTheDocument()
    expect(screen.getByText('GitHub Gateway')).toBeInTheDocument()
  })

  it('renders available tools in the current category', () => {
    render(<MCPToolsPanel chatId="test-chat" />)

    // Default expanded category is 'database', so our mocked tool should be visible
    expect(screen.getByText('Database Query')).toBeInTheDocument()
    expect(screen.getByText('Tools')).toBeInTheDocument()
  })
})
