import type { ProductAccordion, ProductSpec } from "@/types/product";

export const REQUIRED_FIELD_MESSAGE =
  "This field is required before you can save this product.";

export const DEFAULT_CARE =
  "Dry clean only. Steam preferred. Store on a shaped hanger away from direct sunlight.";

export const CARE_PRESETS: { label: string; value: string }[] = [
  { label: "Dry clean", value: DEFAULT_CARE },
  {
    label: "Gentle wash",
    value:
      "Gentle machine wash cold, inside out. Do not bleach. Hang dry. Warm iron on reverse.",
  },
  {
    label: "Silk / festive",
    value:
      "Dry clean only. Do not wring. Steam lightly. Store folded in muslin, away from moisture and sunlight.",
  },
];

export const COLOR_PRESETS = [
  "Navy",
  "Black",
  "Ivory",
  "White",
  "Beige",
  "Maroon",
  "Gold",
  "Grey",
  "Olive",
  "Brown",
];

export const SIZE_PRESETS = ["S", "M", "L", "XL", "XXL"];
export const SHIRT_SIZE_PRESETS = ["38", "40", "42", "44", "46"];
export const BADGE_PRESETS = ["New", "Limited", "Bespoke", "Atelier"];

export const DEFAULT_DETAILS = [
  "Hand-cut in our New Delhi atelier",
  "Premium fabric with a clean, lasting drape",
  "Finished with signature ZENmen detailing",
  "Made to order — allow time for fitting",
].join("\n");

export function detailsPresetForCollection(collection: string): string {
  const key = collection.trim().toLowerCase();
  if (key.includes("shirt")) {
    return [
      "Hand-cut shirt from our New Delhi atelier",
      "Breathable cloth with a clean collar and drape",
      "Mother-of-pearl or matching buttons",
      "Available in standard sizes; bespoke fit on request",
    ].join("\n");
  }
  if (key.includes("suit")) {
    return [
      "Bespoke-ready suit, cut in our New Delhi atelier",
      "Structured shoulder with a natural drape",
      "Fully canvassed or half-canvas construction as specified",
      "Includes jacket and trousers; waistcoat on selected styles",
    ].join("\n");
  }
  if (key.includes("kurta")) {
    return [
      "Hand-finished kurta from our New Delhi atelier",
      "Easy, elegant drape for ceremony and evening",
      "Refined neckline and signature ZENmen detailing",
      "Pair with churidar or trousers as preferred",
    ].join("\n");
  }
  if (key.includes("indo")) {
    return [
      "Indo-western silhouette, cut for occasion wear",
      "Blends structured tailoring with festive ease",
      "Statement detailing without excess ornament",
      "Styled for receptions, sangeet, and evening events",
    ].join("\n");
  }
  return DEFAULT_DETAILS;
}

export const DEFAULT_SPECS: ProductSpec[] = [
  { label: "Fabric", value: "Mill-selected premium cloth" },
  { label: "Fit", value: "Tailored" },
  { label: "Occasion", value: "Wedding, ceremony, evening" },
  { label: "Made in", value: "New Delhi, India" },
];

export const SPEC_LABEL_PRESETS = [
  "Fabric",
  "Fit",
  "Occasion",
  "Made in",
  "Lining",
  "Buttons",
  "Weave",
];

export const DEFAULT_ACCORDION: ProductAccordion[] = [
  {
    title: "Shipping & Delivery",
    content:
      "Express delivery in 2–4 business days. Standard delivery in 5–7 days. Free shipping on orders above Rs. 5,000. Made-to-order pieces follow the lead time shown on this product.",
  },
  {
    title: "Returns & Exchanges",
    content:
      "Unworn items in original packaging may be returned within 30 days. Exchanges are available for size or color. Bespoke or altered pieces cannot be returned.",
  },
  {
    title: "Bespoke Services",
    content:
      "Custom alterations, monogram, lining, and fit changes can be arranged through our atelier team. Share notes at checkout or on WhatsApp.",
  },
];

export const DESCRIPTION_PLACEHOLDER =
  "Example: A midnight navy dinner jacket with a clean shawl lapel, cut for evening and ceremony. Hand-finished in our New Delhi atelier.";

export const TAGLINE_PLACEHOLDER =
  "Example: Midnight shawl lapel, cut for evening";

export function toggleCsvValue(current: string, token: string): string {
  const parts = current
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const exists = parts.some(
    (p) => p.toLowerCase() === token.trim().toLowerCase(),
  );
  const next = exists
    ? parts.filter((p) => p.toLowerCase() !== token.trim().toLowerCase())
    : [...parts, token.trim()];
  return next.join(", ");
}
