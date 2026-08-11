import { requireAdmin } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { findProductBySlug } from "@/lib/product-slug";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ slug: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  const admin = await requireAdmin();
  if ("error" in admin) return admin.error;

  const { slug } = await context.params;
  const body = (await req.json()) as { category?: string };

  const nextCategory = body.category?.trim();
  if (!nextCategory) {
    return NextResponse.json(
      { success: false, message: "Category is required" },
      { status: 422 },
    );
  }

  await connectDB();
  const product = await findProductBySlug(slug);
  if (!product) {
    return NextResponse.json(
      { success: false, message: "Product not found" },
      { status: 404 },
    );
  }

  await Product.findByIdAndUpdate(product._id, {
    $set: { category: nextCategory },
  });

  return NextResponse.json({
    success: true,
    slug: product.slug,
    category: nextCategory,
  });
}
