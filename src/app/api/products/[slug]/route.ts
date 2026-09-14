import { requireAdmin } from "@/lib/admin-auth";
import { applyCollectionPin } from "@/lib/collection-pin";
import { connectDB } from "@/lib/db";
import { findProductBySlug } from "@/lib/find-product-by-slug";
import { canonicalProductSlug } from "@/lib/product-slug";
import { productHasStorefrontImage } from "@/lib/product-images";
import {
  destroyGridFsImages,
  destroyRemovedGridFsImages,
  processIncomingProductImages,
  type IncomingProductImage,
} from "@/lib/product-image-store";
import { revalidateStorefrontProducts } from "@/lib/revalidate-storefront";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    slug: string;
  }>;
}

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

    if (
      !adminView &&
      (product.isAvailable === false ||
        !productHasStorefrontImage(product.images))
    ) {
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
    const admin = await requireAdmin();
    if (admin.error) return admin.error;

    const { slug } = await context.params;
    await connectDB();

    const body = await request.json();
    const existing = await findProductBySlug(slug);

    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const title = typeof body.title === "string"
      ? body.title.replace(/\s+/g, " ").trim()
      : existing.title;
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const updates: Record<string, unknown> = {
      title,
      tagline: body.tagline ?? existing.tagline,
      description: body.description ?? existing.description,
      category:
        typeof body.category === "string"
          ? body.category.trim()
          : existing.category,
      subCategory:
        typeof body.subCategory === "string"
          ? body.subCategory.trim()
          : existing.subCategory,
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

    const nextCategory =
      typeof updates.category === "string"
        ? updates.category
        : (existing.category ?? "");
    if (typeof body.pinToCollection === "boolean") {
      const pin = await applyCollectionPin({
        productId: existing._id,
        category: nextCategory,
        pin: body.pinToCollection,
      });
      updates.pinToCollection = pin.pinToCollection;
      updates.collectionPinAt = pin.collectionPinAt;
    }

    if (typeof body.deliveryLeadValue === "number") {
      updates.deliveryLeadValue =
        body.deliveryLeadValue >= 0 ? body.deliveryLeadValue : undefined;
    } else if (body.deliveryLeadValue === null) {
      updates.deliveryLeadValue = undefined;
    }

    if (
      body.deliveryLeadUnit === "days" ||
      body.deliveryLeadUnit === "weeks" ||
      body.deliveryLeadUnit === "months"
    ) {
      updates.deliveryLeadUnit = body.deliveryLeadUnit;
    }

    if (typeof body.showDeliveryLead === "boolean") {
      updates.showDeliveryLead = body.showDeliveryLead;
    }

    if (typeof body.stock === "number") {
      updates.stock = body.stock;
    }

    if (typeof body.isAvailable === "boolean") {
      updates.isAvailable = body.isAvailable;
    } else if (typeof body.stock === "number") {
      updates.isAvailable = body.stock > 0;
    }

    let nextSlug = canonicalProductSlug(title);
    if (nextSlug && nextSlug !== existing.slug) {
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

      const existingImages = (existing.images ?? []) as IncomingProductImage[];

      try {
        const processedImages = await processIncomingProductImages(
          body.images as IncomingProductImage[],
          title,
          existingImages,
        );

        if (!processedImages.length) {
          return NextResponse.json(
            {
              error:
                "No valid images to save. Upload an image file or keep an existing photo.",
            },
            { status: 400 },
          );
        }

        await destroyRemovedGridFsImages(existingImages, processedImages);
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
      { returnDocument: "after", runValidators: true },
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    const slugForRevalidate = String(updated.slug ?? existing.slug);
    revalidateStorefrontProducts([
      slugForRevalidate,
      String(existing.slug ?? ""),
    ]);

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

    await destroyGridFsImages(doc.images);

    await Product.findOneAndDelete({ _id: doc._id });

    revalidateStorefrontProducts([String(product.slug ?? "")]);

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
