// Mock Next APIs used by the server component
jest.mock('next/navigation', () => ({
  // redirect in Next throws to short-circuit; here we just spy on calls
  redirect: jest.fn(),
}))

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}))

describe('app/page.tsx (HomePage) redirect behavior', () => {
  const { redirect } = require('next/navigation') as { redirect: jest.Mock }
  const { cookies } = require('next/headers') as { cookies: jest.Mock }

  afterEach(() => {
    jest.resetModules()
    redirect.mockClear()
    cookies.mockReset()
  })

  test('redirects to /messages when Supabase auth cookie is present', async () => {
    // Simulate cookie store exposing sb-*-auth-token
    ;(cookies as jest.Mock).mockImplementation(() => ({
      getAll: () => [
        { name: 'sb-xyz-auth-token', value: 'fake' },
        { name: 'other', value: 'v' },
      ],
    }))

    const mod = await import('@/app/page')
    const HomePage = mod.default as () => Promise<unknown>

    await HomePage()

    expect(redirect).toHaveBeenCalledTimes(1)
    expect(redirect).toHaveBeenCalledWith('/messages')
  })

  test('renders landing page when unauthenticated (no sb auth cookie)', async () => {
    // No relevant cookies
    ;(cookies as jest.Mock).mockImplementation(() => ({
      getAll: () => [],
    }))

    const mod = await import('@/app/page')
    const HomePage = mod.default as () => Promise<any>

    const el = await HomePage()

    // Should not redirect
    expect(redirect).not.toHaveBeenCalled()

    // Expect the returned element to be the main landing element
    // app/page.tsx returns <main id="main-content" ...>
    expect(el).toBeTruthy()
    expect((el as any)?.props?.id).toBe('main-content')
  })
})
