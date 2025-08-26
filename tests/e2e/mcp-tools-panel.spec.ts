import { test, expect, type Page, type Route } from '@playwright/test'

// E2E: Connect GitHub in MCPToolsPanel, start stream (mock SSE), and run a preset action.
// This test mocks the external GitHub API and the Next.js MCP proxy endpoints.

test('MCPToolsPanel connects, streams, and runs preset', async ({ page }: { page: Page }) => {
  // Track whether the preset execution POST was made
  let presetExecCalled = false

  // Mock GitHub user validation used by mcpService.connectGitHub()
  await page.route('https://api.github.com/user', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        login: 'tester',
        email: 'tester@example.com',
        repos_url: 'https://api.github.com/users/tester/repos',
      }),
    })
  })

  // Mock MCP proxy endpoints
  await page.route('**/api/mcp/github', async (route: Route) => {
    const req = route.request()
    const method = req.method()

    if (method === 'POST') {
      const body = req.postData() || ''
      if (body.includes('list_repos')) {
        presetExecCalled = true
      }
      // Include a session id header so the client stores it
      await route.fulfill({
        status: 200,
        headers: { 'Mcp-Session-Id': 'test-session-123' },
        contentType: 'text/plain',
        body: '',
      })
      return
    }

    if (method === 'GET') {
      // Return a small SSE-like payload so the reader picks up an event
      await route.fulfill({
        status: 200,
        headers: { 'content-type': 'text/event-stream' },
        body: 'data: hello from mcp\n\n',
      })
      return
    }

    if (method === 'DELETE') {
      await route.fulfill({ status: 200, body: '' })
      return
    }

    await route.continue()
  })

  // Navigate to the MCP test page
  await page.goto('/mcp-test')

  // Connect GitHub via the panel
  const tokenInput = page.getByPlaceholder('Enter GitHub personal access token')
  await tokenInput.fill('ghp_test_token')
  await page.getByRole('button', { name: 'Connect GitHub' }).click()

  // Verify connected UI shows up
  await expect(page.getByText('Connected')).toBeVisible()

  // Verify stream log shows an event
  await expect(page.getByText('GitHub MCP Stream')).toBeVisible()
  await expect(page.getByText('hello from mcp')).toBeVisible()

  // Run a preset (List My Repos) and verify our mock observed the POST
  await page.getByRole('button', { name: 'List My Repos' }).click()
  await expect.poll(() => presetExecCalled).toBeTruthy()
})
