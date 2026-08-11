import {
  DEFAULT_CHILD_PARENT_BY_NAME,
  DEFAULT_CHILD_PARENT_SLUGS,
  DEFAULT_NAV_CATEGORIES,
  getChildOrderUnderParent,
  getDefaultParentSlugs,
} from "@/lib/categories";
import { connectDB } from "@/lib/db";
import { slugify } from "@/lib/utils";
import Category from "@/models/Category";
import mongoose from "mongoose";

function seedFields(item: (typeof DEFAULT_NAV_CATEGORIES)[number]) {
  return {
    name: item.name,
    slug: slugify(item.name),
    filterType: item.filterType ?? "search",
    filterValue: item.filterValue,
    featured: item.featured,
    isActive: true,
    showInNav: true,
  };
}

async function upsertCategoryBySlug(
  slug: string,
  fields: Record<string, unknown>,
) {
  return Category.findOneAndUpdate(
    { slug },
    { $set: { ...fields, slug } },
    {
      upsert: true,
      new: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
    },
  ).lean();
}

async function linkChildToParentSlug(childSlug: string, parentSlug: string) {
  const parent = await Category.findOne({ slug: parentSlug }).select("_id").lean();
  if (!parent?._id) return false;

  const result = await Category.updateOne(
    { slug: childSlug },
    { $set: { parentId: new mongoose.Types.ObjectId(String(parent._id)) } },
  );

  return result.matchedCount > 0;
}

export async function seedDefaultCategoriesIfEmpty() {
  await connectDB();
  const count = await Category.countDocuments();
  if (count > 0) return false;

  await ensureCategoryHierarchyComplete();
  return true;
}

/**
 * Upsert all default categories and wire every child to its parent (Shirt / Suit groups).
 * Safe to run on every nav request — idempotent.
 */
export async function ensureCategoryHierarchyComplete() {
  await connectDB();

  const parentItems = DEFAULT_NAV_CATEGORIES.filter((c) => !c.parentSlug);
  const childItems = DEFAULT_NAV_CATEGORIES.filter((c) => c.parentSlug);

  // 1. Upsert every default row (parentId cleared — linked in step 2)
  for (const item of DEFAULT_NAV_CATEGORIES) {
    const slug = slugify(item.name);
    const order = getChildOrderUnderParent(item, DEFAULT_NAV_CATEGORIES);
    await upsertCategoryBySlug(slug, {
      ...seedFields(item),
      order,
      parentId: null,
    });
  }

  // 2. Link each child to its parent by slug (fresh DB lookup — reliable)
  for (const item of childItems) {
    const childSlug = slugify(item.name);
    const parentSlug = item.parentSlug!;
    const order = getChildOrderUnderParent(item, DEFAULT_NAV_CATEGORIES);

    await linkChildToParentSlug(childSlug, parentSlug);
    await Category.updateOne({ slug: childSlug }, { $set: { order } });
  }

  // 3. Catch-all link for any existing row matching known child slugs/names
  const parentSlugs = getDefaultParentSlugs();
  for (const doc of await Category.find({}).lean()) {
    if (parentSlugs.has(doc.slug)) {
      await Category.updateOne(
        { _id: doc._id },
        { $set: { parentId: null } },
      );
      continue;
    }

    const parentSlug =
      DEFAULT_CHILD_PARENT_SLUGS[doc.slug] ??
      DEFAULT_CHILD_PARENT_BY_NAME[String(doc.name).toLowerCase().trim()];
    if (!parentSlug) continue;

    await linkChildToParentSlug(doc.slug, parentSlug);
  }

  return true;
}

/** @deprecated use ensureCategoryHierarchyComplete */
export async function syncDefaultCategoryHierarchy() {
  return ensureCategoryHierarchyComplete();
}

export function serializeCategory(
  doc: Record<string, unknown>,
  parentName?: string,
) {
  return {
    _id: String(doc._id),
    name: doc.name as string,
    slug: doc.slug as string,
    filterType: doc.filterType as "search" | "category",
    filterValue: doc.filterValue as string,
    featured: Boolean(doc.featured),
    isActive: Boolean(doc.isActive),
    showInNav: Boolean(doc.showInNav),
    order: Number(doc.order ?? 0),
    imageUrl: (doc.imageUrl as string) ?? "",
    description: (doc.description as string) ?? "",
    parentId: doc.parentId ? String(doc.parentId) : null,
    parentName: parentName ?? undefined,
    createdAt: doc.createdAt
      ? new Date(doc.createdAt as string).toISOString()
      : undefined,
    updatedAt: doc.updatedAt
      ? new Date(doc.updatedAt as string).toISOString()
      : undefined,
  };
}
