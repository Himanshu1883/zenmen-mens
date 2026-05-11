// src/app/api/products/[slug]/route.ts
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;

    // Sanitise: allow only lowercase letters, digits, hyphens
    const safeSlug = slug.replace(/[^a-z0-9-]/gi, "").toLowerCase();

    if (!safeSlug) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    await connectDB();

    const product = await Product.findOne({ slug: safeSlug }).lean();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (err) {
    console.error("[GET /api/products/[slug]]", err);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}
