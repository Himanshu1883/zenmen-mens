import Product from "@/models/Product";
import {
  canonicalProductSlug,
  decodeSlugParam,
  sanitizeSlugSource,
} from "@/lib/product-slug";

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function whitespaceInsensitiveSlugRegex(raw: string): RegExp | null {
  const canonical = canonicalProductSlug(raw);
  const tokens = (canonical || sanitizeSlugSource(raw))
    .split(/[\s\-_]+/)
    .filter(Boolean);
  if (!tokens.length) return null;
  return new RegExp(`^${tokens.map(escapeRegex).join("[\\s\\-_]*")}$`, "i");
}

async function persistCanonicalSlug<T extends { _id?: unknown; slug?: string }>(
  product: T,
): Promise<T> {
  const current = String(product.slug ?? "");
  const clean = canonicalProductSlug(current);
  if (!clean || !product._id || clean === current) return product;

  const clash = await Product.findOne({
    slug: clean,
    _id: { $ne: product._id },
  }).lean();
  const next = clash ? `${clean}-${String(product._id).slice(-6)}` : clean;

  await Product.updateOne({ _id: product._id }, { $set: { slug: next } });
  return { ...product, slug: next };
}

/**
 * Resolve a product by slug from URL or DB value.
 * Handles legacy slugs with newlines, spaces, mixed case, and slugify-canonical forms.
 * Server-only — imports Mongoose.
 */
export async function findProductBySlug(slugParam: string) {
  const decoded = decodeSlugParam(slugParam);
  if (!decoded) return null;

  const canonical = canonicalProductSlug(slugParam);
  const loose = sanitizeSlugSource(decoded)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  const candidates = [...new Set([decoded, canonical, loose].filter(Boolean))];

  for (const slug of candidates) {
    const exact = await Product.findOne({ slug }).lean();
    if (exact) return persistCanonicalSlug(exact);
  }

  const ci = await Product.findOne({
    slug: { $regex: new RegExp(`^${escapeRegex(decoded)}$`, "i") },
  }).lean();
  if (ci) return persistCanonicalSlug(ci);

  const fuzzy = whitespaceInsensitiveSlugRegex(slugParam);
  if (fuzzy) {
    const match = await Product.findOne({ slug: { $regex: fuzzy } }).lean();
    if (match) return persistCanonicalSlug(match);
  }

  return null;
}
