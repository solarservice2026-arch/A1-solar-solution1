# Supabase test setup

## Mode detection

This machine is in Mode C: Docker is unavailable and no hosted test-project
variables are configured. The repository nevertheless supports either mode.

## Local mode

Install Docker Desktop and Supabase CLI, then run:

```powershell
npx supabase start
npx supabase db reset
npx supabase status
```

Copy the local URL and anonymous/service keys into a local `.env` only. Configure
the web values with the local URL and anonymous key. Supabase Studio includes a
local mail-capture interface for recovery-email testing.

## Hosted test mode

Use a dedicated non-production Supabase project. Set backend `SUPABASE_URL`,
`SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, and
`DIRECT_URL`; set frontend `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
Never put the service-role key in a `VITE_` variable. Add
`http://localhost:5173/reset-password` and the test deployment reset URL to Auth
redirect allow-lists.

Apply migrations with `npx supabase db push`. Provision tagged users with
`npm run test:users:seed`, run `npm run test:rls` and `npm run test:e2e`, then
remove only tagged users with `npm run test:users:cleanup`.

## Email and cleanup

Local mode uses mail capture. Hosted mode uses test inboxes listed in the E2E
environment variables; no personal email password is needed. After verification,
clean up E2E users, private test objects, and fictional records, then rotate any
temporarily shared test keys.
