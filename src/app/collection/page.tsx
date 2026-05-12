// src/app/collection/page.tsx
"use client";

import { formatPrice } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addItem } from "@/store/slices/cartSlice";
import { fetchProducts } from "@/store/slices/productSlice";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

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
  const { data: session } = useSession();

  const isAdmin = (session?.user as any)?.role === "admin";

  const dispatch = useAppDispatch();
  const { products, loading, loaded, error } = useAppSelector(
    (s) => s.products,
  );
  const cartItems = useAppSelector((s) => s.cart.items);

  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") ?? "All",
  );
  const [selectedColor, setSelectedColor] = useState("All");
  const [search, setSearch] = useState("");
  const [activeImage, setActiveImage] = useState<Record<string, number>>({});

  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [editLoading, setEditLoading] = useState(false);

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
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredProducts.map((product) => {
              const imgIndex = activeImage[product._id] ?? 0;
              const images = product.images ?? [];
              const currentImg = images[imgIndex]?.url ?? "";
              const hoverImageIndex =
                images.length > 1 ? (imgIndex + 1) % images.length : imgIndex;
              const hoverImg = images[hoverImageIndex]?.url ?? "";

              return (
                <Link
                  key={product._id}
                  href={`/collection/${product.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#0f1628] mb-3">
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();

                          setEditingProduct(product);
                        }}
                        className="absolute top-3 right-3 z-20 border border-[#c8a96e] bg-[rgba(10,14,26,0.9)] px-3 py-1 text-[10px] tracking-[0.2em] uppercase text-[#c8a96e] hover:bg-[#c8a96e] hover:text-[#0a0e1a] transition-colors"
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
                              images[0] ?? {
                                url: "",
                                alt: product.title,
                              },
                            selectedColor: product.colors?.[0],
                            selectedSize: product.sizes?.[0],
                            qty: 1,
                          }),
                        );
                        toast.success(`${product.title} added to bag`);
                      }}
                      className="absolute left-3 right-3 bottom-3 border border-[rgba(200,169,110,0.65)] bg-[rgba(10,14,26,0.88)] px-3 py-2 text-[10px] tracking-[0.22em] uppercase text-[#f7f2e8] opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-[#c8a96e] hover:text-[#0a0e1a]"
                    >
                      Add to Cart
                    </button>
                    {product.badge && (
                      <span className="absolute top-3 left-3 bg-[#c8a96e] text-[#0a0e1a] text-[9px] tracking-widest uppercase px-2 py-1">
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
      {editingProduct && (
        <>
          <style>{`
      @keyframes zm-modal-in {
        from { opacity: 0; transform: translateY(16px) scale(0.99); }
        to   { opacity: 1; transform: translateY(0)   scale(1); }
      }
      .zm-overlay {
        position: fixed; inset: 0; z-index: 999;
        background: rgba(4, 7, 16, 0.82);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        overflow-y: auto;
        padding: 40px 16px;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        box-sizing: border-box;
      }
      .zm-modal {
        width: 100%; max-width: 660px;
        background: #090e1c;
        border: 1px solid rgba(200,169,110,0.22);
        display: flex; flex-direction: column;
        animation: zm-modal-in 0.32s cubic-bezier(0.22,1,0.36,1) both;
        position: relative;
        max-height: 88vh;
      }
      /* ── Header ── */
      .zm-modal-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 28px 36px 24px;
        border-bottom: 1px solid rgba(200,169,110,0.13);
        flex-shrink: 0;
      }
      .zm-eyebrow {
        font-family: 'Cormorant Garamond', serif;
        font-size: 9px; letter-spacing: 0.38em; text-transform: uppercase;
        color: rgba(200,169,110,0.6); margin: 0 0 5px;
      }
      .zm-modal-title {
        font-family: 'Playfair Display', serif;
        font-size: 1.45rem; font-weight: 300; letter-spacing: 0.04em;
        color: #f7f2e8; margin: 0; line-height: 1.1;
      }
      .zm-close-btn {
        width: 36px; height: 36px;
        border: 1px solid rgba(200,169,110,0.2);
        background: transparent;
        color: rgba(200,169,110,0.65);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; font-size: 14px; flex-shrink: 0;
        transition: border-color 0.2s, color 0.2s, background 0.2s;
      }
      .zm-close-btn:hover {
        border-color: rgba(200,169,110,0.55);
        color: #f7f2e8;
        background: rgba(200,169,110,0.07);
      }
      /* ── Scrollable body ── */
      .zm-modal-body {
        overflow-y: auto; flex: 1;
        padding: 32px 36px;
        display: flex; flex-direction: column; gap: 24px;
      }
      .zm-modal-body::-webkit-scrollbar { width: 3px; }
      .zm-modal-body::-webkit-scrollbar-track { background: transparent; }
      .zm-modal-body::-webkit-scrollbar-thumb {
        background: rgba(200,169,110,0.28); border-radius: 2px;
      }
      /* ── Section badge ── */
      .zm-badge {
        display: inline-flex; align-items: center; gap: 8px;
        font-family: 'Cormorant Garamond', serif;
        font-size: 9px; letter-spacing: 0.32em; text-transform: uppercase;
        color: rgba(200,169,110,0.5);
      }
      .zm-badge::before {
        content: ''; width: 24px; height: 1px;
        background: rgba(200,169,110,0.28);
      }
      /* ── Field grid ── */
      .zm-row {
        display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
      }
      .zm-field { display: flex; flex-direction: column; gap: 8px; }
      .zm-field.full { grid-column: 1 / -1; }
      .zm-label {
        font-family: 'Cormorant Garamond', serif;
        font-size: 9px; letter-spacing: 0.32em; text-transform: uppercase;
        color: rgba(200,169,110,0.65);
      }
      .zm-input, .zm-textarea {
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(200,169,110,0.16);
        color: #f7f2e8;
        font-family: 'Jost', sans-serif; font-size: 0.82rem; font-weight: 300;
        letter-spacing: 0.03em;
        padding: 11px 14px; outline: none;
        transition: border-color 0.25s, background 0.25s;
        width: 100%; box-sizing: border-box;
      }
      .zm-input:focus, .zm-textarea:focus {
        border-color: rgba(200,169,110,0.48);
        background: rgba(200,169,110,0.04);
      }
      .zm-input::placeholder, .zm-textarea::placeholder {
        color: rgba(247,242,232,0.2);
      }
      .zm-textarea { resize: vertical; line-height: 1.7; min-height: 90px; }
      /* ── Image grid ── */
      .zm-images {
        display: grid; grid-template-columns: repeat(4,1fr); gap: 10px;
      }
      @media (max-width: 480px) {
        .zm-images { grid-template-columns: repeat(2,1fr); }
        .zm-row { grid-template-columns: 1fr; }
        .zm-field.full { grid-column: auto; }
        .zm-modal-header, .zm-modal-body, .zm-modal-footer { padding-left: 20px; padding-right: 20px; }
      }
      .zm-img-card {
        position: relative; aspect-ratio: 1;
        background: #0f1628;
        border: 1px solid rgba(200,169,110,0.12); overflow: hidden;
      }
      .zm-img-card img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .zm-img-remove {
        position: absolute; top: 6px; right: 6px;
        width: 22px; height: 22px;
        background: rgba(9,14,28,0.92);
        border: 1px solid rgba(200,169,110,0.3);
        color: #c8a96e; display: flex; align-items: center; justify-content: center;
        font-size: 9px; cursor: pointer;
        transition: background 0.2s;
      }
      .zm-img-remove:hover { background: rgba(200,169,110,0.15); }
      /* ── Featured checkbox row ── */
      .zm-check-row {
        display: flex; align-items: center; gap: 12px;
        padding: 14px 16px;
        border: 1px solid rgba(200,169,110,0.13);
        background: rgba(200,169,110,0.03);
        cursor: pointer;
      }
      .zm-check-box {
        width: 16px; height: 16px;
        border: 1px solid rgba(200,169,110,0.4);
        background: transparent; appearance: none; -webkit-appearance: none;
        cursor: pointer; flex-shrink: 0; position: relative;
        transition: background 0.2s, border-color 0.2s;
      }
      .zm-check-box:checked {
        background: rgba(200,169,110,0.12); border-color: #c8a96e;
      }
      .zm-check-box:checked::after {
        content: '';
        position: absolute; width: 8px; height: 5px;
        border-left: 1.5px solid #c8a96e; border-bottom: 1.5px solid #c8a96e;
        transform: rotate(-45deg) translate(0,-1px);
      }
      .zm-check-text {
        font-family: 'Jost', sans-serif; font-size: 0.8rem; font-weight: 300;
        letter-spacing: 0.06em; color: rgba(247,242,232,0.6);
      }
      .zm-check-text em { color: #c8a96e; font-style: normal; }
      /* ── Footer ── */
      .zm-modal-footer {
        padding: 20px 36px 28px;
        border-top: 1px solid rgba(200,169,110,0.1);
        display: flex; gap: 12px; flex-shrink: 0;
      }
      .zm-btn-cancel {
        background: transparent;
        border: 1px solid rgba(200,169,110,0.2);
        color: rgba(200,169,110,0.55);
        font-family: 'Cormorant Garamond', serif;
        font-size: 0.72rem; letter-spacing: 0.28em; text-transform: uppercase;
        padding: 14px 20px; cursor: pointer;
        transition: border-color 0.25s, color 0.25s;
      }
      .zm-btn-cancel:hover {
        border-color: rgba(200,169,110,0.45);
        color: rgba(200,169,110,0.85);
      }
      .zm-btn-save {
        flex: 1;
        background: #c8a96e; border: 1px solid #c8a96e;
        color: #07090f;
        font-family: 'Cormorant Garamond', serif;
        font-size: 0.72rem; letter-spacing: 0.32em; text-transform: uppercase;
        padding: 14px 20px; cursor: pointer;
        position: relative; overflow: hidden;
        transition: color 0.3s;
      }
      .zm-btn-save::before {
        content: '';
        position: absolute; inset: 0;
        background: #f7f2e8;
        transform: scaleX(0); transform-origin: left;
        transition: transform 0.34s cubic-bezier(0.22,1,0.36,1);
      }
      .zm-btn-save:hover::before { transform: scaleX(1); }
      .zm-btn-save span { position: relative; z-index: 1; }
      .zm-btn-save:disabled { opacity: 0.55; cursor: not-allowed; }
      .zm-btn-save:disabled::before { display: none; }
    `}</style>

          <div className="zm-overlay">
            <div className="zm-modal">
              {/* ── Header ── */}
              <div className="zm-modal-header">
                <div>
                  <p className="zm-eyebrow">ZENmen — Admin</p>
                  <h2 className="zm-modal-title">Edit Product</h2>
                </div>
                <button
                  className="zm-close-btn"
                  onClick={() => setEditingProduct(null)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* ── Scrollable body ── */}
              <div className="zm-modal-body">
                {/* Essentials */}
                <span className="zm-badge">Essentials</span>

                <div className="zm-row">
                  <div className="zm-field full">
                    <label className="zm-label">Title</label>
                    <input
                      className="zm-input"
                      value={editingProduct.title}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          title: e.target.value,
                        })
                      }
                      placeholder="Product title"
                    />
                  </div>
                  <div className="zm-field">
                    <label className="zm-label">Price (₹)</label>
                    <input
                      type="number"
                      className="zm-input"
                      value={editingProduct.price}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          price: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="zm-field">
                    <label className="zm-label">Stock</label>
                    <input
                      type="number"
                      className="zm-input"
                      value={editingProduct.stock}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          stock: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="zm-field full">
                    <label className="zm-label">Category</label>
                    <input
                      className="zm-input"
                      value={editingProduct.category}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          category: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="zm-field full">
                    <label className="zm-label">Description</label>
                    <textarea
                      className="zm-textarea"
                      rows={5}
                      value={editingProduct.description}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Images */}
                <span className="zm-badge">Product Images</span>

                <div className="zm-images">
                  {editingProduct.images?.map((img: any, index: number) => (
                    <div key={index} className="zm-img-card">
                      <img src={img.url} alt={img.alt} />
                      <button
                        type="button"
                        className="zm-img-remove"
                        onClick={() =>
                          setEditingProduct({
                            ...editingProduct,
                            images: editingProduct.images.filter(
                              (_: any, i: number) => i !== index,
                            ),
                          })
                        }
                        aria-label="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* Visibility */}
                <span className="zm-badge">Visibility</span>

                <label className="zm-check-row">
                  <input
                    type="checkbox"
                    className="zm-check-box"
                    checked={editingProduct.isFeatured}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        isFeatured: e.target.checked,
                      })
                    }
                  />
                  <span className="zm-check-text">
                    Mark as <em>Featured Product</em>
                  </span>
                </label>
              </div>

              {/* ── Footer ── */}
              <div className="zm-modal-footer">
                <button
                  className="zm-btn-cancel"
                  onClick={() => setEditingProduct(null)}
                >
                  Discard
                </button>
                <button
                  disabled={editLoading}
                  className="zm-btn-save"
                  onClick={async () => {
                    try {
                      setEditLoading(true);
                      const res = await fetch(
                        `/api/products/${editingProduct.slug}`,
                        {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(editingProduct),
                        },
                      );
                      if (!res.ok) throw new Error("Update failed");
                      toast.success("Product updated");
                      setEditingProduct(null);
                      dispatch(fetchProducts());
                    } catch (err) {
                      console.error(err);
                      toast.error("Failed to update");
                    } finally {
                      setEditLoading(false);
                    }
                  }}
                >
                  <span>{editLoading ? "Updating…" : "Update Product"}</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
