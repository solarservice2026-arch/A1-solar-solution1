# A1 Solar Full System Audit

## Result

The live role and security audit passes for all configured account categories.

- 11 account categories authenticated or were denied as designed.
- 80 API authorization and own-profile outcomes passed.
- 17 unit tests passed.
- 5 live JWT/staff integration tests passed.
- 9 live RLS/private Storage tests passed.
- 6 authenticated browser E2E tests passed.
- Typecheck, production build, and secret scan passed.

## Role coverage

| Role/category | Validated behavior |
|---|---|
| Super Admin | Full dashboard, business modules, staff, roles, settings, profile |
| Admin | Business administration and staff/role reads according to permissions |
| Manager | Dashboard, leads, customers, quotations, projects, reports |
| Sales Executive | Dashboard, lead/customer and quotation workflow |
| Installation Staff | Dashboard, assigned project/document workflow permissions |
| Service Technician | Dashboard, ticket/document workflow permissions |
| Accountant | Dashboard, customers, invoices, payments, expenses, reports |
| Residential Customer | Own dashboard, quotation, invoice, project and ticket data |
| Commercial Customer | Own dashboard, quotation, invoice, project and ticket data |
| Disabled User | Valid credentials rejected by backend account-status gate |
| No-role User | Authentication succeeds but protected business access is denied |

Detailed endpoint-by-endpoint evidence is in
[`ROLE_FUNCTIONALITY_AUDIT.md`](ROLE_FUNCTIONALITY_AUDIT.md).

## Security coverage

- Real Supabase password login and JWT validation
- Active/disabled account enforcement
- Effective permission loading
- Expected allow/deny API behavior
- Self-role-elevation prevention
- Protected Super Admin account behavior
- Customer-to-customer data isolation
- Private Storage negative access checks
- Secret scan

## Repository structure

```text
apps/
  api/                 Express API, auth and business routes
  web/                 React portal and public website
packages/
  validation/          Shared validation contracts
supabase/
  migrations/          Versioned database/RBAC/Storage migrations
scripts/               Repeatable environment, seed and audit automation
tests/
  e2e/                 Authenticated browser checks
  integration/         Real JWT and staff workflow checks
  rls/                 Live RLS and private Storage checks
docs/
  quality/             Current audit evidence
  archive/phases/      Historical phase reports
  README.md            Documentation index
reference-assets/      User-provided visual references
```

## Document decision

No `.docx` files exist in the repository. The `docs/` directory contains
Markdown operational and security evidence and should not be deleted.
Historical phase documents were moved to `docs/archive/phases/`.

## Remaining production note

The existing dependency security report records an upstream React Router
advisory. A fresh external npm registry audit was not performed during this
run because it requires explicit approval to send dependency metadata to npm.
