# Phase 2 test report — 2026-07-28

| Check | Result | Detail |
|---|---|---|
| `npm run typecheck` | Passed | API and web strict TypeScript |
| `npm run lint` | Passed | Current repository lint script performs TypeScript verification |
| `npm run test` | Passed | 17 tests: API 12, web 5 |
| `npm run test:integration` | Partial | 12 local API tests passed; 2 real-JWT tests skipped |
| `npm run test:rls` | Blocked/skipped | 6 suites discovered; 9 live tests skipped without Supabase variables |
| `npm run test:e2e` | Passed locally | 3 browser tests |
| `npm run build` | Passed | API compile and Vite production build |
| Secret scan | Passed | No populated service-role, reference-password, or SMTP-password assignments |
| `npm run audit` | Failed | 2 high entries from GHSA-qwww-vcr4-c8h2; no published patched release |
| Supabase migration verification | Blocked | No configured Supabase project/Docker runtime |
| RLS integration tests | Blocked | Requires migrated test project and role-specific Auth users |
| Authenticated role E2E | Blocked | Requires provisioned Supabase users |

## Phase 2C rerun

Final results: 17 unit tests, 5 live JWT/staff integration tests, 9 live
RLS/Storage tests, and 6 Playwright tests passed. Typecheck, lint, build, and
secret scan passed. Recovery token/password mechanics passed, but hosted email
request/delivery remains blocked without an authorized test inbox. `npm run
audit` still fails with two high React Router advisory entries.

Build warnings concern client bundle size and ignored library-level `"use client"`
directives; neither failed the build. Authentication remains `Tested`, not
`Complete`, pending live Supabase and E2E checks.
