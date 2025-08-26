/*
  scripts/capture-screenshots.ts

  Captures screenshots for routes defined in docs/ui/sitemap.json.
  Produces desktop and mobile PNGs into matching docs/ui subfolders with
  date-stamped filenames like:
    docs/ui/layouts/desktop/home-YYYY-MM-DD.png

  Usage examples:
    pnpm dlx tsx scripts/capture-screenshots.ts
    pnpm dlx tsx scripts/capture-screenshots.ts --config=docs/ui/sitemap.json --out=docs/ui --base=http://localhost:3000

  Options:
    --config  Path to sitemap JSON (default: docs/ui/sitemap.json)
    --out     Output root folder (default: docs/ui)
    --base    Override baseUrl in sitemap.json
    --only    Comma-separated route names to include (by "name" field)
    --skipAuth Skip routes that requireAuth=true (default false)
    --delay   Extra ms to wait after navigation (default 300)

  Notes:
    - Requires dev server running at the provided base URL.
    - For authenticated routes, sign in in the browser first so cookies exist.
      This script does not perform login; it relies on persisted session cookies
      that Chromium carries from previous runs if using a userDataDir.
*/

import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import puppeteer, { Browser, Page } from 'puppeteer'
import { z } from 'zod'

const ArgSchema = z.object({
  config: z.string().default('docs/ui/sitemap.json'),
  out: z.string().default('docs/ui'),
  base: z.string().url().optional(),
  only: z.string().optional(),
  skipAuth: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
  delay: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 300)),
  headless: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === 'false' ? false : 'new'))
})

type Route = {
  path: string
  name: string
  category: 'layouts' | 'components' | 'user-flows' | string
  description?: string
  requiresAuth?: boolean
}

type Sitemap = {
  generated?: string
  baseUrl?: string
  routes: Route[]
}

function parseArgs(): z.infer<typeof ArgSchema> {
  const raw: Record<string, string> = {}
  for (const arg of process.argv.slice(2)) {
    if (!arg.startsWith('--')) continue
    const [k, v] = arg.replace(/^--/, '').split('=')
    raw[k] = v ?? 'true'
  }
  return ArgSchema.parse(raw)
}

function ymd(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

async function ensureDir(p: string) {
  await fsp.mkdir(p, { recursive: true })
}

async function capture(page: Page, url: string, filePath: string, delayMs: number) {
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60_000 })
  if (delayMs > 0) {
    await new Promise((res) => setTimeout(res, delayMs))
  }
  await page.screenshot({ path: filePath as `${string}.png`, fullPage: true })
  // eslint-disable-next-line no-console
  console.log('Saved', filePath)
}

async function run() {
  const args = parseArgs()
  const site: Sitemap = JSON.parse(await fsp.readFile(args.config, 'utf8'))
  const baseUrl = args.base ?? site.baseUrl ?? 'http://localhost:3000'
  const only = args.only?.split(',').map((s) => s.trim()) ?? null
  const dateStr = ymd()

  // Persist user data dir so authenticated cookies can be reused between runs
  const userDataDir = path.resolve('.puppeteer-profile')

  let browser: Browser | null = null
  try {
    browser = await puppeteer.launch({
      headless: (args as any).headless ?? 'new',
      userDataDir,
      defaultViewport: null,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    } as any)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('\nFailed to launch Chromium. If this is the first run, install it with:\n  npx puppeteer browsers install chromium\n')
    throw e
  }

  try {
    const page = await browser.newPage()

    for (const route of site.routes) {
      if (only && !only.includes(route.name)) continue
      if (route.requiresAuth && args.skipAuth) continue

      const category = route.category
      const name = route.name
      const targetDesktopDir = path.join(args.out, category, 'desktop')
      const targetMobileDir = path.join(args.out, category, 'mobile')
      await ensureDir(targetDesktopDir)
      await ensureDir(targetMobileDir)

      const desktopFile = path.join(targetDesktopDir, `${name}-${dateStr}.png`)
      const mobileFile = path.join(targetMobileDir, `${name}-${dateStr}.png`)

      // Desktop 1440x900
      await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })
      await capture(page, new URL(route.path, baseUrl).toString(), desktopFile, args.delay)

      // Mobile 390x844 (iPhone 12-ish)
      await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true })
      await capture(page, new URL(route.path, baseUrl).toString(), mobileFile, args.delay)
    }
  } finally {
    if (browser) await browser.close()
  }
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exitCode = 1
})
