"use client";

import { fetchProducts } from "@/app/store/productSlice";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
// import { categoryFilters, colorFilters } from "./collectionData";

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

  const categoryFilters = useMemo(
    () => [
      "All",
      ...Array.from(new Set(products.map((p) => p.category).filter(Boolean))),
    ],
    [products],
  );

  const colorFilters = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(products.flatMap((p) => p.colors ?? []).filter(Boolean)),
      ),
    ],
    [products],
  );

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
        @keyframes autoSlidePrimary {
          0%,
          14%,
          100% {
            transform: translateX(0);
          }
          22%,
          78% {
            transform: translateX(-100%);
          }
          86% {
            transform: translateX(0);
          }
        }
        @keyframes autoSlideSecondary {
          0%,
          14%,
          100% {
            transform: translateX(100%);
          }
          22%,
          78% {
            transform: translateX(0);
          }
          86% {
            transform: translateX(100%);
          }
        }
        .product-preview-media {
          position: relative;
          overflow: hidden;
        }
        .product-preview-track {
          position: absolute;
          inset: 0;
        }
        .product-preview-primary,
        .product-preview-secondary {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 20%;
          transition: transform 0.6s ease;
        }
        .product-preview-primary {
          transform: translateX(0);
        }
        .product-preview-secondary {
          transform: translateX(100%);
        }
        .preview-card:hover .product-preview-primary {
          transform: translateX(-100%);
        }
        .preview-card:hover .product-preview-secondary {
          transform: translateX(0);
        }
        .preview-card.auto-preview .product-preview-primary {
          animation: autoSlidePrimary 6.5s ease-in-out infinite;
        }
        .preview-card.auto-preview .product-preview-secondary {
          animation: autoSlideSecondary 6.5s ease-in-out infinite;
        }
        .preview-card.auto-preview:hover .product-preview-primary,
        .preview-card.auto-preview:hover .product-preview-secondary {
          animation-play-state: paused;
        }
      `}</style>
      <main className="bg-[linear-gradient(180deg,#f6f1e8_0%,#f0e7db_55%,#eadfce_100%)] text-[#3f3528]">
        <div className="relative w-full pt-16 md:pt-16">
          <div className="relative h-[58vh] min-h-[440px] w-full overflow-hidden border-y border-[#c8a96e4f]">
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
                    className="h-full w-full object-cover opacity-90"
                  />
                  {/* <div className="absolute inset-0 bg-gradient-to-b from-[#f5ecdd]/10 via-[#533d1f]/20 to-[#2e1f0d]/38" /> */}
                </div>
              ))}
            </div>

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(200,169,110,0.3),transparent_45%)]" />

            <div className="relative z-10 flex h-full w-full flex-col items-center justify-end px-6 pb-10 text-center md:pb-14">
              <p className="mb-4 inline-block w-fit rounded-xl border border-[#c8a96e88] bg-[#f8f0e4]/80 px-4 py-2 text-[10px] tracking-[0.35em] text-[#8b6d3f] uppercase">
                ZENmen Edits
              </p>
              <h1 className="max-w-5xl font-['Cormorant_Garamond'] text-5xl font-light leading-[0.95] text-[#f9f3ea] drop-shadow-[0_2px_8px_rgba(26,17,7,0.45)] md:text-7xl">
                New Season Collection
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[#f0e7d8] md:text-base">
                Statement tailoring, sharp silhouettes, and handcrafted textures
                built for weddings, evenings, and standout everyday presence.
              </p>
            </div>
          </div>
        </div>

        <section className="w-full px-4 py-16 sm:px-6 lg:px-8 2xl:px-12 md:py-20">
          <div className="mb-10 flex flex-col justify-between gap-5 border-b border-[#c8a96e45] pb-6 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] tracking-[0.32em] text-[#c8a96e] uppercase">
                Featured Products
              </p>
              <h2 className="mt-3 font-['Playfair_Display'] text-4xl font-light md:text-5xl">
                Men&apos;s Collections
              </h2>
            </div>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-4 rounded-xl border border-[#c8a96e42] bg-[#f7f1e7] p-4 sm:grid-cols-2 lg:grid-cols-4">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              className="h-11 rounded-lg border border-[#c8a96e66] bg-[#fcf9f3] px-3 text-sm text-[#4b3d2a] outline-none transition focus:border-[#b79257]"
            />
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="h-11 rounded-lg border border-[#c8a96e66] bg-[#fcf9f3] px-3 text-sm text-[#4b3d2a] outline-none transition focus:border-[#b79257]"
            >
              {categoryFilters.map((category) => (
                <option
                  key={category}
                  value={category}
                  className="bg-[#fcf9f3]"
                >
                  Category: {category}
                </option>
              ))}
            </select>
            <select
              value={selectedColor}
              onChange={(event) => setSelectedColor(event.target.value)}
              className="h-11 rounded-lg border border-[#c8a96e66] bg-[#fcf9f3] px-3 text-sm text-[#4b3d2a] outline-none transition focus:border-[#b79257]"
            >
              {colorFilters.map((color) => (
                <option key={color} value={color} className="bg-[#fcf9f3]">
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
              className="h-11 rounded-lg border border-[#c8a96e8f] bg-[#c8a96e24] px-4 text-sm tracking-[0.18em] text-[#8d6f42] uppercase transition hover:bg-[#c8a96e3f]"
            >
              Clear Filters
            </button>
          </div>

          <div className="mb-6 text-xs tracking-[0.18em] text-[#8f7a5d] uppercase">
            Showing {filteredProducts.length} of {products.length} products
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredProducts.map((product, index) => {
              const productId = String(product._id);
              const imgIndex = activeImage[productId] ?? 0;
              const images = product.images ?? [];
              const primary =
                images[imgIndex]?.url || images[0]?.url || "/new.jpg";
              const altIndex =
                images.length > 1 ? (imgIndex + 1) % images.length : 0;
              const secondary = images[altIndex]?.url || primary;
              const hasImagePair = Boolean(primary && secondary);
              const autoPreview =
                hasImagePair &&
                (productId
                  .split("")
                  .reduce(
                    (sum: number, ch: string) => sum + ch.charCodeAt(0),
                    0,
                  ) +
                  index) %
                  3 ===
                  0;
              return (
                <article
                  key={productId}
                  className={`group preview-card translate-y-7 animate-[fadeInUp_0.7s_ease_forwards] overflow-hidden rounded-xl border border-[#c8a96e4d] bg-[#fbf8f2] opacity-0 shadow-[0_14px_34px_rgba(76,52,21,0.16)] transition duration-500 hover:border-[#c8a96e8a] ${autoPreview ? "auto-preview" : ""}`}
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <Link
                    href={`/collection/product-detail?id=${productId}`}
                    className="block"
                  >
                    <div className="product-preview-media relative aspect-[3/4] overflow-hidden">
                      {product.badge && (
                        <span className="absolute left-3 top-3 z-20 border border-[#c8a96e99] bg-[#f7efe2]/90 px-3 py-1 text-[10px] tracking-[0.2em] text-[#8b6d3f] uppercase">
                          {product.badge}
                        </span>
                      )}

                      {hasImagePair ? (
                        <div className="product-preview-track">
                          <img
                            src={primary}
                            alt={product.title}
                            className="product-preview-primary"
                          />
                          <img
                            src={secondary}
                            alt={`${product.title} alternate view`}
                            className="product-preview-secondary"
                          />
                        </div>
                      ) : (
                        <img
                          src={primary}
                          alt={product.title}
                          className="h-full w-full object-cover object-[center_20%]"
                        />
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-[#2e1f0d]/45 via-[#5a4323]/15 to-transparent" />
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
                      className="pointer-events-auto rounded-full border border-[#fff4dfb8] bg-[#f8f1e4]/80 p-2 text-[#5e472a] opacity-0 transition duration-300 group-hover:opacity-100 hover:border-[#c8a96e] hover:text-[#8b6d3f]"
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
                      className="pointer-events-auto rounded-full border border-[#fff4dfb8] bg-[#f8f1e4]/80 p-2 text-[#5e472a] opacity-0 transition duration-300 group-hover:opacity-100 hover:border-[#c8a96e] hover:text-[#8b6d3f]"
                      aria-label={`Show next image for ${product.title}`}
                    >
                      <ChevronRight size={24} />
                    </button>
                  </div>

                  <button
                    type="button"
                    className="flex h-12 w-full items-center justify-center gap-3 border-y border-[#c8a96e70] bg-[#c8a96e] text-[14px] font-bold tracking-[0.2em] text-[#2e220f] uppercase transition duration-300 hover:bg-[#d6bb89]"
                  >
                    <ShoppingBag size={18} />
                    Add to Cart
                  </button>

                  <Link
                    href={`/collection/product-detail?id=${product._id}`}
                    className="block p-4"
                  >
                    <h3 className="font-['Cormorant_Garamond'] text-2xl font-light text-[#3f3122]">
                      {product.title}
                    </h3>
                    <p className="mt-1 text-[11px] tracking-[0.2em] text-[#8f7f66] uppercase">
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
