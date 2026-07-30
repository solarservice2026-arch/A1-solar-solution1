import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const api = process.env.ROLE_AUDIT_API_URL ?? "http://127.0.0.1:5000/api/v1";
const credentials = JSON.parse(
  fs.readFileSync(".auth/e2e-credentials.json", "utf8"),
);

async function sessionFor(label) {
  const client = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data, error } = await client.auth.signInWithPassword(
    credentials[label],
  );
  if (error || !data.session) throw new Error(`${label} login failed`);
  return data.session.access_token;
}

const salesToken = await sessionFor("SALES");
const productsResponse = await fetch(`${api}/products`, {
  headers: { authorization: `Bearer ${salesToken}` },
});
const productsBody = await productsResponse.json();
const products = productsBody.data ?? [];
const completeProduct = products.find(
  (product) =>
    product.id &&
    product.name &&
    product.category &&
    product.selling_price !== null &&
    product.tax_rate !== null,
);

const customerToken = await sessionFor("CUSTOMER_A");
const customerMe = await fetch(`${api}/auth/me`, {
  headers: { authorization: `Bearer ${customerToken}` },
});
const customerMeBody = await customerMe.json();
const canCreateAgreement =
  customerMeBody.data?.permissions?.includes("agreements:create") ?? false;
const forbiddenCreate = await fetch(`${api}/agreements`, {
  method: "POST",
  headers: {
    authorization: `Bearer ${customerToken}`,
    "content-type": "application/json",
  },
  body: JSON.stringify({}),
});

const passed =
  productsResponse.ok &&
  Boolean(completeProduct) &&
  customerMe.ok &&
  !canCreateAgreement &&
  forbiddenCreate.status === 403;

console.log(`Sales role login: ${salesToken ? "passed" : "failed"}`);
console.log(`Product lookup: ${productsResponse.ok ? "passed" : "failed"}`);
console.log(`Complete product mapping: ${completeProduct ? "passed" : "failed"}`);
console.log(
  `Customer agreement permission: ${!canCreateAgreement ? "download-only" : "incorrect"}`,
);
console.log(
  `Customer agreement create API: ${forbiddenCreate.status === 403 ? "blocked" : "incorrect"}`,
);

if (!passed) process.exitCode = 1;
