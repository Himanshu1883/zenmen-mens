export type CategoryFilterType = "search" | "category";

export type Category = {
  _id: string;
  name: string;
  slug: string;
  filterType: CategoryFilterType;
  filterValue: string;
  featured: boolean;
  isActive: boolean;
  showInNav: boolean;
  order: number;
  imageUrl?: string;
  description?: string;
  parentId?: string | null;
  parentName?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type NavCategory = Pick<
  Category,
  "name" | "slug" | "filterType" | "filterValue" | "featured" | "imageUrl"
> & {
  _id?: string;
  href: string;
};

/** Megamenu block: parent with optional sub-categories beneath it. */
export type NavMenuGroup = {
  parent: NavCategory;
  children: NavCategory[];
  /** true when children.length > 0 */
  isGroup: boolean;
};

export type CategoryNavDoc = {
  _id: string;
  name: string;
  slug: string;
  filterType: CategoryFilterType;
  filterValue: string;
  featured?: boolean;
  imageUrl?: string;
  order?: number;
  parentId?: string | null;
};
