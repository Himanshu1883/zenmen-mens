"use client";

import { useDisplayPrice } from "@/hooks/useDisplayPrice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addItem } from "@/store/slices/cartSlice";
import { fetchProducts } from "@/store/slices/productSlice";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type ProductImage = {
  url: string;
  alt?: string;
  isPrimary?: boolean;
  order?: number;
};

type Product = {
  _id: string;
  title: string;
  slug?: string;
  tagline?: string;
  description?: string;
  category?: string;
  subCategory?: string;
  price: number;
  comparePrice?: number;
  discount?: number;
  colors?: string[];
  sizes?: string[];
  badge?: string;
  details?: string[];
  care?: string;
  rating?: number;
  numReviews?: number;
  images?: ProductImage[];
  isAvailable?: boolean;
  isFeatured?: boolean;
};

const categories = ["all", "Ethnic", "Western"];

function IconChevronRight() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export default function Products() {
  const dispatch = useAppDispatch();
  const { format: displayPrice } = useDisplayPrice();
  const { products, loading, loaded, error } = useAppSelector(
    (state) => state.products,
  ) as {
    products: Product[];
    loading: boolean;
    loaded: boolean;
    error: string | null;
  };
  const cartItems = useAppSelector((s) => s.cart.items);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    if (!loading && !loaded) {
      dispatch(fetchProducts());
    }
  }, [dispatch, loading, loaded]);

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

  const displayProducts = filteredProducts.slice(0, 8);

  const getCategoryIcon = (category?: string) => {
    if (category === "Ethnic") {
      return (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      );
    }
    return (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        <path d="M20 3l-4 1-4-1-4 1-4-1v4l3 2v13h10V9l3-2V3z" />
      </svg>
    );
  };

  if (loading && !loaded) {
    return (
      <div className="products-root">
        <div className="grain-overlay" />
        <div className="products-inner">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-[#7da8c7] text-sm font-[family-name:var(--font-montserrat)] uppercase tracking-[0.28em] animate-pulse">
              Curating collection…
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !loaded) {
    return (
      <div className="products-root">
        <div className="grain-overlay" />
        <div className="products-inner">
          <div className="flex flex-col justify-center items-center min-h-[400px] gap-5">
            <div className="text-[#64748b] text-sm tracking-[0.2em] uppercase font-[family-name:var(--font-montserrat)]">
              Unable to load collection
            </div>
            <button
              onClick={() => dispatch(fetchProducts())}
              className="px-6 py-2.5 border border-[#7da8c7] text-[#0f172a] text-[11px] uppercase tracking-[0.2em] bg-white hover:bg-[#7da8c7] hover:text-white hover:border-[#7da8c7] transition-colors rounded-sm"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .products-root {
          font-family: var(--font-montserrat), system-ui, sans-serif;
          position: relative;
          background: #f8fafc;
          min-height: auto;
          color: #0f172a;
          overflow-x: hidden;
        }

        .grain-overlay {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.35'/%3E%3C/svg%3E");
          background-size: 180px;
          opacity: 0.035;
        }

        .products-inner {
          position: relative; z-index: 1;
          max-width: 1360px; margin: 0 auto;
          padding: clamp(56px, 8vw, 96px) clamp(20px, 4vw, 40px) clamp(72px, 10vw, 120px);
        }

        .section-eyebrow {
          font-family: var(--font-montserrat), sans-serif;
          font-size: 10px; font-weight: 600;
          letter-spacing: 0.32em; text-transform: uppercase;
          color: #7da8c7; margin-bottom: 20px;
          display: flex; align-items: center; gap: 14px;
        }
        .section-eyebrow::before {
          content: ''; display: block; width: 36px; height: 1px;
          background: linear-gradient(90deg, #7da8c7, rgba(125,168,199,0.2));
        }

        .section-title {
          font-family: var(--font-playfair), Georgia, serif;
          font-size: clamp(40px, 5.5vw, 72px);
          font-weight: 500; line-height: 1.05;
          color: #0f172a; letter-spacing: -0.02em;
          margin-bottom: 8px;
        }
        .section-title em {
          font-style: italic; color: #7da8c7;
        }

        .section-sub {
          font-size: 15px; font-weight: 300;
          font-family: var(--font-cormorant), Georgia, serif;
          font-style: italic;
          color: #64748b; max-width: 520px;
          line-height: 1.75; margin-bottom: 48px;
        }

        .products-filter-bar {
          display: flex; flex-wrap: wrap; gap: 0;
          margin-bottom: 40px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 0;
        }
        .products-filter-btn {
          font-family: var(--font-montserrat), sans-serif;
          font-size: 11px; font-weight: 500;
          letter-spacing: 0.18em; text-transform: uppercase;
          padding: 14px 22px 16px; border: none; cursor: pointer;
          background: transparent; color: #64748b;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px; transition: color 0.25s ease, border-color 0.25s ease;
          display: flex; align-items: center; gap: 8px;
        }
        .products-filter-btn:hover { color: #0f172a; }
        .products-filter-btn.active {
          color: #0f172a;
          border-bottom-color: #7da8c7;
        }
        .products-filter-count {
          font-size: 9px; padding: 2px 8px;
          border-radius: 999px; border: 1px solid #e2e8f0;
          color: #94a3b8; background: #fff;
        }
        .products-filter-btn.active .products-filter-count {
          border-color: rgba(125,168,199,0.45);
          color: #7da8c7;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
          gap: clamp(18px, 2.5vw, 28px);
          /* Align all rows — every card in a row stretches to equal height */
          align-items: stretch;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── KEY FIX: card is a flex column so body can push footer to bottom ── */
        .product-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
          transition: border-color 0.3s ease, box-shadow 0.35s ease, transform 0.35s ease;
          animation: cardIn 0.5s both;
          position: relative;
          text-decoration: none;
          /* flex column so card-body can fill remaining height */
          display: flex;
          flex-direction: column;
          box-shadow: 0 1px 0 rgba(15, 23, 42, 0.04);
        }
        .product-card:hover {
          border-color: rgba(125, 168, 199, 0.45);
          box-shadow: 0 20px 48px -24px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(125, 168, 199, 0.12);
          transform: translateY(-3px);
        }

        .badge {
          position: absolute; top: 16px; left: 16px; z-index: 10;
          font-family: var(--font-montserrat), sans-serif;
          font-size: 8px; font-weight: 600;
          letter-spacing: 0.22em; text-transform: uppercase;
          padding: 6px 12px;
          border-radius: 2px;
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(125, 168, 199, 0.4);
          color: #0f172a;
          backdrop-filter: blur(8px);
        }

        .card-img {
          /* Fixed aspect ratio — image area never shrinks or grows */
          position: relative;
          aspect-ratio: 3 / 4;
          overflow: hidden;
          background: #f1f5f9;
          flex-shrink: 0;
        }
        .card-img img {
          width: 100%; height: 100%; object-fit: cover; object-position: center;
          transition: transform 0.6s ease;
        }
        .product-card:hover .card-img img {
          transform: scale(1.04);
        }
        .card-img-hover-track {
          position: absolute;
          inset: 0;
        }
        .card-img-primary,
        .card-img-secondary {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          transition: transform 0.6s ease;
        }
        .card-img-primary {
          transform: translateX(0);
        }
        .card-img-secondary {
          transform: translateX(100%);
        }
        .product-card:hover .card-img-primary {
          transform: translateX(-100%);
        }
        .product-card:hover .card-img-secondary {
          transform: translateX(0);
        }
        @keyframes autoSlidePrimary {
          0%, 14%, 100% { transform: translateX(0); }
          22%, 78% { transform: translateX(-100%); }
          86% { transform: translateX(0); }
        }
        @keyframes autoSlideSecondary {
          0%, 14%, 100% { transform: translateX(100%); }
          22%, 78% { transform: translateX(0); }
          86% { transform: translateX(100%); }
        }
        .product-card.auto-preview .card-img-primary {
          animation: autoSlidePrimary 6.5s ease-in-out infinite;
        }
        .product-card.auto-preview .card-img-secondary {
          animation: autoSlideSecondary 6.5s ease-in-out infinite;
        }

        .card-silhouette {
          background: linear-gradient(160deg, #f1f5f9 0%, #e2e8f0 100%);
          color: #94a3b8;
        }

        .card-overlay {
          position: absolute; inset: 0;
          display: flex; align-items: flex-end; justify-content: center;
          padding-bottom: 24px;
          background: linear-gradient(to top, rgba(15, 23, 42, 0.55) 0%, transparent 52%);
          opacity: 0; transition: opacity 0.3s ease;
        }
        .product-card:hover .card-overlay { opacity: 1; }

        .quick-view-btn {
          font-family: var(--font-montserrat), sans-serif;
          font-size: 9px; font-weight: 600;
          letter-spacing: 0.22em; text-transform: uppercase;
          padding: 11px 22px;
          border: 1px solid rgba(255,255,255,0.85);
          background: #ffffff;
          cursor: pointer;
          border-radius: 2px;
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
          color: #0f172a;
        }
        .quick-view-btn:hover {
          background: #7da8c7;
          color: #ffffff;
          border-color: #7da8c7;
        }

        /* ── KEY FIX: card-body is flex column, fills remaining card height ── */
        .card-body {
          padding: 20px 22px 0;
          border-top: 1px solid #f1f5f9;
          /* grow to fill all space below the image */
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .card-cat {
          font-size: 9px; font-weight: 600;
          letter-spacing: 0.24em; text-transform: uppercase;
          margin-bottom: 7px;
          color: #7da8c7;
          /* fixed single line — never wraps */
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Title clamped to exactly 2 lines so height is predictable */
        .card-name {
          font-family: var(--font-playfair), Georgia, serif;
          font-size: 1.3rem; font-weight: 500;
          color: #0f172a; line-height: 1.28;
          margin-bottom: 0;
          /* always exactly 2 lines tall */
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          /* reserve height for 2 lines even if text is shorter */
          min-height: calc(1.3rem * 1.28 * 2);
        }

        .card-desc {
          font-size: 13px; font-weight: 300;
          line-height: 1.65; color: #64748b;
          margin-bottom: 16px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* ── KEY FIX: footer always pushed to bottom of card-body ── */
        .card-footer {
          margin-top: auto;           /* pushes footer to bottom regardless of content above */
          padding: 14px 0 20px;       /* breathing room above and below */
          border-top: 1px solid #f1f5f9;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .card-price-wrap {
          width: 100%;
        }

        .card-price {
          font-family: var(--font-playfair), Georgia, serif;
          font-size: 1.45rem; font-weight: 500;
          color: #0f172a;
          letter-spacing: 0.02em;
        }

        .card-price-compare {
          font-size: 13px;
          color: #94a3b8;
          text-decoration: line-through;
          margin-left: 8px;
        }

        .add-btn {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-montserrat), sans-serif;
          font-size: 9px; font-weight: 600;
          letter-spacing: 0.2em; text-transform: uppercase;
          padding: 10px 18px;
          border: 1px solid rgba(15, 23, 42, 0.12);
          cursor: pointer;
          border-radius: 2px;
          transition: color 0.3s ease, border-color 0.3s ease, transform 0.25s ease;
          background: #f8fafc;
          color: #0f172a;
          width: 100%;
          justify-content: center;
        }
        .add-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, #7da8c7 0%, #9abdd4 100%);
          transform: translateX(-105%);
          transition: transform 0.45s cubic-bezier(.22,.61,.36,1);
          z-index: -1;
        }
        .add-btn-label {
          position: relative;
          z-index: 1;
        }
        .add-btn-icon {
          position: relative;
          z-index: 1;
          width: 16px;
          height: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 400;
          line-height: 1;
          transition: transform 0.35s ease;
        }
        .add-btn:hover {
          color: #ffffff;
          border-color: #7da8c7;
          transform: translateY(-1px);
        }
        .add-btn:hover::before {
          transform: translateX(0);
        }
        .add-btn:hover .add-btn-icon {
          transform: rotate(90deg);
        }

        .products-count {
          font-size: 11px; letter-spacing: 0.14em;
          color: #94a3b8; text-transform: uppercase;
          margin-bottom: 20px;
          font-weight: 500;
        }
        .products-count span {
          color: #7da8c7;
        }

        .divider {
          width: 48px; height: 1px;
          background: linear-gradient(90deg, #7da8c7, rgba(125,168,199,0.15));
          margin-bottom: 28px;
        }

        .view-collection-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          margin-top: 48px;
          padding: 18px 28px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          text-decoration: none;
          transition: border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
        }
        .view-collection-btn:hover {
          background: #f8fafc;
          border-color: #7da8c7;
          box-shadow: 0 12px 36px -20px rgba(125, 168, 199, 0.35);
        }
        .view-collection-text {
          font-family: var(--font-montserrat), sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #0f172a;
        }
        .view-collection-icon {
          color: #7da8c7;
          transition: transform 0.3s ease;
        }
        .view-collection-btn:hover .view-collection-icon {
          transform: translateX(6px);
        }

        @media (max-width: 640px) {
          .products-inner { padding: 48px 18px 72px; }
          .products-grid { grid-template-columns: 1fr; }
          .products-filter-btn { padding: 12px 14px 14px; font-size: 10px; }
          .view-collection-btn { padding: 16px 20px; }
          .view-collection-text { font-size: 10px; }
          /* On mobile single-column, cards don't need equal height — reset */
          .card-name { min-height: unset; }
        }

        /* 2-column breakpoint: enforce equal row heights so buttons align */
        @media (min-width: 641px) and (max-width: 1023px) {
          .products-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .products-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>

      <div className="products-root">
        <div className="grain-overlay" />
        <div className="products-inner">
          <div className="section-eyebrow">Ready to Wear Collection</div>

          <h2 className="section-title">
            Curated
            <br />
            <em>Collection</em>
          </h2>

          <div className="divider" />

          <p className="section-sub">
            Select pieces crafted from our finest fabrics — available for
            immediate purchase. Each garment is a study in restraint and
            precision.
          </p>

          <div className="products-filter-bar">
            {categories.map((cat) => {
              const count =
                cat === "all"
                  ? products.length
                  : products.filter((p) => p.category === cat).length;
              return (
                <button
                  key={cat}
                  className={`products-filter-btn ${activeCategory === cat ? "active" : ""}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat === "all" ? "All Pieces" : cat}
                  <span className="products-filter-count">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="products-count">
            Showing <span>{displayProducts.length}</span> of{" "}
            {filteredProducts.length} pieces
          </div>

          <div className="products-grid">
            {displayProducts.map((product, index) => {
              const primaryImage =
                product.images?.find((img) => img.isPrimary) ||
                product.images?.[0];
              const secondaryImage = product.images?.find(
                (img) => img.url !== primaryImage?.url,
              );
              const hasImagePair = Boolean(primaryImage && secondaryImage);
              const autoPreviewSeed =
                product._id
                  .split("")
                  .reduce((sum, ch) => sum + ch.charCodeAt(0), 0) + index;
              const shouldAutoPreview =
                hasImagePair && autoPreviewSeed % 3 === 0;
              const hasDiscount = product.discount && product.discount > 0;
              const discountedPrice = hasDiscount
                ? product.price * (1 - (product.discount || 0) / 100)
                : product.price;

              return (
                <Link
                  key={product._id}
                  href={`/collection/${encodeURIComponent(product.slug ?? "")}`}
                  className={`product-card ${shouldAutoPreview ? "auto-preview" : ""}`}
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  {product.badge && (
                    <div className="badge">{product.badge}</div>
                  )}

                  <div className="card-img">
                    {primaryImage && secondaryImage ? (
                      <div className="card-img-hover-track">
                        <img
                          src={primaryImage.url}
                          alt={product.title}
                          loading="lazy"
                          className="card-img-primary"
                        />
                        <img
                          src={secondaryImage.url}
                          alt={`${product.title} alternate view`}
                          loading="lazy"
                          className="card-img-secondary"
                        />
                      </div>
                    ) : primaryImage ? (
                      <img
                        src={primaryImage.url}
                        alt={product.title}
                        loading="lazy"
                      />
                    ) : (
                      <div className="card-silhouette flex items-center justify-center h-full">
                        {getCategoryIcon(product.category)}
                      </div>
                    )}
                    <div className="card-overlay">
                      <button
                        type="button"
                        className="quick-view-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          if (!product.slug) return;
                          window.location.href = `/collection/${encodeURIComponent(product.slug)}`;
                        }}
                      >
                        Quick View
                      </button>
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="card-cat">
                      {product.category} ·{" "}
                      {product.subCategory || "Ready to Wear"}
                    </div>
                    <h3 className="card-name">{product.title}</h3>

                    <div className="card-footer">
                      <div className="card-price-wrap">
                        <span className="card-price">
                          {displayPrice(
                            hasDiscount ? discountedPrice : product.price,
                          )}
                        </span>
                        {hasDiscount && (
                          <span className="card-price-compare">
                            {displayPrice(product.price)}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        className="add-btn"
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
                              slug: product.slug ?? product._id,
                              price: hasDiscount
                                ? Math.round(discountedPrice)
                                : product.price,
                              image: primaryImage ?? {
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
                      >
                        <span className="add-btn-label">Add to Bag</span>
                        <span className="add-btn-icon">+</span>
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {filteredProducts.length > 8 && (
            <Link href="/collection" className="view-collection-btn">
              <span className="view-collection-text">View Full Collection</span>
              <span className="view-collection-icon">
                <IconChevronRight />
              </span>
            </Link>
          )}

          {displayProducts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-[#64748b] text-base font-[family-name:var(--font-cormorant)] italic">
                No products found in this category.
              </p>
              <button
                onClick={() => setActiveCategory("all")}
                className="mt-6 rounded-sm border border-[#7da8c7] bg-white px-8 py-3 text-sm uppercase tracking-wider text-[#0f172a] transition-all hover:bg-[#7da8c7] hover:text-white"
              >
                View All Products
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
