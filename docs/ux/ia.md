# Information Architecture

This document captures the current top-level IA and navigation scheme for the ECE-AGENT messaging application.

## Top-level Sections (Primary Nav)
1. Home (Landing)
2. Messages (Chat Interface)
3. Profile (User Settings)
4. Test (API Validation)
5. Auth (Authentication)

These sections map to Next.js app routes:
- `/` - Landing page with authentication redirect
- `/messages` - Main chat interface with agents and tools
- `/profile` - User profile and settings
- `/test` - API connection testing interface
- `/auth` - Authentication flow with Supabase
- `/auth/callback` - OAuth callback handling

## Section Goals and Content Model

### 1) Dashboard
- Purpose: Executive overview with key KPIs, trends, and quick actions.
- Content:
  - KPI cards (e.g., revenue, active customers, churn, MRR growth)
  - Recent activity feed
  - Quick links/actions
- States:
  - Loading: skeleton placeholders for KPI cards and feed
  - Error: alert with retry suggestion
  - Empty: minimized layout when data is missing (rare)

### 2) Customers
- Purpose: Manage customer records and details.
- Content:
  - List + Detail pattern with search, filters, and pagination
  - Detail pane with profile, activity, and billing summary
- States:
  - Loading: skeleton list rows and detail panel
  - Error: alert for list fetch or detail fetch failure
  - Empty: “No results” + guidance to adjust filters

### 3) Billing
- Purpose: Invoices, subscriptions, and payment methods.
- Content:
  - Invoices list with status chips and actions
  - Subscription plans and current usage
  - Payment methods management (add/remove)
- States:
  - Loading: skeleton table rows and cards
  - Error: alert with retry/action guidance
  - Empty: “No invoices yet” / “No payment methods” with CTA

### 4) Settings
- Purpose: Configure profile, security, notifications, and billing preferences.
- Content:
  - Local sidebar: Profile, Security, Notifications, Billing
  - Forms with validation and save actions
- States:
  - Loading: saving overlay and field skeletons
  - Error: inline alert on failed save
  - Empty: N/A (forms always render)

## Navigation Model

- Global TopNav: links to Dashboard, Customers, Billing, Settings.
- Persistent SideNav (lg+): mirrors primary sections, contextual quick links may appear under each.
- Breadcrumbs (PageHeader): reflect depth within Customers and Billing.

## PageHeader Usage

- Title: Section name
- Subtitle: Contextual information or last updated times
- Actions: Contextual CTAs (e.g., “Add customer”, “New invoice”)
- Breadcrumbs: e.g., “Customers / John Doe / Invoices”

## Routing Notes

- Known routes: `/dashboard`, `/list-detail` (internal demo), `/settings`, `/auth`
- To add: `/customers` (replaces list-detail demo), `/billing`
- Default redirect from `/` to `/dashboard`

## Component Primitives

- Layout: Shell, TopNav, SideNav, PageHeader
- UI: Alert, Skeleton, LoadingOverlay
- Tokenization: CSS variables for radius, elevation, simple spacing aliases (expand post-IA validation)

## Next Steps

- Implement Customers route with real list+detail naming (replace `/list-detail`)
- Implement Billing route with invoices and subscriptions sections
- Align tokens and component variants with selected Mobbin references (see references.md)