import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AgentMCPIntegration } from '@/components/agents/AgentMCPIntegration'

jest.mock('@/services/agent-service', () => ({
  agentService: {
    getAgent: jest.fn().mockResolvedValue({
      id: 'agent-1',
      name: 'Test Agent',
      description: 'desc',
      avatar: undefined,
      capabilities: [],
      mcpTools: ['brave-search'],
      status: 'online',
    }),
  },
}))

describe('AgentMCPIntegration', () => {
  it('renders MCP tools after loading', async () => {
    const onToolExecute = jest.fn().mockResolvedValue({ ok: true })

    render(<AgentMCPIntegration agentId="agent-1" onToolExecute={onToolExecute} />)

    // Loading state first
    expect(screen.getByText(/Loading MCP tools/i)).toBeInTheDocument()

    // Tool name appears after agent loads
    await waitFor(() => expect(screen.getByText('brave-search')).toBeInTheDocument())
  })

  it('executes tool on Run click and renders results', async () => {
    const result = { results: ['Search result 1'] }
    const onToolExecute = jest.fn().mockResolvedValue(result)

    render(<AgentMCPIntegration agentId="agent-1" onToolExecute={onToolExecute} />)

    await waitFor(() => expect(screen.getByText('brave-search')).toBeInTheDocument())

    const runBtn = screen.getByRole('button', { name: 'Run' })
    fireEvent.click(runBtn)

    await waitFor(() => expect(onToolExecute).toHaveBeenCalledWith('brave-search', expect.any(Object)))

    // JSON result should render
    await waitFor(() => expect(screen.getByText(/Search result 1/)).toBeInTheDocument())
  })
})
