"use client";

import MobileFilterBar from "@/app/components/MobileFilterBar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProducts } from "@/store/slices/productSlice";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/types/product";
import { useEffect, useMemo, useState } from "react";
import CollectionProductCard from "./CollectionProductCard";
import CollectionSidebarFilters, {
  type CollectionFilterState,
} from "./CollectionSidebarFilters";
import ProductEditModal from "./ProductEditModal";

const PRICE_RANGES = [
  "All",
  "Under ₹10k",
  "₹10k-₹20k",
  "₹20k-₹35k",
  "Above ₹35k",
];

export default function CollectionPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string })?.role === "admin";

  const dispatch = useAppDispatch();
  const { products, loading, loaded, error } = useAppSelector(
    (s) => s.products,
  );

  const searchParams = useSearchParams();
  const qFromUrl = searchParams.get("q") ?? "";
  const categoryFromUrl = searchParams.get("category") ?? "";

  const [filters, setFilters] = useState<CollectionFilterState>({
    selectedAvailability: "All",
    selectedCategory: categoryFromUrl || "All",
    selectedColor: "All",
    selectedSize: "All",
    selectedPrice: "All",
    selectedBrand: "All",
    search: qFromUrl,
  });
  const [sortBy, setSortBy] = useState("featured");
  const [gridCols, setGridCols] = useState<3 | 4>(3);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const patchFilters = (patch: Partial<CollectionFilterState>) =>
    setFilters((prev) => ({ ...prev, ...patch }));

  useEffect(() => {
    if (!loaded && !loading) dispatch(fetchProducts());
  }, [loaded, loading, dispatch]);

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      search: qFromUrl,
      selectedCategory: categoryFromUrl || (qFromUrl ? "All" : prev.selectedCategory),
      ...(qFromUrl || categoryFromUrl
        ? {
            selectedColor: "All",
            selectedSize: "All",
            selectedPrice: "All",
            selectedBrand: "All",
            selectedAvailability: "All",
          }
        : {}),
    }));
  }, [qFromUrl, categoryFromUrl]);

  const categories = useMemo(() => {
    const cats = Array.from(
      new Set(
        products
          .map((p) => p.category)
          .filter((c): c is string => typeof c === "string" && c.length > 0),
      ),
    );
    return ["All", ...cats];
  }, [products]);

  const brands = useMemo(() => {
    const subs = Array.from(
      new Set(
        products
          .map((p) => p.subCategory)
          .filter((c): c is string => typeof c === "string" && c.length > 0),
      ),
    );
    return ["All", ...subs];
  }, [products]);

  const colors = useMemo(() => {
    const all = products.flatMap((p) => p.colors ?? []);
    return ["All", ...Array.from(new Set(all))];
  }, [products]);

  const sizes = useMemo(() => {
    const all = products.flatMap((p) => p.sizes ?? []);
    return ["All", ...Array.from(new Set(all))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const {
      selectedCategory,
      selectedColor,
      selectedSize,
      selectedPrice,
      selectedBrand,
      selectedAvailability,
      search,
    } = filters;

    return products.filter((p) => {
      const catMatch =
        selectedCategory === "All" || p.category === selectedCategory;
      const brandMatch =
        selectedBrand === "All" || p.subCategory === selectedBrand;
      const colorMatch =
        selectedColor === "All" || p.colors?.includes(selectedColor);
      const sizeMatch =
        selectedSize === "All" || p.sizes?.includes(selectedSize);
      const priceMatch =
        selectedPrice === "All" ||
        (selectedPrice === "Under ₹10k" && p.price < 10000) ||
        (selectedPrice === "₹10k-₹20k" &&
          p.price >= 10000 &&
          p.price <= 20000) ||
        (selectedPrice === "₹20k-₹35k" &&
          p.price > 20000 &&
          p.price <= 35000) ||
        (selectedPrice === "Above ₹35k" && p.price > 35000);
      const availMatch =
        selectedAvailability === "All" ||
        (selectedAvailability === "In stock" && p.isAvailable !== false) ||
        (selectedAvailability === "Out of stock" && p.isAvailable === false);
      const needle = search.trim().toLowerCase();
      const srchMatch =
        needle === "" ||
        p.title.toLowerCase().includes(needle) ||
        (p.category?.toLowerCase().includes(needle) ?? false) ||
        (p.subCategory?.toLowerCase().includes(needle) ?? false) ||
        (p.tagline?.toLowerCase().includes(needle) ?? false) ||
        (p.colors?.some((c) => c.toLowerCase().includes(needle)) ?? false);
      return (
        catMatch &&
        brandMatch &&
        colorMatch &&
        sizeMatch &&
        priceMatch &&
        availMatch &&
        srchMatch
      );
    });
  }, [products, filters]);

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === "price_low_high") list.sort((a, b) => a.price - b.price);
    if (sortBy === "price_high_low") list.sort((a, b) => b.price - a.price);
    if (sortBy === "name_az")
      list.sort((a, b) => a.title.localeCompare(b.title));
    if (sortBy === "name_za")
      list.sort((a, b) => b.title.localeCompare(a.title));
    if (sortBy === "featured") {
      list.sort((a, b) => {
        const af = a.isFeatured ? 1 : 0;
        const bf = b.isFeatured ? 1 : 0;
        return bf - af;
      });
    }
    return list;
  }, [filteredProducts, sortBy]);

  const hasActiveFilters =
    filters.selectedCategory !== "All" ||
    filters.selectedColor !== "All" ||
    filters.selectedSize !== "All" ||
    filters.selectedPrice !== "All" ||
    filters.selectedBrand !== "All" ||
    filters.selectedAvailability !== "All" ||
    filters.search.trim() !== "";

  const resetFilters = () =>
    setFilters({
      selectedAvailability: "All",
      selectedCategory: "All",
      selectedColor: "All",
      selectedSize: "All",
      selectedPrice: "All",
      selectedBrand: "All",
      search: "",
    });

  const gridClass =
    gridCols === 4
      ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10 md:gap-x-8"
      : "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10 md:gap-x-8";

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-[#0f172a]">
        <p className="text-lg mb-4">Failed to load collection.</p>
        <button
          type="button"
          onClick={() => dispatch(fetchProducts())}
          className="px-6 py-2 border border-[#7da8c7] text-[#0f172a] text-sm uppercase tracking-widest hover:bg-[#7da8c7] hover:text-white transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#0f172a] pb-6 lg:pb-16">
      <header className="border-b border-[#e8edf2] px-4 py-8 lg:px-5">
        <p className="text-[10px] tracking-[0.35em] uppercase text-[#94a3b8] mb-2">
          ZENmen
        </p>
        <h1 className="font-heading m-0 text-4xl md:text-[2.75rem] font-normal leading-tight text-[#0f172a]">
          The Collection
        </h1>
      </header>

      <div className="lg:hidden">
        <MobileFilterBar
          categories={categories}
          colors={colors}
          sizes={sizes}
          priceRanges={PRICE_RANGES}
          brands={brands}
          selectedCategory={filters.selectedCategory}
          selectedColor={filters.selectedColor}
          selectedSize={filters.selectedSize}
          selectedPrice={filters.selectedPrice}
          selectedBrand={filters.selectedBrand}
          selectedAvailability={filters.selectedAvailability}
          sortBy={sortBy}
          search={filters.search}
          resultCount={sortedProducts.length}
          totalCount={products.length}
          onCategoryChange={(v) => patchFilters({ selectedCategory: v })}
          onColorChange={(v) => patchFilters({ selectedColor: v })}
          onSizeChange={(v) => patchFilters({ selectedSize: v })}
          onPriceChange={(v) => patchFilters({ selectedPrice: v })}
          onBrandChange={(v) => patchFilters({ selectedBrand: v })}
          onAvailabilityChange={(v) =>
            patchFilters({ selectedAvailability: v })
          }
          onSortChange={setSortBy}
          onSearchChange={(v) => patchFilters({ search: v })}
          onReset={resetFilters}
        />
      </div>

      <div className="flex w-full max-w-none gap-6 lg:gap-8 px-4 py-8 lg:px-5 lg:py-10">
        <CollectionSidebarFilters
          categories={categories}
          colors={colors}
          sizes={sizes}
          priceRanges={PRICE_RANGES}
          brands={brands}
          filters={filters}
          onChange={patchFilters}
          onReset={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        <div className="min-w-0 flex-1">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[#e8edf2] pb-4">
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-[13px] text-[#64748b]">
                Sort by
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="ml-2 appearance-none border-0 border-b border-transparent bg-transparent p-0 pr-5 text-[13px] text-[#0f172a] outline-none cursor-pointer hover:border-[#cbd5e1]"
                >
                  <option value="featured">Best selling</option>
                  <option value="price_low_high">Price: Low to High</option>
                  <option value="price_high_low">Price: High to Low</option>
                  <option value="name_az">Name: A–Z</option>
                  <option value="name_za">Name: Z–A</option>
                </select>
              </label>
            </div>

            <div className="hidden lg:flex items-center gap-4 text-[13px] text-[#64748b]">
              <span>
                {sortedProducts.length} / {products.length}
              </span>
              <span className="text-[#e2e8f0]">|</span>
              <span className="flex items-center gap-2">
                View by
                <button
                  type="button"
                  onClick={() => setGridCols(3)}
                  className={`px-1 pb-0.5 transition-colors ${
                    gridCols === 3
                      ? "text-[#0f172a] border-b border-[#0f172a]"
                      : "text-[#94a3b8] hover:text-[#0f172a]"
                  }`}
                >
                  3
                </button>
                <button
                  type="button"
                  onClick={() => setGridCols(4)}
                  className={`px-1 pb-0.5 transition-colors ${
                    gridCols === 4
                      ? "text-[#0f172a] border-b border-[#0f172a]"
                      : "text-[#94a3b8] hover:text-[#0f172a]"
                  }`}
                >
                  4
                </button>
              </span>
            </div>
          </div>

          {loading && (
            <div className={`grid ${gridClass}`}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i}>
                  <div
                    className="zen-bone relative mb-3 bg-[#f1f5f9]"
                    style={{ aspectRatio: "3/4" }}
                  />
                  <div className="zen-bone h-2.5 w-16 mb-2" />
                  <div className="zen-bone h-3.5 w-full mb-1.5" />
                  <div className="zen-bone h-3.5 w-20" />
                </div>
              ))}
            </div>
          )}

          {!loading && sortedProducts.length === 0 && (
            <div className="py-24 text-center text-[#64748b] text-sm">
              No products found.
            </div>
          )}

          {!loading && sortedProducts.length > 0 && (
            <div className={`grid ${gridClass}`}>
              {sortedProducts.map((product) => (
                <CollectionProductCard
                  key={product._id}
                  product={product}
                  isAdmin={isAdmin}
                  onEdit={() => setEditingProduct(product)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {editingProduct ? (
        <ProductEditModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSaved={() => dispatch(fetchProducts())}
        />
      ) : null}
    </div>
  );
}
