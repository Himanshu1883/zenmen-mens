import cloudinary from "@/lib/cloudinary";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
import slugify from "slugify";

interface Params {
  params: Promise<{
    slug: string;
  }>;
}

// GET SINGLE PRODUCT
export async function GET(_req: Request, context: Params) {
  try {
    const { slug } = await context.params;

    const safeSlug = slug.replace(/[^a-z0-9-]/gi, "").toLowerCase();

    if (!safeSlug) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    await connectDB();

    const product = await Product.findOne({
      slug: safeSlug,
      isAvailable: true,
    }).lean();

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

// UPDATE PRODUCT
export async function PUT(request: Request, context: Params) {
  try {
    const { slug } = await context.params;

    await connectDB();

    const body = await request.json();

    const existingProduct = await Product.findOne({
      slug,
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          error: "Product not found",
        },
        { status: 404 },
      );
    }

    // UPDATE SLUG
    if (body.title) {
      body.slug = slugify(body.title, {
        lower: true,
        strict: true,
        trim: true,
      });
    }

    // AUTO AVAILABILITY
    if (typeof body.stock === "number") {
      body.isAvailable = body.stock > 0;
    }

    // HANDLE IMAGE UPDATE
    // HANDLE IMAGE UPDATE ONLY IF NEW FILES EXIST
    if (body.images && body.images.some((img: any) => img.file)) {
      const mergedImages = await Promise.all(
        body.images.map(async (img: any, index: number) => {
          // EXISTING IMAGE
          if (img.url && img.public_id && !img.file) {
            return img;
          }

          // NEW IMAGE
          if (img.file) {
            const uploaded = await cloudinary.uploader.upload(img.file, {
              folder: "zenmen/products",
            });

            return {
              url: uploaded.secure_url,

              public_id: uploaded.public_id,

              alt: img.alt || body.title,

              isPrimary: img.isPrimary || index === 0,

              order: img.order || index,
            };
          }

          return null;
        }),
      );

      body.images = mergedImages.filter(Boolean);
    }

    // VERY IMPORTANT
    // IF NO IMAGE UPDATE HAPPENED,
    // REMOVE IMAGES FROM BODY
    // SO MONGOOSE KEEPS EXISTING IMAGES
    else {
      delete body.images;
    }

    const updated = await Product.findOneAndUpdate(
      {
        slug,
      },
      body,
      {
        new: true,
        runValidators: true,
      },
    ).lean();

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PUT /api/products/[slug]]", err);

    return NextResponse.json(
      {
        error: "Failed to update product",
      },
      { status: 500 },
    );
  }
}

// DELETE PRODUCT
export async function DELETE(_req: Request, context: Params) {
  try {
    const { slug } = await context.params;

    await connectDB();

    const product = await Product.findOne({
      slug,
    });

    if (!product) {
      return NextResponse.json(
        {
          error: "Product not found",
        },
        { status: 404 },
      );
    }

    // DELETE CLOUDINARY IMAGES
    await Promise.all(
      product.images.map(async (img: any) => {
        if (img.public_id) {
          await cloudinary.uploader.destroy(img.public_id);
        }
      }),
    );

    // DELETE PRODUCT
    await Product.findOneAndDelete({
      slug,
    });

    return NextResponse.json({
      success: true,

      message: "Product deleted successfully",
    });
  } catch (err) {
    console.error("[DELETE /api/products/[slug]]", err);

    return NextResponse.json(
      {
        error: "Failed to delete product",
      },
      { status: 500 },
    );
  }
}
