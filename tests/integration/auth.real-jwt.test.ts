import { createClient } from "@supabase/supabase-js";
import request from "supertest";
import { describe,expect,it } from "vitest";
import { app } from "../../apps/api/src/app";
import { credential } from "../test-credentials";
const adminCredential=credential("ADMIN");
const needed=["SUPABASE_URL","SUPABASE_ANON_KEY","SUPABASE_SERVICE_ROLE_KEY"] as const;
const missing=needed.filter(key=>!process.env[key]);
describe.skipIf(missing.length>0||!adminCredential)(`real Supabase JWT integration`,()=>{
 it("accepts a real active-user access token through the Express chain",async()=>{const client=createClient(process.env.SUPABASE_URL!,process.env.SUPABASE_ANON_KEY!);const {data,error}=await client.auth.signInWithPassword(adminCredential!);expect(error).toBeNull();const response=await request(app).get("/api/v1/auth/me").set("Authorization",`Bearer ${data.session!.access_token}`);expect(response.status).toBe(200)});
 it("rejects a wrong-project or malformed token",async()=>{const response=await request(app).get("/api/v1/auth/me").set("Authorization","Bearer wrong-project-token");expect(response.status).toBe(401)});
});
