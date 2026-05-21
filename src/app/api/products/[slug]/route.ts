import cloudinary from "@/lib/cloudinary";
import { resolveImagePublicId } from "@/lib/cloudinary-public-id";
import { requireAdmin } from "@/lib/admin-auth";
import { connectDB } from "@/lib/db";
import { findProductBySlug } from "@/lib/product-slug";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
import slugify from "slugify";

interface Params {
  params: Promise<{
    slug: string;
  }>;
}

type IncomingImage = {
  url: string;
  alt?: string;
  isPrimary?: boolean;
  order?: number;
  public_id?: string;
  file?: string;
};

// GET SINGLE PRODUCT
export async function GET(req: Request, context: Params) {
  try {
    const { slug } = await context.params;
    const adminView = new URL(req.url).searchParams.get("admin") === "1";

    if (!slug?.trim()) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    await connectDB();

    const product = await findProductBySlug(slug);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (!adminView && product.isAvailable === false) {
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

async function destroyCloudinaryImages(
  images: { public_id?: string }[],
): Promise<void> {
  await Promise.all(
    images.map(async (img) => {
      if (img.public_id) {
        try {
          await cloudinary.uploader.destroy(img.public_id);
        } catch (e) {
          console.error("[cloudinary destroy]", img.public_id, e);
        }
      }
    }),
  );
}

async function processIncomingImages(
  images: IncomingImage[],
  title: string,
  existingImages: IncomingImage[],
): Promise<
  {
    url: string;
    alt: string;
    isPrimary: boolean;
    order: number;
    public_id: string;
  }[]
> {
  const result = await Promise.all(
    images.map(async (img, index) => {
      if (img.file) {
        const uploaded = await cloudinary.uploader.upload(img.file, {
          folder: "zenmen/products",
        });
        return {
          url: uploaded.secure_url,
          public_id: uploaded.public_id,
          alt: img.alt || title,
          isPrimary: Boolean(img.isPrimary),
          order: img.order ?? index,
        };
      }

      if (img.url) {
        const public_id = resolveImagePublicId(img, existingImages);

        if (!public_id) {
          console.warn("[PUT] could not resolve public_id:", img.url);
          return null;
        }

        return {
          url: img.url,
          public_id,
          alt: img.alt || title,
          isPrimary: Boolean(img.isPrimary),
          order: img.order ?? index,
        };
      }

      return null;
    }),
  );

  const cleaned = result.filter(Boolean) as {
    url: string;
    alt: string;
    isPrimary: boolean;
    order: number;
    public_id: string;
  }[];

  if (cleaned.length > 0 && !cleaned.some((i) => i.isPrimary)) {
    cleaned[0].isPrimary = true;
  }

  return cleaned;
}

// UPDATE PRODUCT
export async function PUT(request: Request, context: Params) {
  try {
    const admin = await requireAdmin();
    if (admin.error) return admin.error;

    const { slug } = await context.params;
    await connectDB();

    const body = await request.json();
    const existing = await findProductBySlug(slug);

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const title = typeof body.title === "string" ? body.title.trim() : existing.title;
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const updates: Record<string, unknown> = {
      title,
      tagline: body.tagline ?? existing.tagline,
      description: body.description ?? existing.description,
      category: body.category ?? existing.category,
      subCategory: body.subCategory ?? existing.subCategory,
      price: typeof body.price === "number" ? body.price : existing.price,
      comparePrice: body.comparePrice ?? existing.comparePrice,
      discount: body.discount ?? existing.discount,
      badge: body.badge ?? existing.badge,
      care: body.care ?? existing.care,
      colors: Array.isArray(body.colors) ? body.colors : existing.colors,
      sizes: Array.isArray(body.sizes) ? body.sizes : existing.sizes,
      details: Array.isArray(body.details) ? body.details : existing.details,
      specifications: Array.isArray(body.specifications)
        ? body.specifications
        : existing.specifications,
      accordion: Array.isArray(body.accordion)
        ? body.accordion
        : existing.accordion,
      seoTitle: body.seoTitle ?? existing.seoTitle,
      seoDescription: body.seoDescription ?? existing.seoDescription,
      isFeatured:
        typeof body.isFeatured === "boolean"
          ? body.isFeatured
          : existing.isFeatured,
    };

    if (typeof body.stock === "number") {
      updates.stock = body.stock;
    }

    if (typeof body.isAvailable === "boolean") {
      updates.isAvailable = body.isAvailable;
    } else if (typeof body.stock === "number") {
      updates.isAvailable = body.stock > 0;
    }

    if (title !== existing.title) {
      let nextSlug = slugify(title, {
        lower: true,
        strict: true,
        trim: true,
      });
      const clash = await Product.findOne({
        slug: nextSlug,
        _id: { $ne: existing._id },
      });
      if (clash) {
        nextSlug = `${nextSlug}-${String(existing._id).slice(-6)}`;
      }
      updates.slug = nextSlug;
    }

    if (Array.isArray(body.images)) {
      if (body.images.length === 0) {
        return NextResponse.json(
          { error: "At least one image is required" },
          { status: 400 },
        );
      }

      const existingImages = (existing.images ?? []) as IncomingImage[];
      const incomingIds = new Set(
        body.images
          .map((img: IncomingImage) => resolveImagePublicId(img, existingImages))
          .filter(Boolean) as string[],
      );

      const removed = existingImages.filter((img) => {
        const pid = resolveImagePublicId(img, existingImages);
        return pid && !incomingIds.has(pid);
      });
      await destroyCloudinaryImages(removed);

      try {
        const processedImages = await processIncomingImages(
          body.images,
          title,
          existingImages,
        );

        if (!processedImages.length) {
          return NextResponse.json(
            {
              error:
                "No valid images to save. Use Cloudinary-hosted image URLs or re-upload.",
            },
            { status: 400 },
          );
        }

        updates.images = processedImages;
      } catch (imgErr) {
        console.error("[PUT images]", imgErr);
        return NextResponse.json(
          { error: "Failed to process product images" },
          { status: 400 },
        );
      }
    }

    const updated = await Product.findOneAndUpdate(
      { _id: existing._id },
      { $set: updates },
      { new: true, runValidators: true },
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PUT /api/products/[slug]]", err);

    const message =
      err instanceof Error ? err.message : "Failed to update product";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE PRODUCT
export async function DELETE(_req: Request, context: Params) {
  try {
    const admin = await requireAdmin();
    if (admin.error) return admin.error;

    const { slug } = await context.params;

    await connectDB();

    const product = await findProductBySlug(slug);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const doc = await Product.findOne({ slug: product.slug });
    if (!doc) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await destroyCloudinaryImages(doc.images);

    await Product.findOneAndDelete({ _id: doc._id });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (err) {
    console.error("[DELETE /api/products/[slug]]", err);

    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 },
    );
  }
}
