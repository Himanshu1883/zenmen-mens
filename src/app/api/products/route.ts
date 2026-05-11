// src/app/api/products/route.ts
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export const revalidate = 60; // ISR — revalidate every 60 seconds

export async function GET() {
  try {
    await connectDB();
    const products = await Product.find({ isAvailable: true })
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json(products);
  } catch (err) {
    console.error("[GET /api/products]", err);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
