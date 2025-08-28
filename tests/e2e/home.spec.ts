import { test, expect } from '@playwright/test'
import { AxeBuilder } from '@axe-core/playwright'

// Basic smoke for homepage: metadata, a11y, and CTA navigation

test.describe('Homepage', () => {
  test('loads and exposes route metadata', async ({ page }: { page: any }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/AGENT/i)

    const ogTitle = page.locator('meta[property="og:title"][content*="AGENT"]')
    await expect(ogTitle).toHaveCount(1)

    const twitterCard = page.locator('meta[name="twitter:card"][content]')
    await expect(twitterCard).toHaveCount(1)

    const canonical = page.locator('link[rel="canonical"][href="/"]')
    await expect(canonical).toHaveCount(1)
  })

  test('skip link is focusable and jumps to main content', async ({ page }) => {
    await page.goto('/')

    // Press Tab to focus the first focusable element (skip link)
    await page.keyboard.press('Tab')
    const skipLink = page.locator('a[href="#main-content"]')
    await expect(skipLink).toBeVisible()

    // Activate skip link
    await skipLink.press('Enter')
    // The main region should be in view; check that the main element exists with correct id
    const main = page.locator('main#main-content')
    await expect(main).toHaveCount(1)
  })

  test('CTAs have accessible names and navigate', async ({ page }) => {
    await page.goto('/')

    const signIn = page.getByRole('link', { name: /sign in to start chatting/i })
    await expect(signIn).toBeVisible()

    const startChat = page.getByRole('link', { name: /open your conversations/i })
    await expect(startChat).toBeVisible()

    const groupChat = page.getByRole('link', { name: /begin a new group chat/i })
    await expect(groupChat).toBeVisible()

    // Verify hrefs (without navigating away from server state)
    await expect(signIn).toHaveAttribute('href', '/auth')
    await expect(startChat).toHaveAttribute('href', '/messages')
    await expect(groupChat).toHaveAttribute('href', '/messages?group=1')
  })

  test('axe a11y audit has no serious or critical violations', async ({ page }) => {
    await page.goto('/')
    const results = await new AxeBuilder({ page }).analyze()
    const severe = results.violations.filter((v: any) => ['serious', 'critical'].includes(v.impact || ''))

    if (severe.length) {
      console.error('A11y serious/critical violations:', severe.map((v: any) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })))
    }

    expect(severe.length, 'No serious/critical axe violations expected on homepage').toBe(0)
  })
})
