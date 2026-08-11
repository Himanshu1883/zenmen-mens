import { DEFAULT_CHILD_PARENT_SLUGS } from "@/lib/categories";
import { requireAdmin } from "@/lib/admin-auth";
import {
  ensureCategoryHierarchyComplete,
  seedDefaultCategoriesIfEmpty,
  serializeCategory,
} from "@/lib/category-seed";
import { connectDB } from "@/lib/db";
import { slugify } from "@/lib/utils";
import Category from "@/models/Category";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

type CategoryInput = {
  name?: string;
  slug?: string;
  filterType?: "search" | "category";
  filterValue?: string;
  featured?: boolean;
  isActive?: boolean;
  showInNav?: boolean;
  order?: number;
  imageUrl?: string;
  description?: string;
  parentId?: string | null;
};

async function validateParentId(
  parentId: string | null | undefined,
  selfId?: string,
) {
  if (!parentId) return { parentId: null as string | null };

  if (!mongoose.Types.ObjectId.isValid(parentId)) {
    return { error: "Invalid parent category" } as const;
  }
  if (selfId && parentId === selfId) {
    return { error: "Category cannot be its own parent" } as const;
  }

  const parent = await Category.findById(parentId).lean();
  if (!parent) {
    return { error: "Parent category not found" } as const;
  }
  if (parent.parentId) {
    return {
      error: "Parent must be a top-level category (one level of nesting only)",
    } as const;
  }

  return { parentId };
}

function validateInput(body: CategoryInput) {
  const name = body.name?.trim();
  const filterValue = body.filterValue?.trim();

  if (!name) {
    return { error: "Name is required" } as const;
  }
  if (!filterValue) {
    return { error: "Filter value is required" } as const;
  }
  if (
    body.filterType &&
    body.filterType !== "search" &&
    body.filterType !== "category"
  ) {
    return { error: "Invalid filter type" } as const;
  }

  const slug = slugify(body.slug?.trim() || name);
  if (!slug) {
    return { error: "Could not generate slug" } as const;
  }

  return {
    data: {
      name,
      slug,
      filterType: body.filterType ?? "search",
      filterValue,
      featured: body.featured ?? false,
      isActive: body.isActive ?? true,
      showInNav: body.showInNav ?? true,
      order: typeof body.order === "number" ? body.order : 0,
      imageUrl: body.imageUrl?.trim() ?? "",
      description: body.description?.trim() ?? "",
    },
  } as const;
}

export async function GET() {
  const admin = await requireAdmin();
  if ("error" in admin) return admin.error;

  await seedDefaultCategoriesIfEmpty();
  await ensureCategoryHierarchyComplete();

  await connectDB();
  const docs = await Category.find({}).sort({ order: 1, name: 1 }).lean();
  const nameById = new Map(docs.map((d) => [String(d._id), d.name]));
  const nameBySlug = new Map(docs.map((d) => [d.slug, d.name]));

  return NextResponse.json({
    success: true,
    categories: docs.map((doc) => {
      let parentName: string | undefined;
      if (doc.parentId) {
        parentName = nameById.get(String(doc.parentId));
      } else {
        const parentSlug = DEFAULT_CHILD_PARENT_SLUGS[doc.slug];
        if (parentSlug) parentName = nameBySlug.get(parentSlug);
      }
      return serializeCategory(
        doc as Record<string, unknown>,
        parentName,
      );
    }),
  });
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if ("error" in admin) return admin.error;

  const body = (await req.json()) as CategoryInput;
  const validated = validateInput(body);
  if ("error" in validated) {
    return NextResponse.json(
      { success: false, message: validated.error },
      { status: 422 },
    );
  }

  await connectDB();

  const parentCheck = await validateParentId(body.parentId ?? null);
  if ("error" in parentCheck) {
    return NextResponse.json(
      { success: false, message: parentCheck.error },
      { status: 422 },
    );
  }

  const existing = await Category.findOne({ slug: validated.data.slug }).lean();
  if (existing) {
    return NextResponse.json(
      { success: false, message: "A category with this slug already exists" },
      { status: 409 },
    );
  }

  const created = await Category.create({
    ...validated.data,
    parentId: parentCheck.parentId,
  });

  let parentName: string | undefined;
  if (parentCheck.parentId) {
    const parent = await Category.findById(parentCheck.parentId).lean();
    parentName = parent?.name;
  }

  return NextResponse.json(
    {
      success: true,
      category: serializeCategory(
        created.toObject() as Record<string, unknown>,
        parentName,
      ),
    },
    { status: 201 },
  );
}
