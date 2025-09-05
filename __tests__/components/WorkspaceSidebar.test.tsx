import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WorkspaceSidebar } from '@/components/workspace/workspace-sidebar'

// Mock analytics
jest.mock('@/lib/analytics', () => ({
  trackEvent: jest.fn(),
}))

describe('WorkspaceSidebar', () => {
  const defaultProps = {
    panelState: 'expanded' as const,
    onSetPanelState: jest.fn(),
    selectedAgentId: 'agent-1',
    onSelectAgent: jest.fn(),
    workspaceItems: [],
    onExecuteTool: jest.fn(),
    onGenerateMedia: jest.fn(),
    activeParticipants: 2,
    isConnected: true,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders workspace sidebar in expanded state', () => {
    render(<WorkspaceSidebar {...defaultProps} />)
    
    expect(screen.getByText('Workspace')).toBeInTheDocument()
    expect(screen.getByText('AI Models')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('shows active participants count', () => {
    render(<WorkspaceSidebar {...defaultProps} />)
    
    expect(screen.getByText('2 active')).toBeInTheDocument()
  })

  it('shows disconnected status when not connected', () => {
    render(<WorkspaceSidebar {...defaultProps} isConnected={false} />)
    
    expect(screen.getByText('Disconnected')).toBeInTheDocument()
  })

  it('renders collapsed state correctly', () => {
    render(<WorkspaceSidebar {...defaultProps} panelState="collapsed" />)
    
    // Should not render anything when collapsed
    expect(screen.queryByText('Workspace')).not.toBeInTheDocument()
  })

  it('renders minimized state with icon buttons', () => {
    render(<WorkspaceSidebar {...defaultProps} panelState="minimized" />)
    
    // Should show icon buttons but not full content
    expect(screen.queryByText('Workspace')).not.toBeInTheDocument()
    // Icons should be present
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('switches between tabs correctly', async () => {
    const user = userEvent.setup()
    render(<WorkspaceSidebar {...defaultProps} />)
    
    const aiModelsTab = screen.getByRole('tab', { name: /AI Models/i })
    await user.click(aiModelsTab)
    
    // Updated expectations: AIPanelSidebar is rendered under AI Models tab
    expect(await screen.findByText('AI Panel')).toBeInTheDocument()
    expect(await screen.findByText('View All Patches')).toBeInTheDocument()
  })

  it('shows workspace settings in settings tab', async () => {
    const user = userEvent.setup()
    render(<WorkspaceSidebar {...defaultProps} />)
    
    const settingsTab = screen.getByRole('tab', { name: /Settings/i })
    await user.click(settingsTab)
    
    expect(await screen.findByText('Workspace Settings')).toBeInTheDocument()
    expect(await screen.findByText('Chat Settings')).toBeInTheDocument()
  })

  it('handles tool execution', async () => {
    const user = userEvent.setup()
    render(<WorkspaceSidebar {...defaultProps} />)
    
    const codeButton = screen.getByText('Code')
    await user.click(codeButton)
    
    expect(defaultProps.onExecuteTool).toHaveBeenCalledWith('code_interpreter')
  })

  it('handles media generation', async () => {
    const user = userEvent.setup()
    render(<WorkspaceSidebar {...defaultProps} />)
    
    const imageButton = screen.getByText('Image')
    await user.click(imageButton)
    
    expect(defaultProps.onGenerateMedia).toHaveBeenCalledWith('image')
  })

  it('displays workspace items when provided', () => {
    const workspaceItems = [
      {
        id: 'item-1',
        type: 'code' as const,
        content: 'console.log("Hello World")',
        timestamp: new Date(),
        author: 'user',
        status: 'completed' as const,
      },
    ]

    render(<WorkspaceSidebar {...defaultProps} workspaceItems={workspaceItems} />)
    
    expect(screen.getByText('1')).toBeInTheDocument() // Badge showing count
  })

  it('shows empty state when no workspace items', () => {
    render(<WorkspaceSidebar {...defaultProps} />)
    
    expect(screen.getByText('No workspace items yet')).toBeInTheDocument()
    expect(screen.getByText('Use tools and generate media to see items here')).toBeInTheDocument()
  })
})
