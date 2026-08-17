// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatInrAsCurrency } from "./currency";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** INR display (e.g. SSR or non-Redux). For client UI that follows the navbar currency, use `useDisplayPrice`. */
export function formatPrice(n: number): string {
  return formatInrAsCurrency(n, "INR");
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
