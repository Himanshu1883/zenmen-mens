import type {
  CategoryFilterType,
  CategoryNavDoc,
  NavCategory,
  NavMenuGroup,
} from "@/types/category";
import { slugify } from "@/lib/utils";

export type DefaultCategorySeed = {
  name: string;
  filterValue: string;
  featured: boolean;
  filterType?: CategoryFilterType;
  /** Slug of parent category — omit for top-level items. */
  parentSlug?: string;
};

/**
 * Full megamenu hierarchy.
 * Parents: top-level nav items. Children: nested under Shirt / Suit groups.
 */
export const DEFAULT_NAV_CATEGORIES: DefaultCategorySeed[] = [
  // ── Standalone parents ──
  { name: "Kurta-Pajama", filterValue: "kurta", featured: true },
  { name: "Pants/Trousers", filterValue: "pants", featured: false },
  { name: "Indo-Western", filterValue: "indo-western", featured: true },
  { name: "Buttons", filterValue: "button", featured: false },
  { name: "Tie", filterValue: "tie", featured: false },
  { name: "Broches", filterValue: "brooch", featured: false },

  // ── Shirt group ──
  { name: "Shirt", filterValue: "shirt", featured: false },
  {
    name: "Designer Shirt",
    filterValue: "designer shirt",
    featured: false,
    parentSlug: "shirt",
  },
  {
    name: "Formal Shirt",
    filterValue: "formal shirt",
    featured: false,
    parentSlug: "shirt",
  },
  {
    name: "Linen Shirt",
    filterValue: "linen shirt",
    featured: false,
    parentSlug: "shirt",
  },
  {
    name: "Handloom Shirt",
    filterValue: "handloom shirt",
    featured: false,
    parentSlug: "shirt",
  },
  {
    name: "Safari Shirt",
    filterValue: "safari shirt",
    featured: false,
    parentSlug: "shirt",
  },

  // ── Suit group ──
  { name: "Suit", filterValue: "suit", featured: true },
  {
    name: "Designer Suits",
    filterValue: "designer suit",
    featured: true,
    parentSlug: "suit",
  },
  {
    name: "Two Piece Suit",
    filterValue: "two piece",
    featured: false,
    parentSlug: "suit",
  },
  {
    name: "Three Piece Suit",
    filterValue: "three piece",
    featured: true,
    parentSlug: "suit",
  },
  {
    name: "Five Piece Suit",
    filterValue: "five piece",
    featured: false,
    parentSlug: "suit",
  },
  {
    name: "Double Breasted Suit",
    filterValue: "double breasted",
    featured: false,
    parentSlug: "suit",
  },
  {
    name: "Jodhpuri Suit",
    filterValue: "jodhpuri",
    featured: false,
    parentSlug: "suit",
  },
];

/** child slug → parent slug */
export const DEFAULT_CHILD_PARENT_SLUGS: Record<string, string> =
  Object.fromEntries(
    DEFAULT_NAV_CATEGORIES.filter((c) => c.parentSlug).map((c) => [
      slugify(c.name),
      c.parentSlug!,
    ]),
  );

/** child name (lowercase) → parent slug — fallback when slugs differ in legacy DB */
export const DEFAULT_CHILD_PARENT_BY_NAME: Record<string, string> =
  Object.fromEntries(
    DEFAULT_NAV_CATEGORIES.filter((c) => c.parentSlug).map((c) => [
      c.name.toLowerCase().trim(),
      c.parentSlug!,
    ]),
  );

export function categoryCollectionHref(
  filterType: CategoryFilterType,
  filterValue: string,
): string {
  const param =
    filterType === "category"
      ? `category=${encodeURIComponent(filterValue)}`
      : `q=${encodeURIComponent(filterValue)}`;
  return `/collection?${param}`;
}

export function toNavCategory(item: {
  _id?: string;
  name: string;
  slug: string;
  filterType: CategoryFilterType;
  filterValue: string;
  featured?: boolean;
  imageUrl?: string;
}): NavCategory {
  return {
    _id: item._id,
    name: item.name,
    slug: item.slug,
    filterType: item.filterType,
    filterValue: item.filterValue,
    featured: item.featured ?? false,
    imageUrl: item.imageUrl,
    href: categoryCollectionHref(item.filterType, item.filterValue),
  };
}

export function flattenNavGroups(groups: NavMenuGroup[]): NavCategory[] {
  const flat: NavCategory[] = [];
  for (const group of groups) {
    flat.push(group.parent);
    flat.push(...group.children);
  }
  return flat;
}

/**
 * Build megamenu groups from flat categories.
 * Top-level items with children → group; without children → standalone block.
 */
export function buildNavMenuGroups(categories: CategoryNavDoc[]): NavMenuGroup[] {
  const sorted = [...categories].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name),
  );

  const slugToId = new Map(sorted.map((c) => [c.slug, c._id]));

  // Resolve parentId from DB or fallback map when missing
  const withParent = sorted.map((cat) => {
    if (cat.parentId) return cat;
    const parentSlug = DEFAULT_CHILD_PARENT_SLUGS[cat.slug];
    if (!parentSlug) return cat;
    const parentId = slugToId.get(parentSlug);
    if (!parentId) return cat;
    return { ...cat, parentId };
  });

  const byId = new Map(withParent.map((c) => [c._id, c]));
  const childrenByParent = new Map<string, CategoryNavDoc[]>();

  for (const cat of withParent) {
    if (!cat.parentId) continue;
    const parentKey = String(cat.parentId);
    if (!byId.has(parentKey)) continue;
    const list = childrenByParent.get(parentKey) ?? [];
    list.push(cat);
    childrenByParent.set(parentKey, list);
  }

  const tops = withParent.filter((c) => !c.parentId);
  const groups: NavMenuGroup[] = tops.map((parent) => {
    const children = (childrenByParent.get(parent._id) ?? [])
      .sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name),
      )
      .map((child) =>
        toNavCategory({
          _id: child._id,
          name: child.name,
          slug: child.slug,
          filterType: child.filterType,
          filterValue: child.filterValue,
          featured: child.featured,
          imageUrl: child.imageUrl,
        }),
      );

    return {
      parent: toNavCategory({
        _id: parent._id,
        name: parent.name,
        slug: parent.slug,
        filterType: parent.filterType,
        filterValue: parent.filterValue,
        featured: parent.featured,
        imageUrl: parent.imageUrl,
      }),
      children,
      isGroup: children.length > 0,
    };
  });

  const linkedChildIds = new Set(
    groups.flatMap((g) => g.children.map((c) => c._id).filter(Boolean)),
  );

  for (const cat of withParent) {
    if (!cat.parentId || linkedChildIds.has(cat._id)) continue;
    groups.push({
      parent: toNavCategory({
        _id: cat._id,
        name: cat.name,
        slug: cat.slug,
        filterType: cat.filterType,
        filterValue: cat.filterValue,
        featured: cat.featured,
        imageUrl: cat.imageUrl,
      }),
      children: [],
      isGroup: false,
    });
  }

  return groups.sort(
    (a, b) =>
      (withParent.find((c) => c.slug === a.parent.slug)?.order ?? 0) -
        (withParent.find((c) => c.slug === b.parent.slug)?.order ?? 0) ||
      a.parent.name.localeCompare(b.parent.name),
  );
}

export function defaultNavGroupsFallback(): NavMenuGroup[] {
  const withSlug = DEFAULT_NAV_CATEGORIES.map((item) => ({
    ...item,
    slug: slugify(item.name),
  }));

  const parents = withSlug.filter((c) => !c.parentSlug);
  const children = withSlug.filter((c) => c.parentSlug);

  return parents.map((parent) => {
    const subs = children
      .filter((c) => c.parentSlug === parent.slug)
      .map((child) =>
        toNavCategory({
          name: child.name,
          slug: child.slug,
          filterType: child.filterType ?? "search",
          filterValue: child.filterValue,
          featured: child.featured,
        }),
      );

    return {
      parent: toNavCategory({
        name: parent.name,
        slug: parent.slug,
        filterType: parent.filterType ?? "search",
        filterValue: parent.filterValue,
        featured: parent.featured,
      }),
      children: subs,
      isGroup: subs.length > 0,
    };
  });
}

export function defaultNavCategoriesFallback(): NavCategory[] {
  return flattenNavGroups(defaultNavGroupsFallback());
}

export function resolvePrefillProductCategory(
  categoryFromUrl: string,
  qFromUrl: string,
  navCategories: NavCategory[],
): string {
  if (categoryFromUrl.trim()) return categoryFromUrl.trim();
  const q = qFromUrl.trim();
  if (!q) return "";
  const match = navCategories.find(
    (c) =>
      c.filterType === "search" &&
      c.filterValue.toLowerCase() === q.toLowerCase(),
  );
  return match?.name ?? q;
}

export function getDefaultParentSlugs(): Set<string> {
  return new Set(
    DEFAULT_NAV_CATEGORIES.filter((c) => !c.parentSlug).map((c) =>
      slugify(c.name),
    ),
  );
}

export function getChildOrderUnderParent(
  item: DefaultCategorySeed,
  all: DefaultCategorySeed[],
): number {
  if (!item.parentSlug) {
    return all.filter((c) => !c.parentSlug).findIndex((c) => c.name === item.name) + 1;
  }
  const siblings = all.filter((c) => c.parentSlug === item.parentSlug);
  return siblings.findIndex((c) => c.name === item.name) + 1;
}
