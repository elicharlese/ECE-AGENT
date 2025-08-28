import { render, screen, waitFor } from '@testing-library/react'
import { CheckInOverview } from '@/components/profile/CheckInOverview'

// Mock the useUser hook
jest.mock('@/hooks/use-user', () => ({
  useUser: () => ({
    user: {
      email: 'john@company.com'
    }
  })
}))

describe('CheckInOverview', () => {
  it('renders loading state initially', () => {
    render(<CheckInOverview />)
    
    // Should show loading skeletons
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders welcome message after loading', async () => {
    render(<CheckInOverview />)
    
    await waitFor(() => {
      expect(screen.getByText('Welcome back!')).toBeInTheDocument()
      expect(screen.getByText("Here's what's happening in your workspace")).toBeInTheDocument()
    })
  })

  it('displays user avatar with first letter', async () => {
    render(<CheckInOverview />)
    
    await waitFor(() => {
      expect(screen.getByText('J')).toBeInTheDocument() // First letter of john@company.com
    })
  })

  it('renders quick action cards', async () => {
    render(<CheckInOverview />)
    
    await waitFor(() => {
      expect(screen.getByText('View Messages')).toBeInTheDocument()
      expect(screen.getByText('Check Mentions')).toBeInTheDocument()
      expect(screen.getByText('Review Docs')).toBeInTheDocument()
      expect(screen.getByText('Calendar')).toBeInTheDocument()
    })
  })

  it('displays activity summary', async () => {
    render(<CheckInOverview />)
    
    await waitFor(() => {
      expect(screen.getByText('Activity Summary')).toBeInTheDocument()
      expect(screen.getByText('Active Conversations')).toBeInTheDocument()
      expect(screen.getByText('Pending Tasks')).toBeInTheDocument()
      expect(screen.getByText('Upcoming Events')).toBeInTheDocument()
    })
  })

  it('shows recent activity timeline', async () => {
    render(<CheckInOverview />)
    
    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument()
      expect(screen.getByText('New message in #general')).toBeInTheDocument()
      expect(screen.getByText('Document "Project Plan" updated')).toBeInTheDocument()
      expect(screen.getByText('Mentioned in team discussion')).toBeInTheDocument()
    })
  })

  it('displays badges for non-zero counts', async () => {
    render(<CheckInOverview />)
    
    await waitFor(() => {
      // Should show badges for items with counts > 0
      const badges = screen.getAllByText(/^\d+$/) // Numbers only
      expect(badges.length).toBeGreaterThan(0)
    })
  })

  it('has proper responsive grid layout', async () => {
    render(<CheckInOverview />)
    
    await waitFor(() => {
      const gridContainer = screen.getByText('View Messages').closest('.grid')
      expect(gridContainer).toHaveClass('gap-4', 'md:grid-cols-2', 'lg:grid-cols-4')
    })
  })
})
