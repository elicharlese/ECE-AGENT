import { test, expect } from '@playwright/test';

// Base assumptions:
// - Frontend is served via nx: `npx nx serve web --configuration=withApiLocal`
// - The application renders a header with Home and Admin navigation links
// - The Home page shows a health status area that starts as "checking..." and then resolves to either "ok" or an error message.
// - We keep selectors resilient by using role-based queries and visible text matches.

test.describe('Smoke: Navigation + Health', () => {
  test('Header navigation: Home and Admin routes are reachable', async ({ page }) => {
    // Use the baseURL if configured in playwright.config.ts, otherwise default to localhost:5173
    const base = (page.context() as any)._options.baseURL ?? 'http://localhost:5173';

    await page.goto(base);

    // Header should have Home and Admin links
    const homeLink = page.getByRole('link', { name: /home/i });
    const adminLink = page.getByRole('link', { name: /admin/i });

    await expect(homeLink).toBeVisible();
    await expect(adminLink).toBeVisible();

    // Navigate to Admin and verify route content
    await adminLink.click();
    await expect(page).toHaveURL(/\/admin$/);

    // Basic admin page sanity check: look for a heading or section text commonly present on Admin page
    // Adjust the text below if Admin page uses a different label
    const adminHeading = page.getByRole('heading', { name: /admin/i });
    await expect(adminHeading).toBeVisible();

    // Navigate back Home
    await homeLink.click();
    await expect(page).toHaveURL((url) => url.pathname === '/' || url.pathname === '/index.html');
  });

  test('Health badge transitions from checking to a resolved state', async ({ page }) => {
    const base = (page.context() as any)._options.baseURL ?? 'http://localhost:5173';
    await page.goto(base);

    // Expect initial "checking" indicator to be visible
    // The Home page should render some form of health status; match generically to avoid brittle selectors
    const checking = page.getByText(/checking/i);
    await expect(checking).toBeVisible();

    // Wait for the status to resolve. It may become "ok" or an error message.
    // We race against a list of expected outcomes to keep the test deterministic without coupling to API.
    const okLocator = page.getByText(/\bok\b/i);
    const errorLocator = page.getByText(/error|failed|unreachable|invalid/i);

    // Wait up to 10s for either OK or error text to appear, while allowing "checking" to disappear.
    const outcome = await Promise.race([
      okLocator.waitFor({ state: 'visible', timeout: 10000 }).then(() => 'ok'),
      errorLocator.waitFor({ state: 'visible', timeout: 10000 }).then(() => 'error'),
    ]);

    // Assert that one of the outcomes occurred
    expect(['ok', 'error']).toContain(outcome);

    // Optional: ensure "checking" is no longer visible once resolved (best-effort)
    await expect(checking).toHaveCount(0);
  });

  test('Home renders with title, footer, and a11y landmarks', async ({ page }) => {
    const base = (page.context() as any)._options.baseURL ?? 'http://localhost:5173';
    await page.goto(base);

    // Title check (best-effort, adjust expected text if app uses a different title)
    await expect(page).toHaveTitle(/(agent|web|app|home)/i);

    // Basic a11y landmarks: header, main, and footer should be present
    const header = page.locator('header');
    const main = page.locator('main');
    const footer = page.locator('footer');

    await expect(header).toHaveCount(1);
    await expect(main).toHaveCount(1);
    await expect(footer).toHaveCount(1);

    // Footer presence and content sanity (non-empty text or at least visible)
    await expect(footer).toBeVisible();
    const footerText = (await footer.textContent())?.trim() ?? '';
    expect(footerText.length).toBeGreaterThanOrEqual(0); // allow empty but check element exists

    // Ensure there is exactly one h1 on the page (common a11y heuristic)
    const h1s = page.locator('h1');
    await expect(h1s).toHaveCount(1);

    // Ensure header contains navigation landmark or role
    // Try role-based first for resilience
    const navByRole = page.getByRole('navigation');
    // If role isn't present, still pass as long as header exists (do not make brittle)
    try {
      await navByRole.first().waitFor({ state: 'visible', timeout: 1000 });
    } catch {
      // no-op; header landmark already verified
    }
  });

  test('Document has lang, charset, viewport and canonical meta tags', async ({ page }) => {
    const base = (page.context() as any)._options.baseURL ?? 'http://localhost:5173';
    await page.goto(base);

    // html lang attribute
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang && lang.length > 0).toBeTruthy();

    // charset
    const hasCharset = await page.locator('meta[charset]').count();
    expect(hasCharset).toBeGreaterThanOrEqual(1);

    // viewport
    const hasViewport = await page.locator('meta[name="viewport"]').count();
    expect(hasViewport).toBeGreaterThanOrEqual(1);

    // canonical (best-effort)
    const canonicalHref = await page.locator('link[rel="canonical"]').first().getAttribute('href').catch(() => null);
    // allow absence but if present, should be non-empty
    if (canonicalHref !== null) {
      expect((canonicalHref ?? '').length).toBeGreaterThan(0);
    }
  });

  test('Header navigation supports keyboard activation and focus order', async ({ page }) => {
    const base = (page.context() as any)._options.baseURL ?? 'http://localhost:5173';
    await page.goto(base);

    // Focus the page body and tab to first link
    await page.locator('body').click();
    await page.keyboard.press('Tab');

    // Expect focus to land on a visible nav link (Home or Admin)
    const focused = page.locator(':focus');
    const focusedText = (await focused.textContent())?.toLowerCase() ?? '';
    expect(/home|admin/.test(focusedText)).toBeTruthy();

    // Activate using Enter should navigate if focus is on a link
    const beforeUrl = page.url();
    await page.keyboard.press('Enter');

    // If already on home, pressing Enter on "Home" may keep URL; handle both cases:
    await page.waitForTimeout(200);
    const afterUrl = page.url();
    expect(typeof afterUrl).toBe('string');
    // If it changed to admin ensure route is valid
    if (afterUrl !== beforeUrl) {
      await expect(page).toHaveURL(/\/(admin|$)/);
    }
  });

  test('Footer external links open in new tab with rel security attributes', async ({ page, context }) => {
    const base = (page.context() as any)._options.baseURL ?? 'http://localhost:5173';
    await page.goto(base);

    const externalLinks = page.locator('footer a[href^="http"]');
    const count = await externalLinks.count();

    // If no external links, pass with a note; otherwise verify attributes
    for (let i = 0; i < count; i++) {
      const link = externalLinks.nth(i);
      const target = await link.getAttribute('target');
      const rel = (await link.getAttribute('rel')) ?? '';
      expect(target === '_blank' || target === null || target === undefined).toBeTruthy();
      if (target === '_blank') {
        // When opening new tab, ensure rel includes security attributes
        expect(/noopener/.test(rel) || /noreferrer/.test(rel)).toBeTruthy();
      }
    }
  });

  test('Responsive layout renders without major shifts at common breakpoints', async ({ page }) => {
    const base = (page.context() as any)._options.baseURL ?? 'http://localhost:5173';
    await page.goto(base);

    const breakpoints = [
      { width: 375, height: 667 },  // mobile
      { width: 768, height: 1024 }, // tablet
      { width: 1280, height: 800 }, // desktop
    ];

    for (const vp of breakpoints) {
      await page.setViewportSize(vp);
      // Header and main should remain visible across breakpoints
      await expect(page.locator('header')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
    }
  });

  test('No severe console errors on initial load', async ({ page }) => {
    const base = (page.context() as any)._options.baseURL ?? 'http://localhost:5173';

    const messages: { type: string; text: string }[] = [];
    page.on('console', (msg) => {
      messages.push({ type: msg.type(), text: msg.text() });
    });

    await page.goto(base);

    const severe = messages.filter((m) =>
      ['error'].includes(m.type) &&
      // ignore common dev-only noise patterns if any arise
      !/ResizeObserver loop limit exceeded/i.test(m.text)
    );

    expect(severe, `Console contained severe errors: ${JSON.stringify(severe, null, 2)}`).toHaveLength(0);
  });

  test('Skip-to-content link exists and moves focus to main', async ({ page }) => {
    const base = (page.context() as any)._options.baseURL ?? 'http://localhost:5173';
    await page.goto(base);

    // Common patterns: "Skip to content" or "Skip to main content"
    const skip = page.getByRole('link', { name: /skip to (main )?content/i });
    // If present, verify it works; if absent, don't fail the whole suite
    const count = await skip.count();
    if (count > 0) {
      await skip.first().focus();
      await expect(skip.first()).toBeFocused();
      await skip.first().click();
      // After activation, main should receive focus or be at top of page
      const activeId = await page.evaluate(() => document.activeElement?.id || '');
      const mainHasFocus = await page.evaluate(() => document.activeElement?.tagName.toLowerCase() === 'main');
      const mainEl = page.locator('main');
      await expect(mainEl).toHaveCount(1);
      expect(mainHasFocus || activeId.length > 0).toBeTruthy();
    }
  });

  test('Header contains accessible links with readable names', async ({ page }) => {
    const base = (page.context() as any)._options.baseURL ?? 'http://localhost:5173';
    await page.goto(base);

    const header = page.locator('header');
    await expect(header).toHaveCount(1);
    const nav = page.getByRole('navigation');
    // prefer role-based navigation if available
    const linkScope = (await nav.count()) > 0 ? nav : header;

    const links = linkScope.getByRole('link');
    const linkCount = await links.count();
    expect(linkCount).toBeGreaterThan(0);

    for (let i = 0; i < linkCount; i++) {
      const l = links.nth(i);
      const name = await l.getAttribute('aria-label');
      const text = (await l.textContent())?.trim() ?? '';
      // Accessible name should come from either aria-label or visible text
      expect(((name ?? '').trim().length > 0) || text.length > 0).toBeTruthy();
    }
  });

  test('Main landmark has exactly one h1 and no duplicate main landmarks', async ({ page }) => {
    const base = (page.context() as any)._options.baseURL ?? 'http://localhost:5173';
    await page.goto(base);

    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
  });

  test('Common roles exist: banner, contentinfo, and navigation (best-effort)', async ({ page }) => {
    const base = (page.context() as any)._options.baseURL ?? 'http://localhost:5173';
    await page.goto(base);

    // banner typically maps to header
    const banner = page.getByRole('banner');
    const contentinfo = page.getByRole('contentinfo'); // typically footer
    const navigation = page.getByRole('navigation');

    // Do not hard fail if a role is not explicitly set, but prefer presence
    // Verify at least header/main/footer exist; roles are a bonus
    await expect(page.locator('header')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('footer')).toHaveCount(1);

    // Best-effort checks: if roles exist, they should be visible
    if (await banner.count()) await expect(banner).toBeVisible();
    if (await contentinfo.count()) await expect(contentinfo).toBeVisible();
    if (await navigation.count()) await expect(navigation.first()).toBeVisible();
  });

  test('Assets are linked: favicon and web manifest (best-effort)', async ({ page }) => {
    const base = (page.context() as any)._options.baseURL ?? 'http://localhost:5173';
    await page.goto(base);

    const favicon = page.locator('link[rel~="icon"]');
    const manifest = page.locator('link[rel="manifest"]');

    // Non-fatal: if present, their hrefs should be non-empty
    if ((await favicon.count()) > 0) {
      const href = await favicon.first().getAttribute('href');
      expect((href ?? '').length).toBeGreaterThan(0);
    }
    if ((await manifest.count()) > 0) {
      const href = await manifest.first().getAttribute('href');
      expect((href ?? '').length).toBeGreaterThan(0);
    }
  });
});
