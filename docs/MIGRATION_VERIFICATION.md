# Migration verification

| Migration | Applied | Objects/policies | Verification query | Result |
|---|---|---|---|---|
| `202607280001_initial.sql` | Applied | Core tables, triggers, initial RLS | Remote migration/table/index inspection | Passed |
| `202607280002_auth_rbac.sql` | Applied | Permission seed, Auth triggers, RBAC RLS | Remote migration history and live JWT/RLS suites | Passed |
| `202607280003_private_storage.sql` | Applied | Private bucket, Storage policies, remaining exposed-table RLS | Live anonymous/path-denial Storage tests | Passed |

Source inspection confirms ordered filenames, UUID keys, foreign keys, unique and
check constraints, and conflict-safe role/permission/bucket seeds. Actual
application, trigger ownership, repeat execution, and policy behavior cannot be
claimed until a test database is available.

Useful verification query:

```sql
select schemaname, tablename, rowsecurity from pg_tables where schemaname='public';
select schemaname, tablename, policyname, cmd from pg_policies order by 1,2,3;
select tgname, tgrelid::regclass from pg_trigger where not tgisinternal;
```
