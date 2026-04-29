"use client";
import { useState } from "react";

const products: Product[] = [
  {
    id: "midnight-charcoal",
    name: "Midnight Charcoal Suit",
    material: "Italian Wool · Slim Fit",
    price: 32000,
    category: "suit",
    badge: "New",
    accent: "#C9A96E",
    bg: "linear-gradient(145deg,#0e0e0c 0%,#1a1a15 60%,#222018 100%)",
    description:
      "Full canvas construction with hand-stitched lapels in premium Italian wool.",
  },
  {
    id: "oxford-white",
    name: "Oxford White Formal",
    material: "Egyptian Cotton · Regular Fit",
    price: 3200,
    category: "shirt",
    accent: "#a8b8c8",
    bg: "linear-gradient(145deg,#0d0d0f 0%,#16161a 60%,#1c1c20 100%)",
    description:
      "Woven from 100% Egyptian cotton with a spread collar and mother-of-pearl buttons.",
  },
  {
    id: "slim-wool-trouser",
    name: "Slim Fit Wool Trousers",
    material: "Super 120s Wool · Slim",
    price: 7500,
    category: "trouser",
    badge: "Bestseller",
    accent: "#b8a090",
    bg: "linear-gradient(145deg,#0f0e0d 0%,#181614 60%,#1e1c1a 100%)",
    description:
      "Crafted from Super 120s wool with a half-canvas waistband and hand-finished hems.",
  },
  {
    id: "sand-linen",
    name: "Sand Linen Three-Piece",
    material: "Irish Linen · Classic Fit",
    price: 28500,
    category: "suit",
    accent: "#d4c4a0",
    bg: "linear-gradient(145deg,#0e0e0c 0%,#181710 60%,#201e14 100%)",
    description:
      "A distinguished three-piece in lightweight Irish linen for summer occasions.",
  },
  {
    id: "royal-blue",
    name: "Royal Blue Herringbone",
    material: "Premium Cotton Blend · Slim",
    price: 4800,
    category: "shirt",
    badge: "Limited",
    accent: "#7090c8",
    bg: "linear-gradient(145deg,#0c0c10 0%,#141418 60%,#1a1820 100%)",
    description:
      "A subtle herringbone weave in deep royal blue with contrast stitching.",
  },
  {
    id: "navy-trouser",
    name: "Navy Formal Trousers",
    material: "Worsted Wool · Regular Fit",
    price: 6200,
    category: "trouser",
    accent: "#8898b0",
    bg: "linear-gradient(145deg,#0c0e10 0%,#14161a 60%,#1a1c1e 100%)",
    description:
      "Versatile navy worsted wool trousers — a true wardrobe cornerstone.",
  },
  {
    id: "double-breasted",
    name: "Double Breasted Classic",
    material: "British Tweed · Classic Fit",
    price: 38000,
    category: "suit",
    accent: "#C9A96E",
    bg: "linear-gradient(145deg,#0e0c10 0%,#181420 60%,#1e1a24 100%)",
    description:
      "A bold double-breasted silhouette in heritage British tweed with peak lapels.",
  },
  {
    id: "mandarin-linen",
    name: "Mandarin Collar Linen",
    material: "100% Linen · Relaxed Fit",
    price: 2900,
    category: "shirt",
    accent: "#c8b890",
    bg: "linear-gradient(145deg,#0e0e0c 0%,#181814 60%,#1c1c18 100%)",
    description:
      "A modern mandarin collar in breathable 100% linen, perfect for warm occasions.",
  },
];

const categories = ["all", "suit", "shirt", "trouser"];

const icons = {
  suit: (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    >
      <path d="M8 2L6 6l-2 2v14h16V8l-2-2-2-4" />
      <path d="M8 2l4 4 4-4" />
      <path d="M12 6v16" />
    </svg>
  ),
  shirt: (
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
  ),
  trouser: (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    >
      <path d="M4 2h16v8l-4 12H4V2z" />
      <path d="M20 10l-4 12h-4V2" />
    </svg>
  ),
};

const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

type SilhouetteProps = {
  category: string;
  accent: string;
};

function SilhouetteSVG({ category, accent }: SilhouetteProps) {
  if (category === "suit")
    return (
      <svg
        viewBox="0 0 160 220"
        width="100%"
        height="100%"
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient id={`sg-${accent}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.18" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <ellipse
          cx="80"
          cy="38"
          rx="22"
          ry="26"
          fill={`url(#sg-${accent})`}
          stroke={accent}
          strokeWidth="0.6"
          strokeOpacity="0.5"
        />
        <path
          d="M40 70 Q58 55 80 64 Q102 55 120 70 L130 170 H30 Z"
          fill={`url(#sg-${accent})`}
          stroke={accent}
          strokeWidth="0.6"
          strokeOpacity="0.4"
        />
        <path
          d="M80 64 L74 120"
          stroke={accent}
          strokeWidth="0.8"
          strokeOpacity="0.5"
        />
        <path
          d="M80 64 L86 120"
          stroke={accent}
          strokeWidth="0.8"
          strokeOpacity="0.5"
        />
        <path
          d="M58 70 L38 140"
          stroke={accent}
          strokeWidth="0.5"
          strokeOpacity="0.3"
          strokeDasharray="2 3"
        />
        <path
          d="M102 70 L122 140"
          stroke={accent}
          strokeWidth="0.5"
          strokeOpacity="0.3"
          strokeDasharray="2 3"
        />
        <path
          d="M60 130 Q80 123 100 130"
          stroke={accent}
          strokeWidth="0.6"
          strokeOpacity="0.35"
          fill="none"
        />
        <circle cx="80" cy="90" r="1.5" fill={accent} fillOpacity="0.6" />
        <circle cx="80" cy="100" r="1.5" fill={accent} fillOpacity="0.6" />
        <circle cx="80" cy="110" r="1.5" fill={accent} fillOpacity="0.6" />
      </svg>
    );
  if (category === "shirt")
    return (
      <svg
        viewBox="0 0 160 220"
        width="100%"
        height="100%"
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient id={`sg2-${accent}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.18" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <ellipse
          cx="80"
          cy="40"
          rx="18"
          ry="22"
          fill={`url(#sg2-${accent})`}
          stroke={accent}
          strokeWidth="0.6"
          strokeOpacity="0.5"
        />
        <path
          d="M45 72 L35 110 L50 115 L50 175 L110 175 L110 115 L125 110 L115 72 Q96 60 80 66 Q64 60 45 72Z"
          fill={`url(#sg2-${accent})`}
          stroke={accent}
          strokeWidth="0.6"
          strokeOpacity="0.4"
        />
        <path
          d="M80 66 L80 175"
          stroke={accent}
          strokeWidth="0.8"
          strokeOpacity="0.35"
          strokeDasharray="2 3"
        />
        <path
          d="M68 75 L68 90 Q74 88 80 90 Q86 88 92 90 L92 75"
          stroke={accent}
          strokeWidth="0.7"
          strokeOpacity="0.5"
          fill="none"
        />
        <circle cx="80" cy="110" r="1.5" fill={accent} fillOpacity="0.6" />
        <circle cx="80" cy="122" r="1.5" fill={accent} fillOpacity="0.6" />
        <circle cx="80" cy="134" r="1.5" fill={accent} fillOpacity="0.6" />
      </svg>
    );
  return (
    <svg
      viewBox="0 0 160 220"
      width="100%"
      height="100%"
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id={`sg3-${accent}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.18" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.04" />
        </linearGradient>
      </defs>
      <path
        d="M50 40 L110 40 L118 130 L92 130 L92 200 L68 200 L68 130 L42 130 Z"
        fill={`url(#sg3-${accent})`}
        stroke={accent}
        strokeWidth="0.6"
        strokeOpacity="0.45"
      />
      <path
        d="M50 40 L68 130"
        stroke={accent}
        strokeWidth="0.5"
        strokeOpacity="0.3"
      />
      <path
        d="M110 40 L92 130"
        stroke={accent}
        strokeWidth="0.5"
        strokeOpacity="0.3"
      />
      <path
        d="M80 40 L80 200"
        stroke={accent}
        strokeWidth="0.8"
        strokeOpacity="0.35"
        strokeDasharray="2 3"
      />
      <path
        d="M45 80 L115 80"
        stroke={accent}
        strokeWidth="0.5"
        strokeOpacity="0.25"
      />
    </svg>
  );
}

type Product = {
  id: string;
  name: string;
  material: string;
  price: number;
  category: "suit" | "shirt" | "trouser";
  badge?: string;
  accent: string;
  bg: string;
  description: string;
};

type ProductCardProps = {
  product: Product;
  index: number;
};

function ProductCard({ product, index }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div
      className={`product-card${hovered ? " hovered" : ""}`}
      style={{ animationDelay: `${index * 80}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {product.badge && (
        <div
          className="badge"
          style={{ color: product.accent, borderColor: product.accent + "55" }}
        >
          {product.badge}
        </div>
      )}

      <div className="card-img" style={{ background: product.bg }}>
        <div className="card-silhouette">
          <SilhouetteSVG category={product.category} accent={product.accent} />
        </div>
        <div
          className="card-shimmer"
          style={{
            background: `linear-gradient(135deg, transparent 40%, ${product.accent}08 100%)`,
          }}
        />
        <div className={`card-overlay${hovered ? " visible" : ""}`}>
          <button
            className="quick-view-btn"
            style={{
              color: product.accent,
              borderColor: product.accent + "80",
            }}
          >
            Quick View
          </button>
        </div>
      </div>

      <div className="card-body">
        <div className="card-cat" style={{ color: product.accent + "bb" }}>
          {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
        </div>
        <h3 className="card-name">{product.name}</h3>
        <p className="card-material">{product.material}</p>
        <p className="card-desc">{product.description}</p>

        <div className="card-footer">
          <span className="card-price">{formatPrice(product.price)}</span>
          <button
            className={`add-btn${added ? " added" : ""}`}
            style={{
              background: added ? product.accent : "transparent",
              borderColor: product.accent,
              color: added ? "#0a0a08" : product.accent,
            }}
            onClick={handleAdd}
          >
            {added ? "Added ✓" : "Add to Bag"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const [active, setActive] = useState("all");

  const filtered =
    active === "all" ? products : products.filter((p) => p.category === active);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Montserrat:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .products-root {
          font-family: 'Montserrat', sans-serif;
          background: #050A18;
          min-height: 100vh;
          color: #e8e4d8;
          overflow-x: hidden;
        }

        .grain-overlay {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: 0.45;
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
          color: #f0ece0; letter-spacing: -0.01em;
          margin-bottom: 12px;
        }
        .section-title em {
          font-style: italic; color: #C9A96E;
        }

        .section-sub {
          font-size: 15px; font-weight: 300;
          color: white; max-width: 480px;
          line-height: 1.8; margin-bottom: 64px;
          letter-spacing: 0.02em;
        }

        .products-filter-bar {
          display: flex; gap: 4px;
          margin-bottom: 56px;
          border-bottom: 1px solid #ffffff0f;
          padding-bottom: 0;
        }
        .products-filter-btn {
          font-family: 'Montserrat', sans-serif;
          font-size: 12px; font-weight: 500;
          letter-spacing: 0.2em; text-transform: uppercase;
          padding: 14px 28px 16px; border: none; cursor: pointer;
          background: transparent; color: #665a4a;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px; transition: all 0.3s ease;
          display: flex; align-items: center; gap: 8px;
        }
        .products-filter-btn:hover { color: #c4b898; }
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
          background: #0f0e0c;
          border: 1px solid #ffffff0a;
          border-radius: 2px;
          overflow: hidden; cursor: pointer;
          transition: border-color 0.4s ease, transform 0.4s ease;
          animation: cardIn 0.5s both;
          position: relative;
        }
        .product-card.hovered {
          border-color: #ffffff18;
          transform: translateY(-4px);
        }

        .badge {
          position: absolute; top: 20px; left: 20px; z-index: 10;
          font-family: 'Montserrat', sans-serif;
          font-size: 9px; font-weight: 600;
          letter-spacing: 0.25em; text-transform: uppercase;
          padding: 5px 12px; border: 1px solid;
          border-radius: 0;
        }

        .card-img {
          position: relative; height: 340px; overflow: hidden;
        }
        .card-silhouette {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          padding: 32px 48px;
        }
        .card-shimmer {
          position: absolute; inset: 0; pointer-events: none;
        }
        .card-overlay {
          position: absolute; inset: 0;
          display: flex; align-items: flex-end; justify-content: center;
          padding-bottom: 28px;
          background: linear-gradient(0deg, rgba(0,0,0,0.55) 0%, transparent 50%);
          opacity: 0; transition: opacity 0.35s ease;
        }
        .card-overlay.visible { opacity: 1; }

        .quick-view-btn {
          font-family: 'Montserrat', sans-serif;
          font-size: 10px; font-weight: 500;
          letter-spacing: 0.25em; text-transform: uppercase;
          padding: 10px 24px; border: 1px solid;
          background: rgba(0,0,0,0.6); cursor: pointer;
          border-radius: 0;
          transition: background 0.2s ease;
        }
        .quick-view-btn:hover { background: rgba(0,0,0,0.9); }

        .card-body {
          padding: 28px 28px 24px;
          border-top: 1px solid #ffffff0a;
        }

        .card-cat {
          font-size: 10px; font-weight: 500;
          letter-spacing: 0.3em; text-transform: uppercase;
          margin-bottom: 10px;
        }

        .card-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px; font-weight: 400;
          color: #f0ece0; line-height: 1.15;
          margin-bottom: 8px;
        }

        .card-material {
          font-size: 11px; font-weight: 400;
          letter-spacing: 0.12em; color: #C9A96E;
          margin-bottom: 14px; text-transform: uppercase;
        }

        .card-desc {
          font-size: 13px; font-weight: 300;
          line-height: 1.75; color: white/50;
          margin-bottom: 24px;
        }

        .card-footer {
          display: flex; align-items: center; justify-content: space-between;
          border-top: 1px solid #ffffff08; padding-top: 20px;
        }

        .card-price {
          font-family: 'Cormorant Garamond', serif;
          font-size: 24px; font-weight: 400;
          color: #d4c8a8;
          letter-spacing: 0.02em;
        }

        .add-btn {
          font-family: 'Montserrat', sans-serif;
          font-size: 10px; font-weight: 500;
          letter-spacing: 0.2em; text-transform: uppercase;
          padding: 10px 20px; border: 1px solid;
          cursor: pointer; border-radius: 0;
          transition: all 0.3s ease;
        }
        .add-btn:hover { opacity: 0.85; }

        .products-count {
          font-size: 12px; letter-spacing: 0.15em;
          color: white; text-transform: uppercase;
          margin-bottom: 24px;
        }

        .divider {
          width: 60px; height: 1px;
          background: linear-gradient(90deg, #C9A96E, transparent);
          margin-bottom: 48px;
        }

        @media (max-width: 640px) {
          .products-inner { padding: 48px 20px 80px; }
          .products-grid { grid-template-columns: 1fr; }
          .products-filter-btn { padding: 12px 16px 14px; font-size: 11px; }
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
                  className={`products-filter-btn ${active === cat ? "active" : ""}`}
                  onClick={() => setActive(cat)}
                >
                  {cat === "all"
                    ? "All Pieces"
                    : cat.charAt(0).toUpperCase() + cat.slice(1) + "s"}
                  <span className="products-filter-count">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="products-count">
            Showing {filtered.length} of {products.length} pieces
          </div>

          <div className="products-grid">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
