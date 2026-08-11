"use client";

import ProductFormModal from "@/app/components/adminComponents/ProductFormModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/product";
import { getPrimaryImage } from "@/lib/product-images";
import { Edit, Eye, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { GlassCard } from "../dashboard/GlassCard";

type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

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

type ModalState =
  | { mode: "create" }
  | { mode: "edit"; product: Product }
  | null;

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [categories, setCategories] = useState<string[]>([]);
  const [modal, setModal] = useState<ModalState>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const [page, setPage] = useState<number>(1);
  const [pages, setPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const limit = 12;

  const reloadList = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));
        params.set("admin", "1");
        if (selectedCategory && selectedCategory !== "All") {
          params.set("category", selectedCategory);
        }

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
  }, [page, selectedCategory, refreshKey]);

  useEffect(() => {
    const unique = Array.from(
      new Set(products.map((p) => p.category).filter(Boolean) as string[]),
    );
    setCategories(unique);
  }, [products]);

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

  const stats = products.reduce(
    (acc, p) => {
      const s = stockStatus(p);
      acc[s] += 1;
      return acc;
    },
    { "In Stock": 0, "Low Stock": 0, "Out of Stock": 0 } as Record<
      StockStatus,
      number
    >,
  );

  const visibleProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);

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
          <p className="text-2xl font-semibold text-[#0f172a]">{total}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-[#64748b] text-sm mb-1">In Stock</p>
          <p className="text-2xl font-semibold text-green-600">
            {stats["In Stock"]}
          </p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-[#64748b] text-sm mb-1">Low Stock</p>
          <p className="text-2xl font-semibold text-yellow-600">
            {stats["Low Stock"]}
          </p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-[#64748b] text-sm mb-1">Out of Stock</p>
          <p className="text-2xl font-semibold text-red-600">
            {stats["Out of Stock"]}
          </p>
        </GlassCard>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => {
            setSelectedCategory("All");
            setPage(1);
          }}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border ${
            selectedCategory === "All"
              ? "bg-[#7da8c7] text-white border-transparent"
              : "text-[#64748b] border-[#e2e8f0]"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setPage(1);
            }}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border ${
              selectedCategory === cat
                ? "bg-[#7da8c7] text-white border-transparent"
                : "text-[#64748b] border-[#e2e8f0]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading && products.length === 0 ? (
        <p className="text-center text-[#64748b] py-12 animate-pulse">
          Loading products…
        </p>
      ) : visibleProducts.length === 0 ? (
        <p className="text-center text-[#64748b] py-12">
          No products found. Add your first product.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleProducts.map((product) => {
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
                      <p className="text-[#7da8c7] text-sm">{product.category}</p>
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
