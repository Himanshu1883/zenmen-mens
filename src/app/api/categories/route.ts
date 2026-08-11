import { buildNavMenuGroups } from "@/lib/categories";
import { ensureCategoryHierarchyComplete } from "@/lib/category-seed";
import { connectDB } from "@/lib/db";
import type { CategoryNavDoc } from "@/types/category";
import Category from "@/models/Category";
import { NextResponse } from "next/server";

function toNavDoc(doc: Record<string, unknown>): CategoryNavDoc {
  return {
    _id: String(doc._id),
    name: doc.name as string,
    slug: doc.slug as string,
    filterType: doc.filterType as "search" | "category",
    filterValue: doc.filterValue as string,
    featured: Boolean(doc.featured),
    imageUrl: (doc.imageUrl as string) ?? "",
    order: Number(doc.order ?? 0),
    parentId: doc.parentId ? String(doc.parentId) : null,
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const navOnly = searchParams.get("nav") === "1";

  await connectDB();

  if (navOnly) {
    await ensureCategoryHierarchyComplete();
  }

  const query = navOnly
    ? { isActive: true, showInNav: true }
    : { isActive: true };

  const docs = await Category.find(query)
    .sort({ order: 1, name: 1 })
    .lean();

  if (navOnly) {
    const navDocs = docs.map((doc) => toNavDoc(doc as Record<string, unknown>));
    const groups = buildNavMenuGroups(navDocs);
    return NextResponse.json({ success: true, groups });
  }

  const categories = docs.map((doc) => {
    const base = toNavDoc(doc as Record<string, unknown>);
    return {
      ...base,
      isActive: doc.isActive ?? true,
      showInNav: doc.showInNav ?? true,
      description: doc.description ?? "",
    };
  });

  return NextResponse.json({ success: true, categories });
}
