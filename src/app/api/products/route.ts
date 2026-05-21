import { requireAdmin } from "@/lib/admin-auth";
import cloudinary from "@/lib/cloudinary";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
import slugify from "slugify";

export const revalidate = 60;

// GET ALL PRODUCTS
export async function GET(request: Request) {
  try {
    await connectDB();

    const url = new URL(request.url);

    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? Math.max(1, Number(limitParam)) : null;

    const category = url.searchParams.get("category") || undefined;

    const featured = url.searchParams.get("featured");
    const admin = url.searchParams.get("admin") === "1";

    const query: Record<string, unknown> = {};

    if (!admin) {
      query.isAvailable = true;
    }

    if (category) {
      query.category = category;
    }

    if (featured === "true") {
      query.isFeatured = true;
    }

    const total = await Product.countDocuments(query);

    let productsQuery = Product.find(query).sort({ createdAt: -1 });
    let pages = 1;

    if (limit) {
      pages = Math.ceil(total / limit) || 1;
      const skip = (page - 1) * limit;
      productsQuery = productsQuery.skip(skip).limit(limit);
    }

    const products = await productsQuery.lean();

    return NextResponse.json({
      products,
      total,
      page,
      pages,
    });
  } catch (err) {
    console.error("[GET /api/products]", err);

    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

// CREATE PRODUCT
export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    if (admin.error) return admin.error;

    await connectDB();

    const body = await request.json();

    const {
      title,
      tagline,
      description,
      category,
      subCategory,
      price,
      comparePrice,
      discount,
      images,
      details,
      specifications,
      care,
      colors,
      sizes,
      stock,
      badge,
      accordion,
      seoTitle,
      seoDescription,
      isFeatured,
      isAvailable,
    } = body;

    // REQUIRED VALIDATION
    if (!title || !description || !category || !price || !images?.length) {
      return NextResponse.json(
        {
          error: "Title, description, category, price and images are required",
        },
        { status: 400 },
      );
    }

    // UPLOAD IMAGES TO CLOUDINARY
    const uploadedImages = await Promise.all(
      images.map(async (img: any, index: number) => {
        const uploaded = await cloudinary.uploader.upload(img.file, {
          folder: "zenmen/products",
        });

        return {
          url: uploaded.secure_url,

          public_id: uploaded.public_id,

          alt: img.alt || title,

          isPrimary: img.isPrimary || index === 0,

          order: img.order || index,
        };
      }),
    );

    // GENERATE SLUG
    const slug = slugify(title, {
      lower: true,
      strict: true,
      trim: true,
    });

    // CHECK EXISTING PRODUCT
    const existing = await Product.findOne({
      slug,
    });

    if (existing) {
      return NextResponse.json(
        {
          error: "Product with same title already exists",
        },
        { status: 400 },
      );
    }

    const product = await Product.create({
      title,
      slug,
      tagline,
      description,

      category,
      subCategory,

      price,
      comparePrice,
      discount,

      images: uploadedImages,

      details,

      specifications,

      care,

      colors,

      sizes,

      stock: stock || 0,

      badge,

      accordion,

      seoTitle,

      seoDescription,

      isFeatured: isFeatured || false,

      isAvailable:
        typeof isAvailable === "boolean" ? isAvailable : (stock ?? 0) > 0,
    });

    return NextResponse.json(product, {
      status: 201,
    });
  } catch (err) {
    console.error("[POST /api/products]", err);

    return NextResponse.json(
      {
        error: "Failed to create product",
      },
      { status: 500 },
    );
  }
}
