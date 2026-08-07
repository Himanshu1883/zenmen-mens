import { z } from "zod";
import { isInternalMobileEmail, isPhoneContact, normalizePhone } from "@/lib/auth-contact";

/** Strict whitelist — unknown keys are rejected */
export const profileUpdateSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(80, "Name is too long"),
    email: z.string().trim().max(254),
    phone: z.string().trim().max(20),
    currentPassword: z.string().max(128).optional(),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(128, "New password is too long")
      .optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.email) {
      if (
        isInternalMobileEmail(data.email) ||
        !z.email().safeParse(data.email.toLowerCase()).success
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["email"],
          message: "Enter a valid email address",
        });
      }
    }
    if (data.phone && !isPhoneContact(data.phone)) {
      ctx.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Enter a valid 10-digit Indian mobile number",
      });
    }
    if (!data.email && !data.phone) {
      ctx.addIssue({
        code: "custom",
        path: ["email"],
        message: "Keep at least an email or mobile number",
      });
    }
  });

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export function normalizeProfilePhone(phone?: string) {
  if (!phone) return undefined;
  return normalizePhone(phone);
}
