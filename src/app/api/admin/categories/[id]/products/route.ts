import { requireAdmin } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(_req: Request, context: RouteContext) {
  const admin = await requireAdmin();
  if ("error" in admin) return admin.error;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid category id" },
      { status: 400 },
    );
  }

  await connectDB();
  const category = await Category.findById(id).lean();
  if (!category) {
    return NextResponse.json(
      { success: false, message: "Category not found" },
      { status: 404 },
    );
  }

  const categoryNames = new Set<string>([category.name]);
  if (category.filterType === "category") {
    categoryNames.add(category.filterValue);
  }

  const select =
    "title slug price category subCategory stock isAvailable images isFeatured";

  const exactProducts = await Product.find({
    category: { $in: Array.from(categoryNames) },
  })
    .select(select)
    .sort({ title: 1 })
    .lean();

  let relatedProducts: typeof exactProducts = [];
  if (category.filterType === "search" && category.filterValue.trim()) {
    const regex = new RegExp(escapeRegex(category.filterValue.trim()), "i");
    const exactIds = exactProducts.map((p) => p._id);
    relatedProducts = await Product.find({
      _id: { $nin: exactIds },
      $or: [
        { title: regex },
        { category: regex },
        { tagline: regex },
        { subCategory: regex },
      ],
    })
      .select(select)
      .sort({ title: 1 })
      .limit(50)
      .lean();
  }

  const mapProduct = (
    doc: (typeof exactProducts)[number],
    assigned: boolean,
  ) => {
    const images = (doc.images ?? []) as {
      url?: string;
      isPrimary?: boolean;
    }[];
    return {
      _id: String(doc._id),
      title: doc.title,
      slug: doc.slug,
      price: doc.price,
      category: doc.category ?? "",
      subCategory: doc.subCategory ?? "",
      stock: doc.stock ?? 0,
      isAvailable: doc.isAvailable !== false,
      isFeatured: doc.isFeatured ?? false,
      assigned,
      imageUrl:
        images.find((img) => img.isPrimary)?.url ?? images[0]?.url ?? "",
    };
  };

  return NextResponse.json({
    success: true,
    category: {
      _id: String(category._id),
      name: category.name,
      filterType: category.filterType,
      filterValue: category.filterValue,
    },
    products: [
      ...exactProducts.map((p) => mapProduct(p, true)),
      ...relatedProducts.map((p) => mapProduct(p, false)),
    ],
    counts: {
      assigned: exactProducts.length,
      related: relatedProducts.length,
      total: exactProducts.length + relatedProducts.length,
    },
  });
}
