import { test, expect } from '@playwright/test'

test.describe('Immersive 3D Toggle Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the messages page where the chat window is rendered
    await page.goto('/messages')
    
    // Wait for the page to load and chat interface to be visible
    await page.waitForSelector('[data-testid="chat-window"]', { timeout: 10000 })
  })

  test('3D toggle button is visible when feature flag is enabled', async ({ page }) => {
    // Check if the 3D toggle button is present in the chat header
    const toggleButton = page.locator('button[aria-label*="headset"], button[title*="headset"], button:has-text("3D")')
    
    // The button should be visible if the IMMERSIVE_CHAT feature flag is enabled
    await expect(toggleButton).toBeVisible()
  })

  test('3D toggle button activates immersive view', async ({ page }) => {
    // Find and click the 3D toggle button
    const toggleButton = page.locator('button[aria-label*="headset"], button[title*="headset"], button:has-text("3D")')
    await toggleButton.click()

    // Wait for the 3D view to activate
    await page.waitForTimeout(500)

    // Check that the 3D view container is now visible
    const headsetView = page.locator('[data-testid="headset-3d-view"], .headset-3d-view')
    await expect(headsetView).toBeVisible()

    // Check that the message input is hidden in 3D mode
    const messageInput = page.locator('textarea[placeholder*="message"], input[placeholder*="message"]')
    await expect(messageInput).not.toBeVisible()
  })

  test('3D toggle button deactivates immersive view', async ({ page }) => {
    // First activate 3D mode
    const toggleButton = page.locator('button[aria-label*="headset"], button[title*="headset"], button:has-text("3D")')
    await toggleButton.click()
    await page.waitForTimeout(500)

    // Click again to deactivate
    await toggleButton.click()
    await page.waitForTimeout(500)

    // Check that the 3D view is no longer visible
    const headsetView = page.locator('[data-testid="headset-3d-view"], .headset-3d-view')
    await expect(headsetView).not.toBeVisible()

    // Check that the message input is visible again
    const messageInput = page.locator('textarea[placeholder*="message"], input[placeholder*="message"]')
    await expect(messageInput).toBeVisible()
  })

  test('3D toggle state persists across page reloads', async ({ page }) => {
    // Activate 3D mode
    const toggleButton = page.locator('button[aria-label*="headset"], button[title*="headset"], button:has-text("3D")')
    await toggleButton.click()
    await page.waitForTimeout(500)

    // Reload the page
    await page.reload()
    await page.waitForSelector('[data-testid="chat-window"]', { timeout: 10000 })

    // Check that 3D mode is still active after reload
    const headsetView = page.locator('[data-testid="headset-3d-view"], .headset-3d-view')
    await expect(headsetView).toBeVisible()

    // Check that the toggle button shows active state
    await expect(toggleButton).toHaveClass(/active|pressed/)
  })

  test('3D toggle emits analytics events', async ({ page }) => {
    // Set up console log monitoring for analytics events
    const analyticsEvents: string[] = []
    page.on('console', (msg) => {
      if (msg.text().includes('analytics') || msg.text().includes('trackEvent')) {
        analyticsEvents.push(msg.text())
      }
    })

    // Click the 3D toggle button
    const toggleButton = page.locator('button[aria-label*="headset"], button[title*="headset"], button:has-text("3D")')
    await toggleButton.click()
    await page.waitForTimeout(1000)

    // Click again to toggle off
    await toggleButton.click()
    await page.waitForTimeout(1000)

    // Check that analytics events were fired (implementation may vary)
    // This is a basic check - actual implementation depends on how analytics are set up
    expect(analyticsEvents.length).toBeGreaterThan(0)
  })

  test('3D toggle is desktop-only (not visible on mobile)', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.reload()
    await page.waitForSelector('[data-testid="chat-window"]', { timeout: 10000 })

    // Check that the 3D toggle button is not visible on mobile
    const toggleButton = page.locator('button[aria-label*="headset"], button[title*="headset"], button:has-text("3D")')
    await expect(toggleButton).not.toBeVisible()
  })

  test('3D view displays chat messages in immersive layout', async ({ page }) => {
    // First, ensure there are some messages in the chat
    // This might require setting up test data or mocking
    
    // Activate 3D mode
    const toggleButton = page.locator('button[aria-label*="headset"], button[title*="headset"], button:has-text("3D")')
    await toggleButton.click()
    await page.waitForTimeout(500)

    // Check that the 3D view container is visible
    const headsetView = page.locator('[data-testid="headset-3d-view"], .headset-3d-view')
    await expect(headsetView).toBeVisible()

    // Check for 3D-specific styling or layout elements
    const threeDElements = page.locator('.transform-3d, .perspective, [style*="transform3d"]')
    await expect(threeDElements.first()).toBeVisible()
  })
})
