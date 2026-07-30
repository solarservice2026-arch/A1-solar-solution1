import express from "express";
import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import { requireAuth, requirePermission, resetAuthProvider, setAuthProvider } from "./middleware.js";
import { AppError } from "../lib/http.js";
const makeApp=(permission="leads:view")=>{
 const app=express();app.get("/secure",requireAuth,requirePermission(permission),(_req,res)=>res.json({success:true}));
 app.use((error:unknown,_req:express.Request,res:express.Response,_next:express.NextFunction)=>{
  const known=error as AppError;res.status(known.status??500).json({code:known.code??"INTERNAL_ERROR"});
 });return app;
};
afterEach(()=>resetAuthProvider());
describe("authentication middleware",()=>{
 it("rejects a missing token",async()=>{expect((await request(makeApp()).get("/secure")).status).toBe(401)});
 it("rejects an expired or unknown token",async()=>{setAuthProvider({resolve:async()=>null});expect((await request(makeApp()).get("/secure").set("Authorization","Bearer expired")).body.code).toBe("INVALID_SESSION")});
 it("rejects a disabled existing session",async()=>{setAuthProvider({resolve:async()=>({userId:"u",email:"u@example.com",active:false,roles:[],permissions:[]})});expect((await request(makeApp()).get("/secure").set("Authorization","Bearer valid")).body.code).toBe("ACCOUNT_DISABLED")});
 it("forbids a user without permission",async()=>{setAuthProvider({resolve:async()=>({userId:"u",email:"u@example.com",active:true,roles:["sales_executive"],permissions:["leads:view"]})});expect((await request(makeApp("quotations:approve")).get("/secure").set("Authorization","Bearer valid")).status).toBe(403)});
 it("allows a matching permission",async()=>{setAuthProvider({resolve:async()=>({userId:"u",email:"u@example.com",active:true,roles:["sales_executive"],permissions:["leads:view"]})});expect((await request(makeApp()).get("/secure").set("Authorization","Bearer valid")).status).toBe(200)});
 it("allows super admin without an explicit permission",async()=>{setAuthProvider({resolve:async()=>({userId:"u",email:"u@example.com",active:true,roles:["super_admin"],permissions:[]})});expect((await request(makeApp("roles:update")).get("/secure").set("Authorization","Bearer valid")).status).toBe(200)});
});
