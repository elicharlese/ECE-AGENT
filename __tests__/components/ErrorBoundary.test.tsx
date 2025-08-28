import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary, ChatErrorBoundary } from '@/components/ErrorBoundary'

// Component that throws an error for testing
function ThrowError({ shouldThrow = false }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error
  beforeAll(() => {
    console.error = jest.fn()
  })
  afterAll(() => {
    console.error = originalError
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('renders error fallback when child throws error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Test error')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('calls retry function when retry button is clicked', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    )
    
    const retryButton = screen.getByRole('button', { name: /try again/i })
    fireEvent.click(retryButton)
    
    // After retry, should render children again (no error)
    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  it('calls onError callback when error occurs', () => {
    const mockOnError = jest.fn()
    
    render(
      <ErrorBoundary onError={mockOnError}>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    )
    
    expect(mockOnError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    )
  })

  it('renders custom fallback component when provided', () => {
    const CustomFallback = ({ error, retry }: { error: Error; retry: () => void }) => (
      <div>
        <span>Custom error: {error.message}</span>
        <button onClick={retry}>Custom retry</button>
      </div>
    )

    render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Custom error: Test error')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /custom retry/i })).toBeInTheDocument()
  })
})

describe('ChatErrorBoundary', () => {
  const originalError = console.error
  beforeAll(() => {
    console.error = jest.fn()
  })
  afterAll(() => {
    console.error = originalError
  })

  it('renders chat-specific error fallback', () => {
    render(
      <ChatErrorBoundary>
        <ThrowError shouldThrow />
      </ChatErrorBoundary>
    )
    
    expect(screen.getByText('Chat unavailable')).toBeInTheDocument()
    expect(screen.getByText('Unable to load the chat interface.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('has proper styling for chat context', () => {
    render(
      <ChatErrorBoundary>
        <ThrowError shouldThrow />
      </ChatErrorBoundary>
    )
    
    const container = screen.getByText('Chat unavailable').closest('div')
    expect(container).toHaveClass('h-full', 'flex', 'items-center', 'justify-center')
  })
})
