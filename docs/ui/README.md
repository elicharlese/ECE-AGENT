# UI Documentation

This folder contains UI documentation, screenshots, and validation reports for the ECE-AGENT application.

## Structure

- **guidelines.md** - UI screenshot capture guidelines and processes
- **SITEMAP.md** - Application route documentation with screenshot links
- **VALIDATION_REPORT.md** - UI validation against END_GOAL.md requirements
- **sitemap.json** - Machine-readable configuration for screenshot automation
- **layouts/** - Layout screenshots (desktop/mobile)
- **components/** - Component screenshots (desktop/mobile)
- **user-flows/** - User flow screenshots (desktop/mobile)
- **responsive/** - Responsive design validation screenshots

## Current Status (Updated 2025-01-30)

### Test Interface Added

- **New route**: `/test` - Comprehensive API connection testing interface
- **Features**: Tests all API endpoints with real-time status indicators
- **Categories**: Auth, Data, Payment, Integration, Media APIs

### Screenshot Coverage

- Total routes documented: 10
- Viewports: Desktop (1440x900), Mobile (390x844)
- Authentication: Supabase-based auth flow captured
- Last update: 2025-08-24

### Validation Status

- ✅ Responsive UI using React + Tailwind
- ✅ Mobile + desktop consistent design
- ✅ Routing works via Nx app layouts
- ⚠️ Admin login (using Supabase auth exclusively)

## Quick Commands

Generate fresh screenshots:

```bash
pnpm dlx tsx scripts/capture-screenshots.ts --config=docs/ui/sitemap.json --out=docs/ui --base=http://localhost:3000
```

Update sitemap documentation:

```bash
# Edit docs/ui/sitemap.json, then regenerate SITEMAP.md
```
