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

/** Combined accessories catalog: Buttons, Tie, Broches (and spelling aliases). */
export const ACCESSORIES_COLLECTION_Q = "accessories";
export const ACCESSORIES_COLLECTION_HREF = categoryCollectionHref(
  "search",
  ACCESSORIES_COLLECTION_Q,
);

const ACCESSORY_NAV_ALIASES = new Set([
  "button",
  "buttons",
  "tie",
  "ties",
  "brooch",
  "brooches",
  "broche",
  "broches",
  "accessories",
  "accessory",
]);

export function isAccessoriesCollectionQuery(raw: string) {
  const q = raw.trim().toLowerCase();
  return q === ACCESSORIES_COLLECTION_Q || q === "accessory";
}

function isAccessoryNavParent(item: {
  name: string;
  filterValue: string;
  slug: string;
}) {
  return [item.name, item.filterValue, item.slug].some((v) =>
    ACCESSORY_NAV_ALIASES.has(normTag(v)),
  );
}

export function accessoryNavGroups(groups: NavMenuGroup[]): NavMenuGroup[] {
  return groups.filter((g) => isAccessoryNavParent(g.parent));
}

/** Live nav href for an accessory token (tie / button / brooch), else default `?q=`. */
export function accessoryCollectionHref(
  token: string,
  groups: NavMenuGroup[] = [],
): string {
  const t = normTag(token);
  const match = (groups.length ? groups : defaultNavGroupsFallback()).find(
    (g) => {
      const name = normTag(g.parent.name);
      const fv = normTag(g.parent.filterValue);
      const slug = normTag(g.parent.slug);
      if (name === t || fv === t || slug === t) return true;
      if (t.length >= 3 && (name.startsWith(t) || fv.startsWith(t) || slug.startsWith(t))) {
        return isAccessoryNavParent(g.parent);
      }
      if (t.startsWith("broch") && (name.startsWith("broch") || fv.startsWith("broch"))) {
        return true;
      }
      return false;
    },
  );
  return match?.parent.href ?? categoryCollectionHref("search", token);
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
  if (isAccessoriesCollectionQuery(q)) return "";
  const match = navCategories.find(
    (c) =>
      c.filterType === "search" &&
      c.filterValue.toLowerCase() === q.toLowerCase(),
  );
  return match?.name ?? q;
}

function eqLoose(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

function normTag(s: string) {
  return s.trim().toLowerCase().replace(/[-_]/g, " ").replace(/\s+/g, " ");
}

function navItemMatchesQuery(item: NavCategory, raw: string) {
  const q = raw.trim().toLowerCase();
  if (!q) return false;
  return (
    item.name.toLowerCase() === q ||
    item.filterValue.toLowerCase() === q ||
    item.slug.toLowerCase() === q
  );
}

export type CollectionPageContext = {
  group: NavMenuGroup | null;
  childName: string | null;
  isTextSearch: boolean;
  searchNeedle: string;
  /** Union of accessory parents when `?q=accessories`. */
  accessoryGroups?: NavMenuGroup[];
};

/** Map collection URL (?q= / ?category=) to a nav collection group. */
export function resolveCollectionPageContext(
  qFromUrl: string,
  categoryFromUrl: string,
  groups: NavMenuGroup[],
): CollectionPageContext {
  const category = categoryFromUrl.trim();
  const q = qFromUrl.trim();

  if (isAccessoriesCollectionQuery(q) && !category) {
    const accessoryGroups = accessoryNavGroups(groups);
    if (accessoryGroups.length > 0) {
      return {
        group: null,
        childName: null,
        isTextSearch: false,
        searchNeedle: "",
        accessoryGroups,
      };
    }
  }

  for (const group of groups) {
    if (category && navItemMatchesQuery(group.parent, category)) {
      return { group, childName: null, isTextSearch: false, searchNeedle: "" };
    }
    if (q && navItemMatchesQuery(group.parent, q)) {
      return { group, childName: null, isTextSearch: false, searchNeedle: "" };
    }
    for (const child of group.children) {
      if (category && navItemMatchesQuery(child, category)) {
        return {
          group,
          childName: child.name,
          isTextSearch: false,
          searchNeedle: "",
        };
      }
      if (q && navItemMatchesQuery(child, q)) {
        return {
          group,
          childName: child.name,
          isTextSearch: false,
          searchNeedle: "",
        };
      }
    }
  }

  if (q) {
    return { group: null, childName: null, isTextSearch: true, searchNeedle: q };
  }

  return { group: null, childName: null, isTextSearch: false, searchNeedle: "" };
}

function tagMatchesNavItem(tag: string, item: NavCategory) {
  const t = normTag(tag);
  if (!t) return false;
  const name = normTag(item.name);
  const filterValue = normTag(item.filterValue);
  if (t === name || t === filterValue) return true;
  if (name.length > 3 && t.includes(name)) return true;
  if (filterValue.length > 2 && t.includes(filterValue)) return true;
  return false;
}

function productClaimedByOtherCollection(
  product: { category?: string },
  group: NavMenuGroup,
  allGroups: NavMenuGroup[],
) {
  const cat = product.category?.trim() ?? "";
  if (!cat || allGroups.length === 0) return false;
  return allGroups.some((other) => {
    if (other.parent.slug === group.parent.slug) return false;
    return (
      eqLoose(cat, other.parent.name) ||
      eqLoose(cat, other.parent.filterValue)
    );
  });
}

export function productMatchesNavItem(
  product: {
    category?: string;
    subCategory?: string;
    title?: string;
    tagline?: string;
  },
  item: NavCategory,
) {
  return [product.category, product.subCategory, product.title, product.tagline]
    .filter((s): s is string => Boolean(s?.trim()))
    .some((tag) => tagMatchesNavItem(tag, item));
}

export function productInCollectionGroup(
  product: {
    category?: string;
    subCategory?: string;
    title?: string;
    tagline?: string;
  },
  group: NavMenuGroup,
  allGroups: NavMenuGroup[] = [],
) {
  if (productClaimedByOtherCollection(product, group, allGroups)) {
    return false;
  }
  if (productMatchesNavItem(product, group.parent)) return true;
  return group.children.some((child) => productMatchesNavItem(product, child));
}

/** Names + filterValues a product.category string may have been tagged with. */
export function productCategoryMatchTokens(
  cats: Array<{ name: string; filterValue?: string }>,
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const cat of cats) {
    for (const raw of [cat.name, cat.filterValue]) {
      const v = raw?.trim();
      if (!v) continue;
      const key = v.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(v);
    }
  }
  return out;
}

export type CollectionGroup = {
  parent: { _id: string; name: string };
  children: { _id: string; name: string }[];
};

/** Collection = parent; Category = child of that parent. */
export function resolveProductCollectionFields(
  category: string,
  subCategory: string,
  groups: CollectionGroup[],
): { collectionName: string; categoryName: string } {
  const cat = category.trim();
  const sub = subCategory.trim();
  const eq = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

  const parentMatch = groups.find((g) => eq(g.parent.name, cat));
  if (parentMatch) {
    const childMatch = parentMatch.children.find((c) => eq(c.name, sub));
    return {
      collectionName: parentMatch.parent.name,
      categoryName: childMatch?.name ?? sub,
    };
  }

  for (const g of groups) {
    const child =
      g.children.find((c) => eq(c.name, cat)) ??
      g.children.find((c) => eq(c.name, sub));
    if (child) {
      return {
        collectionName: g.parent.name,
        categoryName: child.name,
      };
    }
  }

  return { collectionName: cat, categoryName: sub };
}

export function buildCollectionGroups(
  categories: Array<{
    _id: string;
    name: string;
    slug: string;
    parentId?: string | null;
    order?: number;
  }>,
): CollectionGroup[] {
  const slugToId = new Map(categories.map((c) => [c.slug, c._id]));
  const parentList = categories
    .filter((c) => !resolveCategoryParentId(c, slugToId))
    .sort(
      (a, b) =>
        (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name),
    );

  const childMap = new Map<string, typeof categories>();
  for (const cat of categories) {
    const parentId = resolveCategoryParentId(cat, slugToId);
    if (!parentId) continue;
    const list = childMap.get(parentId) ?? [];
    list.push(cat);
    childMap.set(parentId, list);
  }

  return parentList.map((parent) => ({
    parent: { _id: parent._id, name: parent.name },
    children: (childMap.get(parent._id) ?? [])
      .sort(
        (a, b) =>
          (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name),
      )
      .map((c) => ({ _id: c._id, name: c.name })),
  }));
}

export function resolveCategoryParentId(
  cat: { parentId?: string | null; slug: string; name: string },
  slugToId: Map<string, string>,
): string | null {
  if (cat.parentId) return cat.parentId;
  const parentSlug =
    DEFAULT_CHILD_PARENT_SLUGS[cat.slug] ??
    DEFAULT_CHILD_PARENT_BY_NAME[cat.name.toLowerCase().trim()];
  if (!parentSlug) return null;
  return slugToId.get(parentSlug) ?? null;
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
