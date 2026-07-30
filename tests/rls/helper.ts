import { createClient } from "@supabase/supabase-js";
import { credential } from "../test-credentials";
const labels=["CUSTOMER_A","CUSTOMER_B","SALES","ACCOUNTANT","DISABLED","NO_ROLE"];
export const liveConfigured=Boolean(process.env.SUPABASE_URL&&process.env.SUPABASE_ANON_KEY&&labels.every(credential));
export async function userClient(label:string){const auth=credential(label);if(!auth)throw new Error(`Missing ${label} credentials`);const client=createClient(process.env.SUPABASE_URL!,process.env.SUPABASE_ANON_KEY!);const {error}=await client.auth.signInWithPassword(auth);if(error)throw error;return client}
