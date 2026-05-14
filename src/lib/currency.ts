/** Product prices in the database are in INR. */

export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP";

export const CURRENCY_STORAGE_KEY = "zenmen-currency";

/** Approximate INR per 1 unit of foreign currency (static; refresh for production FX). */
export const INR_PER_UNIT: Record<CurrencyCode, number> = {
  INR: 1,
  USD: 83.2,
  EUR: 90.5,
  GBP: 106,
};

const LOCALES: Record<CurrencyCode, string> = {
  INR: "en-IN",
  USD: "en-US",
  EUR: "en-DE",
  GBP: "en-GB",
};

export const CURRENCY_OPTIONS: {
  code: CurrencyCode;
  label: string;
}[] = [
  { code: "INR", label: "India · INR" },
  { code: "USD", label: "United States · USD" },
  { code: "EUR", label: "Europe · EUR" },
  { code: "GBP", label: "United Kingdom · GBP" },
];

export function isCurrencyCode(v: string | null | undefined): v is CurrencyCode {
  return v === "INR" || v === "USD" || v === "EUR" || v === "GBP";
}

export function convertInrTo(code: CurrencyCode, amountInr: number): number {
  if (code === "INR") return amountInr;
  return amountInr / INR_PER_UNIT[code];
}

export function formatInrAsCurrency(
  amountInr: number,
  code: CurrencyCode,
): string {
  const value = convertInrTo(code, amountInr);
  return new Intl.NumberFormat(LOCALES[code], {
    style: "currency",
    currency: code,
    minimumFractionDigits: 0,
    maximumFractionDigits: code === "INR" ? 0 : 2,
  }).format(value);
}
