export type ProductImageRef = {
  url?: string;
  alt?: string;
  isPrimary?: boolean;
  order?: number;
  public_id?: string;
};

/** Index of the primary image; falls back to 0 when none is marked. */
export function getPrimaryImageIndex(
  images: ProductImageRef[] | undefined,
): number {
  if (!images?.length) return 0;
  const marked = images.findIndex((img) => img.isPrimary === true);
  return marked >= 0 ? marked : 0;
}

export function getPrimaryImage(
  images: ProductImageRef[] | undefined,
): ProductImageRef | undefined {
  if (!images?.length) return undefined;
  return images[getPrimaryImageIndex(images)];
}

/** Ensure exactly one image has isPrimary: true. */
export function normalizePrimaryFlags<T extends ProductImageRef>(
  images: T[],
): T[] {
  if (!images.length) return images;
  const primaryIdx = getPrimaryImageIndex(images);
  return images.map((img, i) => ({
    ...img,
    isPrimary: i === primaryIdx,
  }));
}

/** Next/Image cannot optimize GridFS `/api/media/` streams. */
export function shouldUnoptimizeProductImage(src: string) {
  return src.startsWith("/api/media/") || src.startsWith("data:");
}

/** Storefront only lists products whose photos are in Mongo GridFS. */
export const STOREFRONT_HAS_IMAGE_FILTER = {
  "images.url": { $regex: "^/api/media/" },
};

export function productHasStorefrontImage(
  images: ProductImageRef[] | undefined,
): boolean {
  return (images ?? []).some(
    (img) => typeof img.url === "string" && img.url.startsWith("/api/media/"),
  );
}
