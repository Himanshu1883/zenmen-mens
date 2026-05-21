/**
 * Resolve Cloudinary public_id when legacy products only stored image URLs.
 */

type ImageRef = { url?: string; public_id?: string };

/** Parse public_id from a Cloudinary delivery URL */
export function publicIdFromCloudinaryUrl(url: string): string | null {
  if (!url.includes("cloudinary.com")) return null;

  const marker = "/upload/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;

  let segment = url.slice(idx + marker.length).split("?")[0] ?? "";
  segment = segment.replace(/\.\w+$/i, "");

  const parts = segment.split("/").filter(Boolean);

  // Version folder: v1777980244
  while (parts.length > 0 && /^v\d+$/i.test(parts[0]!)) {
    parts.shift();
  }

  // Transformation segments: w_500, c_fill, fl_progressive, etc.
  while (
    parts.length > 0 &&
    (/^[a-z]{1,3}_[\w,.-]+$/i.test(parts[0]!) || parts[0]!.includes(","))
  ) {
    parts.shift();
  }

  const id = parts.join("/");
  return id.length > 0 ? id : null;
}

/** Prefer stored id, then match existing row, then parse from URL */
export function resolveImagePublicId(
  img: ImageRef,
  existingImages?: ImageRef[],
): string | null {
  if (img.public_id?.trim()) return img.public_id.trim();

  const fromExisting = existingImages?.find((e) => e.url === img.url)?.public_id;
  if (fromExisting?.trim()) return fromExisting.trim();

  if (img.url) return publicIdFromCloudinaryUrl(img.url);

  return null;
}
