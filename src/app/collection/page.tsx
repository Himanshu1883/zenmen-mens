"use client";

import { fetchProducts } from "@/app/store/productSlice";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { categoryFilters, colorFilters } from "./collectionData";

import type { AppDispatch, RootState } from "@/app/store/store";
import { useDispatch, useSelector } from "react-redux";

export default function CollectionPage() {
  const formatPrice = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const [activeImage, setActiveImage] = useState<Record<string, number>>({});
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading } = useSelector(
    (state: RootState) => state.products,
  );
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedColor, setSelectedColor] = useState("All");
  const [search, setSearch] = useState("");
  // const [hydrated, setHydrated] = useState(false);
  const productsCountRef = useRef(products.length);
  const loadingRef = useRef(loading);

  useEffect(() => {
    productsCountRef.current = products.length;
    loadingRef.current = loading;
  }, [products.length, loading]);

  // useEffect(() => {
  //   if (!loading) dispatch(fetchProducts()); // ✅ only fetch once ever
  // }, [loading, dispatch]);

  useEffect(() => {
    if (!loading && products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, loading, products.length]);

  useEffect(() => {
    const ensureProductsLoaded = () => {
      if (!loadingRef.current && productsCountRef.current === 0) {
        dispatch(fetchProducts());
      }
    };

    const onPageShow = () => ensureProductsLoaded();
    const onFocus = () => ensureProductsLoaded();
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        ensureProductsLoaded();
      }
    };

    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [dispatch]);

  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    return products.filter((product) => {
      const categoryMatch =
        selectedCategory === "All" || product.category === selectedCategory;

      const colorMatch =
        selectedColor === "All" || product.colors?.includes(selectedColor);

      const searchMatch =
        search.trim() === "" ||
        product.title.toLowerCase().includes(search.trim().toLowerCase());

      return categoryMatch && colorMatch && searchMatch;
    });
  }, [products, search, selectedCategory, selectedColor]);

  const switchImage = (id: string, dir: "prev" | "next", length: number) => {
    if (!length || length <= 1) return;
    setActiveImage((prev) => {
      const current = prev[id] ?? 0;
      const nextValue =
        dir === "next"
          ? (current + 1) % length
          : (current - 1 + length) % length;
      return { ...prev, [id]: nextValue };
    });
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-[#d6bb89]">
        Loading products...
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(28px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <main className="bg-[#050A18] text-[#F3EEE4]">
        <div className="relative w-full pt-20 md:pt-20">
          <div className="relative h-[58vh] min-h-[440px] w-full overflow-hidden border-y border-[#c8a96e2c]">
            <div className="absolute inset-0 grid grid-cols-3 md:grid-cols-6">
              {[
                "/zenmen_kurta_hero.jpeg",
                "/zenmen_white.jpeg",
                "/zenmen_shirts.jpeg",
                "/zenmen_blackcoat.jpeg",
                "/sherwani.webp",
                "/new.jpg",
              ].map((src, idx) => (
                <div key={src} className="relative">
                  <img
                    src={src}
                    alt={`Collection mood ${idx + 1}`}
                    className="h-full w-full object-cover opacity-75"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/70" />
                </div>
              ))}
            </div>

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(200,169,110,0.22),transparent_45%)]" />

            <div className="relative z-10 flex h-full w-full flex-col items-center justify-end px-6 pb-10 text-center md:pb-14">
              <p className="mb-4 inline-block w-fit rounded-xl border border-[#c8a96e66] bg-black/30 px-4 py-2 text-[10px] tracking-[0.35em] text-[#d6bb89] uppercase">
                ZENmen Edits
              </p>
              <h1 className="max-w-5xl font-['Cormorant_Garamond'] text-5xl font-light leading-[0.95] text-[#f8f4ec] drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)] md:text-7xl">
                New Season Collection
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[#d6d1c4] md:text-base">
                Statement tailoring, sharp silhouettes, and handcrafted textures
                built for weddings, evenings, and standout everyday presence.
              </p>
            </div>
          </div>
        </div>

        <section className="w-full px-4 py-16 sm:px-6 lg:px-8 2xl:px-12 md:py-20">
          <div className="mb-10 flex flex-col justify-between gap-5 border-b border-[#c8a96e2f] pb-6 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] tracking-[0.32em] text-[#c8a96e] uppercase">
                Featured Products
              </p>
              <h2 className="mt-3 font-['Playfair_Display'] text-4xl font-light md:text-5xl">
                Men&apos;s Collections
              </h2>
            </div>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-4 rounded-xl border border-[#c8a96e2f] bg-[#0b1224] p-4 sm:grid-cols-2 lg:grid-cols-4">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              className="h-11 rounded-lg border border-[#c8a96e44] bg-[#0f1830] px-3 text-sm text-[#f3eee4] outline-none transition focus:border-[#d6bb89]"
            />
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="h-11 rounded-lg border border-[#c8a96e44] bg-[#0f1830] px-3 text-sm text-[#f3eee4] outline-none transition focus:border-[#d6bb89]"
            >
              {categoryFilters.map((category) => (
                <option
                  key={category}
                  value={category}
                  className="bg-[#0f1830]"
                >
                  Category: {category}
                </option>
              ))}
            </select>
            <select
              value={selectedColor}
              onChange={(event) => setSelectedColor(event.target.value)}
              className="h-11 rounded-lg border border-[#c8a96e44] bg-[#0f1830] px-3 text-sm text-[#f3eee4] outline-none transition focus:border-[#d6bb89]"
            >
              {colorFilters.map((color) => (
                <option key={color} value={color} className="bg-[#0f1830]">
                  Color: {color}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedCategory("All");
                setSelectedColor("All");
              }}
              className="h-11 rounded-lg border border-[#c8a96e66] bg-[#c8a96e22] px-4 text-sm tracking-[0.18em] text-[#e4cfa6] uppercase transition hover:bg-[#c8a96e44]"
            >
              Clear Filters
            </button>
          </div>

          <div className="mb-6 text-xs tracking-[0.18em] text-[#bdb6a6] uppercase">
            Showing {filteredProducts.length} of {products.length} products
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((product, index) => {
              const imgIndex = activeImage[product._id] ?? 0;
              return (
                <article
                  key={product._id}
                  className="group translate-y-7 animate-[fadeInUp_0.7s_ease_forwards] overflow-hidden rounded-xl border border-[#c8a96e33] bg-[#111111] opacity-0 shadow-[0_16px_40px_rgba(0,0,0,0.45)] transition duration-500 hover:border-[#c8a96e8a]"
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <Link
                    href={`/collection/product-detail?id=${product._id}`}
                    className="block"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden">
                      {product.badge && (
                        <span className="absolute left-3 top-3 z-20 border border-[#c8a96e88] bg-black/70 px-3 py-1 text-[10px] tracking-[0.2em] text-[#d6bb89] uppercase">
                          {product.badge}
                        </span>
                      )}

                      <img
                        src={
                          product.images?.[imgIndex]?.url ||
                          product.images?.[0]?.url ||
                          "/new.jpg"
                        }
                        alt={product.title}
                        className="h-full w-full object-cover"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                    </div>
                  </Link>

                  <div className="pointer-events-none absolute inset-x-0 top-[32%] z-20 flex items-center justify-between px-3">
                    <button
                      type="button"
                      onClick={() =>
                        switchImage(
                          product._id,
                          "prev",
                          product.images?.length ?? 0,
                        )
                      }
                      className="pointer-events-auto rounded-full border border-[#f8f4ec61] bg-black/45 p-2 text-[#f8f4ec] opacity-0 transition duration-300 group-hover:opacity-100 hover:border-[#c8a96e] hover:text-[#c8a96e]"
                      aria-label={`Show previous image for ${product.title}`}
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        switchImage(
                          product._id,
                          "next",
                          product.images?.length ?? 0,
                        )
                      }
                      className="pointer-events-auto rounded-full border border-[#f8f4ec61] bg-black/45 p-2 text-[#f8f4ec] opacity-0 transition duration-300 group-hover:opacity-100 hover:border-[#c8a96e] hover:text-[#c8a96e]"
                      aria-label={`Show next image for ${product.title}`}
                    >
                      <ChevronRight size={24} />
                    </button>
                  </div>

                  <button
                    type="button"
                    className="flex h-12 w-full items-center justify-center gap-3 border-y border-[#c8a96e59] bg-[#c8a96e] text-[14px] font-bold tracking-[0.2em] text-black uppercase transition duration-300 hover:bg-[#d6bb89]"
                  >
                    <ShoppingBag size={18} />
                    Add to Cart
                  </button>

                  <Link
                    href={`/collection/product-detail?id=${product._id}`}
                    className="block p-4"
                  >
                    <h3 className="font-['Cormorant_Garamond'] text-2xl font-light text-[#f8f4ec]">
                      {product.title}
                    </h3>
                    <p className="mt-1 text-[11px] tracking-[0.2em] text-[#9e9585] uppercase">
                      {product.category} • {product.colors?.[0]}
                    </p>
                    <p className="mt-3 font-sans text-2xl text-[#d6bb89]">
                      {formatPrice(product.price)}
                    </p>
                  </Link>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
