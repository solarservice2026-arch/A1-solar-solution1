# Security
Bearer tokens must be verified against Supabase on every protected API request.
Authorization is enforced in API middleware and RLS. Customer policies join to
the authenticated profile. Storage buckets for documents must be private and
served with short-lived signed URLs. Keep service-role, SMTP, reference, and
database credentials server-only. Audit authentication, permission, finance,
inventory, document, and settings events without storing secrets.
