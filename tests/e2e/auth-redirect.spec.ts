import { test, expect } from '@playwright/test'

// Redirect behaviors for authenticated vs unauthenticated flows
// We do not create a real Supabase session in E2E; instead we validate
// server-side guards and fast-path cookie heuristics.

test.describe('Auth redirects', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies()
  })

  test('unauthenticated visit to /messages redirects to /auth?returnTo=/messages', async ({ page }) => {
    const target = '/messages'
    await page.goto(target)
    await page.waitForURL('**/auth?returnTo=/messages')
    await expect(page).toHaveURL(/\/auth\?returnTo=\/messages$/)

    // The auth page should render a login UI
    const loginHeading = page.getByRole('heading', { name: /welcome to agent/i })
    await expect(loginHeading).toBeVisible()
  })

  test('home fast-path cookie redirects from / -> /messages -> /auth?returnTo=/messages', async ({ page, context, baseURL }) => {
    // Set a cookie that matches the home page heuristic (sb-*-auth-token)
    const url = baseURL || 'http://localhost:4200'
    await context.addCookies([
      {
        name: 'sb-xyz-auth-token',
        value: 'fake',
        url,
        path: '/',
      },
    ])

    await page.goto('/')
    // Expect to land on the auth gate with returnTo=/messages eventually
    await page.waitForURL('**/auth?returnTo=/messages')
    await expect(page).toHaveURL(/\/auth\?returnTo=\/messages$/)
  })
})
