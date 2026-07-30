import { z } from "zod";
export const emailSchema = z.string().trim().email().max(254);
export const passwordSchema = z.string().min(10).max(128)
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/\d/, "Include a number");
export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1).max(128) });
export const resetPasswordSchema = z.object({ password: passwordSchema, confirmation: z.string() })
  .refine((value) => value.password === value.confirmation, { message: "Passwords do not match", path: ["confirmation"] });
export const appRoles = ["super_admin","admin","manager","sales_executive","installation_staff","service_technician","accountant","customer"] as const;
export const staffSchema = z.object({
  email: emailSchema,
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
  role: z.enum(appRoles),
  active: z.boolean().default(true)
});
export type AppRole = typeof appRoles[number];
export type StaffInput = z.infer<typeof staffSchema>;
