# Database plan

The normalized PostgreSQL schema uses UUID keys, constrained statuses, foreign
keys, timestamps, indexes, transactional ledgers, and RLS. Inventory is derived
from immutable transactions. Financial records are cancelled/reversed rather
than deleted. Private document objects live in Supabase Storage; PostgreSQL
stores metadata only.

The first migration implements the security/RBAC foundation and core CRM,
quotation, project, finance, service, inventory, notification, and audit
entities. Further workflow-specific columns should be added with forward-only
migrations after owner acceptance testing.
