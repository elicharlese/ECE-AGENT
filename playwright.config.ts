import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['list'],
    ...(process.env.CI ? [["junit", { outputFile: 'test-results/junit.xml' }]] : [['html']]),
  ],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:4200',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: process.env.E2E_NO_SERVER
    ? undefined
    : {
        command: 'pnpm dev',
        url: process.env.E2E_BASE_URL || 'http://localhost:4200',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
