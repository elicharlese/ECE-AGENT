import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import { ProfileSettings } from '@/components/profile/ProfileSettings'

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

const { toast } = jest.requireMock('sonner') as { toast: { success: jest.Mock; error: jest.Mock } }

describe('ProfileSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('updates profile on valid submit and shows success toast', async () => {
    render(<ProfileSettings />)

    // Wait for initial GET to populate values
    await screen.findByDisplayValue('Old Name')
    await screen.findByDisplayValue('olduser')

    // Change a couple of fields
    fireEvent.change(screen.getByLabelText('Display name'), { target: { value: 'New Name' } })
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'new_user' } })

    // Submit
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Profile updated')
    })

    // Values should be reset from PUT response (MSW echoes back what we sent)
    await screen.findByDisplayValue('New Name')
    await screen.findByDisplayValue('new_user')
  })

  it('shows inline zod error messages for invalid inputs', async () => {
    render(<ProfileSettings />)

    // Wait for initial GET to populate values
    await screen.findByDisplayValue('Old Name')

    // Enter invalid values
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'A' } }) // too short
    fireEvent.change(screen.getByLabelText('Avatar URL'), { target: { value: 'not-a-url' } }) // invalid url
    fireEvent.change(screen.getByLabelText('Solana Address'), { target: { value: 'short' } }) // too short

    // Submit to trigger validation
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    // Default zod messages are fine to assert against
    expect(await screen.findByText(/at least 3 character\(s\)/i)).toBeInTheDocument()
    expect(screen.getByText(/invalid url/i)).toBeInTheDocument()
    expect(await screen.findByText(/at least 32 character\(s\)/i)).toBeInTheDocument()

    // Ensure no server toast fired for client-side validation
    expect(toast.success).not.toHaveBeenCalled()
    expect(toast.error).not.toHaveBeenCalled()
  })
})
