# Landing + Auth Redesign Plan

Reference screenshot: `public/design/landing-auth-reference.png`

## Goals

- Unify landing (`/`) and auth (`/auth`) pages with a consistent, elegant aesthetic.
- Keep Three.js background (`ThreeHero`) as full‑screen canvas; remove Spline usage from the home hero.
- Apply glass surfaces, subtle grid/vignette, and brand gradients using Tailwind utilities.
- Maintain a11y, reduced‑motion, and performance best practices.

## Current State

- `/app/page.tsx` already uses `ThreeHero` full‑screen and overlay copy/CTAs.
- `components/hero/SplineHero.tsx` exists but is not used on `/`.

## Visual Language

- Background: deep navy gradient with soft vignette + subtle grid lines.
- Surfaces: frosted glass (translucent, backdrop‑blur, soft border, inner shadow optional).
- Accents: brand gradient text (indigo → fuchsia) and luminous gradient buttons.
- Micro‑interactions: gentle hover/lift, focus‑visible rings, reduced motion support.

## Tokens & Global Styles

1. Tailwind config (`tailwind.config.js`)
   - Add gradient tokens (e.g., `brand`, `brandSoft`, `panel`) and shadows.
2. Global CSS (`styles/globals.css`)
   - Add utility classes for vignette and grid overlays (CSS variables; prefers‑reduced‑motion safe).

## UI Building Blocks (components/ui)

- Backgrounds
  - `backgrounds/GridOverlay.tsx`: subtle lines + dots overlay, pointer‑events: none.
  - `backgrounds/Vignette.tsx`: radial vignette, darkens edges.
- Surfaces
  - `GlassCard.tsx`: rounded‑3xl, `bg-white/6 dark:bg-slate-900/40`, `backdrop-blur`, `border-white/20`.
- Typography
  - `GradientText.tsx`: wraps children with brand gradient text.
- Badges & CTAs
  - Reuse `Button` from `components/ui/button`. Add variants via className helpers if needed (`primary-gradient`, `glass`).
- Sections
  - `TrustLogos.tsx`: row of grayscale brand logos with opacity hover.
  - `HeroCopy.tsx`: title, subtitle, and CTA group.

## Page Compositions

- Landing: `components/apps/landing/LandingHero.tsx`
  - Layout: two‑column at lg, stacked on mobile.
  - Left: `HeroCopy` and CTAs.
  - Right: preview card (glass surface) or decorative element; background remains `ThreeHero`.
  - Background helpers: `GridOverlay`, `Vignette` stacked over `ThreeHero`.
- Auth: `components/apps/auth/AuthHero.tsx`
  - Same background stack as Landing.
  - Centered `GlassCard` containing `<LoginForm />` and a small headline.

## Implementation Steps

1. Remove Spline from home hero
   - Confirm `/app/page.tsx` imports only `ThreeHero` (already true).
   - Mark `components/hero/SplineHero.tsx` as deprecated; remove references.
2. Add background helpers
   - `backgrounds/GridOverlay.tsx`, `backgrounds/Vignette.tsx`.
3. Add `GlassCard.tsx` and `GradientText.tsx` atoms.
4. Compose sections
   - `TrustLogos.tsx`, `HeroCopy.tsx`.
5. Landing composition
   - Create `components/apps/landing/LandingHero.tsx` and swap into `/app/page.tsx` while keeping `ThreeHero` underneath.
6. Auth composition
   - Create `components/apps/auth/AuthHero.tsx` and wrap `<LoginForm />` in `/app/auth/page.tsx`.
7. Global polish
   - Update `styles/globals.css` with vignette/grid utilities.
   - Add Tailwind tokens/shadows in `tailwind.config.js`.
8. Accessibility & performance
   - Ensure backgrounds pause when tab hidden; respect `prefers-reduced-motion`.
   - Keep overlay elements `pointer-events-auto` and background `pointer-events` for icon interaction.
9. Cleanup
   - If unused across repo, remove `@splinetool/runtime` from deps and delete `SplineHero.tsx` in a follow‑up patch.

## Assets

- Drop the provided screenshot at `public/design/landing-auth-reference.png`.
- Place partner logos (optional) in `public/brands/` for `TrustLogos.tsx`.

## Testing

- E2E: landing hero renders, CTAs clickable, auth form visible inside glass card.
- Unit: `GlassCard`, `GridOverlay`, `Vignette` snapshot and a11y checks.

## Notes

- Keep changes TypeScript‑only and leverage existing UI primitives (e.g., `Button`).
- Avoid SSR errors by continuing dynamic imports for any canvas/3D work.
