# Phase 2B environment check

Checked on 2026-07-28 without printing values.

| Variable | Status |
|---|---|
| SUPABASE_URL | Missing |
| SUPABASE_ANON_KEY | Missing |
| SUPABASE_SERVICE_ROLE_KEY | Missing |
| DATABASE_URL | Missing |
| DIRECT_URL | Missing |
| VITE_SUPABASE_URL | Missing |
| VITE_SUPABASE_ANON_KEY | Missing |

Only `.env.example` was detected. Docker and a globally installed Supabase CLI
are unavailable. The npm CLI package cannot start a local stack without Docker.
Environment mode remains Mode C.

Backend production validation requires backend Supabase/database values and now
rejects mismatched backend/frontend Supabase URLs. The browser source references
only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; administrative operations
remain server-side.
