import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const api =
  process.env.ROLE_AUDIT_API_URL ??
  "https://a1-solor-solution.vercel.app/api/v1";
const label = process.env.PAYU_TEST_USER ?? "CUSTOMER_B";
const credentials = JSON.parse(
  fs.readFileSync(".auth/e2e-credentials.json", "utf8"),
);
const auth = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
const { data, error } = await auth.auth.signInWithPassword(credentials[label]);
if (error || !data.session) throw new Error("Tagged customer login failed");

const headers = {
  authorization: `Bearer ${data.session.access_token}`,
  "content-type": "application/json",
};
const response = await fetch(`${api}/agreements`, { headers });
const body = await response.json();
if (!response.ok) throw new Error("Unable to list tagged agreements");

for (const agreement of body.data ?? []) {
  if (agreement.payment_status === "Paid") continue;
  const checkoutResponse = await fetch(
    `${api}/agreements/${agreement.id}/payu-checkout`,
    { method: "POST", headers },
  );
  const checkoutBody = await checkoutResponse.json();
  console.log(
    `${agreement.agreement_number}: HTTP ${checkoutResponse.status} - ${
      checkoutResponse.ok
        ? "checkout configured"
        : checkoutBody.message ?? "checkout failed"
    }`,
  );
}
