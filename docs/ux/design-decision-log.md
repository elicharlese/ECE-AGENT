# Design Decision Log (Mobbin-Informed)

Purpose
Create a single source of truth for UX/UI decisions inspired by Mobbin research. Each decision is atomic, traceable, and implementable without copying proprietary assets.

How to use
- Add one entry per decision.
- Link to related Mobbin references and internal artifacts (issues, PRs).
- Keep rationale concise and engineering-ready (trade-offs, constraints, acceptance criteria).

Decision Entry Template

- ID: D-YYYYMMDD-xx
- Title: Short, action-oriented summary
- Status: Proposed | Approved | Implemented | Deprecated
- Owner: Name/Team
- Related: Issue/PR/Doc links

Context
- Problem/Goal:
- Scope and constraints:
- Assumptions and risks:

Mobbin References (Inspiration only)
- Reference 1: Product – Screen – URL
- Reference 2: Product – Screen – URL
- Observations (structure, states, interactions, components):

Options Considered
- Option A:
  - Summary:
  - Pros:
  - Cons:
- Option B:
  - Summary:
  - Pros:
  - Cons:
- Option C (if applicable)

Decision
- Chosen option:
- Rationale:
- Non-goals (explicitly out of scope right now):

Implementation Notes
- Affected pages/templates: (Dashboard, ListDetail, Settings, Auth, etc.)
- Components/tokens involved: (PageHeader, SideNav, TopNav, Card, DataTable shell, etc.)
- Accessibility considerations:
- Responsive behavior/breakpoints:
- States to implement: loading, empty, error, success

Acceptance Criteria
- [ ] Meets core UX goals (list)
- [ ] Responsive behavior matches pattern intent
- [ ] Keyboard/focus/ARIA verified
- [ ] No proprietary visuals copied; all assets original

Validation & Rollout
- Reviewers: Design, Eng, PM
- Test plan: E2E smoke scenarios (navigation, modal focus trap, empty/error states)
- Metrics/KPIs (if applicable):

Changelog
- Created: YYYY-MM-DD
- Updated: YYYY-MM-DD

Example Entry (Filled)

- ID: D-20250806-01
- Title: Adopt persistent sidebar filters for dense list views (desktop), modal filters on mobile
- Status: Approved
- Owner: UX Core
- Related: PR #123, docs/ux/mobbin-research-workflow.md

Context
- Problem/Goal: Improve discoverability and speed for complex filtering in data-heavy lists.
- Constraints: Keep current Tailwind palette/typography; minimal token additions only.

Mobbin References
- Shopify – Collections Filters – https://mobbin.com/…
- Slack – Channel Search Filters – https://mobbin.com/…
- Observations: Persistent sidebar aids multi-filter editing; mobile prefers modal to save space.

Options
- A: Persistent sidebar (desktop) + modal (mobile)
  - Pros: Efficient for power users; scalable; discoverable
  - Cons: Uses horizontal space on desktop
- B: Single dropdown filter
  - Pros: Minimal UI
  - Cons: Poor for complex queries

Decision
- Chosen: A
- Rationale: Best balance for complex domains; matches user mental model.

Implementation Notes
- Affected templates: ListDetail
- Components: FilterPanel, FilterToggle, AppliedFiltersBar
- Accessibility: Ensure toggles and checkboxes reachable with keyboard; aria-expanded on panel
- Breakpoints: Sidebar ≥ lg; Modal & filter button < lg
- States: Empty results with “Clear filters” CTA

Acceptance
- [ ] Sidebar appears on lg+; modal on smaller
- [ ] Escape closes modal; focus returns to trigger
- [ ] No copied visuals

Validation
- Reviewers: UX, FE, PM
- Tests: Playwright scenarios for open/close, persistence, empty states
- Metrics: Filter usage completion

Changelog
- Created: 2025-08-06
- Updated: 2025-08-06