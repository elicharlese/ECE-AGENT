import { render, screen } from '@testing-library/react'
import { 
  PageLoadingSpinner, 
  ChatLoadingSkeleton, 
  ConversationListSkeleton,
  AgentListSkeleton,
  InlineLoadingSpinner,
  ButtonLoadingSpinner,
  AuthLoadingState,
  AppInitializingState
} from '@/components/LoadingStates'

describe('LoadingStates', () => {
  describe('PageLoadingSpinner', () => {
    it('renders with default message', () => {
      render(<PageLoadingSpinner />)
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('renders with custom message', () => {
      render(<PageLoadingSpinner message="Custom loading message" />)
      expect(screen.getByText('Custom loading message')).toBeInTheDocument()
    })

    it('has proper structure and classes', () => {
      render(<PageLoadingSpinner />)
      const container = screen.getByText('Loading...').closest('div')
      expect(container).toHaveClass('min-h-[400px]', 'flex', 'items-center', 'justify-center')
    })
  })

  describe('ChatLoadingSkeleton', () => {
    it('renders header skeleton', () => {
      render(<ChatLoadingSkeleton />)
      const container = document.querySelector('.border-b')
      expect(container).toBeInTheDocument()
    })

    it('renders multiple message skeletons', () => {
      render(<ChatLoadingSkeleton />)
      // Should render 4 message skeletons based on the component
      const skeletons = document.querySelectorAll('.flex.gap-3')
      expect(skeletons.length).toBeGreaterThanOrEqual(4)
    })

    it('renders input skeleton', () => {
      render(<ChatLoadingSkeleton />)
      const inputArea = document.querySelector('.border-t')
      expect(inputArea).toBeInTheDocument()
    })
  })

  describe('ConversationListSkeleton', () => {
    it('renders multiple conversation skeletons', () => {
      render(<ConversationListSkeleton />)
      // Should render 6 conversation skeletons
      const skeletons = document.querySelectorAll('.flex.items-center.gap-3')
      expect(skeletons.length).toBe(6)
    })

    it('has proper spacing structure', () => {
      render(<ConversationListSkeleton />)
      const container = document.querySelector('.p-2.space-y-2')
      expect(container).toBeInTheDocument()
    })
  })

  describe('AgentListSkeleton', () => {
    it('renders multiple agent skeletons', () => {
      render(<AgentListSkeleton />)
      // Should render 5 agent skeletons
      const skeletons = document.querySelectorAll('.flex.items-center.gap-3')
      expect(skeletons.length).toBe(5)
    })

    it('has proper padding structure', () => {
      render(<AgentListSkeleton />)
      const container = document.querySelector('.p-4.space-y-3')
      expect(container).toBeInTheDocument()
    })
  })

  describe('InlineLoadingSpinner', () => {
    it('renders with default size', () => {
      render(<InlineLoadingSpinner />)
      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toHaveClass('h-4', 'w-4')
    })

    it('renders with medium size', () => {
      render(<InlineLoadingSpinner size="md" />)
      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toHaveClass('h-5', 'w-5')
    })

    it('renders with large size', () => {
      render(<InlineLoadingSpinner size="lg" />)
      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toHaveClass('h-6', 'w-6')
    })
  })

  describe('ButtonLoadingSpinner', () => {
    it('renders with correct size for buttons', () => {
      render(<ButtonLoadingSpinner />)
      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toHaveClass('h-4', 'w-4')
    })
  })

  describe('AuthLoadingState', () => {
    it('renders authentication loading message', () => {
      render(<AuthLoadingState />)
      expect(screen.getByText('Authenticating...')).toBeInTheDocument()
      expect(screen.getByText('Please wait while we verify your credentials.')).toBeInTheDocument()
    })

    it('has proper full-screen structure', () => {
      render(<AuthLoadingState />)
      const container = screen.getByText('Authenticating...').closest('div')?.parentElement?.parentElement
      expect(container).toHaveClass('min-h-screen', 'flex', 'items-center', 'justify-center')
    })
  })

  describe('AppInitializingState', () => {
    it('renders app initialization message', () => {
      render(<AppInitializingState />)
      expect(screen.getByText('Starting ECE Agent')).toBeInTheDocument()
      expect(screen.getByText('Initializing your intelligent assistant...')).toBeInTheDocument()
    })

    it('has proper background and structure', () => {
      render(<AppInitializingState />)
      const container = screen.getByText('Starting ECE Agent').closest('div')?.parentElement?.parentElement
      expect(container).toHaveClass('min-h-screen', 'bg-gray-50', 'dark:bg-gray-900')
    })

    it('renders loading indicator', () => {
      render(<AppInitializingState />)
      expect(screen.getByText('Loading')).toBeInTheDocument()
    })
  })
})
