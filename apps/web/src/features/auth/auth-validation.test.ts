import { describe, expect, it } from "vitest";
import { resetPasswordSchema } from "@a1/validation";
describe("password reset validation",()=>{
 it("accepts a strong matching password",()=>expect(resetPasswordSchema.safeParse({password:"StrongPass12",confirmation:"StrongPass12"}).success).toBe(true));
 it("rejects weak passwords",()=>expect(resetPasswordSchema.safeParse({password:"password",confirmation:"password"}).success).toBe(false));
 it("rejects mismatched confirmation",()=>expect(resetPasswordSchema.safeParse({password:"StrongPass12",confirmation:"StrongPass13"}).success).toBe(false));
});
