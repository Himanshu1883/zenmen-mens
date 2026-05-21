// src/app/collection/page.tsx
"use client";

import MobileFilterBar from "@/app/components/MobileFilterBar";
import { useDisplayPrice } from "@/hooks/useDisplayPrice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addItem } from "@/store/slices/cartSlice";
import { fetchProducts } from "@/store/slices/productSlice";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/types/product";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import ProductEditModal from "./ProductEditModal";

const FALLBACK_BANNER = [
  { src: "/zenmen_kurta_hero.jpeg", alt: "Collection mood 1" },
  { src: "/zenmen_white.jpeg", alt: "Collection mood 2" },
  { src: "/zenmen_shirts.jpeg", alt: "Collection mood 3" },
  { src: "/zenmen_blackcoat.jpeg", alt: "Collection mood 4" },
  { src: "/sherwani.webp", alt: "Collection mood 5" },
  { src: "/new.jpg", alt: "Collection mood 6" },
];

export default function CollectionPage() {
  type FilterPanel = "category" | "price" | "color" | "size" | null;

  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "admin";

  const dispatch = useAppDispatch();
  const { format: displayPrice } = useDisplayPrice();
  const { products, loading, loaded, error } = useAppSelector(
    (s) => s.products,
  );
  const cartItems = useAppSelector((s) => s.cart.items);

  const searchParams = useSearchParams();
  const qFromUrl = searchParams.get("q") ?? "";
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") ?? "All",
  );
  const [selectedColor, setSelectedColor] = useState("All");
  const [selectedSize, setSelectedSize] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [activePanel, setActivePanel] = useState<FilterPanel>(null);
  const [search, setSearch] = useState(qFromUrl);
  const [activeImage, setActiveImage] = useState<Record<string, number>>({});
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!loaded && !loading) dispatch(fetchProducts());
  }, [loaded, loading, dispatch]);

  const categoryFromUrl = searchParams.get("category") ?? "";

  useEffect(() => {
    setSearch(qFromUrl);
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    } else if (qFromUrl) {
      setSelectedCategory("All");
    }
    if (qFromUrl || categoryFromUrl) {
      setSelectedColor("All");
      setSelectedSize("All");
      setSelectedPrice("All");
    }
  }, [qFromUrl, categoryFromUrl]);

  const bannerImages = useMemo(() => {
    if (products.length === 0) return FALLBACK_BANNER;
    return products.slice(0, 6).map((p, i) => ({
      src: p.images?.[0]?.url ?? FALLBACK_BANNER[i]?.src ?? "/new.jpg",
      alt: p.images?.[0]?.alt ?? p.title ?? `Collection mood ${i + 1}`,
    }));
  }, [products]);

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

  const colors = useMemo(() => {
    const all = products.flatMap((p) => p.colors ?? []);
    return ["All", ...Array.from(new Set(all))];
  }, [products]);

  const sizes = useMemo(() => {
    const all = products.flatMap((p) => p.sizes ?? []);
    return ["All", ...Array.from(new Set(all))];
  }, [products]);

  const priceRanges = [
    "All",
    "Under ₹10k",
    "₹10k-₹20k",
    "₹20k-₹35k",
    "Above ₹35k",
  ];

  const filteredProducts = useMemo(
    () =>
      products.filter((p) => {
        const catMatch =
          selectedCategory === "All" || p.category === selectedCategory;
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
        const needle = search.trim().toLowerCase();
        const srchMatch =
          needle === "" ||
          p.title.toLowerCase().includes(needle) ||
          (p.category?.toLowerCase().includes(needle) ?? false) ||
          (p.subCategory?.toLowerCase().includes(needle) ?? false) ||
          (p.tagline?.toLowerCase().includes(needle) ?? false) ||
          (p.colors?.some((c) => c.toLowerCase().includes(needle)) ?? false);
        return catMatch && colorMatch && sizeMatch && priceMatch && srchMatch;
      }),
    [
      products,
      selectedCategory,
      selectedColor,
      selectedSize,
      selectedPrice,
      search,
    ],
  );

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === "price_low_high") list.sort((a, b) => a.price - b.price);
    if (sortBy === "price_high_low") list.sort((a, b) => b.price - a.price);
    if (sortBy === "name_az")
      list.sort((a, b) => a.title.localeCompare(b.title));
    if (sortBy === "name_za")
      list.sort((a, b) => b.title.localeCompare(a.title));
    return list;
  }, [filteredProducts, sortBy]);

  const hasActiveFilters =
    selectedCategory !== "All" ||
    selectedColor !== "All" ||
    selectedSize !== "All" ||
    selectedPrice !== "All" ||
    search.trim() !== "";

  const toggle = (panel: FilterPanel) =>
    setActivePanel((prev) => (prev === panel ? null : panel));
  const isActive = (panel: FilterPanel) => activePanel === panel;

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] text-[#0f172a]">
        <p className="text-lg mb-4">Failed to load collection.</p>
        <button
          onClick={() => dispatch(fetchProducts())}
          className="px-6 py-2 border border-[#7da8c7] text-[#0f172a] text-sm uppercase tracking-widest hover:bg-[#7da8c7] hover:text-white transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a]">
      {/* ══════════════════════ BANNER ══════════════════════ */}
      <div className="relative w-full">
        <div className="relative h-[58vh] min-h-[440px] w-full overflow-hidden border-b border-[#e2e8f0]">
          <div className="absolute inset-0 grid grid-cols-3 md:grid-cols-6">
            {bannerImages.map(({ src, alt }, idx) => (
              <div key={idx} className="relative overflow-hidden">
                <img
                  src={src}
                  alt={alt}
                  className="h-full w-full object-cover opacity-80 transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#f8fafc]/10 via-transparent to-[#0f172a]/45" />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(125,168,199,0.24),transparent_50%)]" />
          <div className="relative z-10 flex h-full w-full flex-col items-center justify-end px-6 pb-12 text-center md:pb-16">
            <p className="mb-4 inline-block w-fit border border-[#cbd5e1] bg-white/75 px-4 py-2 text-[10px] tracking-[0.35em] text-[#0f172a] uppercase backdrop-blur-sm">
              ZENmen Edits
            </p>
            <h1 className="max-w-4xl font-['Cormorant_Garamond'] text-5xl font-light leading-[0.95] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] md:text-7xl">
              New Season Collection
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 md:text-base">
              Statement tailoring, sharp silhouettes, and handcrafted textures
              built for weddings, evenings, and standout everyday presence.
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════ HEADER ══════════════════════ */}
      <div className="pt-12 pb-6 px-6 md:px-12 lg:px-20">
        <p className="text-[10px] tracking-[4px] uppercase text-[#7da8c7] mb-3">
          ZENmen — Collection
        </p>
        <h2 className="font-['Cormorant_Garamond'] text-4xl md:text-5xl font-light leading-tight text-[#0f172a]">
          The Collection
        </h2>
      </div>

      {/* ══════════════════════ DESKTOP FILTER BAR ══════════════════════ */}
      <div className="hidden md:block sticky top-[80px] z-30 bg-[#f8fafc]/95 backdrop-blur border-[#e2e8f0]">
        <div className="px-12 lg:px-20 pb-5">
          <div className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-8">
              {(
                [
                  { key: "category", label: "Category" },
                  { key: "price", label: "Price" },
                  { key: "color", label: "Color" },
                  { key: "size", label: "Size" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => toggle(tab.key)}
                  className={`inline-flex items-center gap-1 py-1 text-[15px] transition ${
                    isActive(tab.key)
                      ? "text-[#0f172a] border-b border-[#0f172a]"
                      : "text-[#64748b] hover:text-[#0f172a]"
                  }`}
                >
                  {tab.label}
                  <span className="inline-flex h-4 w-4 items-center justify-center text-[#94a3b8]">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      className={`transition-transform duration-200 ${isActive(tab.key) ? "rotate-180" : ""}`}
                    >
                      <path
                        d="M2 4l3 3 3-3"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 text-[14px] text-[#64748b]">
              <span>
                {sortedProducts.length} / {products.length}
              </span>
              <span className="text-[#cbd5e1]">|</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-transparent border-0 p-0 pr-4 text-[#0f172a] outline-none text-[13px] cursor-pointer"
                >
                  <option value="featured">Sort</option>
                  <option value="price_low_high">Price: Low to High</option>
                  <option value="price_high_low">Price: High to Low</option>
                  <option value="name_az">Name: A-Z</option>
                  <option value="name_za">Name: Z-A</option>
                </select>
                <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[#94a3b8]">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M2 4l3 3 3-3"
                      stroke="currentColor"
                      strokeWidth="1.25"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          <div className="py-2">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="appearance-none w-full rounded-none border-0 border-b border-[#d6e1ec] bg-transparent px-0 py-2 text-sm text-[#0f172a] outline-none placeholder:text-[#8ca0b6] focus:border-[#7da8c7]"
            />
          </div>

          {activePanel && (
            <div className="border-[#e7edf5] py-4">
              {activePanel === "category" && (
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-0 py-1 text-[13px] tracking-[0.04em] transition-colors ${
                        selectedCategory === cat
                          ? "text-[#0f172a]"
                          : "text-[#64748b] hover:text-[#0f172a]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
              {activePanel === "price" && (
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  {priceRanges.map((range) => (
                    <button
                      key={range}
                      onClick={() => setSelectedPrice(range)}
                      className={`px-0 py-1 text-[13px] tracking-[0.04em] transition-colors ${
                        selectedPrice === range
                          ? "text-[#0f172a]"
                          : "text-[#64748b] hover:text-[#0f172a]"
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              )}
              {activePanel === "size" && (
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-0 py-1 text-[13px] tracking-[0.04em] transition-colors ${
                        selectedSize === size
                          ? "text-[#0f172a]"
                          : "text-[#64748b] hover:text-[#0f172a]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
              {activePanel === "color" && (
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 md:grid-cols-4 lg:grid-cols-6">
                  {colors.map((col) => (
                    <button
                      key={col}
                      onClick={() => setSelectedColor(col)}
                      className="flex items-center gap-2 py-1 text-left"
                    >
                      <span
                        className={`h-3 w-3 rounded-full border flex-shrink-0 ${
                          selectedColor === col
                            ? "border-[#7da8c7] bg-[#7da8c7]"
                            : "border-[#cbd5e1] bg-white"
                        }`}
                      />
                      <span
                        className={`text-[11px] tracking-[0.06em] truncate ${
                          selectedColor === col
                            ? "text-[#0f172a]"
                            : "text-[#64748b]"
                        }`}
                      >
                        {col}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {hasActiveFilters && (
            <div className="border-t border-[#e7edf5] py-2">
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("All");
                  setSelectedColor("All");
                  setSelectedSize("All");
                  setSelectedPrice("All");
                }}
                className="text-[11px] tracking-[0.08em] uppercase text-[#64748b] hover:text-[#0f172a] transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter bar only */}
      <div className="md:hidden">
        <MobileFilterBar
          categories={categories}
          colors={colors}
          sizes={sizes}
          priceRanges={priceRanges}
          selectedCategory={selectedCategory}
          selectedColor={selectedColor}
          selectedSize={selectedSize}
          selectedPrice={selectedPrice}
          sortBy={sortBy}
          search={search}
          resultCount={sortedProducts.length}
          totalCount={products.length}
          onCategoryChange={setSelectedCategory}
          onColorChange={setSelectedColor}
          onSizeChange={setSelectedSize}
          onPriceChange={setSelectedPrice}
          onSortChange={setSortBy}
          onSearchChange={setSearch}
          onReset={() => {
            setSearch("");
            setSelectedCategory("All");
            setSelectedColor("All");
            setSelectedSize("All");
            setSelectedPrice("All");
          }}
        />
      </div>

      {/* Product count — desktop only (mobile shows inside filter bar) */}
      {!loading && products.length > 0 && (
        <div className="hidden md:block px-6 md:px-12 lg:px-20 pb-4 text-[10px] tracking-[2px] uppercase text-[#94a3b8]">
          Showing {sortedProducts.length} of {products.length} products
        </div>
      )}

      {/* ══════════════════════ GRID ══════════════════════ */}
      <div className="px-4 md:px-12 lg:px-20 pb-8 md:pb-20">
        {/* Skeleton */}
        {loading && (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i}>
        <div className="zen-bone relative mb-3 border border-[#e2e8f0]" style={{ aspectRatio: "3/4", position: "relative" }}>
          <img src="/zenmen_watermark.png" alt="" aria-hidden="true"
            style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
              width:"95%", maxWidth:200, opacity:0.2, filter:"grayscale(1) brightness(0.6)",
              pointerEvents:"none" }} />
        </div>
        <div className="zen-bone h-2.5 w-16 mb-2" />
        <div className="zen-bone h-3.5 w-full mb-1.5" />
        <div className="zen-bone h-3.5 w-20" />
      </div>
    ))}
  </div>
)}

        {/* Empty state */}
        {!loading && sortedProducts.length === 0 && (
          <div className="py-24 text-center text-[#64748b] text-sm">
            No products found.
          </div>
        )}

        {/* Product grid */}
        {!loading && sortedProducts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {sortedProducts.map((product) => {
              const imgIndex = activeImage[product._id] ?? 0;
              const images = product.images ?? [];
              const currentImg = images[imgIndex]?.url ?? "";
              const hoverImageIndex =
                images.length > 1 ? (imgIndex + 1) % images.length : imgIndex;
              const hoverImg = images[hoverImageIndex]?.url ?? "";

              return (
                <Link
                  key={product._id}
                  href={
                    product.slug
                      ? `/collection/${encodeURIComponent(product.slug)}`
                      : "/collection"
                  }
                  className="group block rounded-sm no-underline text-inherit"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-white mb-3 border border-[#e2e8f0]">
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditingProduct(product);
                        }}
                        className="absolute top-3 right-3 z-20 border border-[#7da8c7] bg-white/90 px-3 py-1 text-[10px] tracking-[0.2em] uppercase text-[#0f172a] hover:bg-[#7da8c7] hover:text-white transition-colors"
                      >
                        Edit
                      </button>
                    )}
                    {currentImg && (
                      <img
                        src={currentImg}
                        alt={images[imgIndex]?.alt ?? product.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                    {hoverImg && hoverImageIndex !== imgIndex && (
                      <img
                        src={hoverImg}
                        alt={images[hoverImageIndex]?.alt ?? product.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      />
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const exists = cartItems.find(
                          (ci) =>
                            ci._id === product._id &&
                            ci.selectedColor === product.colors?.[0] &&
                            ci.selectedSize === product.sizes?.[0],
                        );
                        if (exists) {
                          toast("Already in cart");
                          return;
                        }
                        dispatch(
                          addItem({
                            _id: product._id,
                            title: product.title,
                            slug: product.slug,
                            price: product.price,
                            image: images[imgIndex] ??
                              images[0] ?? { url: "", alt: product.title },
                            selectedColor: product.colors?.[0],
                            selectedSize: product.sizes?.[0],
                            qty: 1,
                          }),
                        );
                        toast.success(`${product.title} added to bag`);
                      }}
                      className="absolute left-3 right-3 bottom-3 border border-[#7da8c7] bg-white/90 px-3 py-2 text-[10px] tracking-[0.22em] uppercase text-[#0f172a] opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-[#7da8c7] hover:text-white"
                    >
                      Add to Cart
                    </button>
                    {product.badge && (
                      <span className="absolute top-3 left-3 bg-[#7da8c7] text-white text-[9px] tracking-widest uppercase px-2 py-1">
                        {product.badge}
                      </span>
                    )}
                    {images.length > 1 && (
                      <div className="absolute bottom-14 left-1/2 z-10 -translate-x-1/2 flex gap-1">
                        {images.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.preventDefault();
                              setActiveImage((prev) => ({
                                ...prev,
                                [product._id]: idx,
                              }));
                            }}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${
                              imgIndex === idx ? "bg-[#7da8c7]" : "bg-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="m-0 text-[10px] tracking-[2px] uppercase text-[#7da8c7] mb-1">
                    {product.category}
                  </p>
                  <p className="m-0 text-sm text-[#0f172a] font-light mb-1 truncate">
                    {product.title}
                  </p>
                  <p className="m-0 text-sm text-[#475569]">
                    {displayPrice(product.price)}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {editingProduct && (
        <ProductEditModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSaved={() => dispatch(fetchProducts())}
        />
      )}
    </div>
  );
}
