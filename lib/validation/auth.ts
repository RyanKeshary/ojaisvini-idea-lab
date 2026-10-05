import { z } from "zod";
import { normalizePhone } from "@/lib/auth/phone";

export const phoneSchema = z
  .string()
  .transform((s) => normalizePhone(s))
  .refine((p) => /^[6-9]\d{9}$/.test(p), { message: "invalid-phone" });

export const otpSchema = z.object({
  phone: phoneSchema,
  otp: z.string().regex(/^\d{6}$/, "invalid-otp"),
});

export const pinSchema = z.object({
  phone: phoneSchema,
  pin: z.string().regex(/^\d{4}$/, "invalid-pin"),
});

export const registerNameSchema = z.object({
  name: z.string().trim().min(2, "invalid-name").max(60, "invalid-name"),
});

export const staffSchema = z.object({
  email: z.string().email("invalid-email"),
  password: z.string().min(4, "invalid-password"),
});
