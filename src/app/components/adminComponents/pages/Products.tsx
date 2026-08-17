"use client";

import ProductFormModal from "@/app/components/adminComponents/ProductFormModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  productCategoryMatchTokens,
  resolveCategoryParentId,
} from "@/lib/categories";
import { getPrimaryImage } from "@/lib/product-images";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";
import { ChevronDown, Edit, Eye, Plus, Search, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { GlassCard } from "../dashboard/GlassCard";

type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";
type StockFilter = "" | "in" | "low" | "out";
type FeaturedFilter = "" | "true" | "false";
type AvailableFilter = "" | "true" | "false";

type CategoryGroup = {
  parent: Category;
  children: Category[];
};

const selectClass =
  "h-9 rounded-lg border border-[#e2e8f0] bg-white px-3 text-sm text-[#0f172a] outline-none focus:border-[#7da8c7]";
const inputClass =
  "h-9 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 pl-9 text-sm text-[#0f172a] outline-none placeholder:text-[#94a3b8] focus:border-[#7da8c7]";

function stockStatus(product: Product): StockStatus {
  if (product.isAvailable === false || (product.stock ?? 0) === 0) {
    return "Out of Stock";
  }
  if ((product.stock ?? 0) <= 3) return "Low Stock";
  return "In Stock";
}

function statusBadgeClass(status: StockStatus) {
  if (status === "In Stock") {
    return "border-green-500/50 text-green-600 bg-green-500/10";
  }
  if (status === "Low Stock") {
    return "border-yellow-500/50 text-yellow-600 bg-yellow-500/10";
  }
  return "border-red-500/50 text-red-600 bg-red-500/10";
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border ${
        active
          ? "bg-[#7da8c7] text-white border-transparent"
          : "text-[#64748b] border-[#e2e8f0] hover:border-[#7da8c7]/50"
      }`}
    >
      {children}
    </button>
  );
}

function buildCategoryGroups(categories: Category[]): CategoryGroup[] {
  const slugToId = new Map(categories.map((c) => [c.slug, c._id]));
  const parentList = categories
    .filter((c) => !resolveCategoryParentId(c, slugToId))
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

  const childMap = new Map<string, Category[]>();
  for (const cat of categories) {
    const parentId = resolveCategoryParentId(cat, slugToId);
    if (!parentId) continue;
    const list = childMap.get(parentId) ?? [];
    list.push(cat);
    childMap.set(parentId, list);
  }
  for (const [key, list] of childMap) {
    childMap.set(
      key,
      [...list].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)),
    );
  }

  const groups: CategoryGroup[] = [];
  const listed = new Set<string>();

  for (const parent of parentList) {
    const children = childMap.get(parent._id) ?? [];
    groups.push({ parent, children });
    listed.add(parent._id);
    for (const child of children) listed.add(child._id);
  }

  const orphans = categories
    .filter((c) => !listed.has(c._id))
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  for (const orphan of orphans) {
    groups.push({ parent: orphan, children: [] });
  }

  return groups;
}

type ModalState =
  | { mode: "create" }
  | { mode: "edit"; product: Product }
  | null;

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryDocs, setCategoryDocs] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [modal, setModal] = useState<ModalState>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("");
  const [featuredFilter, setFeaturedFilter] = useState<FeaturedFilter>("");
  const [availableFilter, setAvailableFilter] = useState<AvailableFilter>("");

  const [page, setPage] = useState<number>(1);
  const [pages, setPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [catalogStats, setCatalogStats] = useState({
    total: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
  });
  const [loading, setLoading] = useState(true);
  const limit = 12;

  const reloadList = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const groups = useMemo(
    () => buildCategoryGroups(categoryDocs),
    [categoryDocs],
  );

  const selectedGroup = useMemo(
    () =>
      groups.find(
        (g) =>
          g.parent._id === selectedCategoryId ||
          g.children.some((c) => c._id === selectedCategoryId),
      ) ?? null,
    [groups, selectedCategoryId],
  );

  const categoryTokens = useMemo(() => {
    if (!selectedCategoryId || !selectedGroup) return [];
    if (selectedGroup.parent._id === selectedCategoryId) {
      return productCategoryMatchTokens([
        selectedGroup.parent,
        ...selectedGroup.children,
      ]);
    }
    const child = selectedGroup.children.find(
      (c) => c._id === selectedCategoryId,
    );
    return child ? productCategoryMatchTokens([child]) : [];
  }, [selectedCategoryId, selectedGroup]);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/categories");
        if (!res.ok) {
          toast.error("Failed to load collections");
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setCategoryDocs(
            Array.isArray(data.categories) ? (data.categories as Category[]) : [],
          );
        }
      } catch {
        if (!cancelled) toast.error("Failed to load collections");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));
        params.set("admin", "1");
        if (categoryTokens.length > 0) {
          params.set("categories", categoryTokens.join(","));
        }
        if (search) params.set("q", search);
        if (stockFilter) params.set("stock", stockFilter);
        if (featuredFilter) params.set("featured", featuredFilter);
        if (availableFilter) params.set("available", availableFilter);

        const res = await fetch(`/api/products?${params.toString()}`);
        if (!res.ok) {
          toast.error("Failed to load products");
          return;
        }
        const data = await res.json();

        if (data && Array.isArray(data.products)) {
          setProducts(data.products as Product[]);
          setPages(data.pages ?? 1);
          setTotal(data.total ?? 0);
          if (data.stats) {
            setCatalogStats({
              total: data.stats.total ?? 0,
              inStock: data.stats.inStock ?? 0,
              lowStock: data.stats.lowStock ?? 0,
              outOfStock: data.stats.outOfStock ?? 0,
            });
          }
        } else if (Array.isArray(data)) {
          setProducts(data as Product[]);
          setPages(1);
          setTotal(data.length);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    page,
    categoryTokens,
    search,
    stockFilter,
    featuredFilter,
    availableFilter,
    refreshKey,
  ]);

  const getImageUrl = (p: Product) => {
    const primary = getPrimaryImage(p.images);
    return primary?.url ?? "/logo_zenmen.png";
  };

  const getImageAlt = (p: Product) => {
    const primary = getPrimaryImage(p.images);
    return primary?.alt ?? p.title ?? "Product image";
  };

  const handleDelete = async (product: Product) => {
    const label = product.title || product.slug;
    if (
      !confirm(
        `Delete "${label}"? Images will be removed from Cloudinary and the database.`,
      )
    ) {
      return;
    }

    try {
      setDeletingSlug(product.slug);
      const res = await fetch(
        `/api/products/${encodeURIComponent(product.slug)}`,
        { method: "DELETE" },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Delete failed",
        );
      }
      toast.success("Product deleted");
      reloadList();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingSlug(null);
    }
  };

  const hasFilters =
    Boolean(selectedCategoryId) ||
    Boolean(searchInput.trim()) ||
    Boolean(stockFilter) ||
    Boolean(featuredFilter) ||
    Boolean(availableFilter);

  const clearFilters = () => {
    setSelectedCategoryId(null);
    setSearchInput("");
    setSearch("");
    setStockFilter("");
    setFeaturedFilter("");
    setAvailableFilter("");
    setPage(1);
  };

  const selectParent = (parentId: string) => {
    setSelectedCategoryId(parentId);
    setPage(1);
  };

  const selectChild = (childId: string) => {
    setSelectedCategoryId(childId);
    setPage(1);
  };

  return (
    <div className="space-y-6 mt-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-[#0f172a] mb-2">Products</h1>
          <p className="text-[#64748b]">Manage your luxury product catalog</p>
        </div>
        <Button
          className="bg-[#7da8c7] hover:bg-[#5a8faf] text-white"
          onClick={() => setModal({ mode: "create" })}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <GlassCard className="p-4">
          <p className="text-[#64748b] text-sm mb-1">Total Products</p>
          <p className="text-2xl font-semibold text-[#0f172a]">
            {catalogStats.total}
          </p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-[#64748b] text-sm mb-1">In Stock</p>
          <p className="text-2xl font-semibold text-green-600">
            {catalogStats.inStock}
          </p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-[#64748b] text-sm mb-1">Low Stock</p>
          <p className="text-2xl font-semibold text-yellow-600">
            {catalogStats.lowStock}
          </p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-[#64748b] text-sm mb-1">Out of Stock</p>
          <p className="text-2xl font-semibold text-red-600">
            {catalogStats.outOfStock}
          </p>
        </GlassCard>
      </div>

      <GlassCard className="p-4 space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
            <input
              className={inputClass}
              placeholder="Search title or slug"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Search products"
            />
          </div>
          <select
            className={selectClass}
            value={stockFilter}
            onChange={(e) => {
              setStockFilter(e.target.value as StockFilter);
              setPage(1);
            }}
            aria-label="Stock status"
          >
            <option value="">All stock</option>
            <option value="in">In stock</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
          <select
            className={selectClass}
            value={featuredFilter}
            onChange={(e) => {
              setFeaturedFilter(e.target.value as FeaturedFilter);
              setPage(1);
            }}
            aria-label="Featured"
          >
            <option value="">All featured</option>
            <option value="true">Featured</option>
            <option value="false">Not featured</option>
          </select>
          <select
            className={selectClass}
            value={availableFilter}
            onChange={(e) => {
              setAvailableFilter(e.target.value as AvailableFilter);
              setPage(1);
            }}
            aria-label="Availability"
          >
            <option value="">All availability</option>
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </select>
          {hasFilters ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="border-[#e2e8f0] text-[#64748b]"
              onClick={clearFilters}
            >
              <X className="mr-1 h-4 w-4" />
              Clear
            </Button>
          ) : null}
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#94a3b8] mb-2">
            Collection
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <FilterChip
              active={!selectedCategoryId}
              onClick={() => {
                setSelectedCategoryId(null);
                setPage(1);
              }}
            >
              All
            </FilterChip>
            {groups.map((group) => {
              const inGroup =
                selectedCategoryId === group.parent._id ||
                group.children.some((c) => c._id === selectedCategoryId);
              return (
                <FilterChip
                  key={group.parent._id}
                  active={inGroup}
                  onClick={() => selectParent(group.parent._id)}
                >
                  <span className="inline-flex items-center gap-1">
                    {group.parent.name}
                    {group.children.length > 0 ? (
                      <ChevronDown className="h-3.5 w-3.5 opacity-80" />
                    ) : null}
                  </span>
                </FilterChip>
              );
            })}
          </div>
          {selectedGroup && selectedGroup.children.length > 0 ? (
            <div className="mt-3 flex items-center gap-2 flex-wrap pl-1">
              <FilterChip
                active={selectedCategoryId === selectedGroup.parent._id}
                onClick={() => selectParent(selectedGroup.parent._id)}
              >
                All in {selectedGroup.parent.name}
              </FilterChip>
              {selectedGroup.children.map((child) => (
                <FilterChip
                  key={child._id}
                  active={selectedCategoryId === child._id}
                  onClick={() => selectChild(child._id)}
                >
                  {child.name}
                </FilterChip>
              ))}
            </div>
          ) : null}
        </div>

        <p className="text-sm text-[#64748b]">
          {hasFilters
            ? `${total.toLocaleString("en-IN")} matching`
            : `${total.toLocaleString("en-IN")} products`}
        </p>
      </GlassCard>

      {loading && products.length === 0 ? (
        <p className="text-center text-[#64748b] py-12 animate-pulse">
          Loading products…
        </p>
      ) : products.length === 0 ? (
        <p className="text-center text-[#64748b] py-12">
          {hasFilters
            ? "No products match these filters."
            : "No products found. Add your first product."}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const status = stockStatus(product);
            return (
              <GlassCard
                key={product._id}
                hover
                className="overflow-hidden"
              >
                <div className="aspect-square overflow-hidden relative group">
                  <Image
                    src={getImageUrl(product)}
                    alt={getImageAlt(product)}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:text-[#7da8c7] hover:bg-white/10"
                      asChild
                    >
                      <Link
                        href={`/collection/${encodeURIComponent(product.slug)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant="outline"
                      className={statusBadgeClass(status)}
                    >
                      {status}
                    </Badge>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-[#0f172a] font-semibold mb-1 line-clamp-2">
                        {product.title}
                      </h3>
                      {product.tagline && (
                        <p className="text-[#64748b] text-xs mb-1 line-clamp-1">
                          {product.tagline}
                        </p>
                      )}
                      <p className="text-[#7da8c7] text-sm">
                        {[product.category, product.subCategory]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <p className="text-[#0f172a] text-xl font-semibold">
                        ₹{product.price.toLocaleString()}
                      </p>
                      <p className="text-[#64748b] text-xs">
                        Stock: {product.stock ?? 0}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-[#64748b] hover:text-[#7da8c7] hover:bg-[#f1f5f9]"
                        onClick={() =>
                          setModal({ mode: "edit", product })
                        }
                        aria-label="Edit product"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-[#64748b] hover:text-red-500 hover:bg-[#f1f5f9]"
                        onClick={() => handleDelete(product)}
                        disabled={deletingSlug === product.slug}
                        aria-label="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            size="sm"
            variant="outline"
            className="border-[#e2e8f0] text-[#64748b]"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Previous
          </Button>

          {Array.from({ length: pages }).map((_, i) => (
            <Button
              key={i}
              size="sm"
              onClick={() => setPage(i + 1)}
              className={
                page === i + 1
                  ? "bg-[#7da8c7] hover:bg-[#5a8faf] text-white"
                  : "border-[#e2e8f0] text-[#64748b]"
              }
            >
              {i + 1}
            </Button>
          ))}

          <Button
            size="sm"
            variant="outline"
            className="border-[#e2e8f0] text-[#64748b]"
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page >= pages}
          >
            Next
          </Button>
        </div>
      )}

      {modal?.mode === "create" && (
        <ProductFormModal
          mode="create"
          onClose={() => setModal(null)}
          onSaved={reloadList}
        />
      )}
      {modal?.mode === "edit" && (
        <ProductFormModal
          mode="edit"
          product={modal.product}
          onClose={() => setModal(null)}
          onSaved={reloadList}
        />
      )}
    </div>
  );
}
