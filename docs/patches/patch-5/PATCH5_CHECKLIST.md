# Patch 5 Checklist — Chat UI Modernization (Professional Theme)

## Summary
Apply a professional, sleek theme to the chat experience with consistent design tokens, refined components, and a11y/performance safeguards. Targets `components/chat/*` and shared primitives.

## Features to Implement
- [ ] Theme tokens
  - [ ] Color palette (light/dark), radii, spacing, elevation, opacity, durations
  - [ ] Typography scale and weights; tighten leading/letter-spacing for headers
  - [ ] Tailwind config utilities for tokens (no inline styles)
- [ ] Chat surfaces
  - [ ] Conversation list: density controls, active/hover states, unread badges
  - [ ] Header/Toolbar: compact layout, icon buttons, focus-visible rings
  - [ ] Message bubbles: modern shape, subtle shadows, timestamps, status ticks
  - [ ] Composer: input affordances, attachment/actions bar, send button states
  - [ ] Menus/Popovers/Context actions: tidy spacing, motion, contrast
  - [ ] Thread/Sidebar panels: consistent tokens + responsive breakpoints
- [ ] Interactions & Motion
  - [ ] Hover/press/focus micro-interactions with reduced motion fallback
  - [ ] Smooth entrance/exit for messages and menus (Tailwind animate)
- [ ] Accessibility
  - [ ] WCAG AA contrast, keyboard navigation, focus-visible rings
  - [ ] Screen reader labels for key actions
- [ ] Theming
  - [ ] Dark/light parity, prefers-color-scheme support
  - [ ] Feature flag to toggle new theme (for safe rollout)

## Implementation Plan
1) Tokens: extend Tailwind, export token vars, document usage in `docs/`
2) Refactor shared primitives (buttons, inputs, badges) to consume tokens
3) Update `components/chat/*` surfaces one-by-one; keep PRs small
4) Add `libs/ui` snapshot tests for primitives; update unit tests where needed
5) Add/adjust E2E for chat flows (send msg, switch thread, open menu)
6) Perf checks (no regressions in FCP/TTI), a11y audit, dark/light audit

## Tests to Write
- [ ] Unit: tokenized primitives (buttons, inputs, menu, badge)
- [ ] Unit: message bubble variants (mine/theirs, status, timestamp)
- [ ] Integration: composer actions, menu accessibility (keyboard)
- [ ] E2E: primary chat flows remain green; visual snapshot for key screens
- [ ] Coverage ≥ 90% for modified files (enforce in CI)

## Default CLI Flags (non-interactive)
- Nx Init:

```
npx create-nx-workspace … --preset=react-ts --appName=web --style=css \
  --defaultBase=main --no-interactive
```

- Expo App:

```
nx g @nx/expo:app mobile --no-interactive
```

## Acceptance Criteria
- Consistent tokens across chat components with no inline styles
- Modern visuals for bubbles/composer/toolbar lists; polished focus states
- Dark/light parity and WCAG AA contrast
- E2E + visual snapshot coverage; ≥90% test coverage for modified files
- No perf regressions; feature flag allows rollback
