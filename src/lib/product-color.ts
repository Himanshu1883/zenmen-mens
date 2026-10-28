import { canonicalProductSlug } from "@/lib/product-slug";
import type { Product } from "@/types/product";

const HEX: Record<string, string> = {
  black: "#1a1a1a",
  charcoal: "#2a2a2a",
  noir: "#2a2a2a",
  navy: "#1a2a4a",
  midnight: "#1a2a4a",
  blue: "#3b6ea8",
  royal: "#1e3a8a",
  white: "#f8fafc",
  ivory: "#e8e0d0",
  cream: "#f5f0e6",
  "off white": "#f3efe6",
  "off-white": "#f3efe6",
  beige: "#d4c4a8",
  sand: "#c8b49a",
  camel: "#c4a574",
  cognac: "#9a5b2f",
  brown: "#6b4423",
  grey: "#94a3b8",
  gray: "#94a3b8",
  maroon: "#6b1d1d",
  wine: "#5c2030",
  burgundy: "#6b1d2a",
  green: "#3d5c4a",
  olive: "#556b2f",
  sage: "#9caf88",
  forest: "#2d4a3e",
  emerald: "#0f6b4c",
  pink: "#e8b4b8",
  blush: "#c48b96",
  purple: "#6b4c7a",
  gold: "#c9a227",
};

const LIGHT = new Set([
  "white",
  "ivory",
  "cream",
  "sand",
  "beige",
  "off white",
  "off-white",
]);

export type ProductColorVariant = {
  name: string;
  hex: string;
  slug: string;
  productId: string;
  current: boolean;
  light: boolean;
};

const COLOR_TOKENS = [
  "midnight navy",
  "charcoal noir",
  "off white",
  "off-white",
  "bottle green",
  "royal blue",
  "royal navy",
  "baby pink",
  "mint green",
  "forest green",
  "emerald green",
  "navy blue",
  "light green",
  "blush",
  "ivory",
  "cream",
  "sand",
  "sage",
  "olive",
  "navy",
  "black",
  "white",
  "beige",
  "maroon",
  "gold",
  "grey",
  "gray",
  "brown",
  "camel",
  "cognac",
  "pink",
  "purple",
  "charcoal",
  "burgundy",
  "wine",
  "emerald",
  "khaki",
];

export function normalizeStyleGroup(raw: string | undefined | null): string {
  return canonicalProductSlug(raw ?? "");
}

/** Split "Embroidered Kurta — Black" into design name + colour. */
export function splitDesignAndColor(title: string): {
  design: string;
  color: string | null;
} {
  const raw = title.replace(/\s+/g, " ").trim();
  const parts = raw.split(/\s+[—–-]\s+/);
  if (parts.length >= 2) {
    const color = parts[parts.length - 1]?.trim() ?? "";
    const design = parts.slice(0, -1).join(" — ").trim();
    if (design && color && looksLikeColor(color)) {
      return { design, color };
    }
  }
  return { design: raw, color: null };
}

function looksLikeColor(value: string): boolean {
  const n = value.trim().toLowerCase();
  if (!n) return false;
  return COLOR_TOKENS.some((token) => n === token || n.includes(token));
}

/** Design-group key from a colourway title, e.g. "Set — Ivory" → embroidered-kurta-pajama-set */
export function inferredStyleGroup(
  title: string,
  explicit?: string | null,
): string {
  const fromField = normalizeStyleGroup(explicit);
  if (fromField) return fromField;
  const { design, color } = splitDesignAndColor(title);
  if (!color || !design) return "";
  return normalizeStyleGroup(design);
}

export function productColorName(product: {
  colors?: string[];
  title?: string;
}): string {
  const listed = product.colors?.map((c) => c.trim()).filter(Boolean) ?? [];
  if (listed[0]) return listed[0];
  return "";
}

export function colorSwatchHex(name: string): string {
  const n = name.trim().toLowerCase();
  if (!n) return "#cbd5e1";
  if (HEX[n]) return HEX[n];
  for (const [key, hex] of Object.entries(HEX)) {
    if (n.includes(key)) return hex;
  }
  return "#cbd5e1";
}

export function isLightColorName(name: string): boolean {
  const n = name.trim().toLowerCase();
  return LIGHT.has(n) || [...LIGHT].some((key) => n.includes(key));
}

function toVariant(
  product: Product,
  name: string,
  currentId: string,
  currentSlug: string,
): ProductColorVariant {
  return {
    name,
    hex: colorSwatchHex(name),
    slug: product.slug,
    productId: product._id,
    current: product._id === currentId || product.slug === currentSlug,
    light: isLightColorName(name),
  };
}

/** Colours the shopper can actually buy: sibling SKUs in the same design group, else this product only. */
export function colorVariantsForProduct(
  product: Product,
  catalog: Product[] = [],
): ProductColorVariant[] {
  const group = product.styleGroup?.trim();
  const seen = new Set<string>();
  const out: ProductColorVariant[] = [];

  const push = (item: Product, name: string) => {
    const label = name.trim();
    if (!label) return;
    const key = `${item.slug}::${label.toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(toVariant(item, label, product._id, product.slug));
  };

  if (group) {
    const siblings = [
      product,
      ...catalog.filter(
        (p) =>
          p._id !== product._id &&
          p.styleGroup?.trim() === group &&
          p.isAvailable !== false,
      ),
    ];
    for (const item of siblings) {
      push(item, productColorName(item));
    }
    return out;
  }

  const own = productColorName(product);
  if (own) push(product, own);
  return out;
}
