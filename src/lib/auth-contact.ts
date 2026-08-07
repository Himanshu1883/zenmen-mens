import { z } from "zod";

/** Internal placeholder domain — never show this to customers */
export const INTERNAL_MOBILE_EMAIL_DOMAIN = "mobile.zenmen.local";

/** Digits only, strip spaces / dashes / leading +91 or 0 */
export function normalizePhone(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  return digits;
}

export function isEmailContact(value: string): boolean {
  return z.email().safeParse(value.trim()).success;
}

export function isPhoneContact(value: string): boolean {
  const digits = normalizePhone(value);
  return /^[6-9]\d{9}$/.test(digits);
}

export function isInternalMobileEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase().endsWith(`@${INTERNAL_MOBILE_EMAIL_DOMAIN}`);
}

/** Pull 10-digit phone from `9876543210@mobile.zenmen.local` when needed */
export function phoneFromInternalEmail(email?: string | null): string | null {
  if (!isInternalMobileEmail(email)) return null;
  const local = email!.split("@")[0] ?? "";
  const digits = normalizePhone(local);
  return isPhoneContact(digits) ? digits : null;
}

export function formatPhoneDisplay(phone?: string | null): string {
  if (!phone) return "";
  const digits = normalizePhone(phone);
  if (!/^\d{10}$/.test(digits)) return phone;
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}

/** Real inbox address only — hides synthetic mobile emails */
export function getPublicEmail(email?: string | null): string | null {
  if (!email || isInternalMobileEmail(email)) return null;
  return email.trim().toLowerCase();
}

export function resolveAccountContact(user: {
  email?: string | null;
  phone?: string | null;
}): {
  publicEmail: string | null;
  phone: string | null;
  /** Single line for UI (auth chip, admin list, etc.) */
  displayContact: string;
} {
  const phone =
    (user.phone ? normalizePhone(user.phone) : null) ||
    phoneFromInternalEmail(user.email);
  const publicEmail = getPublicEmail(user.email);

  const displayContact = publicEmail
    ? phone
      ? `${publicEmail} · ${formatPhoneDisplay(phone)}`
      : publicEmail
    : phone
      ? formatPhoneDisplay(phone)
      : "No contact on file";

  return {
    publicEmail,
    phone: phone && isPhoneContact(phone) ? phone : null,
    displayContact,
  };
}

export function parseContact(value: string): {
  kind: "email" | "phone";
  email?: string;
  phone?: string;
} | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (isEmailContact(trimmed) && !isInternalMobileEmail(trimmed)) {
    return { kind: "email", email: trimmed.toLowerCase() };
  }
  if (isPhoneContact(trimmed)) {
    const phone = normalizePhone(trimmed);
    return {
      kind: "phone",
      phone,
      /** Internal email so NextAuth / unique email index stay happy */
      email: `${phone}@${INTERNAL_MOBILE_EMAIL_DOMAIN}`,
    };
  }
  return null;
}

export const contactSchema = z
  .string()
  .trim()
  .min(1, "Email or mobile number is required")
  .refine((v) => {
    if (isInternalMobileEmail(v)) return false;
    return isEmailContact(v) || isPhoneContact(v);
  }, {
    message: "Enter a valid email or 10-digit mobile number",
  });
