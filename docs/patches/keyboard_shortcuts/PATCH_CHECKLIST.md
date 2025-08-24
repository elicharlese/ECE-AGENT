# Patch Checklist — Keyboard Shortcuts

Feature directory: `docs/patches/keyboard_shortcuts/`

## Checklist

- [x] Problem identified
- [x] Solution designed
- [x] Code changes implemented
- [x] Documentation updated (patch + feature mapping)
- [ ] Tests updated/added (follow-up patch to add unit tests for `useHotkeys`)
- [x] Performance impact assessed (no material impact; minimal listeners)
- [x] Reviewed and approved

## Problem

Improve navigation and accessibility by adding global keyboard shortcuts (Command Palette, Help, and go-to sequences).

## Solution

- Reusable `useHotkeys` hook for registering single-combo hotkeys
- Global `HotkeysProvider` to attach listeners and manage key sequences (e.g., `g` `m`)
- Command Palette modal (Cmd/Ctrl+K)
- Shortcuts Help modal (Shift+?)

## Scope

- Non-invasive; wrapped globally in `app/providers.tsx`
- Skips inputs/contenteditable to avoid interfering with typing

## Files Changed

- `hooks/use-hotkeys.ts`
- `components/hotkeys/HotkeysProvider.tsx`
- `components/hotkeys/CommandPalette.tsx`
- `components/hotkeys/ShortcutsHelp.tsx`
- `app/providers.tsx`

## Shortcuts Implemented

- Cmd/Ctrl+K → Command Palette
- Shift+? → Shortcuts Help
- g m → `/messages`
- g h → `/`

## Validation

- Manual verification in dev build
- Fresh `next build` to ensure no type/bundle regressions

## Follow-ups

- Add unit tests for `useHotkeys` and provider sequence logic
- Expand Command Palette actions
