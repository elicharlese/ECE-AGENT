# Changelog

All notable changes to this project will be documented in this file.

## [v0.1.1] - 2025-08-24

Release focus: documentation and screenshots; curated linear history; minor runtime improvements (hotkeys, MCP proxy, LiveKit test).

Compare: https://github.com/elicharlese/ECE-AGENT/compare/v0.0.1...v0.1.1

### Features
- Global keyboard shortcuts (Command Palette, Hotkeys Provider, Shortcuts Help, useHotkeys)
  - paths: components/hotkeys/*, hooks/use-hotkeys.ts
- MCP GitHub proxy + streaming controls and tools panel
  - paths: app/api/mcp/github/*, services/mcp-service.ts, components/mcp/mcp-tools-panel.tsx, app/mcp-test/page.tsx
- Calls/LiveKit: token route clearer errors, test page, stabilized UIs
  - paths: app/api/livekit/token/route.ts, app/calls/test/page.tsx, components/calls/*, src/types/livekit.ts
- Accessible chat menus
  - paths: components/chat/AgentMenu.tsx, components/chat/ConversationMenu.tsx, integrations in chat windows
- Solana wallet linking + profile-service improvements
  - paths: components/user/user-profile.tsx, services/profile-service.ts, app/profile-test/page.tsx
- Hooks & Infra utilities (conversations/messages/realtime, feature flags, performance monitor, query client)
  - paths: hooks/use-*.ts, lib/*, styles/globals.css
- Services & shared types alignment
  - paths: services/*, src/types/*

### Fixes
- Database RLS policy corrections (non-recursive) and migrations
  - paths: server/db/migrations/004..009, fix-policies.sql

### Chore/Config
- Next/Vercel config refinements, Prisma schema, Supabase client/server gating
  - paths: next.config.mjs, prisma/schema.prisma, lib/supabase/*, lib/prisma.ts, tsconfig.json, package.json

### Documentation
- Patch docs and feature mapping/tracking
  - paths: docs/patches/*
- UI screenshots, sitemap, validation report
  - paths: docs/ui/**/* (PNGs), docs/ui/SITEMAP.md, docs/ui/VALIDATION_REPORT.md, docs/ui/sitemap.json

[v0.1.1]: https://github.com/elicharlese/ECE-AGENT/releases/tag/v0.1.1
