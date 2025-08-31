import React from 'react'
import { screen, fireEvent, waitFor, act } from '@testing-library/react'
import { GifPicker } from '@/components/chat/gif-picker'
import { renderWithAct, advanceTimersBy } from '../utils/test-utils'

// Popover relies on layout; jsdom is fine with clicking the trigger to render content

describe('GifPicker', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('loads trending on open, then switches category to Reactions', async () => {
    const onGifSelect = jest.fn()
    await renderWithAct(<GifPicker onGifSelect={onGifSelect} />)

    // Open the GIF picker popover
    fireEvent.click(screen.getByRole('button', { name: /open gif picker/i }))

    // Initial mount triggers loading
    expect(await screen.findByText(/loading gifs/i)).toBeInTheDocument()
    await act(async () => {
      jest.advanceTimersByTime(500)
    })

    // After initial load, some trending GIFs present (e.g., Happy Dance)
    expect(await screen.findByTitle('Happy Dance')).toBeInTheDocument()

    // Switch to Reactions category
    fireEvent.click(screen.getByRole('button', { name: /reactions/i }))

    // Should show loading again for category fetch
    expect(await screen.findByText(/loading gifs/i)).toBeInTheDocument()
    await act(async () => {
      jest.advanceTimersByTime(500)
    })

    // Reactions should include Thumbs Up, High Five, Mind Blown, Celebration
    expect(await screen.findByTitle('Thumbs Up')).toBeInTheDocument()
    expect(screen.getByTitle('High Five')).toBeInTheDocument()
    expect(screen.getByTitle('Mind Blown')).toBeInTheDocument()
    expect(screen.getByTitle('Celebration')).toBeInTheDocument()

    // A non-reaction like "Happy Dance" should generally be filtered out
    expect(screen.queryByTitle('Happy Dance')).not.toBeInTheDocument()
  })

  test('debounces search input (300ms) then loads results (500ms)', async () => {
    const onGifSelect = jest.fn()
    await renderWithAct(<GifPicker onGifSelect={onGifSelect} />)

    // Open
    fireEvent.click(screen.getByRole('button', { name: /open gif picker/i }))

    // Initial load
    expect(await screen.findByText(/loading gifs/i)).toBeInTheDocument()
    await advanceTimersBy(500)

    // Type a query that should match "Laughing"
    const input = await screen.findByPlaceholderText(/search gifs/i)
    fireEvent.change(input, { target: { value: 'laugh' } })

    // Before 300ms debounce, grid from initial load still present
    await advanceTimersBy(299)
    expect(screen.getByTitle('Happy Dance')).toBeInTheDocument()

    // Cross debounce and also complete the simulated network delay
    await advanceTimersBy(1) // complete 300ms debounce
    await advanceTimersBy(500) // complete 500ms API delay

    // Expect matching GIF(s) for 'laugh'
    expect(await screen.findByTitle('Laughing')).toBeInTheDocument()

    // Common non-matching GIF should be gone
    expect(screen.queryByTitle('Thumbs Up')).not.toBeInTheDocument()
  })
})
