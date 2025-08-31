# ≥ 90% Test Coverage

Testing infrastructure and coverage targets.

## Mapped Patches

- patch-1: Initial tests
  - [Summary](../patch-1/PATCH1_SUMMARY.md) · [Checklist](../patch-1/PATCH1_CHECKLIST.md)
- patch-9: Testing expansion
  - [Summary](../patch-9/PATCH9_SUMMARY.md) · [Checklist](../patch-9/PATCH9_CHECKLIST.md)
- patch-12: Coverage improvements
  - [Summary](../patch-12/PATCH12_SUMMARY.md) · [Checklist](../patch-12/PATCH12_CHECKLIST.md)

## Recent Test Additions (2025-01-30)

- **Auth redirect tests**: Unit tests for `app/auth/page.tsx` redirect logic with Supabase session mocking
- **E2E auth flows**: Playwright tests for unauthenticated redirects and cookie-based fast-path
- **API connection testing**: Comprehensive test page at `/test` for all API endpoints

## Key Files

- `__tests__/**` - Jest unit tests
- `tests/e2e/**` - Playwright E2E tests
- `jest.config.js` - Jest configuration
- `jest.setup.ts` - Test setup and mocks
- `playwright.config.ts` - E2E test configuration
- `app/test/page.tsx` - Manual API testing interface

## Current Coverage Status

- Unit tests: 90 tests passing (21 suites)
- E2E tests: Auth redirect flows implemented
- API testing: Manual testing interface available at `/test`
- Missing: Comprehensive API endpoint unit tests, component interaction tests
