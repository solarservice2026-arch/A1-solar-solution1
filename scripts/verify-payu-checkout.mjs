import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const api = process.env.ROLE_AUDIT_API_URL ?? "http://127.0.0.1:5000/api/v1";
const credentials = JSON.parse(
  fs.readFileSync(".auth/e2e-credentials.json", "utf8"),
);
const testUser = process.env.PAYU_TEST_USER ?? "CUSTOMER_A";
const auth = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
const { data, error } = await auth.auth.signInWithPassword(
  credentials[testUser],
);
if (error || !data.session) throw new Error("Customer login failed");
const headers = {
  authorization: `Bearer ${data.session.access_token}`,
  "content-type": "application/json",
};
const agreementsResponse = await fetch(`${api}/agreements`, { headers });
const agreementsBody = await agreementsResponse.json();
const unpaid = (agreementsBody.data ?? []).find(
  (row) => row.payment_status !== "Paid",
);
if (!unpaid) throw new Error("No tagged unpaid agreement fixture found");
const checkoutResponse = await fetch(
  `${api}/agreements/${unpaid.id}/payu-checkout`,
  { method: "POST", headers },
);
const checkoutBody = await checkoutResponse.json();
if (!checkoutResponse.ok)
  console.log(
    `Checkout initialization error: HTTP ${checkoutResponse.status} ${checkoutBody.message ?? "Unknown error"}`,
  );
const checkout = checkoutBody.data;
const required = [
  "key",
  "txnid",
  "amount",
  "productinfo",
  "firstname",
  "email",
  "phone",
  "surl",
  "furl",
  "hash",
];
const fieldsComplete = required.every((key) => Boolean(checkout?.fields?.[key]));
const saltProtected =
  checkout &&
  !Object.keys(checkout.fields ?? {}).some((key) =>
    key.toLowerCase().includes("salt"),
  );
const testMode = checkout?.action === "https://test.payu.in/_payment";
const hashShape = /^[a-f0-9]{128}$/.test(checkout?.fields?.hash ?? "");
const gatewayResponse = checkout
  ? await fetch(checkout.action, {
      method: "POST",
      redirect: "manual",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(checkout.fields),
    })
  : null;
const gatewayAccepted = Boolean(
  gatewayResponse && [200, 302, 303].includes(gatewayResponse.status),
);

const forgedCallback = await fetch(`${api}/payments/payu/callback`, {
  method: "POST",
  redirect: "manual",
  headers: { "content-type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    txnid: checkout?.fields?.txnid ?? "",
    status: "success",
    hash: "invalid",
  }),
});
const forgedBlocked =
  forgedCallback.status === 303 &&
  forgedCallback.headers.get("location")?.includes("payment=failed");

const passed =
  checkoutResponse.ok &&
  fieldsComplete &&
  saltProtected &&
  testMode &&
  hashShape &&
  gatewayAccepted &&
  forgedBlocked;

console.log(`Customer PayU checkout: ${checkoutResponse.ok ? "passed" : "failed"}`);
console.log(`Required checkout fields: ${fieldsComplete ? "configured" : "missing"}`);
console.log(`Merchant salt exposure: ${saltProtected ? "blocked" : "failed"}`);
console.log(`PayU environment: ${testMode ? "test" : "incorrect"}`);
console.log(`SHA-512 request hash: ${hashShape ? "configured" : "failed"}`);
console.log(`PayU test gateway form: ${gatewayAccepted ? "accepted" : "rejected"}`);
console.log(`Forged success callback: ${forgedBlocked ? "blocked" : "failed"}`);
console.log(`PayU integration verification: ${passed ? "passed" : "failed"}`);

if (!passed) process.exitCode = 1;
