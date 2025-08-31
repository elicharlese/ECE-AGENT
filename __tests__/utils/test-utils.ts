import React from 'react'
import { render as rtlRender, act, RenderResult } from '@testing-library/react'

export async function renderWithAct(ui: React.ReactElement): Promise<RenderResult> {
  let result!: RenderResult
  await act(async () => {
    result = rtlRender(ui)
  })
  return result
}

export async function advanceTimersBy(ms: number) {
  await act(async () => {
    jest.advanceTimersByTime(ms)
  })
}

// No-op test to satisfy Jest since this file lives under __tests__
describe('test-utils noop', () => {
  it('does nothing', () => {
    expect(true).toBe(true)
  })
})
