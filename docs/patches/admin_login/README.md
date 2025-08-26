# Admin Login

This feature covers secure authentication flows using Supabase and removal of dev-only bypasses.

## Mapped Patches

- patch-1: Initial authentication implementation (Supabase)
  - [Summary](../patch-1/PATCH1_SUMMARY.md) · [Checklist](../patch-1/PATCH1_CHECKLIST.md)
- patch-2: Enhanced authentication with multi-provider support
  - [Summary](../patch-2/PATCH2_SUMMARY.md) · [Checklist](../patch-2/PATCH2_CHECKLIST.md)
- patch-5: Security improvements and hardened production gating
  - [Summary](../patch-5/PATCH5_SUMMARY.md) · [Checklist](../patch-5/PATCH5_CHECKLIST.md)
- patch-6: Removal of dev-only admin login bypass
  - [Summary](../patch-6/PATCH6_SUMMARY.md) · [Checklist](../patch-6/PATCH6_CHECKLIST.md)

## Key Files

- `app/auth/page.tsx`
- `components/login-form.tsx`
- `lib/supabase/client.ts`
- `middleware.ts`

## Notes

- Environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are required.
- OAuth redirect must include `/auth/callback`.
