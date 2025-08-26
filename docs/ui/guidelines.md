# UI Screenshot Guidelines

This document defines the standard process for generating and maintaining UI screenshots in `docs/ui/`.

## Scope and Structure

- Root: `docs/ui/`
- Categories: `layouts/`, `components/`, `user-flows/` (extend as needed)
- Viewports:
  - Desktop: 1440x900 → saved under `<category>/desktop/`
  - Mobile: 390x844 → saved under `<category>/mobile/`
- Filenames: `<route-name>-YYYY-MM-DD.png`
- Sitemap files:
  - `docs/ui/sitemap.json` (machine-readable config for the script)
  - `docs/ui/SITEMAP.md` (human overview and links)

## Source of Truth

- Script: `scripts/capture-screenshots.ts`
- Reads: `docs/ui/sitemap.json`
- Writes: `docs/ui/<category>/{desktop|mobile}/<name>-YYYY-MM-DD.png`

## Authentication Handling

- The script uses a persistent Puppeteer profile in `.puppeteer-profile/` to reuse session cookies.
- For routes with `requiresAuth: true`, log in once using a visible browser:
  1. Launch the login route visibly:
     ```bash
     pnpm dlx tsx scripts/capture-screenshots.ts --only=auth-login --headless=false --delay=300000
     ```
  2. Complete Supabase auth in the opened Chromium window, then re-run the full capture (headless).

## Standard Commands

- Install Chromium (first run only):
  ```bash
  npx puppeteer browsers install chromium
  ```

- Capture public routes only (skip authenticated):
  ```bash
  pnpm dlx tsx scripts/capture-screenshots.ts \
    --config=docs/ui/sitemap.json \
    --out=docs/ui \
    --base=http://localhost:3000 \
    --skipAuth=true
  ```

- Capture all routes after logging in (recommended):
  ```bash
  pnpm dlx tsx scripts/capture-screenshots.ts \
    --config=docs/ui/sitemap.json \
    --out=docs/ui \
    --base=http://localhost:3000
  ```

- Target specific routes (comma-separated `name` values from `sitemap.json`):
  ```bash
  pnpm dlx tsx scripts/capture-screenshots.ts --only=messages,messages-with-agents
  ```

## Adding/Updating Routes

1. Edit `docs/ui/sitemap.json`:
   - Add `{ name, path, category, requiresAuth }`. Keep `name` kebab-case.
2. Optionally update `docs/ui/SITEMAP.md` with a short description and links.
3. Run the capture commands above to generate fresh screenshots.

## Review Checklist

- Screens are current date-stamped.
- Desktop and mobile variants exist (unless route is desktop-only).
- Auth-required screens were captured after login.
- No PII or secrets visible.

## CI/Automation (Optional)

- Consider running the capture script in CI on tagged releases or when `sitemap.json` changes.
- Store screenshots as artifacts or commit them (review size impact).

## Troubleshooting

- Chromium launch fails: run `npx puppeteer browsers install chromium`.
- Blank/redirected screenshots: ensure dev server is running and base URL is correct.
- Auth pages not captured: re-run login step with `--headless=false` to refresh cookies.
