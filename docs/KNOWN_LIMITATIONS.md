# Known limitations

- Reference application audit is blocked without credentials.
- No Supabase project values are configured, so live sign-in, email delivery,
  migrations, and RLS integration tests cannot run locally.
- Authentication/RBAC code and isolated middleware tests are implemented, but
  production readiness requires applying both migrations and testing multiple
  real Auth users.
- Staff role reassignment, access reset, and the staff-management frontend are
  not yet implemented.
- CRM and later Phase 2 modules have not started because the prompt requires
  Authentication/RBAC to pass live RLS and end-to-end verification first.
- Phase 2B rechecked all seven Supabase/database variables; all are missing.
  Real JWT, multi-user RLS, private Storage, email recovery, and authenticated
  role-specific browser verification therefore remain blocked.
- Phase 2C received partial local configuration, but `DATABASE_URL` remains a
  placeholder, the direct migration dry-run could not connect, and Auth/REST
  reachability checks failed. No remote migration or seed was attempted.
