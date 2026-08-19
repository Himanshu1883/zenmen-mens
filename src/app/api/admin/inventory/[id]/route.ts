import { requireAdmin } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { fail, ok } from "@/lib/http-responses";
import { productStockAvailability } from "@/lib/inventory";
import { getPrimaryImage } from "@/lib/product-images";
import Product from "@/models/Product";
import { listInventoryLogs } from "@/services/inventoryLogService";
import { applyManualStockChange } from "@/services/stockService";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

function serializeProduct(doc: Record<string, unknown>) {
  const stock = Math.max(0, Number(doc.stock ?? 0));
  const isAvailable = doc.isAvailable !== false;
  const images = Array.isArray(doc.images) ? doc.images : [];
  const primary = getPrimaryImage(
    images as { url?: string; alt?: string; isPrimary?: boolean }[],
  );
  const updatedAt =
    doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt;

  return {
    _id: String(doc._id),
    title: String(doc.title ?? ""),
    slug: String(doc.slug ?? ""),
    category: typeof doc.category === "string" ? doc.category : "",
    subCategory: typeof doc.subCategory === "string" ? doc.subCategory : "",
    stock,
    isAvailable,
    availability: productStockAvailability(stock, isAvailable),
    updatedAt: typeof updatedAt === "string" ? updatedAt : null,
    image: {
      url: primary?.url ?? "/logo_zenmen.png",
      alt: primary?.alt || String(doc.title ?? "Product"),
    },
  };
}

function asRecord(product: {
  toObject?: () => Record<string, unknown>;
}): Record<string, unknown> {
  if (typeof product.toObject === "function") {
    return product.toObject();
  }
  return product as Record<string, unknown>;
}

function serializeLog(doc: Record<string, unknown>) {
  const createdAt =
    doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt;
  return {
    _id: String(doc._id),
    productId: String(doc.productId),
    delta: Number(doc.delta ?? 0),
    previousStock: Number(doc.previousStock ?? 0),
    resultingStock: Number(doc.resultingStock ?? 0),
    reason: String(doc.reason ?? ""),
    orderId: doc.orderId ? String(doc.orderId) : null,
    adminUserId: doc.adminUserId ? String(doc.adminUserId) : null,
    note: typeof doc.note === "string" ? doc.note : "",
    createdAt: typeof createdAt === "string" ? createdAt : null,
  };
}

export async function GET(_req: Request, ctx: Ctx) {
  const admin = await requireAdmin();
  if ("error" in admin) return admin.error;

  const { id } = await ctx.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return fail("INVALID_ID", "Invalid product id", 400);
  }

  await connectDB();
  const product = await Product.findById(id)
    .select("title slug category subCategory stock isAvailable images updatedAt")
    .lean();
  if (!product) return fail("NOT_FOUND", "Product not found", 404);

  const logs = await listInventoryLogs(id, 25);

  return ok({
    product: serializeProduct(product as Record<string, unknown>),
    logs: logs.map((row) => serializeLog(row as Record<string, unknown>)),
  });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const admin = await requireAdmin();
  if ("error" in admin) return admin.error;

  const { id } = await ctx.params;
  const body = (await req.json()) as {
    mode?: "set" | "adjust";
    stock?: number;
    delta?: number;
    note?: string;
  };

  const mode: "set" | "adjust" =
    body.mode === "adjust" || body.mode === "set"
      ? body.mode
      : typeof body.delta === "number"
        ? "adjust"
        : "set";

  const result = await applyManualStockChange({
    productId: id,
    mode,
    stock: body.stock,
    delta: body.delta,
    note: typeof body.note === "string" ? body.note : undefined,
    adminUserId: admin.session?.user?.id,
  });

  if ("error" in result && typeof result.error === "string") {
    const status =
      result.error === "NOT_FOUND"
        ? 404
        : result.error === "CONFLICT"
          ? 409
          : result.error === "INVALID_ID"
            ? 400
            : 422;
    return fail(result.error, result.message ?? "Update failed", status);
  }

  const product = serializeProduct(asRecord(result.product));

  return ok({
    product,
    previousStock: result.previousStock,
    unchanged: result.unchanged,
  });
}
