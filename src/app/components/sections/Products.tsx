"use client";

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

const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

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
            <div className="text-[#C9A96E] text-lg tracking-wider animate-pulse">
              CURATING COLLECTION...
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
            <div className="text-[#C9A96E] text-sm tracking-[0.2em] uppercase">
              Unable to load collection
            </div>
            <button
              onClick={() => dispatch(fetchProducts())}
              className="px-6 py-2 border border-[#C9A96E] text-[#C9A96E] text-[11px] uppercase tracking-[0.2em] hover:bg-[rgba(201,169,110,0.14)] transition-colors"
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
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Montserrat:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .products-root {
          font-family: 'Montserrat', sans-serif;
          background: #0f1628;
          min-height: 100vh;
          color: #e8dcc7;
          overflow-x: hidden;
        }

        .grain-overlay {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: 0.16;
        }

        .products-inner {
          position: relative; z-index: 1;
          max-width: 1360px; margin: 0 auto;
          padding: 80px 40px 120px;
        }

        .section-eyebrow {
          font-family: 'Montserrat', sans-serif;
          font-size: 11px; font-weight: 500;
          letter-spacing: 0.35em; text-transform: uppercase;
          color: #C9A96E; margin-bottom: 24px;
          display: flex; align-items: center; gap: 16px;
        }
        .section-eyebrow::before {
          content: ''; display: block; width: 40px; height: 1px; background: #C9A96E; opacity: 0.6;
        }

        .section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(52px, 7vw, 96px);
          font-weight: 300; line-height: 1.0;
          color: #efe2cc; letter-spacing: -0.01em;
          margin-bottom: 12px;
        }
        .section-title em {
          font-style: italic; color: #C9A96E;
        }

        .section-sub {
          font-size: 15px; font-weight: 300;
          color: #b8a58a; max-width: 480px;
          line-height: 1.8; margin-bottom: 64px;
          letter-spacing: 0.02em;
        }

        .products-filter-bar {
          display: flex; gap: 4px;
          margin-bottom: 56px;
          border-bottom: 1px solid #c9a96e2f;
          padding-bottom: 0;
        }
        .products-filter-btn {
          font-family: 'Montserrat', sans-serif;
          font-size: 12px; font-weight: 500;
          letter-spacing: 0.2em; text-transform: uppercase;
          padding: 14px 28px 16px; border: none; cursor: pointer;
          background: transparent; color: #a58f72;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px; transition: all 0.3s ease;
          display: flex; align-items: center; gap: 8px;
        }
        .products-filter-btn:hover { color: #d9c1a0; }
        .products-filter-btn.active {
          color: #C9A96E;
          border-bottom-color: #C9A96E;
        }
        .products-filter-count {
          font-size: 10px; padding: 2px 7px;
          border-radius: 20px; border: 1px solid currentColor;
          opacity: 0.7;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .product-card {
          background: #171411;
          border: 1px solid #c9a96e33;
          border-radius: 2px;
          overflow: hidden;
          transition: border-color 0.4s ease, transform 0.4s ease;
          animation: cardIn 0.5s both;
          position: relative;
          text-decoration: none;
          display: block;
        }
        .product-card:hover {
          border-color: rgba(201, 169, 110, 0.55);
          transform: translateY(-4px);
        }

        .badge {
          position: absolute; top: 20px; left: 10px; z-index: 10;
          font-family: 'Montserrat', sans-serif;
          font-size: 9px; font-weight: 600;
          letter-spacing: 0.25em; text-transform: uppercase;
          padding: 5px 12px; border: 1px solid;
          border-radius: 0;
          background: rgba(27, 23, 19, 0.9);
          backdrop-filter: blur(4px);
        }

        .card-img {
          position: relative; height: 340px; overflow: hidden;
          background: #0f1628;
        }
        .card-img img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.6s ease;
        }
        .product-card:hover .card-img img {
          transform: scale(1.05);
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
        .card-overlay {
          position: absolute; inset: 0;
          display: flex; align-items: flex-end; justify-content: center;
          padding-bottom: 28px;
          background: linear-gradient(0deg, rgba(8, 7, 6, 0.65) 0%, transparent 55%);
          opacity: 0; transition: opacity 0.35s ease;
        }
        .product-card:hover .card-overlay { opacity: 1; }

        .quick-view-btn {
          font-family: 'Montserrat', sans-serif;
          font-size: 10px; font-weight: 500;
          letter-spacing: 0.25em; text-transform: uppercase;
          padding: 10px 24px; border: 1px solid #C9A96E;
          background: rgba(16, 13, 10, 0.92); cursor: pointer;
          border-radius: 0;
          transition: background 0.2s ease;
          color: #C9A96E;
        }
        .quick-view-btn:hover { background: rgba(29, 23, 17, 0.98); }

        .card-body {
          padding: 28px 28px 24px;
          border-top: 1px solid #c9a96e2b;
        }

        .card-cat {
          font-size: 10px; font-weight: 500;
          letter-spacing: 0.3em; text-transform: uppercase;
          margin-bottom: 10px;
          color: #C9A96E;
        }

        .card-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px; font-weight: 400;
          color: #f0e3cf; line-height: 1.2;
          margin-bottom: 8px;
        }

        .card-sub {
          font-size: 11px; font-weight: 400;
          letter-spacing: 0.12em; color: #ad9a7e;
          // margin-bottom: 14px;
          text-transform: uppercase;
        }

        .card-desc {
          font-size: 13px; font-weight: 300;
          line-height: 1.65; color: #a18d70;
          margin-bottom: 20px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-footer {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 14px;
          border-top: 1px solid #c9a96e22; padding-top: 10px;
        }
        .card-price-wrap {
          width: 100%;
          text-align: left;
        }
        .card-footer .add-btn {
          align-self: center;
        }

        .card-price {
          // font-family: 'Cormorant Garamond', serif;
          font-size: 24px; font-weight: 400;
          color: #f0e2ca;
          letter-spacing: 0.02em;
        }

        .card-price-compare {
          font-size: 14px;
          color: #9f927d;
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
          font-family: 'Montserrat', sans-serif;
          font-size: 10px; font-weight: 500;
          letter-spacing: 0.22em; text-transform: uppercase;
          padding: 8px 16px;
          border: 1px solid #C9A96E66;
          cursor: pointer;
          border-radius: 0;
          transition: color 0.35s ease, border-color 0.35s ease, transform 0.25s ease;
          background: transparent;
          color: #C9A96E;
          min-width: 132px;
          justify-content: space-between;
        }
        .add-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, #C9A96E 0%, #d8b57a 60%, #e8cc97 100%);
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
          border-radius: 0;
          border: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 400;
          line-height: 1;
          transition: transform 0.35s ease;
        }
        .add-btn:hover {
          color: #120f0b;
          border-color: #e5c58c;
          transform: translateY(-1px);
        }
        .add-btn:hover::before {
          transform: translateX(0);
        }
        .add-btn:hover .add-btn-icon {
          transform: rotate(90deg);
        }

        .products-count {
          font-size: 12px; letter-spacing: 0.15em;
          color: #ab9578; text-transform: uppercase;
          margin-bottom: 24px;
        }
        .products-count span {
          color: #C9A96E;
        }

        .divider {
          width: 60px; height: 1px;
          background: linear-gradient(90deg, #C9A96E, transparent);
          margin-bottom: 48px;
        }

        .view-collection-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          margin-top: 64px;
          padding: 20px 32px;
          background: rgba(201, 169, 110, 0.08);
          border: 1px solid rgba(201, 169, 110, 0.32);
          text-decoration: none;
          transition: all 0.3s ease;
        }
        .view-collection-btn:hover {
          background: rgba(201, 169, 110, 0.16);
          border-color: rgba(201, 169, 110, 0.5);
        }
        .view-collection-text {
          font-family: 'Montserrat', sans-serif;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #C9A96E;
        }
        .view-collection-icon {
          color: #C9A96E;
          transition: transform 0.3s ease;
        }
        .view-collection-btn:hover .view-collection-icon {
          transform: translateX(8px);
        }

        @media (max-width: 640px) {
          .products-inner { padding: 48px 20px 80px; }
          .products-grid { grid-template-columns: 1fr; }
          .products-filter-btn { padding: 12px 16px 14px; font-size: 10px; }
          .view-collection-btn { padding: 16px 20px; }
          .view-collection-text { font-size: 11px; }
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
                  href={`/collection/${product.slug ?? ""}`}
                  className={`product-card ${shouldAutoPreview ? "auto-preview" : ""}`}
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  {product.badge && (
                    <div
                      className="badge"
                      style={{ color: "#C9A96E", borderColor: "#C9A96E55" }}
                    >
                      {product.badge}
                    </div>
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
                        className="quick-view-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          if (!product.slug) return;
                          window.location.href = `/collection/${product.slug}`;
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
                    <p className="card-sub">
                      {product.tagline ||
                        product.colors?.[0] ||
                        "Premium Quality"}
                    </p>
                    {/* <p className="card-desc">
                      {product.description?.slice(0, 100)}...
                    </p> */}

                    <div className="card-footer">
                      <div className="card-price-wrap">
                        <span className="card-price">
                          {formatPrice(
                            hasDiscount ? discountedPrice : product.price,
                          )}
                        </span>
                        {hasDiscount && (
                          <span className="card-price-compare">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                      <button
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
              <p className="text-[#b7a58b] text-lg">
                No products found in this category.
              </p>
              <button
                onClick={() => setActiveCategory("all")}
                className="mt-6 px-8 py-3 border border-[#C9A96E] text-[#C9A96E] text-sm uppercase tracking-wider hover:bg-[rgba(201,169,110,0.15)] transition-all"
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
