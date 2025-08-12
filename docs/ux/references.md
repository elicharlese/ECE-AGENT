# Mobbin References

Purpose: Track 3–5 Mobbin references used as inspiration for IA and UI. We document what we emulate at the pattern level (layout, flows, interaction). We do NOT copy proprietary assets.

Note: Replace placeholders below with actual Mobbin URLs/titles when available (paste Mobbin links or titles + app names).

## Reference 1 — Dashboard Overview
- App + Screen: [Mobbin link or title here]
- Emulate:
  - KPI card grid with concise metrics and trends
  - Recent activity feed
  - Quick actions row above the fold
- Applied To:
  - Dashboard route (`/dashboard`): KPI cards, recent feed, quick actions
- Notes/Constraints:
  - Keep content density moderate; mobile collapses to single column
  - Use our tokens (radius-8/12, elev-sm) for card chrome

## Reference 2 — Customers: List + Detail
- App + Screen: [Mobbin link or title here]
- Emulate:
  - Master list with search, filters, and selection
  - Detail pane with summary header and tabs/sections
- Applied To:
  - Customers route (to be implemented): list + detail
  - Interim demo is `/list-detail` to validate layout and states
- Notes/Constraints:
  - Breadcrumbs in PageHeader
  - Persist search query in URL when ready

## Reference 3 — Billing: Invoices / Subscriptions
- App + Screen: [Mobbin link or title here]
- Emulate:
  - Invoice table with status badges
  - Subscription summary with plan, usage, next charge
- Applied To:
  - Billing route (to be implemented): invoices + subscriptions sections
- Notes/Constraints:
  - Clear empty state for “no invoices yet”
  - Inline actions for “download invoice” and “manage payment method”

## Reference 4 — Settings: Forms with Local Sidebar
- App + Screen: [Mobbin link or title here]
- Emulate:
  - Local subsection navigation (Profile, Security, Notifications, Billing)
  - Clean stacked form fields with clear save feedback
- Applied To:
  - Settings route (`/settings`): form sections and save interactions
- Notes/Constraints:
  - LoadingOverlay for save-in-progress
  - Alert for save failure/success messaging

## Accessibility and Compliance Checklist
- Do not copy proprietary icons, logos, illustrations, or brand assets
- Ensure sufficient color contrast for text and interactive elements
- Use semantic landmarks and proper aria roles for alerts and overlays
- Keyboard focus visible on interactive elements; overlays are non-trapping demos

## Implementation Mapping
- Layout Primitives: Shell, TopNav, SideNav, PageHeader
- Shared UI: Alert, Skeleton, LoadingOverlay
- Tokens: CSS variables for radius and elevation defined in styles.css
- Routes: `/dashboard`, `/customers` (pending), `/billing` (pending), `/settings`
- Demo States: Loading/Empty/Error shown in each example page

## Open Questions
- Which KPI set and thresholds for Dashboard?
- Customers filters: which facets (plan, status, MRR range)?
- Billing providers supported (Stripe, etc.) to influence UI affordances
- Settings validation and error messaging conventions