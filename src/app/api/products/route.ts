import { requireAdmin } from "@/lib/admin-auth";
import cloudinary from "@/lib/cloudinary";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { normalizePrimaryFlags } from "@/lib/product-images";
import { escapeRegex } from "@/lib/utils";
import { NextResponse } from "next/server";
import slugify from "slugify";

export const revalidate = 60;

type IncomingImage = {
  file?: string;
  alt?: string;
  isPrimary?: boolean;
  order?: number;
};

// GET ALL PRODUCTS
export async function GET(request: Request) {
  try {
    await connectDB();

    const url = new URL(request.url);

    const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? Math.max(1, Number(limitParam)) : null;

    const category = url.searchParams.get("category") || undefined;
    const categoriesParam = url.searchParams.get("categories");
    const q = url.searchParams.get("q")?.trim() ?? "";
    const stock = url.searchParams.get("stock");
    const available = url.searchParams.get("available");
    const featured = url.searchParams.get("featured");
    const admin = url.searchParams.get("admin") === "1";

    const filters: Record<string, unknown>[] = [];

    if (!admin) {
      filters.push({ isAvailable: true });
    }

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
    } else if (category) {
      // Storefront contract: exact Product.category match
      filters.push({ category });
    }

    if (q) {
      const pattern = escapeRegex(q.slice(0, 80));
      filters.push({
        $or: [
          { title: { $regex: pattern, $options: "i" } },
          { slug: { $regex: pattern, $options: "i" } },
        ],
      });
    }

    if (featured === "true") {
      filters.push({ isFeatured: true });
    } else if (featured === "false") {
      filters.push({ isFeatured: { $ne: true } });
    }

    if (available === "true") {
      filters.push({ isAvailable: { $ne: false } });
    } else if (available === "false") {
      filters.push({ isAvailable: false });
    }

    if (stock === "in") {
      filters.push({ isAvailable: { $ne: false }, stock: { $gt: 3 } });
    } else if (stock === "low") {
      filters.push({
        isAvailable: { $ne: false },
        stock: { $gte: 1, $lte: 3 },
      });
    } else if (stock === "out") {
      filters.push({
        $or: [{ isAvailable: false }, { stock: { $lte: 0 } }],
      });
    }

    const query =
      filters.length === 0
        ? {}
        : filters.length === 1
          ? filters[0]
          : { $and: filters };

    const total = await Product.countDocuments(query);

    let productsQuery = Product.find(query).sort({ createdAt: -1 });
    let pages = 1;

    if (limit) {
      pages = Math.ceil(total / limit) || 1;
      const skip = (page - 1) * limit;
      productsQuery = productsQuery.skip(skip).limit(limit);
    }

    const products = await productsQuery.lean();

    let stats:
      | {
          total: number;
          inStock: number;
          lowStock: number;
          outOfStock: number;
        }
      | undefined;

    if (admin) {
      const [all, inStock, lowStock, outOfStock] = await Promise.all([
        Product.countDocuments({}),
        Product.countDocuments({
          isAvailable: { $ne: false },
          stock: { $gt: 3 },
        }),
        Product.countDocuments({
          isAvailable: { $ne: false },
          stock: { $gte: 1, $lte: 3 },
        }),
        Product.countDocuments({
          $or: [{ isAvailable: false }, { stock: { $lte: 0 } }],
        }),
      ]);
      stats = { total: all, inStock, lowStock, outOfStock };
    }

    return NextResponse.json({
      products,
      total,
      page,
      pages,
      ...(stats ? { stats } : {}),
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
      deliveryLeadValue,
      deliveryLeadUnit,
      showDeliveryLead,
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

    const uploadedImages = normalizePrimaryFlags(
      await Promise.all(
        images.map(async (img: IncomingImage, index: number) => {
          const uploaded = await cloudinary.uploader.upload(img.file!, {
            folder: "zenmen/products",
          });

          return {
            url: uploaded.secure_url,
            public_id: uploaded.public_id,
            alt: img.alt || title,
            isPrimary: Boolean(img.isPrimary),
            order: img.order ?? index,
          };
        }),
      ),
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

      deliveryLeadValue:
        typeof deliveryLeadValue === "number" && deliveryLeadValue >= 0
          ? deliveryLeadValue
          : undefined,
      deliveryLeadUnit: deliveryLeadUnit ?? "days",
      showDeliveryLead: Boolean(showDeliveryLead),

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
