# Authentication email verification

Recovery redirects must target `/reset-password` on an allow-listed frontend
origin. Local verification should use Supabase mail capture: request recovery,
open the captured link, confirm a recovery session reaches the reset page,
change the password, verify the old password fails, and verify the new password
succeeds.

For hosted testing, use dedicated test inboxes and Supabase's default test email
provider unless secure custom SMTP is explicitly required. Never use the owner's
personal email password.

Phase 2C verified recovery redirect, one-time token exchange, password change,
old/new login behavior, and token-reuse rejection through a tagged user. Hosted
email request/delivery remains blocked because Supabase rejects reserved
fictional domains and no authorized test inbox is configured.
