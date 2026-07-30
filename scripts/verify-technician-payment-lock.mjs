import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const api = process.env.ROLE_AUDIT_API_URL ?? "http://127.0.0.1:5000/api/v1";
const credentials = JSON.parse(
  fs.readFileSync(".auth/e2e-credentials.json", "utf8"),
);
const admin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

async function tokenFor(label) {
  const auth = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data, error } = await auth.auth.signInWithPassword(credentials[label]);
  if (error || !data.session) throw new Error(`${label} login failed`);
  return data.session.access_token;
}

const technicianToken = await tokenFor("TECHNICIAN");
const technicianHeaders = {
  authorization: `Bearer ${technicianToken}`,
  "content-type": "application/json",
};
const ticketsResponse = await fetch(`${api}/tickets`, {
  headers: technicianHeaders,
});
const ticketsBody = await ticketsResponse.json();
const tickets = ticketsBody.data ?? [];
let ticketUpdatePassed = true;
if (tickets[0]) {
  const update = await fetch(`${api}/tickets/${tickets[0].id}`, {
    method: "PATCH",
    headers: technicianHeaders,
    body: JSON.stringify({
      status: tickets[0].status,
      resolution: tickets[0].resolution ?? "",
    }),
  });
  ticketUpdatePassed = update.ok;
}
const staffDenied =
  (await fetch(`${api}/staff`, { headers: technicianHeaders })).status === 403;

const { data: customerUser } = await admin.auth.admin.listUsers({
  page: 1,
  perPage: 1000,
});
const customerEmail = credentials.CUSTOMER_A.email.toLowerCase();
const customerAuth = customerUser.users.find(
  (user) => user.email?.toLowerCase() === customerEmail,
);
if (!customerAuth) throw new Error("Customer A account not found");
const { data: customer } = await admin
  .from("customers")
  .select("id")
  .eq("profile_id", customerAuth.id)
  .single();
const { data: quotation } = await admin
  .from("quotations")
  .select("id")
  .eq("customer_id", customer.id)
  .limit(1)
  .single();
const { data: template } = await admin
  .from("agreement_templates")
  .select("id,version")
  .eq("active", true)
  .limit(1)
  .single();
const { data: agreement, error: agreementError } = await admin
  .from("agreements")
  .upsert(
    {
      agreement_number: "TEST-AGR-CUSTOMER-A",
      customer_id: customer.id,
      quotation_id: quotation.id,
      template_id: template.id,
      merged_data: {
        consumer_address: "Tagged test customer address",
        agreement_date: new Date().toISOString().slice(0, 10),
        template_version: template.version,
      },
      payment_status: "Unpaid",
      payment_amount: 1,
    },
    { onConflict: "agreement_number" },
  )
  .select()
  .single();
if (agreementError) throw agreementError;

const customerToken = await tokenFor("CUSTOMER_A");
const customerHeaders = { authorization: `Bearer ${customerToken}` };
const agreementsResponse = await fetch(`${api}/agreements`, {
  headers: customerHeaders,
});
const agreementsBody = await agreementsResponse.json();
const lockedRow = (agreementsBody.data ?? []).find(
  (row) => row.id === agreement.id,
);
const sanitized =
  lockedRow?.locked === true &&
  lockedRow.merged_data === undefined &&
  lockedRow.quotations === undefined;
const documentResponse = await fetch(
  `${api}/agreements/${agreement.id}/document`,
  { headers: customerHeaders },
);
const paymentBlocked = documentResponse.status === 402;

const passed =
  ticketsResponse.ok &&
  tickets.length > 0 &&
  ticketUpdatePassed &&
  staffDenied &&
  agreementsResponse.ok &&
  sanitized &&
  paymentBlocked;

console.log("Technician login: passed");
console.log(`Assigned tickets visible: ${tickets.length > 0 ? "passed" : "failed"}`);
console.log(`Ticket update: ${ticketUpdatePassed ? "passed" : "failed"}`);
console.log(`Technician admin access: ${staffDenied ? "blocked" : "failed"}`);
console.log(`Unpaid agreement list data: ${sanitized ? "sanitized" : "failed"}`);
console.log(`Unpaid agreement preview/download: ${paymentBlocked ? "blocked" : "failed"}`);
console.log(`Overall verification: ${passed ? "passed" : "failed"}`);

if (!passed) process.exitCode = 1;
