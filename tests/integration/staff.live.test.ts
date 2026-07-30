import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import request from "supertest";
import { describe,expect,it } from "vitest";
import { app } from "../../apps/api/src/app";
import { credential } from "../test-credentials";
const configured=Boolean(process.env.SUPABASE_URL&&process.env.SUPABASE_ANON_KEY&&process.env.SUPABASE_SERVICE_ROLE_KEY&&credential("SUPER_ADMIN")&&credential("ADMIN"));
async function token(label:string){const client=createClient(process.env.SUPABASE_URL!,process.env.SUPABASE_ANON_KEY!);const {data,error}=await client.auth.signInWithPassword(credential(label)!);if(error)throw error;return data.session!.access_token}
async function taggedUser(label:string){const expected=credential(label);if(!expected)throw new Error(`Missing credential ${label}`);const admin=createClient(process.env.SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false}});const {data}=await admin.auth.admin.listUsers({page:1,perPage:1000});const user=data.users.find(item=>item.email===expected.email);if(!user)throw new Error(`Missing tagged user ${label}`);return user}
describe.skipIf(!configured)("live staff management",()=>{
 it("Super Admin can list staff and effective permissions",async()=>{const bearer=await token("SUPER_ADMIN");const list=await request(app).get("/api/v1/staff").set("Authorization",`Bearer ${bearer}`);expect(list.status).toBe(200);expect(list.body.data.length).toBeGreaterThan(0);const admin=await taggedUser("ADMIN");const permissions=await request(app).get(`/api/v1/staff/${admin.id}/permissions`).set("Authorization",`Bearer ${bearer}`);expect(permissions.status).toBe(200);expect(permissions.body.data.length).toBeGreaterThan(0)});
 it("ordinary Admin cannot disable Super Admin",async()=>{const bearer=await token("ADMIN"),superAdmin=await taggedUser("SUPER_ADMIN");const response=await request(app).post(`/api/v1/staff/${superAdmin.id}/disable`).set("Authorization",`Bearer ${bearer}`);expect(response.status).toBe(403);expect(["FORBIDDEN","PROTECTED_ACCOUNT"]).toContain(response.body.code)});
 it("user cannot elevate their own role",async()=>{const bearer=await token("ADMIN"),admin=await taggedUser("ADMIN");const service=createClient(process.env.SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!);const {data:role}=await service.from("roles").select("id").eq("name","super_admin").single();const response=await request(app).post(`/api/v1/staff/${admin.id}/roles`).set("Authorization",`Bearer ${bearer}`).send({roleId:role!.id});expect(response.status).toBe(403);expect(["FORBIDDEN","SELF_PRIVILEGE_CHANGE"]).toContain(response.body.code)});
});
