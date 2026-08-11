import { requireAdmin } from "@/lib/admin-auth";
import { serializeCategory } from "@/lib/category-seed";
import { connectDB } from "@/lib/db";
import { slugify } from "@/lib/utils";
import Category from "@/models/Category";
import Product from "@/models/Product";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

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
  selfId: string,
) {
  if (parentId === undefined) return { skip: true as const };
  if (!parentId) return { parentId: null as string | null };

  if (!mongoose.Types.ObjectId.isValid(parentId)) {
    return { error: "Invalid parent category" } as const;
  }
  if (parentId === selfId) {
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

  const childCount = await Category.countDocuments({ parentId: selfId });
  if (childCount > 0) {
    return {
      error: "Cannot nest a category that already has sub-categories",
    } as const;
  }

  return { parentId };
}

export async function PUT(req: Request, context: RouteContext) {
  const admin = await requireAdmin();
  if ("error" in admin) return admin.error;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid category id" },
      { status: 422 },
    );
  }

  const body = (await req.json()) as CategoryInput;
  const name = body.name?.trim();
  const filterValue = body.filterValue?.trim();

  if (!name) {
    return NextResponse.json(
      { success: false, message: "Name is required" },
      { status: 422 },
    );
  }
  if (!filterValue) {
    return NextResponse.json(
      { success: false, message: "Filter value is required" },
      { status: 422 },
    );
  }
  if (
    body.filterType &&
    body.filterType !== "search" &&
    body.filterType !== "category"
  ) {
    return NextResponse.json(
      { success: false, message: "Invalid filter type" },
      { status: 422 },
    );
  }

  const slug = slugify(body.slug?.trim() || name);
  if (!slug) {
    return NextResponse.json(
      { success: false, message: "Could not generate slug" },
      { status: 422 },
    );
  }

  await connectDB();

  const existing = await Category.findById(id).lean();
  if (!existing) {
    return NextResponse.json(
      { success: false, message: "Category not found" },
      { status: 404 },
    );
  }

  const parentCheck = await validateParentId(body.parentId, id);
  if ("error" in parentCheck) {
    return NextResponse.json(
      { success: false, message: parentCheck.error },
      { status: 422 },
    );
  }

  const slugConflict = await Category.findOne({
    slug,
    _id: { $ne: id },
  }).lean();
  if (slugConflict) {
    return NextResponse.json(
      { success: false, message: "A category with this slug already exists" },
      { status: 409 },
    );
  }

  const updatePayload: Record<string, unknown> = {
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
  };

  if (!("skip" in parentCheck)) {
    updatePayload.parentId = parentCheck.parentId;
  }

  const updated = await Category.findByIdAndUpdate(
    id,
    { $set: updatePayload },
    { returnDocument: "after" },
  ).lean();

  if (!updated) {
    return NextResponse.json(
      { success: false, message: "Category not found" },
      { status: 404 },
    );
  }

  if (existing.name !== name) {
    await Product.updateMany(
      { category: existing.name },
      { $set: { category: name } },
    );
  }

  let parentName: string | undefined;
  if (updated.parentId) {
    const parent = await Category.findById(updated.parentId).lean();
    parentName = parent?.name;
  }

  return NextResponse.json({
    success: true,
    category: serializeCategory(
      updated as Record<string, unknown>,
      parentName,
    ),
  });
}

export async function DELETE(_req: Request, context: RouteContext) {
  const admin = await requireAdmin();
  if ("error" in admin) return admin.error;

  const { id } = await context.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid category id" },
      { status: 422 },
    );
  }

  await connectDB();
  const deleted = await Category.findByIdAndDelete(id).lean();

  if (!deleted) {
    return NextResponse.json(
      { success: false, message: "Category not found" },
      { status: 404 },
    );
  }

  await Category.updateMany({ parentId: id }, { $set: { parentId: null } });

  return NextResponse.json({ success: true });
}
