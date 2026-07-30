# Video/PDF Addendum Implementation Report

Date: 2026-07-29

## Implemented

- Enforced backend account hierarchy during invitations and role assignment.
- Super Admin can grant Admin and lower roles, but cannot grant Super Admin
  through ordinary user management.
- Admin can grant only operational roles.
- Admin cannot edit, disable, or change roles for Admin/Super Admin targets.
- Self privilege changes remain blocked.
- Staff invitation UI now displays only roles the current actor may assign.
- Customer accounts can be invited through the validated user workflow.
- Added account archive metadata and explicit Admin/user lifecycle permissions.
- Added versioned agreement template, agreement document, signature path,
  finalized snapshot, storage path, and SHA-256 metadata schema.
- Added customer-isolated Agreement RLS policies.
- Added immutable quotation document snapshot metadata.
- Synchronized ignored frontend public Supabase configuration with backend.
- Applied migration `202607290001_account_hierarchy_documents.sql` to the
  confirmed test project.
- Added a structured two-page A4 quotation print/PDF renderer using live
  customer, line-item, tax and quotation data.
- Added a structured three-page PM Surya Ghar consumer/vendor Agreement
  renderer.
- Added the Agreement list/create API, protected route, navigation and UI.
- Added and applied an idempotent default versioned Agreement template
  migration.
- Development web and API servers were started and health checked.

## Verification evidence

- Migration dry-run: passed.
- Migration apply: passed.
- Typecheck: passed.
- API unit tests: 12 passed.
- Real JWT/staff integration tests: 5 passed.
- Live RLS/Storage tests: 9 passed.
- Production build: passed.
- Secret scan: passed.
- API health endpoint: HTTP 200.
- Web application: HTTP 200.

## Not yet complete

- Finalize/amend/signed-URL document APIs are not yet implemented.
- PDF snapshot/hash and private file workflows still require end-to-end tests.
- Authenticated Playwright coverage for the new document workflows is pending.
- Dependency audit could not reach the npm audit endpoint in the restricted
  execution environment.

The addendum must not be marked complete until these remaining document gates
are implemented and pass live tests.
