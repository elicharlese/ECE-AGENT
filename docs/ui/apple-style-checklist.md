# Apple-inspired UI/Brand Consistency Checklist

This checklist distills Apple’s App Store Marketing Guidelines and HIG-aligned motion/feedback principles into actionable steps for our existing web/mobile/desktop apps.

Sources
- App Store Marketing Guidelines (Badges, Product Images, Messaging, Legal): https://developer.apple.com/app-store/marketing/guidelines/#section-badges
- App Store Marketing Tools (localized badges/embeds/QR): https://tools.applemediaservices.com/app-store/
- Apple Trademark List: https://www.apple.com/legal/intellectual-property/trademark/appletmlist.html

Note: Keep “App Store” in English even in localized badges. Use Apple-provided artwork only; do not modify or animate badges or product images.

## A. App Store Badges (Web + Print)

- [ ] Preferred badge is black; use white only if black is visually heavy and it’s the single badge in layout. Do not animate/angle/modify the badge.
- [ ] Use exactly one App Store badge per layout or video; place it subordinate to primary imagery/message. When mixing platform badges, place the App Store badge first.
- [ ] Maintain minimum clear space = 1/4 badge height (or 1/10 for very limited layouts). Keep other elements outside this area.
- [ ] Minimum size: 40px height onscreen, 10mm in print. Ensure adequate legibility while not dominant.
- [ ] Use localized badge artwork via Marketing Tools; keep the service mark “App Store” in English (never translate it).
- [ ] If using a pre-order campaign, swap “Pre-order on the” badge to “Download on the” after release.
- [ ] Link badges using the Marketing Tools deep-link/short-link (icon, badge, or QR). Don’t copy assets from apple.com pages.
- [ ] Never use the Apple logo in place of the word “Apple.” Never show a standalone Apple logo.

Implementation targets in repo
- [ ] `components/ui/MobileStoreBadges.tsx`: Ensure we render the preferred black badge by default, fallback to white when visually required, and use localized assets from the Marketing Tools.
- [ ] `components/apps/landing/LandingHero.tsx`: Verify badge placement, spacing (clear space), and only a single App Store badge appears per layout.
- [ ] `public/` assets: Remove any non-canonical or modified badge images; store only unaltered Apple-provided assets if we keep local copies.

## B. Product Images (Device Bezels & Screen Content)

- [ ] Use Apple-provided product bezels only; do not crop, tilt, add shadows/reflections, or animate devices. Maintain correct relative scale across devices.
- [ ] Minimum device size: ≥200px height onscreen (≥25mm in print). Ensure legibility at provided resolution.
- [ ] Don’t render 3D simulations or generic devices that mimic Apple-specific details (Home button, sensor housing, switches, etc.).
- [ ] Screen content must show the app as it actually runs on the latest OS. Don’t display blank screens.
- [ ] Status bar for iPhone/iPad should show full network/Wi‑Fi/battery; may include 5G when applicable.
- [ ] Push notifications: show only a single notification on the lock screen; if tapped, it must open the app; don’t show Home Screen.
- [ ] Home Screen: only show widgets if our app supports them and no 3rd‑party content is depicted.
- [ ] Mac screenshots: add our app icon to the Dock and customize menu bar titles appropriately.

Implementation targets in repo
- [ ] `components/apps/landing/LandingHero.tsx`: Audit device mockups; replace any custom/modified frames with Apple-provided bezels. Ensure status bar conventions in static imagery.
- [ ] `public/` marketing images: Re-export screenshots conforming to latest OS UI and the single-notification rule when shown.

## C. Messaging, Naming, and Language

- [ ] Focus copy on our app and its value, not Apple product features. Always include a clear CTA to download.
- [ ] Refer to supported products precisely: “App name for iPhone, iPad, and Mac,” or “works with/compatible with …”. Don’t say “iPhone app name.”
- [ ] Use correct Apple product capitalization per trademark list: iPhone, iPad, iPod touch, MacBook Air, MacBook Pro, iMac, Apple Watch, Apple TV, Apple Vision Pro, App Store.
- [ ] Keep Apple trademarks in English in all locales (don’t translate “App Store”, “Apple Pay”, etc.).
- [ ] When listing other platforms, list Apple first and never show Apple devices alongside competitor devices in imagery.
- [ ] URLs must not start with Apple trademarks (acceptable: company.com/app/iphone; not acceptable: iphoneapp.com).

Implementation targets in repo
- [ ] `components/apps/landing/LandingHero.tsx` and marketing copy: Verify naming and capitalization rules; ensure CTA and accurate device support listing.
- [ ] `docs/` site content and any README marketing sections: Fix naming/capitalization and URL language.

## D. Legal Requirements

- [ ] In U.S.-only communications, include the appropriate ™/℠/® symbol the first time an Apple trademark appears in body copy (not in headlines, not on the badge artwork).
- [ ] Include Apple credit lines once per site or communication near other legal copy (e.g., footer or legal page). Example format (U.S.): “___ and ___ are registered trademarks of Apple Inc.”
- [ ] Don’t imply association/endorsement by Apple. Use badges and product images only as permitted.

Implementation targets in repo
- [ ] `app/(site)/layout.tsx` or site footer component: Add a small legal section and Apple credit lines where applicable.
- [ ] `public/` and `components/ui/MobileStoreBadges.tsx`: Ensure no modified badge art and correct alt text (e.g., “Download on the App Store”).

## E. Motion, Microinteractions, and Haptics (HIG-aligned)

Principles
- [ ] Motion serves meaning: use animations to indicate hierarchy, transitions, and feedback—not decoration.
- [ ] Fast and smooth: target 60fps; keep typical UI transitions ~200–400ms; prefer transform/opacity animations (GPU-friendly) over layout-affecting properties.
- [ ] Respect user settings: honor Reduced Motion at OS/browser level; provide less‑motion variants or disable non-essential motion when requested.
- [ ] Subtlety over spectacle: microinteractions should be brief, context-aware, and not distract from content.

Haptics (Mobile)
- [ ] Use light impact on taps and toggles; use success/notification haptics on confirmations; use warning/error haptics sparingly.
- [ ] Centralize haptic calls behind a hook/service to avoid overuse and to gate by platform and user preference.

Implementation targets in repo
- [ ] `hooks/use-haptics.ts`: Audit mappings (light/medium/heavy, success/warning/error). Respect user “reduced haptics”/settings if present.
- [ ] UI interactions across `components/chat/*`, `components/agents/*`, `components/apps/landing/*`: Add subtle microinteractions (e.g., button tap ripple/scale, list reordering, drawer opening) using transform/opacity and honor `prefers-reduced-motion`.
- [ ] `styles/globals.css` and Tailwind config: Ensure motion-safe utilities are available; define reduced-motion variants if needed.

## F. Performance & Delivery

- [ ] Keep interactions snappy: prefetch assets for above‑the‑fold sections; lazy‑load heavy components (already using next/dynamic in areas—extend consistently).
- [ ] Use Next/Image for marketing imagery where possible; ship correctly sized images and modern formats; avoid layout shifts.
- [ ] Avoid costly CSS effects (e.g., large blurs) on scroll; prefer transform/opacity.

## G. QA Checklist (Per Page/Component)

For each marketing or app page that shows Apple badges/devices:
- [ ] Exactly one App Store badge, preferred black, correct size and clear space.
- [ ] Badge links to correct App Store product via Marketing Tools.
- [ ] Only Apple-provided bezels; no modified/angled/animated devices.
- [ ] Screenshots show latest OS UI; status bar and notification rules followed.
- [ ] Messaging follows naming/capitalization rules; includes CTA.
- [ ] Trademark symbol (U.S.) appears first instance in body copy; credit lines present in legal area.
- [ ] Animations are purposeful, performant, and reduced-motion aware; haptics mapped appropriately on mobile.

## Next Steps (Proposed)

- [ ] Replace/validate badge artwork and linking in `components/ui/MobileStoreBadges.tsx` via Marketing Tools.
- [ ] Audit `LandingHero.tsx` for bezel accuracy, spacing, and single-badge rule; update imagery in `public/`.
- [ ] Add/verify Apple credit lines in site footer and ensure U.S.-only ™/® symbol usage in body copy where applicable.
- [ ] Add reduced-motion variants and consolidate motion tokens/utilities in Tailwind; refine microinteractions on key buttons/menus.
- [ ] Review `hooks/use-haptics.ts` for consistent mapping and user setting overrides.
