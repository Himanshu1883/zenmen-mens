// src/app/collection/page.tsx
"use client";

import { fetchProducts } from "@/store/slices/productSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

// ── Dynamic banner: first 6 product images from DB, fallback to static ────────
const FALLBACK_BANNER = [
  { src: "/zenmen_kurta_hero.jpeg", alt: "Collection mood 1" },
  { src: "/zenmen_white.jpeg", alt: "Collection mood 2" },
  { src: "/zenmen_shirts.jpeg", alt: "Collection mood 3" },
  { src: "/zenmen_blackcoat.jpeg", alt: "Collection mood 4" },
  { src: "/sherwani.webp", alt: "Collection mood 5" },
  { src: "/new.jpg", alt: "Collection mood 6" },
];

export default function CollectionPage() {
  const dispatch = useAppDispatch();
  const { products, loading, loaded, error } = useAppSelector(
    (s) => s.products,
  );

  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") ?? "All",
  );
  const [selectedColor, setSelectedColor] = useState("All");
  const [search, setSearch] = useState("");
  const [activeImage, setActiveImage] = useState<Record<string, number>>({});

  // Single clean effect — fetch once
  useEffect(() => {
    if (!loaded && !loading) dispatch(fetchProducts());
  }, [loaded, loading, dispatch]);

  // ── Banner images: pull primary image from first 6 products, fallback to static
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

  const filteredProducts = useMemo(
    () =>
      products.filter((p) => {
        const catMatch =
          selectedCategory === "All" || p.category === selectedCategory;
        const colorMatch =
          selectedColor === "All" || p.colors?.includes(selectedColor);
        const srchMatch =
          search.trim() === "" ||
          p.title.toLowerCase().includes(search.trim().toLowerCase());
        return catMatch && colorMatch && srchMatch;
      }),
    [products, selectedCategory, selectedColor, search],
  );

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0e1a] text-[#f7f2e8]">
        <p className="text-lg mb-4">Failed to load collection.</p>
        <button
          onClick={() => dispatch(fetchProducts())}
          className="px-6 py-2 border border-[#c8a96e] text-[#c8a96e] text-sm uppercase tracking-widest hover:bg-[#c8a96e] hover:text-[#0a0e1a] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-[#f7f2e8]">
      {/* ══════════════════════ BANNER ══════════════════════ */}
      <div className="relative w-full pt-16">
        <div className="relative h-[58vh] min-h-[440px] w-full overflow-hidden border-b border-[rgba(200,169,110,0.2)]">
          {/* 6-column dynamic image grid */}
          <div className="absolute inset-0 grid grid-cols-3 md:grid-cols-6">
            {bannerImages.map(({ src, alt }, idx) => (
              <div key={idx} className="relative overflow-hidden">
                <img
                  src={src}
                  alt={alt}
                  className="h-full w-full object-cover opacity-80 transition-transform duration-700 hover:scale-105"
                />
                {/* Per-column dark vignette */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#050A18]/10 via-transparent to-[#050A18]/60" />
              </div>
            ))}
          </div>

          {/* Radial gold glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(200,169,110,0.18),transparent_50%)]" />

          {/* Bottom fade into page background */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[#0a0e1a]" />

          {/* Banner text */}
          <div className="relative z-10 flex h-full w-full flex-col items-center justify-end px-6 pb-12 text-center md:pb-16">
            <p className="mb-4 inline-block w-fit border border-[rgba(200,169,110,0.5)] bg-[rgba(5,10,24,0.6)] px-4 py-2 text-[10px] tracking-[0.35em] text-[#c8a96e] uppercase backdrop-blur-sm">
              ZENmen Edits
            </p>
            <h1 className="max-w-4xl font-['Cormorant_Garamond'] text-5xl font-light leading-[0.95] text-[#f8f4ec] drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] md:text-7xl">
              New Season Collection
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[rgba(247,242,232,0.65)] md:text-base">
              Statement tailoring, sharp silhouettes, and handcrafted textures
              built for weddings, evenings, and standout everyday presence.
            </p>
          </div>
        </div>
      </div>

      {/* ══════════════════════ HEADER ══════════════════════ */}
      <div className="pt-12 pb-6 px-6 md:px-12 lg:px-20">
        <p className="text-[10px] tracking-[4px] uppercase text-[#c8a96e] mb-3">
          ZENmen — Collection
        </p>
        <h2 className="font-['Cormorant_Garamond'] text-4xl md:text-5xl font-light leading-tight text-[#f7f2e8]">
          The Collection
        </h2>
      </div>

      {/* ══════════════════════ FILTERS ══════════════════════ */}
      <div className="px-6 md:px-12 lg:px-20 pb-8 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border border-[rgba(200,169,110,0.3)] text-[#f7f2e8] text-sm px-4 py-2 outline-none focus:border-[#c8a96e] placeholder:text-[rgba(247,242,232,0.3)] w-52"
        />
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 text-[10px] tracking-widest uppercase transition-colors ${
                selectedCategory === cat
                  ? "bg-[#c8a96e] text-[#0a0e1a]"
                  : "border border-[rgba(200,169,110,0.3)] text-[#c8a96e] hover:bg-[rgba(200,169,110,0.1)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        {/* Color filter */}
        {colors.length > 2 && (
          <div className="flex gap-2 flex-wrap">
            {colors.map((col) => (
              <button
                key={col}
                onClick={() => setSelectedColor(col)}
                className={`px-4 py-1.5 text-[10px] tracking-widest uppercase transition-colors ${
                  selectedColor === col
                    ? "bg-[#c8a96e] text-[#0a0e1a]"
                    : "border border-[rgba(200,169,110,0.2)] text-[rgba(200,169,110,0.6)] hover:bg-[rgba(200,169,110,0.08)]"
                }`}
              >
                {col}
              </button>
            ))}
          </div>
        )}
        {/* Clear */}
        {(selectedCategory !== "All" || selectedColor !== "All" || search) && (
          <button
            onClick={() => {
              setSearch("");
              setSelectedCategory("All");
              setSelectedColor("All");
            }}
            className="px-4 py-1.5 text-[10px] tracking-widest uppercase border border-[rgba(200,169,110,0.2)] text-[rgba(247,242,232,0.4)] hover:text-[#c8a96e] hover:border-[#c8a96e] transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Product count */}
      {!loading && products.length > 0 && (
        <div className="px-6 md:px-12 lg:px-20 pb-4 text-[10px] tracking-[2px] uppercase text-[rgba(247,242,232,0.3)]">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      )}

      {/* ══════════════════════ GRID ══════════════════════ */}
      <div className="px-6 md:px-12 lg:px-20 pb-20">
        {/* Skeleton */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] bg-[rgba(200,169,110,0.05)] animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredProducts.length === 0 && (
          <div className="py-24 text-center text-[rgba(247,242,232,0.4)] text-sm">
            No products found.
          </div>
        )}

        {/* Product grid — original card design fully preserved */}
        {!loading && filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const imgIndex = activeImage[product._id] ?? 0;
              const images = product.images ?? [];
              const currentImg = images[imgIndex]?.url ?? "";

              return (
                <Link
                  key={product._id}
                  href={`/collection/${product.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#0f1628] mb-3">
                    {currentImg && (
                      <img
                        src={currentImg}
                        alt={images[imgIndex]?.alt ?? product.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                    {product.badge && (
                      <span className="absolute top-3 left-3 bg-[#c8a96e] text-[#0a0e1a] text-[9px] tracking-widest uppercase px-2 py-1">
                        {product.badge}
                      </span>
                    )}
                    {images.length > 1 && (
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
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
                              imgIndex === idx ? "bg-[#c8a96e]" : "bg-white/30"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] tracking-[2px] uppercase text-[#c8a96e] mb-1">
                    {product.category}
                  </p>
                  <p className="text-sm text-[#f7f2e8] font-light mb-1 truncate">
                    {product.title}
                  </p>
                  <p className="text-sm text-[rgba(247,242,232,0.6)]">
                    {formatPrice(product.price)}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
