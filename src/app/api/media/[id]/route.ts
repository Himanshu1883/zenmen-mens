import {
  findProductImageFile,
  getProductImageBucket,
  parseObjectId,
} from "@/lib/gridfs";
import { NextResponse } from "next/server";
import { Readable } from "node:stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

function mimeFromFilename(filename?: string) {
  const ext = (filename || "").split(".").pop()?.toLowerCase();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  if (ext === "avif") return "image/avif";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  return "";
}

function fileHeaders(file: {
  filename?: string;
  contentType?: string | null;
  metadata?: { contentType?: string } | null;
  length?: number;
}) {
  const stored =
    file.contentType?.trim() ||
    file.metadata?.contentType?.trim() ||
    "";
  const type =
    stored && stored !== "application/octet-stream"
      ? stored
      : mimeFromFilename(file.filename) || "application/octet-stream";
  const filename = file.filename?.replace(/[^\w.-]+/g, "_") || "image";
  const headers: Record<string, string> = {
    "Content-Type": type,
    "Content-Disposition": `inline; filename="${filename}"`,
    "Cache-Control": "public, max-age=31536000, immutable",
  };
  if (typeof file.length === "number") {
    headers["Content-Length"] = String(file.length);
  }
  return headers;
}

export async function GET(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!parseObjectId(id)) {
    return NextResponse.json({ error: "Invalid image id" }, { status: 400 });
  }

  try {
    const file = await findProductImageFile(id);
    if (!file) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const bucket = await getProductImageBucket();
    const download = bucket.openDownloadStream(file._id);
    const body = Readable.toWeb(download) as ReadableStream<Uint8Array>;

    return new NextResponse(body, { headers: fileHeaders(file) });
  } catch (err) {
    console.error("[GET /api/media/[id]]", err);
    return NextResponse.json({ error: "Failed to load image" }, { status: 500 });
  }
}

export async function HEAD(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!parseObjectId(id)) {
    return NextResponse.json({ error: "Invalid image id" }, { status: 400 });
  }

  const file = await findProductImageFile(id);
  if (!file) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 200, headers: fileHeaders(file) });
}
