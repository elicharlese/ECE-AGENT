// Mocks for Next.js and Supabase server client used by the auth page
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

jest.mock('@/lib/supabase/server', () => ({
  getSupabaseServer: jest.fn(),
}))

// Mock LoginForm to avoid heavy client-side deps; we just echo props for assertions
import React from 'react'
jest.mock('@/components/login-form', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  LoginForm: (props: any) => React.createElement('div', { id: 'mock-login-form', 'data-return-to': props?.returnTo || '' }),
}))

describe('app/auth/page.tsx (AuthPage) behavior', () => {
  const { redirect } = require('next/navigation') as { redirect: jest.Mock }
  const { getSupabaseServer } = require('@/lib/supabase/server') as { getSupabaseServer: jest.Mock }

  afterEach(() => {
    // Do not reset module registry; it breaks the mocked module instance reference.
    // Instead clear mocks between tests.
    jest.clearAllMocks()
    getSupabaseServer.mockReset()
  })

  test('redirects to /messages when session exists and no returnTo', async () => {
    getSupabaseServer.mockResolvedValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'u1' } } } }),
      },
    })

    const mod = await import('@/app/auth/page')
    const AuthPage = mod.default as (args: { searchParams: Promise<{ returnTo?: string }> }) => Promise<unknown>

    await AuthPage({ searchParams: Promise.resolve({}) })

    expect(redirect).toHaveBeenCalledTimes(1)
    expect(redirect).toHaveBeenCalledWith('/messages')
  })

  test('redirects to returnTo when session exists and returnTo is a safe path', async () => {
    getSupabaseServer.mockResolvedValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'u1' } } } }),
      },
    })

    const mod = await import('@/app/auth/page')
    const AuthPage = mod.default as (args: { searchParams: Promise<{ returnTo?: string }> }) => Promise<unknown>

    await AuthPage({ searchParams: Promise.resolve({ returnTo: '/inbox' }) })

    expect(redirect).toHaveBeenCalledTimes(1)
    expect(redirect).toHaveBeenCalledWith('/inbox')
  })

  test('ignores unsafe returnTo and redirects to /messages', async () => {
    getSupabaseServer.mockResolvedValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'u1' } } } }),
      },
    })

    const mod = await import('@/app/auth/page')
    const AuthPage = mod.default as (args: { searchParams: Promise<{ returnTo?: string }> }) => Promise<unknown>

    await AuthPage({ searchParams: Promise.resolve({ returnTo: 'https://evil.com' }) })

    expect(redirect).toHaveBeenCalledTimes(1)
    expect(redirect).toHaveBeenCalledWith('/messages')
  })

  test('renders LoginForm when no session; passes through returnTo', async () => {
    getSupabaseServer.mockResolvedValue({
      auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      },
    })

    const mod = await import('@/app/auth/page')
    const AuthPage = mod.default as (args: { searchParams: Promise<{ returnTo?: string }> }) => Promise<any>

    const el = await AuthPage({ searchParams: Promise.resolve({ returnTo: '/messages' }) })

    expect(redirect).not.toHaveBeenCalled()
    expect(el).toBeTruthy()
    // Server component returns a React element with props for LoginForm; it is not rendered here.
    expect((el as any)?.props?.returnTo).toBe('/messages')
  })
})
