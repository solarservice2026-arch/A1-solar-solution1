# Pre-migration review

Target: no project selected because Supabase test infrastructure is unavailable.
No database command was executed.

| Migration | Purpose | Dependencies | Destructive operations | RLS changes | Storage changes | Safe to apply to test |
|---|---|---|---|---|---|---|
| `202607280001_initial.sql` | Core roles and business schema | Supabase Auth schema, pgcrypto | None | Initial business/customer policies | None | Yes, after backup |
| `202607280002_auth_rbac.sql` | Permissions, mappings and Auth lifecycle triggers | Migration 001 | Replaces two named Auth triggers using `DROP TRIGGER IF EXISTS`; no data deletion | Enables RBAC-table RLS | None | Yes, after confirming trigger ownership |
| `202607280003_private_storage.sql` | Private document bucket and remaining exposed-table policies | Migrations 001–002 and Storage schema | None | Enables product/inventory/related RLS | Creates/updates private bucket and policies | Yes on a dedicated test project |

The trigger replacement is intentional and scoped by exact trigger names. No
`TRUNCATE`, table drop, column drop, or unrestricted data deletion exists.
Before applying to a populated test project, create a schema/data backup and
record the Supabase project reference—not credentials.
