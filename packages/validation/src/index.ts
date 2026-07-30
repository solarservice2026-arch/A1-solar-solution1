import { z } from "zod";

export const indianMobile = z.string().regex(/^[6-9]\d{9}$/, "Enter a valid Indian mobile number");
export const pinCode = z.string().regex(/^[1-9]\d{5}$/, "Enter a valid PIN code");
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).optional()
});
export const leadSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  mobile: indianMobile,
  email: z.string().email().optional().or(z.literal("")),
  city: z.string().trim().max(80).optional(),
  customerType: z.enum(["Residential", "Commercial", "Industrial"]),
  monthlyBill: z.number().nonnegative().optional(),
  capacityKw: z.number().positive().max(100000).optional(),
  source: z.string().trim().min(1).max(80),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]).default("Medium"),
  notes: z.string().trim().max(2000).optional()
});
export const enquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  mobile: indianMobile,
  email: z.string().email().optional().or(z.literal("")),
  type: z.enum(["site_survey", "quotation", "contact"]),
  message: z.string().trim().max(2000).optional()
});
export type LeadInput = z.infer<typeof leadSchema>;
export type EnquiryInput = z.infer<typeof enquirySchema>;
export * from "./auth.js";
