# Phase 2A checklist

| Task | Required | Current status | Evidence | Blocker |
|---|---|---|---|---|
| Supabase environment validation | Yes | Implemented locally | Production Zod validation and 3 passing tests | Live values absent |
| Migration application | Yes | Blocked | Migration source exists | Supabase mode not yet detected |
| Auth database trigger verification | Yes | Blocked | Trigger migration exists | Requires migrated database |
| Permission seed verification | Yes | Blocked | Idempotent inserts exist | Requires migrated database |
| Role seed verification | Yes | Blocked | Seed uses conflict handling | Requires migrated database |
| RLS policy verification | Yes | Blocked | Policy matrix exists | Requires authenticated test users |
| Storage policy verification | Yes | Blocked | Private bucket/policies in migration 003 | Requires migrated database |
| Role-specific test users | Yes | Blocked | Tagged seed/cleanup scripts implemented | Test infrastructure required |
| Authentication API tests | Yes | Partial | Real Express chain tests pass; provider is substituted | Real JWT integration required |
| Authentication UI tests | Yes | Partial | 3 Playwright public/guard tests pass | Role-specific authenticated tests require test users |
| Password-recovery email verification | Yes | Blocked | Recovery UI implemented | Mail capture/test project required |
| Staff-management completion | Yes | Implemented | APIs and `/staff`/`/roles` UI with protections/audit | Live workflow verification blocked |
| Dependency audit remediation | Yes | Unresolved | Report documents 7.18.1 advisory and rejected downgrade | No patched registry release |
| Production build | Yes | Passed | `npm run build` after Phase 2A changes | Bundle-size warning only |
| Secret scan | Yes | Passed | `npm run secret:scan` | — |
| Final completion report | Yes | Complete | `PHASE_2A_COMPLETION_REPORT.md` | — |

Phase 2B environment recheck produced the same Mode C result. Two real-JWT tests
and nine focused RLS/Storage tests now exist and explicitly skip—not pass—when
the required test environment is unavailable.
