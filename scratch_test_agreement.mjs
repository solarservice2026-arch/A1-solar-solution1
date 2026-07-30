import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const api = "http://127.0.0.1:5000/api/v1";
const credentials = JSON.parse(
  fs.readFileSync(".auth/e2e-credentials.json", "utf8")
);

async function tokenFor(label) {
  const client = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  const { data, error } = await client.auth.signInWithPassword(
    credentials[label]
  );
  if (error || !data.session) throw new Error(`${label} login failed: ${error?.message}`);
  return data.session.access_token;
}

async function run() {
  try {
    const adminToken = await tokenFor("SUPER_ADMIN");
    
    // Get quotation
    const quotesResponse = await fetch(`${api}/quotations`, {
      headers: { authorization: `Bearer ${adminToken}` },
    });
    const quotesText = await quotesResponse.text();
    console.log("Quotations response status:", quotesResponse.status);
    console.log("Quotations response text:", quotesText);
    const quotesBody = JSON.parse(quotesText);
    
    const quote = quotesBody.data?.find(q => q.quotation_number === "QUO-20260730-1946DA");
    if (!quote) {
      console.error("No quotation found! Quotes body:", quotesBody);
      return;
    }
    
    const payload = {
      customerId: quote.customer_id,
      quotationId: quote.id,
      consumerAddress: "123 Main St, Test City",
      agreementDate: new Date().toISOString().slice(0, 10),
      paymentTerms: "50% advance, 50% on completion",
    };
    
    console.log("Submitting payload:", payload);
    
    const response = await fetch(`${api}/agreements`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${adminToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    
    const status = response.status;
    const body = await response.json().catch(() => ({}));
    console.log("Response status:", status);
    console.log("Response body:", JSON.stringify(body, null, 2));
  } catch (err) {
    console.error("Test failed:", err);
  }
}

run();
