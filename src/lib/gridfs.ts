import { connectDB } from "@/lib/db";
import { GridFSBucket, ObjectId, type GridFSFile } from "mongodb";

export const PRODUCT_IMAGE_BUCKET = "productImages";
export const MEDIA_ROUTE = "/api/media";
export const MAX_PRODUCT_IMAGE_BYTES = 8 * 1024 * 1024;

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

export function productMediaUrl(id: string) {
  return `${MEDIA_ROUTE}/${id}`;
}

export function parseObjectId(id: string | undefined | null): ObjectId | null {
  if (!id || !/^[a-f0-9]{24}$/i.test(id)) return null;
  return new ObjectId(id);
}

export function isGridFsId(id: string | undefined | null): boolean {
  return Boolean(parseObjectId(id));
}

export async function getProductImageBucket() {
  const conn = await connectDB();
  const db = conn.db;
  if (!db) {
    throw new Error("MongoDB is not connected");
  }
  return new GridFSBucket(db, { bucketName: PRODUCT_IMAGE_BUCKET });
}

export function parseImageDataUrl(dataUrl: string): {
  buffer: Buffer;
  contentType: string;
} {
  const match = dataUrl.match(
    /^data:([a-z0-9.+-]+\/[a-z0-9.+-]+);base64,([\s\S]+)$/i,
  );
  if (!match) {
    throw new Error("Invalid image upload");
  }

  const mime = match[1].toLowerCase();
  if (!ALLOWED_MIME.has(mime)) {
    throw new Error("Unsupported image type");
  }

  const contentType = mime === "image/jpg" ? "image/jpeg" : mime;
  const buffer = Buffer.from(match[2], "base64");
  if (!buffer.length) {
    throw new Error("Empty image upload");
  }
  if (buffer.length > MAX_PRODUCT_IMAGE_BYTES) {
    throw new Error("Image is too large (max 8MB)");
  }

  return { buffer, contentType };
}

export function extensionForMime(contentType: string) {
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  if (contentType === "image/gif") return "gif";
  if (contentType === "image/avif") return "avif";
  return "jpg";
}

export async function uploadProductImageBuffer(opts: {
  buffer: Buffer;
  filename: string;
  contentType: string;
  metadata?: Record<string, string>;
}): Promise<{ id: string; url: string }> {
  if (opts.buffer.length > MAX_PRODUCT_IMAGE_BYTES) {
    throw new Error("Image is too large (max 8MB)");
  }

  const bucket = await getProductImageBucket();
  const id = await new Promise<ObjectId>((resolve, reject) => {
    const stream = bucket.openUploadStream(opts.filename, {
      metadata: {
        ...opts.metadata,
        contentType: opts.contentType,
      },
    });
    stream.once("error", reject);
    stream.once("finish", () => resolve(stream.id as ObjectId));
    stream.end(opts.buffer);
  });

  const sid = String(id);
  return { id: sid, url: productMediaUrl(sid) };
}

export async function deleteProductImage(id: string): Promise<void> {
  const oid = parseObjectId(id);
  if (!oid) return;

  const bucket = await getProductImageBucket();
  try {
    await bucket.delete(oid);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/FileNotFound|not found/i.test(msg)) return;
    throw err;
  }
}

export async function findProductImageFile(
  id: string,
): Promise<GridFSFile | null> {
  const oid = parseObjectId(id);
  if (!oid) return null;

  const bucket = await getProductImageBucket();
  const files = await bucket.find({ _id: oid }).limit(1).toArray();
  return files[0] ?? null;
}
