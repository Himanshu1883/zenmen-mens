import Product from "@/models/Product";
import slugifyLib from "slugify";

/** Decode slug from URL path segment (handles %20, etc.) */
export function decodeSlugParam(raw: string): string {
  try {
    return decodeURIComponent(raw.trim());
  } catch {
    return raw.trim();
  }
}

/** URL-safe slug for links and API paths */
export function encodeProductSlug(slug: string): string {
  return encodeURIComponent(slug);
}

/** Canonical slug (same rules as product create API) */
export function canonicalProductSlug(raw: string): string {
  const decoded = decodeSlugParam(raw);
  if (!decoded) return "";
  return slugifyLib(decoded, {
    lower: true,
    strict: true,
    trim: true,
  });
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Resolve a product by slug from URL or DB value.
 * Handles legacy slugs with spaces, mixed case, and slugify-canonical forms.
 */
export async function findProductBySlug(slugParam: string) {
  const decoded = decodeSlugParam(slugParam);
  if (!decoded) return null;

  const canonical = canonicalProductSlug(slugParam);
  const loose = decoded
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  const candidates = [...new Set([decoded, canonical, loose].filter(Boolean))];

  for (const slug of candidates) {
    const exact = await Product.findOne({ slug }).lean();
    if (exact) return exact;
  }

  const ci = await Product.findOne({
    slug: { $regex: new RegExp(`^${escapeRegex(decoded)}$`, "i") },
  }).lean();
  if (ci) return ci;

  if (canonical) {
    const byCanonical = await Product.findOne({ slug: canonical }).lean();
    if (byCanonical) return byCanonical;
  }

  return null;
}
