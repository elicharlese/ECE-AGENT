---
title: Unified Dark Mode Theming - Checklist
created: 2025-01-09
---

# Unified Dark Mode Theming - Patch Checklist

## Summary

Unify dark mode implementation across mobile and desktop platforms by replacing the mobile-specific LightDim component with a consistent theming solution using a cross-platform theme API.

## Feature List

- [ ] ✅ Cross-platform native theme provider implementation
- [ ] ✅ React Native theme tokens (light/dark) 
- [ ] ✅ Native theme toggle component with system/light/dark modes
- [ ] ✅ Mobile app integration with unified theme provider
- [ ] ✅ Theme-aware UI components using tokens
- [ ] ✅ StatusBar dynamic styling based on theme
- [ ] ✅ Code block theming for readability in both modes
- [ ] ✅ Removal of mobile-specific LightDim usage
- [ ] ✅ Shared-ui library exports for cross-platform reuse
- [ ] ✅ TypeScript path alias integration (@ece-agent/shared-ui)

## Implementation Plan

### Phase 1: Native Theme Infrastructure ✅
- [x] Create `libs/shared-ui/src/theme/native/tokens.ts` with light/dark color tokens
- [x] Implement `libs/shared-ui/src/theme/native/Provider.tsx` with React context
- [x] Add `libs/shared-ui/src/theme/native/ThemeToggle.tsx` component
- [x] Export native theme components from shared-ui index

### Phase 2: Mobile Integration ✅  
- [x] Wrap mobile app with `RNThemeProvider`
- [x] Replace hardcoded colors with theme tokens
- [x] Add theme toggle to mobile UI
- [x] Update StatusBar styling dynamically
- [x] Theme code blocks for proper contrast

### Phase 3: Code Quality & Documentation ✅
- [x] Fix lint warnings (unescaped apostrophes)
- [x] Use TypeScript path aliases for clean imports
- [x] Ensure all containers use themed backgrounds
- [x] Document architecture and API

## Tests to Write

- [ ] Unit tests for native theme provider context
- [ ] Theme toggle component behavior tests  
- [ ] Token resolution tests (system/light/dark)
- [ ] Mobile app theme integration tests
- [ ] Cross-platform theme consistency tests

## Performance Impact

- ✅ Minimal impact - uses React context efficiently
- ✅ Theme tokens cached via useMemo
- ✅ No unnecessary re-renders with proper context structure

## Notes & Links

- Follows next-themes pattern but tailored for React Native
- Desktop/web continues using next-themes for consistency
- Theme tokens use hex colors suitable for React Native styling
- LightDim component remains web-only (not removed, just unused on mobile)
- Supports theme persistence (can be added with AsyncStorage later)

## Related Files

- `libs/shared-ui/src/theme/native/Provider.tsx`
- `libs/shared-ui/src/theme/native/tokens.ts` 
- `libs/shared-ui/src/theme/native/ThemeToggle.tsx`
- `libs/shared-ui/src/theme/types.ts`
- `mobile/src/app/App.tsx`
- `tsconfig.base.json` (path aliases)

## END_GOAL.md Mapping

✅ **Mobile + desktop exhibits consistent design** - Unified theming ensures visual consistency across platforms while respecting platform-specific patterns.
