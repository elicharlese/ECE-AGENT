# Mobbin Research Workflow and Checklist

Purpose
Use Mobbin to benchmark best-in-class UI patterns and transform findings into implementable, license-safe layouts and components for our platform.

Scope
- Research and benchmarking (not copying assets)
- Pattern selection and rationale
- Translation to design tokens, components, and templates
- Traceable documentation for product/design/engineering

Compliance Notes
- Do: Use Mobbin as research inspiration; write your own copy, compose original components, and cite sources.
- Don’t: Copy proprietary artwork, icons, or compositions verbatim; do not embed screenshots in production UI.

Workflow

1) Define the UX goal and constraints
- Objective: What task or flow are we improving? (e.g., onboarding wizard, dashboard overview, list + detail)
- Audience: Who is the primary user? Key jobs to be done? Accessibility constraints?
- Platforms: Desktop, tablet, mobile. Breakpoints and input modes.
- KPIs: Success criteria (completion rate, time-on-task, error rate, NPS).

2) Mobbin scouting and capture
- Search terms: dashboard cards, data table, filters, settings, onboarding, empty states, notifications, auth.
- Products to scan: domain-relevant leaders and adjacent categories.
- Capture per screen:
  - Structure: navigation style, page header, content layout, density
  - States: loading, empty, error, success
  - Interactions: search, filters, sort, pagination, bulk actions, inline editing
  - Components: cards/tables/forms/modals/drawers/toasts
- Save references: record product, screen name, and Mobbin link in the Decision Log.

3) Pattern selection and rationale
- Choose 2–3 patterns for each target area (e.g., filters: persistent sidebar vs. modal, tables: dense vs. comfy).
- Evaluate trade-offs: learnability, speed, complexity, accessibility, responsiveness.
- Decide primary pattern; note alternatives and when to switch (breakpoints, complexity threshold).

4) Translate into systemized building blocks
- Tokens (minimal at this stage): spacing scale (4/8 baseline), radius, elevation tiers, container widths.
- Components: PageHeader, TopNav/SideNav, Card, DataTable shell, Form primitives, Modal/Drawer, Toast, Skeleton.
- Templates: Dashboard, ListDetail, Settings, Auth.
- States: Standardize loading/empty/error frameworks.

5) Implementation notes (engineering-ready)
- Tailwind: reuse current palette and typography. Add only minimal tokens (spacing aliases, radii, shadows) if needed.
- Responsiveness: define breakpoints and layout switches (e.g., tabs on mobile, sidebar on desktop).
- Accessibility: keyboard focus order, visible focus, aria labels/roles, motion-reduced transitions.

6) Validation and iteration
- UX review against references: ensure the intent of patterns is preserved, not their look-and-feel.
- E2E smoke tests: navigation, responsive layouts, focus traps for modals/drawers.
- Usability checks: empty/error states clarity, discoverability of primary actions.

Checklists

Mobbin Research Checklist
- [ ] Goal and constraints documented
- [ ] 3–5 relevant Mobbin references collected
- [ ] Patterns summarized (structure, states, interactions, components)
- [ ] Rationale documented for primary/alternate patterns
- [ ] References cited in Decision Log

Implementation Readiness Checklist
- [ ] Tokens defined or confirmed (spacing, radius, elevation)
- [ ] Components list finalized for this iteration
- [ ] Templates mapped to routes/pages
- [ ] Accessibility criteria enumerated
- [ ] Test scenarios identified (E2E smoke)

Design QA Checklist
- [ ] Responsive behavior matches intended pattern switches
- [ ] Empty/loading/error states are consistent and helpful
- [ ] Focus and keyboard navigation verified
- [ ] No proprietary assets copied; visuals are original

Submission Artifacts
- Updated Decision Log entries
- Component/template mapping notes
- Screenshots for research only (kept in docs, not embedded in production UI)

Tips
- Prefer consistency over novelty; Mobbin patterns are valuable because they are learned.
- Bias towards few flexible templates rather than many one-offs.
- Defer heavy theming until core layout patterns are validated.