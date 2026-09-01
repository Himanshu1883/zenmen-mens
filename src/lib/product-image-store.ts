import { idFromMediaUrl, resolveImagePublicId } from "@/lib/cloudinary-public-id";
import {
  deleteProductImage,
  extensionForMime,
  isGridFsId,
  parseImageDataUrl,
  productMediaUrl,
  uploadProductImageBuffer,
} from "@/lib/gridfs";
import { normalizePrimaryFlags } from "@/lib/product-images";

export type IncomingProductImage = {
  url?: string;
  alt?: string;
  isPrimary?: boolean;
  order?: number;
  public_id?: string;
  file?: string;
};

export type StoredProductImage = {
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
  public_id: string;
};

function slugish(title: string) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "product"
  );
}

function storedGridFsId(img: IncomingProductImage): string | null {
  if (isGridFsId(img.public_id)) return img.public_id!.trim();
  const fromUrl = img.url ? idFromMediaUrl(img.url) : null;
  return fromUrl && isGridFsId(fromUrl) ? fromUrl : null;
}

export async function processIncomingProductImages(
  images: IncomingProductImage[],
  title: string,
  existingImages: IncomingProductImage[] = [],
): Promise<StoredProductImage[]> {
  const result = await Promise.all(
    images.map(async (img, index) => {
      if (img.file) {
        const { buffer, contentType } = parseImageDataUrl(img.file);
        const uploaded = await uploadProductImageBuffer({
          buffer,
          filename: `${slugish(title)}-${index}.${extensionForMime(contentType)}`,
          contentType,
          metadata: { kind: "product", title },
        });
        return {
          url: uploaded.url,
          public_id: uploaded.id,
          alt: img.alt || title,
          isPrimary: Boolean(img.isPrimary),
          order: img.order ?? index,
        };
      }

      const mediaId = storedGridFsId(img);
      if (mediaId) {
        return {
          url: productMediaUrl(mediaId),
          public_id: mediaId,
          alt: img.alt || title,
          isPrimary: Boolean(img.isPrimary),
          order: img.order ?? index,
        };
      }

      if (img.url) {
        return {
          url: img.url,
          public_id: resolveImagePublicId(img, existingImages) ?? "",
          alt: img.alt || title,
          isPrimary: Boolean(img.isPrimary),
          order: img.order ?? index,
        };
      }

      return null;
    }),
  );

  const cleaned = result.filter(Boolean) as StoredProductImage[];
  return normalizePrimaryFlags(cleaned);
}

export async function destroyGridFsImages(
  images: IncomingProductImage[],
): Promise<void> {
  await Promise.all(
    images.map(async (img) => {
      const id = storedGridFsId(img);
      if (id) await deleteProductImage(id);
    }),
  );
}

export async function destroyRemovedGridFsImages(
  existing: IncomingProductImage[],
  kept: StoredProductImage[],
): Promise<void> {
  const keptIds = new Set(
    kept.map((img) => img.public_id).filter((id) => isGridFsId(id)),
  );
  const removed = existing.filter((img) => {
    const id = storedGridFsId(img);
    return Boolean(id && !keptIds.has(id));
  });
  await destroyGridFsImages(removed);
}
