# Phase 2 gap analysis

Reviewed on 2026-07-28. The public website is preserved. The reference system
remains blocked because credentials are unavailable.

| Module | Existing implementation | Missing backend | Missing frontend | Missing database/RLS | Missing tests | Dependencies / order |
|---|---|---|---|---|---|---|
| Authentication/RBAC | Roles, profiles and role joins; static login surface | Token verification, profile context, permission middleware, staff management | Session provider, recovery/reset, guards, forbidden/unauthorized pages | Permission seed, helper policies, login metadata, safe staff RPC | Auth and permission integration tests | First |
| Application shell | Public header/footer | Notifications later | Authenticated sidebar/top bar/breadcrumbs/error boundary | None for basic shell | Route guard tests | After auth |
| Leads/CRM | Core lead table and shared create schema | CRUD/workflows/transactional conversion | List/forms/detail/timeline | Assignment policies and conversion columns | Lifecycle/visibility | After shell |
| Customers | Customer/address tables and limited read RLS | CRUD/summary/timeline/export | List/forms/detail tabs | Staff policies and activity model | Isolation and lifecycle | After leads |
| Products/Inventory | Product and transaction tables | Controlled ledger workflows | Product/inventory pages | RLS, warehouses, concurrency function | Stock rules | After customers |
| Quotations | Header/items tables | Calculations, state machine, versions, PDF | Line items and approval UI | Versions/RLS | Finance and transitions | After inventory |
| Projects onward | Core project/finance/service/document tables | Full services and workflows | Operational pages | Expanded normalized tables/RLS | Full workflows | Strictly after quotations |

## Authentication findings

- Backend currently has no authentication or authorization middleware.
- Frontend does not instantiate Supabase or restore a session.
- Existing `has_role` checks only selected roles and no granular permissions.
- Several tables are exposed without RLS enabled.
- No Super Admin protection, staff invitation service, last-login field, or
  permission seed exists.
- Environment validation currently permits an unconfigured production API.

Implementation will extend the current architecture rather than create a second
authentication system.
