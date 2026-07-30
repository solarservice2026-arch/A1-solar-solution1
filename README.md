# A1 Solar Solution Platform

Production-oriented monorepo for A1 Solar Solution: a responsive public website,
CRM, customer/staff portals, REST API, and Supabase PostgreSQL schema.

## Stack

React, Vite, TypeScript, Express, Zod, Supabase Auth/PostgreSQL/Storage, Vitest,
Supertest, and Playwright.

## Quick start

1. Copy `.env.example` to `.env` and add your own Supabase project values.
2. Run `npm install`.
3. Run `npm run db:migrate`, then `npm run db:seed`.
4. Run `npm run dev`.

The web app runs at `http://localhost:5173`; the API defaults to
`http://localhost:5000/api/v1`. Never expose the service-role key to the web app.

## Commands

`npm run dev`, `npm run build`, `npm run lint`, `npm run typecheck`,
`npm run test`, `npm run test:e2e`, `npm run db:migrate`, `npm run db:seed`.

## Workspace

- `apps/web` — public site and portals
- `apps/api` — versioned REST API
- `packages/validation` — shared Zod contracts
- `supabase` — migrations, RLS, and fictional seed data
- `docs` — audit, architecture, security, and operations

Development users must be created through Supabase Auth; seed data never includes
passwords. Start with `docs/README.md`, then see `docs/SUPABASE_SETUP.md` and
`docs/SECURITY.md`.
