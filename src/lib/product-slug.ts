import slugifyLib from "slugify";

/** Decode slug from URL path segment (handles %20, %0A, etc.) */
export function decodeSlugParam(raw: string): string {
  try {
    return decodeURIComponent(raw).trim();
  } catch {
    return raw.trim();
  }
}

/** Collapse newlines/tabs/control chars so slugs never embed %0A. */
export function sanitizeSlugSource(raw: string): string {
  return raw
    .replace(/[\u0000-\u001F\u007F]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Canonical slug (same rules as product create API) */
export function canonicalProductSlug(raw: string): string {
  const decoded = sanitizeSlugSource(decodeSlugParam(raw));
  if (!decoded) return "";
  return slugifyLib(decoded, {
    lower: true,
    strict: true,
    trim: true,
  });
}

/** URL-safe slug for storefront links and API paths */
export function encodeProductSlug(slug: string): string {
  const clean = canonicalProductSlug(slug);
  return encodeURIComponent(clean || sanitizeSlugSource(slug));
}

export function productCollectionHref(slug: string): string {
  const encoded = encodeProductSlug(slug);
  return encoded ? `/collection/${encoded}` : "/collection";
}

/**
 * Safe for Next.js static path segments (no newlines/spaces/slashes).
 * Legacy dirty DB slugs still work at request time via dynamicParams.
 */
export function isStaticSafeSlug(slug: unknown): slug is string {
  if (typeof slug !== "string") return false;
  const s = slug.trim();
  if (!s || s.length > 180) return false;
  if (/[\n\r\t\\/<>:"|?*]/.test(s)) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(s);
}
