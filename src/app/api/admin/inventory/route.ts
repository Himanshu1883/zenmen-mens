import { LOW_STOCK_THRESHOLD } from "@/config/inventoryConfig";
import { requireAdmin } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { ok } from "@/lib/http-responses";
import {
  productStockAvailability,
  stockStatusMongoFilter,
} from "@/lib/inventory";
import { getPrimaryImage } from "@/lib/product-images";
import { escapeRegex } from "@/lib/utils";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

function serializeProduct(doc: Record<string, unknown>) {
  const stock = Math.max(0, Number(doc.stock ?? 0));
  const isAvailable = doc.isAvailable !== false;
  const images = Array.isArray(doc.images) ? doc.images : [];
  const primary = getPrimaryImage(
    images as { url?: string; alt?: string; isPrimary?: boolean }[],
  );
  const updatedAt = doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt;

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

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if ("error" in admin) return admin.error;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number(searchParams.get("limit") ?? 20) || 20),
  );
  const q = searchParams.get("q")?.trim().slice(0, 80) ?? "";
  const stock = searchParams.get("stock")?.trim() ?? "";
  const categoriesParam = searchParams.get("categories")?.trim() ?? "";

  const filters: Record<string, unknown>[] = [];

  const categoryNames = categoriesParam
    ? [
        ...new Set(
          categoriesParam
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        ),
      ].slice(0, 50)
    : [];

  if (categoryNames.length > 0) {
    const pattern = `^(${categoryNames.map(escapeRegex).join("|")})$`;
    filters.push({
      $or: [
        { category: { $regex: pattern, $options: "i" } },
        { subCategory: { $regex: pattern, $options: "i" } },
      ],
    });
  }

  if (q) {
    const pattern = escapeRegex(q);
    filters.push({
      $or: [
        { title: { $regex: pattern, $options: "i" } },
        { slug: { $regex: pattern, $options: "i" } },
      ],
    });
  }

  const stockFilter = stockStatusMongoFilter(stock);
  if (stockFilter) filters.push(stockFilter);

  const query =
    filters.length === 0
      ? {}
      : filters.length === 1
        ? filters[0]
        : { $and: filters };

  await connectDB();

  const skip = (page - 1) * limit;
  const [docs, total, all, inStock, lowStock, outOfStock, unitsAgg] =
    await Promise.all([
      Product.find(query)
        .select(
          "title slug category subCategory stock isAvailable images updatedAt",
        )
        .sort({ stock: 1, title: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
      Product.countDocuments({}),
      Product.countDocuments({
        isAvailable: { $ne: false },
        stock: { $gt: LOW_STOCK_THRESHOLD },
      }),
      Product.countDocuments({
        isAvailable: { $ne: false },
        stock: { $gte: 1, $lte: LOW_STOCK_THRESHOLD },
      }),
      Product.countDocuments({
        $or: [{ isAvailable: false }, { stock: { $lte: 0 } }],
      }),
      Product.aggregate<{ totalUnits: number }>([
        { $group: { _id: null, totalUnits: { $sum: "$stock" } } },
      ]),
    ]);

  const pages = Math.ceil(total / limit) || 1;

  return ok({
    products: docs.map((d) => serializeProduct(d as Record<string, unknown>)),
    total,
    page,
    pages,
    limit,
    lowStockThreshold: LOW_STOCK_THRESHOLD,
    stats: {
      total: all,
      inStock,
      lowStock,
      outOfStock,
      totalUnits: Math.max(0, Math.round(unitsAgg[0]?.totalUnits ?? 0)),
    },
  });
}
