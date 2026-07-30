import { createClient } from "@supabase/supabase-js";

const admin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
const { data: role, error: roleError } = await admin
  .from("roles")
  .select("id")
  .eq("name", "customer")
  .single();
if (roleError) throw roleError;
const { data: permissions, error: permissionError } = await admin
  .from("permissions")
  .select("id")
  .in("key", ["payments:view", "payments:create"]);
if (permissionError) throw permissionError;
const { error } = await admin.from("role_permissions").upsert(
  permissions.map((permission) => ({
    role_id: role.id,
    permission_id: permission.id,
  })),
);
if (error) throw error;
console.log("Customer PayU permissions: configured");
