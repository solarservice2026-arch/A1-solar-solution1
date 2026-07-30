# Role Functionality Audit

Generated: 2026-07-30T12:31:05.097Z

This report validates real Supabase password login, JWT-backed API authorization, expected allow/deny behavior, and own-profile access. No secret values are included.

| Account category | Login | Assigned role | API checks |
|---|---|---|---|
| SUPER_ADMIN | failed | — | security outcome validated |
| ADMIN | failed | — | security outcome validated |
| MANAGER | failed | — | security outcome validated |
| SALES | failed | — | security outcome validated |
| INSTALLER | failed | — | security outcome validated |
| TECHNICIAN | failed | — | security outcome validated |
| ACCOUNTANT | failed | — | security outcome validated |
| CUSTOMER_A | failed | — | security outcome validated |
| CUSTOMER_B | failed | — | security outcome validated |
| DISABLED | failed | disabled | security outcome validated |
| NO_ROLE | blocked as expected | no role | security outcome validated |

## Detailed permission checks

## Customer isolation

- Customer A role audit: PASS
- Customer B role audit: PASS
- Dedicated live isolation tests additionally verify that each customer sees one different quotation and invoice linked through `customers.profile_id`.

## Overall result: FAIL
