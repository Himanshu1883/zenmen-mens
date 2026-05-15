"use client";

import { useDisplayPrice } from "@/hooks/useDisplayPrice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addItem } from "@/store/slices/cartSlice";
import type { Product } from "@/types/product";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// ─── Static data ────────────────────────────────────────────────────────────

const COLORS = [
  { name: "Midnight Navy", cls: "bg-[#1a2a4a]" },
  { name: "Charcoal Noir", cls: "bg-[#2a2a2a]" },
  { name: "Deep Wine", cls: "bg-[#5c2030]" },
  { name: "Warm Sand", cls: "bg-[#c8b49a]" },
  { name: "Ivory", cls: "bg-[#e8e0d0]" },
];

const ACCORDION_ITEMS = [
  {
    id: "shipping",
    label: "Shipping & Delivery",
    content:
      "Express delivery in 2-4 business days. Standard delivery in 5-7 days. Free shipping on orders above Rs. 5,000.",
  },
  {
    id: "returns",
    label: "Returns & Exchanges",
    content:
      "Unworn items in original packaging may be returned within 30 days. Exchanges are available for size or color.",
  },
  {
    id: "bespoke",
    label: "Bespoke Services",
    content:
      "Custom alterations can be arranged through our atelier team for a refined personal fit.",
  },
];

// ─── Icons ───────────────────────────────────────────────────────────────────

function IconHeart({ filled }: { filled: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={filled ? "#7da8c7" : "none"}
      stroke={filled ? "#7da8c7" : "currentColor"}
      strokeWidth="1.5"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function IconBag() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

function IconWhatsApp() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12.032 3.024c-4.967 0-9 4.033-9 9 0 1.59.414 3.153 1.2 4.53L3 21.024l4.545-1.212a8.97 8.97 0 0 0 4.287 1.092c4.967 0 9-4.033 9-9s-4.033-9-9-9z"
        fill="currentColor"
      />
      <path
        d="M16.968 13.68c-.276-.144-1.632-.804-1.884-.9-.252-.096-.432-.144-.612.144-.18.288-.696.9-.852 1.08-.156.18-.312.204-.588.06-.804-.372-1.68-.828-2.352-1.488a8.973 8.973 0 0 1-1.62-2.052c-.144-.252-.012-.384.108-.504.108-.108.252-.288.384-.432.12-.144.168-.24.252-.408.084-.168.036-.312-.024-.432-.06-.12-.612-1.476-.84-2.028-.216-.528-.444-.456-.612-.468-.156-.012-.336-.012-.516-.012a.96.96 0 0 0-.696.324 2.94 2.94 0 0 0-.912 2.148c0 1.26.912 2.472 1.032 2.64.12.168 1.764 2.736 4.272 3.84.6.264 1.056.42 1.416.54.6.192 1.152.156 1.584.096.48-.072 1.476-.6 1.68-1.188.204-.588.204-1.092.144-1.2-.06-.096-.216-.156-.48-.3z"
        fill="white"
      />
    </svg>
  );
}

/** Official WhatsApp green mark for light buttons */
function IconWhatsAppGreen({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="#25D366"
      aria-hidden
    >
      <path d="M20.52 3.48A11.85 11.85 0 0 0 12.06 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.16 1.6 5.98L0 24l6.3-1.65a11.86 11.86 0 0 0 5.76 1.47h.01c6.56 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.17-3.45-8.44Zm-8.46 18.33h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.74.98 1-3.64-.24-.37a9.9 9.9 0 0 1-1.53-5.29c0-5.46 4.44-9.9 9.91-9.9 2.64 0 5.12 1.03 6.98 2.89a9.82 9.82 0 0 1 2.92 7.01c0 5.46-4.44 9.9-9.9 9.9Zm5.43-7.42c-.3-.15-1.78-.88-2.06-.98-.27-.1-.47-.15-.67.15-.2.3-.77.98-.95 1.18-.17.2-.35.23-.65.08-.3-.15-1.27-.47-2.42-1.49-.89-.79-1.5-1.76-1.68-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.67-1.62-.92-2.23-.24-.58-.48-.5-.67-.51l-.57-.01c-.2 0-.52.08-.8.38-.27.3-1.05 1.03-1.05 2.5 0 1.48 1.08 2.9 1.23 3.1.15.2 2.12 3.24 5.14 4.54.72.31 1.29.49 1.73.63.73.23 1.4.2 1.92.12.59-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.17-1.43-.08-.13-.28-.2-.58-.35Z" />
    </svg>
  );
}

function IconChevron() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function IconZoomIn() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
      <path d="M11 8v6M8 11h6" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill={filled ? "#7da8c7" : "none"}
      stroke={filled ? "none" : "#7da8c7"}
      strokeWidth="1.5"
    >
      <path d="M6 1l1.29 2.61 2.88.42-2.08 2.03.49 2.87L6 7.52l-2.58 1.41.49-2.87L1.83 4.03l2.88-.42z" />
    </svg>
  );
}

// ─── Accordion ───────────────────────────────────────────────────────────────

function AccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: (typeof ACCORDION_ITEMS)[0];
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-[#e2e8f0]">
      <button
        onClick={onToggle}
        className="group flex w-full items-center justify-between bg-transparent py-4 text-left"
      >
        <span className="font-['Jost'] text-[.7rem] uppercase tracking-[.2em] text-black transition-colors group-hover:text-[#7da8c7]">
          {item.label}
        </span>
        <span
          className={`text-[#7da8c7] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        >
          <IconChevron />
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-400"
        style={{
          maxHeight: isOpen ? "200px" : "0",
          paddingBottom: isOpen ? "1rem" : "0",
        }}
      >
        <p className="text-[.82rem] leading-[1.85] text-black">
          {item.content}
        </p>
      </div>
    </div>
  );
}

// ─── Image Zoom (desktop hover + mobile tap) ──────────────────────────────────

function ZoomableImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const rafRef = useRef<number | null>(null);
  const [tapZoomMode, setTapZoomMode] = useState(false);
  const touchStart = useRef<{ x: number; y: number; t: number } | null>(null);
  const touchMoved = useRef(false);

  const ZOOM_SCALE = 2;
  const TAP_MAX_MOVE_PX = 12;
  const TAP_MAX_MS = 350;

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setTapZoomMode(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    setZoomed(false);
    setOrigin({ x: 50, y: 50 });
  }, [src, tapZoomMode]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !tapZoomMode) return;

    const preventScrollWhilePanning = (e: TouchEvent) => {
      if (zoomed && e.touches.length === 1) e.preventDefault();
    };

    el.addEventListener("touchmove", preventScrollWhilePanning, {
      passive: false,
    });
    return () =>
      el.removeEventListener("touchmove", preventScrollWhilePanning);
  }, [zoomed, tapZoomMode]);

  const getRelativePos = useCallback((clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return { x: 50, y: 50 };
    const rect = el.getBoundingClientRect();
    const x = Math.min(
      100,
      Math.max(0, ((clientX - rect.left) / rect.width) * 100),
    );
    const y = Math.min(
      100,
      Math.max(0, ((clientY - rect.top) / rect.height) * 100),
    );
    return { x, y };
  }, []);

  // ── Desktop: zoom on hover, track cursor for pan ──────────────────────────

  const handleMouseEnter = () => {
    if (tapZoomMode) return;
    setZoomed(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (tapZoomMode || !zoomed) return;
    const { clientX, clientY } = e;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setOrigin(getRelativePos(clientX, clientY));
      rafRef.current = null;
    });
  };

  const handleMouseLeave = () => {
    if (tapZoomMode) return;
    setZoomed(false);
    setOrigin({ x: 50, y: 50 });
  };

  // ── Mobile: tap to toggle zoom; drag to pan when zoomed ───────────────────

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!tapZoomMode || e.touches.length !== 1) return;
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      t: Date.now(),
    };
    touchMoved.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!tapZoomMode || e.touches.length !== 1) return;

    if (touchStart.current && !zoomed) {
      const dx = e.touches[0].clientX - touchStart.current.x;
      const dy = e.touches[0].clientY - touchStart.current.y;
      if (Math.hypot(dx, dy) > TAP_MAX_MOVE_PX) touchMoved.current = true;
      return;
    }

    if (!zoomed) return;
    e.preventDefault();
    const touch = e.touches[0];
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setOrigin(getRelativePos(touch.clientX, touch.clientY));
      rafRef.current = null;
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!tapZoomMode || !touchStart.current) return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStart.current.x;
    const dy = touch.clientY - touchStart.current.y;
    const elapsed = Date.now() - touchStart.current.t;
    touchStart.current = null;

    const isTap =
      !touchMoved.current &&
      Math.hypot(dx, dy) < TAP_MAX_MOVE_PX &&
      elapsed < TAP_MAX_MS;

    if (!isTap) return;

    if (zoomed) {
      setZoomed(false);
      setOrigin({ x: 50, y: 50 });
    } else {
      setOrigin(getRelativePos(touch.clientX, touch.clientY));
      setZoomed(true);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className ?? ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        cursor: tapZoomMode
          ? zoomed
            ? "grab"
            : "zoom-in"
          : zoomed
            ? "zoom-out"
            : "zoom-in",
        touchAction: tapZoomMode && zoomed ? "none" : "pan-y",
      }}
    >
      <img
        src={src}
        alt={alt}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        draggable={false}
        className="block h-full w-full select-none object-cover object-[center_15%]"
        style={{
          transform: zoomed ? `scale(${ZOOM_SCALE})` : "scale(1)",
          transformOrigin: `${origin.x}% ${origin.y}%`,
          transition: zoomed ? "transform 0.12s ease-out" : "transform 0.2s ease",
          willChange: "transform",
        }}
      />

      {/* Zoom hint badge — only when not zoomed */}
      {!zoomed && (
        <div className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-1.5 rounded-sm border border-white/15 bg-[#0f172a]/70 px-2.5 py-1.5 text-[9px] tracking-[0.15em] uppercase text-[#e2e8f0] backdrop-blur-sm">
          <IconZoomIn />
          <span className="hidden sm:inline">Zoom</span>
        </div>
      )}

      {/* Close hint when zoomed on mobile */}
      {zoomed && (
        <div className="pointer-events-none absolute right-4 top-4 flex items-center gap-1.5 rounded-sm border border-white/15 bg-[#0f172a]/70 px-2.5 py-1.5 text-[9px] tracking-[0.15em] uppercase text-[#e2e8f0] backdrop-blur-sm sm:hidden">
          <IconClose />
          Tap to exit
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProductDetailClient({ product }: { product: Product }) {
  const dispatch = useAppDispatch();
  const { format: displayPrice } = useDisplayPrice();
  const allProducts = useAppSelector((s) => s.products.products);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] ?? "M");
  const [selectedColor, setSelectedColor] = useState(
    product.colors?.[0] ?? COLORS[0].name,
  );
  const [activeTab, setActiveTab] = useState<
    "desc" | "details" | "specs" | "care"
  >("desc");
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    setActiveImage(0);
    setSelectedSize(product.sizes?.[0] ?? "M");
    setSelectedColor(product.colors?.[0] ?? COLORS[0].name);
  }, [product._id]);

  const isColorAvailable = useMemo(
    () => !!product.colors?.includes(selectedColor),
    [product.colors, selectedColor],
  );

  const canAddToCart = useMemo(
    () => isColorAvailable || selectedColor === product.colors?.[0],
    [isColorAvailable, selectedColor, product.colors],
  );

  const rating = product.rating ?? 4.6;
  const reviewCount = product.numReviews ?? 42;
  const stars = Array.from({ length: 5 }, (_, i) => i < Math.floor(rating));

  const specs = [
    { label: "Category", value: product.category ?? "-" },
    { label: "Color", value: product.colors?.[0] ?? "-" },
    {
      label: "Fit",
      value: product.category === "Kurta" ? "Relaxed" : "Tailored",
    },
    { label: "Sizes", value: product.sizes?.join(", ") ?? "-" },
  ];

  const relatedProducts = useMemo(
    () =>
      allProducts
        .filter(
          (item) =>
            item._id !== product._id &&
            (item.category === product.category ||
              item.colors?.[0] === product.colors?.[0]),
        )
        .slice(0, 4),
    [allProducts, product._id, product.category, product.colors],
  );

  const mosaicData = useMemo(
    () => allProducts.filter((item) => item._id !== product._id).slice(0, 5),
    [allProducts, product._id],
  );

  const handleWhatsAppInquiry = () => {
    const msg = `Hi Zenmen, I'm interested in the "${product.title}" in ${selectedColor} color, size ${selectedSize}. Is this available?`;
    window.open(
      `https://wa.me/919650753273?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
  };

  const handleWhatsAppBestPrice = () => {
    const msg = `Hi ZENmen — I'd like your best price on "${product.title}" (${selectedColor}, size ${selectedSize}). Thank you.`;
    window.open(
      `https://wa.me/919650753273?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
  };

  function handleAddToCart() {
    dispatch(
      addItem({
        _id: product._id,
        title: product.title,
        slug: product.slug,
        price: product.price,
        image: product.images?.[0] ?? { url: "" },
        selectedColor: selectedColor || undefined,
        selectedSize: selectedSize || undefined,
        qty: 1,
      }),
    );
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  const currentImageSrc =
    product.images?.[activeImage]?.url ??
    product.images?.[0]?.url ??
    "/new.jpg";

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#f8fafc] pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))] font-['Jost'] font-light text-[#0f172a] md:pb-0">
      {/* Noise texture */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "256px",
        }}
      />

      {/* Breadcrumb */}
      <div className="relative z-10 mx-auto flex items-center gap-2 px-8 pb-0 pt-10 text-[.65rem] uppercase tracking-[.22em] text-black lg:px-16">
        <Link
          href="/"
          className="text-black no-underline transition-colors hover:text-[#7da8c7]"
        >
          Home
        </Link>
        <span className="opacity-40">/</span>
        <Link
          href="/collection"
          className="text-black no-underline transition-colors hover:text-[#7da8c7]"
        >
          Collection
        </Link>
        <span className="opacity-40">/</span>
        <span className="text-[#7da8c7]">{product.title}</span>
      </div>

      <div className="relative z-10 mx-auto grid max-w-[1440px] grid-cols-1 items-start gap-12 px-8 pb-20 pt-10 lg:gap-16 lg:px-16 xl:grid-cols-[1fr_420px]">
        {/* ── LEFT: sticky image gallery ── */}
        <div className="xl:sticky xl:top-[88px] xl:self-start">
          <div className="flex items-start gap-3">
            {/* Desktop thumbnails */}
            <div className="hidden xl:flex w-[86px] shrink-0 flex-col gap-3">
              {(product.images ?? []).map((img, i) => (
                <button
                  key={`thumb-${i}`}
                  onClick={() => setActiveImage(i)}
                  className={`overflow-hidden rounded-[3px] border-[1.5px] bg-transparent p-0 transition-all duration-200 ${
                    activeImage === i
                      ? "border-[#7da8c7]"
                      : "border-[#dbe4ef] hover:border-[#9fbdd5]"
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.alt ?? `Thumbnail ${i + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="block h-[96px] w-full object-cover object-[center_15%]"
                  />
                </button>
              ))}
            </div>

            {/* Main zoomable image */}
            <div className="relative min-w-0 flex-1 rounded-[4px] border border-[#dbe4ef] bg-[#f1f5f9] overflow-hidden">
              {/* Badge */}
              <div className="absolute left-6 top-6 z-20 rounded-[2px] border border-white/15 bg-[#0f172a]/70 px-4 py-1.5 text-[.6rem] uppercase tracking-[.28em] text-[#7da8c7] pointer-events-none backdrop-blur-sm">
                {product.badge ?? "Featured"}
              </div>

              <ZoomableImage
                src={currentImageSrc}
                alt={product.title}
                className="h-[520px] sm:h-[640px] w-full"
              />
            </div>
          </div>

          {/* Mobile thumbnails */}
          <div className="mt-3 grid grid-cols-4 gap-3 xl:hidden">
            {(product.images ?? []).map((img, i) => (
              <button
                key={`thumb-mobile-${i}`}
                onClick={() => setActiveImage(i)}
                className={`rounded-[3px] border-[1.5px] bg-transparent p-0 overflow-hidden transition-all duration-200 ${
                  activeImage === i
                    ? "border-[#7da8c7]"
                    : "border-[#dbe4ef] hover:border-[#9fbdd5]"
                }`}
              >
                <img
                  src={img.url}
                  alt={img.alt ?? `Thumbnail ${i + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="block h-[80px] w-full object-cover object-[center_15%]"
                />
              </button>
            ))}
          </div>

          {/* Zoom instruction hint */}
          <p className="mt-3 text-center text-[10px] tracking-[0.1em] uppercase text-[#94a3b8]">
            <span className="hidden md:inline">Hover</span>
            <span className="md:hidden">Tap</span> image to zoom
            <span className="hidden md:inline"> · move cursor to explore</span>
            <span className="md:hidden"> · drag to explore · tap again to exit</span>
          </p>
        </div>

        {/* ── RIGHT: scrollable details panel ── */}
        <aside className="xl:max-h-[calc(100vh-108px)] xl:overflow-y-auto xl:[scrollbar-width:none] xl:[&::-webkit-scrollbar]:hidden">
          <div className="rounded-[4px] border border-[#dbe4ef] bg-white p-8 sm:p-9">
            <p className="mb-2 text-[.6rem] uppercase tracking-[.35em] text-[#7da8c7]">
              {product.category} · Limited Edition
            </p>
            <h1 className="mb-3 font-['Cormorant_Garamond'] text-[3.5rem] font-light leading-[.95] text-[#0f172a]">
              {product.title}
            </h1>
            <p className="text-[.82rem] leading-[1.8] text-black">
              {product.tagline ??
                "Crafted for timeless style and everyday confidence."}
            </p>

            {/* Stars */}
            <div className="mt-4 flex items-center gap-3 border-t border-[#dbe4ef] pt-4">
              <div className="flex gap-0.5">
                {stars.map((filled, i) => (
                  <StarIcon key={i} filled={filled} />
                ))}
              </div>
              <span className="text-[.7rem] tracking-[.1em] text-black">
                {rating} · {reviewCount} reviews
              </span>
            </div>

            {/* Price */}
            {/* <div className="my-4 border-y border-[#dbe4ef] py-4">
              <p
                className="text-[2.5rem] font-normal leading-tight text-[#0f172a]"
                style={{ color: "#0f172a" }}
              >
                {displayPrice(product.price)}
              </p>
            </div> */}

            <p
              className="text-[2.5rem] font-normal leading-tight text-[#0f172a]"
              style={{ color: "#0f172a" }}
            >
              {displayPrice(product.price)}
            </p>

            {/* Color picker */}
            <div className="mb-5">
              <p className="mb-3 flex items-center justify-between text-[.62rem] uppercase tracking-[.22em] text-black">
                Color
                <span
                  className={`normal-case tracking-normal ${
                    !isColorAvailable && selectedColor !== COLORS[0].name
                      ? "text-[#7da8c7]"
                      : "text-[#94a3b8]"
                  }`}
                >
                  {selectedColor}
                  {!isColorAvailable && selectedColor !== COLORS[0].name && (
                    <span className="ml-2 text-[.55rem] text-[#7da8c7]">
                      (Custom Order)
                    </span>
                  )}
                </span>
              </p>

              <div className="flex gap-2.5">
                {COLORS.map((c) => (
                  <button
                    key={c.name}
                    title={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    className={`relative h-7 w-7 rounded-full border-0 transition-transform hover:scale-110 ${c.cls} ${
                      selectedColor === c.name
                        ? "ring-[1.5px] ring-[#7da8c7] ring-offset-2 ring-offset-white"
                        : ""
                    } ${
                      !product.colors?.includes(c.name) &&
                      c.name !== product.colors?.[0]
                        ? "opacity-60 ring-1 ring-[rgba(125,168,199,0.3)]"
                        : ""
                    }`}
                  >
                    {!product.colors?.includes(c.name) &&
                      c.name !== product.colors?.[0] && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="h-full w-[1.5px] rotate-45 bg-[rgba(125,168,199,0.5)]" />
                        </span>
                      )}
                  </button>
                ))}
              </div>

              <p className="mt-2 text-[.65rem] text-black">
                {!isColorAvailable && selectedColor !== product.colors?.[0]
                  ? "✨ This color is available on custom order. Contact us for details."
                  : product.colors?.includes(selectedColor)
                    ? "✓ In stock and ready to ship"
                    : "Select a color to check availability"}
              </p>
            </div>

            {/* Size picker */}
            <p className="mb-3 flex items-center justify-between text-[.62rem] uppercase tracking-[.22em] text-black">
              Size
              <span className="normal-case tracking-normal text-[#94a3b8]">
                {selectedSize}
              </span>
            </p>
            <div className="mb-5 flex flex-wrap gap-2">
              {(product.sizes ?? ["M"]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`h-11 min-w-[48px] cursor-pointer rounded-[3px] border px-3 font-['Jost'] text-[.78rem] tracking-[.08em] transition-all ${
                    selectedSize === s
                      ? "border-[#7da8c7] bg-[#f0f6fb] text-[#0f172a]"
                      : "border-[#e2e8f0] bg-transparent text-black hover:border-[#7da8c7] hover:text-[#0f172a]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* CTA row — desktop / tablet; mobile uses fixed bar below */}
            <div className="hidden flex-col gap-3 md:flex">
              {isColorAvailable || selectedColor === product.colors?.[0] ? (
                <button
                  onClick={handleAddToCart}
                  className={`flex h-[52px] items-center justify-center gap-2.5 rounded-[3px] border-0 font-['Jost'] text-[.72rem] font-medium uppercase tracking-[.25em] transition-all ${
                    addedToCart
                      ? "bg-[#3b82f6] text-white"
                      : "bg-[#7da8c7] text-white hover:bg-[#5a8faf]"
                  }`}
                >
                  <IconBag />
                  {addedToCart ? "Added to Cart" : "Add to Cart"}
                </button>
              ) : (
                <button
                  onClick={handleWhatsAppInquiry}
                  className="flex h-[52px] items-center justify-center gap-2.5 rounded-[3px] border-0 bg-[#25D366] font-['Jost'] text-[.72rem] font-medium uppercase tracking-[.25em] text-white transition-all hover:bg-[#20b859]"
                >
                  <IconWhatsApp />
                  Book Now
                </button>
              )}

              {isColorAvailable || selectedColor === product.colors?.[0] ? (
                <button className="h-[52px] rounded-[3px] border border-[#d6e1ec] bg-transparent font-['Jost'] text-[.72rem] uppercase tracking-[.25em] text-[#0f172a] transition-all hover:border-[#7da8c7] hover:bg-[#f0f6fb]">
                  Buy Now · Express Checkout
                </button>
              ) : (
                <button
                  onClick={handleWhatsAppInquiry}
                  className="flex h-[52px] items-center justify-center gap-2 rounded-[3px] border border-[#d6e1ec] bg-transparent font-['Jost'] text-[.72rem] uppercase tracking-[.25em] text-[#0f172a] transition-all hover:border-[#7da8c7] hover:text-[#7da8c7]"
                >
                  <IconWhatsApp />
                  Inquire on WhatsApp
                </button>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={() => setWishlisted((w) => !w)}
              className="mt-3 flex w-full items-center justify-center gap-2 border-0 bg-transparent opacity-60 transition-opacity hover:opacity-100"
            >
              <IconHeart filled={wishlisted} />
              <span className="font-['Jost'] text-[.65rem] uppercase tracking-[.2em] text-black">
                {wishlisted ? "Saved to Wishlist" : "Add to Wishlist"}
              </span>
            </button>

            {/* Accordion */}
            <div className="mt-6 border-t border-[#e2e8f0]">
              {ACCORDION_ITEMS.map((item) => (
                <AccordionItem
                  key={item.id}
                  item={item}
                  isOpen={openAccordion === item.id}
                  onToggle={() =>
                    setOpenAccordion(openAccordion === item.id ? null : item.id)
                  }
                />
              ))}

              {/* Tabs */}
              <div className="mt-10 overflow-hidden rounded-[4px] border border-[#e2e8f0] bg-[#f8fafc] px-4">
                <div className="flex gap-1 border-b border-[#e2e8f0]">
                  {(["desc", "details", "specs", "care"] as const).map(
                    (tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 border-0 bg-transparent py-4 font-['Jost'] text-[.65rem] uppercase tracking-[.2em] transition-all ${
                          activeTab === tab
                            ? "-mb-px border-b-[1.5px] border-[#7da8c7] bg-[#f0f6fb] text-[#7da8c7]"
                            : "text-black hover:text-[#0f172a]"
                        }`}
                      >
                        {tab === "desc"
                          ? "Description"
                          : tab === "details"
                            ? "Details"
                            : tab === "specs"
                              ? "Specs"
                              : "Care"}
                      </button>
                    ),
                  )}
                </div>

                <div className="p-8">
                  {activeTab === "desc" && (
                    <p className="text-[.88rem] leading-[1.9] text-black">
                      {product.description}
                    </p>
                  )}
                  {activeTab === "details" && (
                    <ul className="grid list-none grid-cols-1 gap-3 sm:grid-cols-2">
                      {(product.details ?? []).map((d, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2.5 text-[.82rem] text-black"
                        >
                          <span className="mt-[7px] h-1 w-1 flex-shrink-0 rounded-full bg-[#7da8c7]" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  )}
                  {activeTab === "specs" && (
                    <div className="grid grid-cols-2">
                      {specs.map((s) => (
                        <div key={s.label} className="contents">
                          <span className="border-b border-[#e2e8f0] py-3 text-[.72rem] uppercase tracking-[.15em] text-black">
                            {s.label}
                          </span>
                          <span className="border-b border-[#e2e8f0] py-3 text-right text-[.82rem] text-black">
                            {s.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {activeTab === "care" && (
                    <p className="text-[.88rem] leading-[1.9] text-black">
                      {product.care ??
                        "Dry clean only. Steam preferred. Store on a shaped hanger away from direct sunlight."}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ── You May Also Desire ── */}
      {relatedProducts.length > 0 && (
        <section className="relative z-10 mx-auto px-8 py-14 lg:px-16">
          <div className="mb-8 flex items-baseline justify-between">
            <h2 className="font-['Cormorant_Garamond'] text-[2.2rem] font-light text-[#0f172a]">
              You May Also Desire
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((item) => (
              <Link
                key={item._id}
                href={`/collection/${item.slug}`}
                className="group block overflow-hidden rounded-[3px] border border-[#e2e8f0] bg-white text-inherit no-underline transition-all duration-300 hover:-translate-y-1 hover:border-[#7da8c7] hover:shadow-[0_8px_32px_rgba(125,168,199,0.15)]"
              >
                <div className="overflow-hidden h-[280px]">
                  <img
                    src={item.images?.[0]?.url ?? "/new.jpg"}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="block h-full w-full object-cover object-[center_10%]"
                  />
                </div>
                <div className="p-4">
                  <p className="mb-0.5 font-['Cormorant_Garamond'] text-[1.5rem] font-light text-[#0f172a]">
                    {item.title}
                  </p>
                  <p className="text-[.6rem] uppercase tracking-[.18em] text-black">
                    {item.category} · {item.colors?.[0] ?? "-"}
                  </p>
                  <p className="mt-2 text-[1.25rem] text-black">
                    {displayPrice(item.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── More from the Collection (mosaic) ── */}
      {mosaicData.length > 0 && (
        <section className="relative z-10 mx-auto px-8 py-14 lg:px-16">
          <div className="mb-8 flex items-baseline justify-between">
            <h2 className="font-['Cormorant_Garamond'] text-[2.2rem] font-light text-[#0f172a]">
              More from the Collection
            </h2>
          </div>
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: "repeat(4, 1fr)",
              gridTemplateRows: "200px 200px",
            }}
          >
            {mosaicData.map((item, i) => (
              <Link
                key={`${item._id}-mosaic`}
                href={`/collection/${item.slug}`}
                className="group relative cursor-pointer overflow-hidden rounded-[3px] border border-[#e2e8f0] no-underline"
                style={i === 0 ? { gridColumn: "1 / 3", gridRow: "1 / 3" } : {}}
              >
                <img
                  src={item.images?.[0]?.url ?? "/new.jpg"}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover object-[center_10%]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(15,23,42,0.6)] via-[rgba(15,23,42,0.08)] to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                  <span
                    className={`block font-['Cormorant_Garamond'] font-light text-white ${
                      i === 0 ? "text-[2.2rem]" : "text-[1.6rem]"
                    }`}
                  >
                    {item.title}
                  </span>
                  <span className="mt-0.5 block text-[.75rem] text-[#7da8c7]">
                    {displayPrice(item.price)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Mobile: dual CTAs — global MobileBottomNav is hidden on /collection/[slug] */}
      <div
        className="fixed inset-x-0 bottom-0 z-[100] border-t border-[#e2e8f0] bg-[#f8fafc]/95 px-3 pt-2.5 pb-[calc(0.65rem+env(safe-area-inset-bottom,0px))] backdrop-blur-md md:hidden"
        role="region"
        aria-label="Product actions"
      >
        <div className="mx-auto grid max-w-lg grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleWhatsAppBestPrice}
            className="flex h-[52px] min-h-[52px] items-center justify-center gap-2 rounded-sm border border-[#0f172a] bg-white px-1.5 font-['Jost'] text-[8.5px] font-semibold uppercase leading-[1.15] tracking-[0.12em] text-[#0f172a] shadow-[0_1px_0_rgba(255,255,255,1)_inset,0_4px_14px_-6px_rgba(15,23,42,0.14)] transition-opacity active:opacity-90 [-webkit-tap-highlight-color:transparent]"
          >
            <IconWhatsAppGreen className="h-[17px] w-[17px] shrink-0" />
            <span className="max-[360px]:text-[8px]">Chat for best price</span>
          </button>
          <button
            type="button"
            onClick={canAddToCart ? handleAddToCart : handleWhatsAppInquiry}
            className="flex h-[52px] min-h-[52px] items-center justify-center rounded-sm border border-black bg-[#0f172a] px-1.5 font-['Jost'] text-[9.5px] font-bold uppercase tracking-[0.16em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16),inset_1px_0_0_rgba(255,255,255,0.06),0_8px_22px_-8px_rgba(0,0,0,0.42)] transition-opacity active:opacity-90 [-webkit-tap-highlight-color:transparent]"
          >
            {addedToCart ? "Added" : canAddToCart ? "Add to cart" : "Book now"}
          </button>
        </div>
      </div>
    </main>
  );
}
