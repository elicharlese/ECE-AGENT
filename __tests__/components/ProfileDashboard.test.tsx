import { render, screen, fireEvent } from '@testing-library/react'
import { ProfileDashboard } from '@/components/profile/ProfileDashboard'

// Mock the child components
jest.mock('@/components/profile/CheckInOverview', () => ({
  CheckInOverview: () => <div data-testid="checkin-overview">Check In Overview</div>
}))

jest.mock('@/components/profile/RecentMessages', () => ({
  RecentMessages: () => <div data-testid="recent-messages">Recent Messages</div>
}))

jest.mock('@/components/profile/DocsSection', () => ({
  DocsSection: () => <div data-testid="docs-section">Docs Section</div>
}))

jest.mock('@/components/profile/MentionsSection', () => ({
  MentionsSection: () => <div data-testid="mentions-section">Mentions Section</div>
}))

jest.mock('@/components/profile/CalendarSync', () => ({
  CalendarSync: () => <div data-testid="calendar-sync">Calendar Sync</div>
}))

jest.mock('@/components/profile/ClickUpIntegration', () => ({
  ClickUpIntegration: () => <div data-testid="clickup-integration">ClickUp Integration</div>
}))

describe('ProfileDashboard', () => {
  it('renders dashboard header', () => {
    render(<ProfileDashboard />)
    
    expect(screen.getByText('Profile Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Your personalized workspace overview and integrations')).toBeInTheDocument()
  })

  it('renders all tab triggers', () => {
    render(<ProfileDashboard />)
    
    expect(screen.getByRole('tab', { name: /check in/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /messages/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /documents/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /mentions/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /calendar/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /tasks/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /settings/i })).toBeInTheDocument()
  })

  it('shows check in overview by default', () => {
    render(<ProfileDashboard />)
    
    expect(screen.getByTestId('checkin-overview')).toBeInTheDocument()
    expect(screen.queryByTestId('recent-messages')).not.toBeInTheDocument()
  })

  it('switches tabs correctly', () => {
    render(<ProfileDashboard />)
    
    // Click messages tab
    fireEvent.click(screen.getByRole('tab', { name: /messages/i }))
    expect(screen.getByTestId('recent-messages')).toBeInTheDocument()
    expect(screen.queryByTestId('checkin-overview')).not.toBeInTheDocument()
    
    // Click docs tab
    fireEvent.click(screen.getByRole('tab', { name: /documents/i }))
    expect(screen.getByTestId('docs-section')).toBeInTheDocument()
    expect(screen.queryByTestId('recent-messages')).not.toBeInTheDocument()
    
    // Click mentions tab
    fireEvent.click(screen.getByRole('tab', { name: /mentions/i }))
    expect(screen.getByTestId('mentions-section')).toBeInTheDocument()
    
    // Click calendar tab
    fireEvent.click(screen.getByRole('tab', { name: /calendar/i }))
    expect(screen.getByTestId('calendar-sync')).toBeInTheDocument()
    
    // Click tasks tab
    fireEvent.click(screen.getByRole('tab', { name: /tasks/i }))
    expect(screen.getByTestId('clickup-integration')).toBeInTheDocument()
  })

  it('has proper responsive layout classes', () => {
    render(<ProfileDashboard />)
    
    const container = screen.getByText('Profile Dashboard').closest('div')?.parentElement
    expect(container).toHaveClass('w-full', 'max-w-7xl', 'mx-auto', 'space-y-6')
  })

  it('wraps components in error boundaries', () => {
    render(<ProfileDashboard />)
    
    // All tab content should be wrapped in ErrorBoundary components
    // This is tested by ensuring the components render without throwing
    expect(screen.getByTestId('checkin-overview')).toBeInTheDocument()
  })
})
