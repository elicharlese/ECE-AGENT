import { render, screen, fireEvent } from '@testing-library/react'
import { EmptyChatState } from '@/components/chat/EmptyChatState'

describe('EmptyChatState', () => {
  it('renders empty state with default content', () => {
    render(<EmptyChatState />)
    
    expect(screen.getByText('No conversation selected')).toBeInTheDocument()
    expect(screen.getByText(/Select a conversation from the left/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start new chat/i })).toBeInTheDocument()
  })

  it('calls onStartNewChat when button is clicked', () => {
    const mockStartNewChat = jest.fn()
    render(<EmptyChatState onStartNewChat={mockStartNewChat} />)
    
    const button = screen.getByRole('button', { name: /start new chat/i })
    fireEvent.click(button)
    
    expect(mockStartNewChat).toHaveBeenCalledTimes(1)
  })

  it('has proper accessibility attributes', () => {
    render(<EmptyChatState />)
    
    const button = screen.getByRole('button', { name: /start new chat/i })
    expect(button).toHaveAttribute('aria-label', 'Start new chat')
  })

  it('renders icon and maintains visual structure', () => {
    render(<EmptyChatState />)
    
    // Check for icon container
    const iconContainer = screen.getByText('No conversation selected').previousElementSibling
    expect(iconContainer).toHaveClass('rounded-xl', 'bg-gradient-to-br')
    
    // Check for button with icon
    const button = screen.getByRole('button', { name: /start new chat/i })
    expect(button).toHaveClass('gap-2')
  })
})
