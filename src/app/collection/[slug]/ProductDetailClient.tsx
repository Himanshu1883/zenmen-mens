// src/app/collection/[slug]/ProductDetailClient.tsx
"use client";

import { addItem } from "@/store/slices/cartSlice";
import { useAppDispatch } from "@/store/hooks";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types/product";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/store/hooks";

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

function IconSearch() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function IconHeart({ filled }: { filled: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={filled ? "#c8a96e" : "none"}
      stroke={filled ? "#c8a96e" : "currentColor"}
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
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
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

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill={filled ? "#c8a96e" : "none"}
      stroke={filled ? "none" : "#8a7352"}
      strokeWidth="1.5"
    >
      <path d="M6 1l1.29 2.61 2.88.42-2.08 2.03.49 2.87L6 7.52l-2.58 1.41.49-2.87L1.83 4.03l2.88-.42z" />
    </svg>
  );
}

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
    <div className="border-b border-[rgba(200,169,110,0.18)]">
      <button
        onClick={onToggle}
        className="group flex w-full items-center justify-between bg-transparent py-4 text-left"
      >
        <span className="font-['Jost'] text-[.7rem] uppercase tracking-[.2em] text-[#c6bda8] transition-colors group-hover:text-[#c8a96e]">
          {item.label}
        </span>
        <span
          className={`text-[#c8a96e] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
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
        <p className="text-[.82rem] leading-[1.85] text-[#9e9585]">
          {item.content}
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
// CHANGED: receives `product` directly instead of `productId` string.
// The server page fetches the product by slug and passes it here.
export default function ProductDetailClient({ product }: { product: Product }) {
  const dispatch = useAppDispatch();

  // Pull all products from Redux for related / mosaic sections
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

  // Reset selections if product changes
  useEffect(() => {
    setActiveImage(0);
    setSelectedSize(product.sizes?.[0] ?? "M");
    setSelectedColor(product.colors?.[0] ?? COLORS[0].name);
  }, [product._id]);

  const isColorAvailable = useMemo(() => {
    if (!product.colors) return false;
    return product.colors.includes(selectedColor);
  }, [product.colors, selectedColor]);

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

  const relatedProducts = useMemo(() => {
    return allProducts
      .filter(
        (item) =>
          item._id !== product._id &&
          (item.category === product.category ||
            item.colors?.[0] === product.colors?.[0]),
      )
      .slice(0, 4);
  }, [allProducts, product._id, product.category, product.colors]);

  const mosaicData = useMemo(() => {
    return allProducts.filter((item) => item._id !== product._id).slice(0, 5);
  }, [allProducts, product._id]);

  const handleWhatsAppInquiry = () => {
    const phoneNumber = "919650753273";
    const message = `Hi Zenmen, I'm interested in the "${product.title}" in ${selectedColor} color, size ${selectedSize}. Is this available?`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  // CHANGED: now actually dispatches to Redux cart
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

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#050A18] font-['Jost'] font-light text-[#F3EEE4]">
      {/* Noise texture */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "256px",
        }}
      />

      {/* Breadcrumb */}
      <div className="relative z-10 mx-auto flex items-center gap-2 px-8 pb-0 pt-[100px] text-[.65rem] uppercase tracking-[.22em] text-[#9e9585] lg:px-16">
        <Link
          href="/"
          className="text-[#9e9585] no-underline transition-colors hover:text-[#c8a96e]"
        >
          Home
        </Link>
        <span className="opacity-40">/</span>
        <Link
          href="/collection"
          className="text-[#9e9585] no-underline transition-colors hover:text-[#c8a96e]"
        >
          Collection
        </Link>
        <span className="opacity-40">/</span>
        <span className="text-[#c8a96e]">{product.title}</span>
      </div>

      <div className="relative z-10 mx-auto grid max-w-[1440px] grid-cols-1 items-start gap-12 px-8 pb-20 pt-10 lg:gap-16 lg:px-16 xl:grid-cols-[1fr_420px]">
        {/* ── LEFT: sticky image gallery ── */}
        <div className="xl:sticky xl:top-[88px] xl:self-start">
          <div className="relative overflow-hidden rounded-[4px] border border-[rgba(200,169,110,0.18)] bg-[#0d1527]">
            <div className="absolute left-6 top-6 z-10 rounded-[2px] border border-[rgba(200,169,110,0.18)] bg-[rgba(5,10,24,0.75)] px-4 py-1.5 text-[.6rem] uppercase tracking-[.28em] text-[#c8a96e] backdrop-blur-xl">
              {product.badge ?? "Featured"}
            </div>
            <img
              src={
                product.images?.[activeImage]?.url ??
                product.images?.[0]?.url ??
                "/new.jpg"
              }
              alt={product.title}
              className="h-[520px] w-full object-cover object-[center_15%] transition-all duration-700 hover:scale-[1.03] sm:h-[640px]"
            />
          </div>

          {/* Thumbnails */}
          <div className="mt-3 grid grid-cols-4 gap-3">
            {(product.images ?? []).map((img, i) => (
              <button
                key={`${product._id}-thumb-${i}`}
                onClick={() => setActiveImage(i)}
                className={`rounded-[3px] border-[1.5px] bg-transparent p-0 transition-all duration-200 ${
                  activeImage === i
                    ? "border-[#c8a96e]"
                    : "border-transparent hover:border-[rgba(200,169,110,0.4)]"
                }`}
              >
                <img
                  src={img.url}
                  alt={img.alt ?? `Thumbnail ${i + 1}`}
                  className="block h-[150px] w-full object-cover object-[center_15%]"
                />
              </button>
            ))}
          </div>
        </div>

        {/* ── RIGHT: scrollable details panel ── */}
        <aside className="xl:max-h-[calc(100vh-108px)] xl:overflow-y-auto xl:[scrollbar-width:none] xl:[&::-webkit-scrollbar]:hidden">
          <div className="rounded-[4px] border border-[rgba(200,169,110,0.18)] bg-[#0d1527] p-8 sm:p-9">
            <p className="mb-2 text-[.6rem] uppercase tracking-[.35em] text-[#c8a96e]">
              {product.category} · Limited Edition
            </p>
            <h1 className="mb-3 font-['Cormorant_Garamond'] text-[3.5rem] font-light leading-[.95] text-[#f8f4ec]">
              {product.title}
            </h1>
            <p className="text-[.82rem] leading-[1.8] text-[#9e9585]">
              {product.tagline ??
                "Crafted for timeless style and everyday confidence."}
            </p>

            {/* Stars */}
            <div className="mt-4 flex items-center gap-3 border-t border-[rgba(200,169,110,0.18)] pt-4">
              <div className="flex gap-0.5">
                {stars.map((filled, i) => (
                  <StarIcon key={i} filled={filled} />
                ))}
              </div>
              <span className="text-[.7rem] tracking-[.1em] text-[#9e9585]">
                {rating} · {reviewCount} reviews
              </span>
            </div>

            {/* Price */}
            <div className="my-7 border-y border-[rgba(200,169,110,0.18)] py-6">
              <p className="text-[3rem] font-light leading-none text-[#e8d4a8]">
                {formatPrice(product.price)}
              </p>
            </div>

            {/* Color picker */}
            <div className="mb-5">
              <p className="mb-3 flex items-center justify-between text-[.62rem] uppercase tracking-[.22em] text-[#9e9585]">
                Color
                <span
                  className={`normal-case tracking-normal ${
                    !isColorAvailable && selectedColor !== COLORS[0].name
                      ? "text-[#c8a96e]"
                      : "text-[#c6bda8]"
                  }`}
                >
                  {selectedColor}
                  {!isColorAvailable && selectedColor !== COLORS[0].name && (
                    <span className="ml-2 text-[.55rem] text-[#c8a96e]">
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
                        ? "ring-[1.5px] ring-[#c8a96e] ring-offset-2 ring-offset-[#0d1527]"
                        : ""
                    } ${
                      !product.colors?.includes(c.name) &&
                      c.name !== product.colors?.[0]
                        ? "opacity-60 ring-1 ring-[rgba(200,169,110,0.3)]"
                        : ""
                    }`}
                  >
                    {!product.colors?.includes(c.name) &&
                      c.name !== product.colors?.[0] && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="h-full w-[1.5px] rotate-45 bg-[rgba(200,169,110,0.5)]" />
                        </span>
                      )}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[.65rem] text-white">
                {!isColorAvailable && selectedColor !== product.colors?.[0]
                  ? "✨ This color is available on custom order. Contact us for details."
                  : product.colors?.includes(selectedColor)
                    ? "✓ In stock and ready to ship"
                    : "Select a color to check availability"}
              </p>
            </div>

            {/* Size picker */}
            <p className="mb-3 flex items-center justify-between text-[.62rem] uppercase tracking-[.22em] text-[#9e9585]">
              Size
              <span className="normal-case tracking-normal text-[#c6bda8]">
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
                      ? "border-[#c8a96e] bg-[rgba(200,169,110,0.12)] text-[#f7e5c3]"
                      : "border-[rgba(200,169,110,0.28)] bg-transparent text-[#c6bda8] hover:border-[rgba(200,169,110,0.65)] hover:text-[#f8f4ec]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3">
              {isColorAvailable || selectedColor === product.colors?.[0] ? (
                <button
                  onClick={handleAddToCart}
                  className={`flex h-[52px] items-center justify-center gap-2.5 rounded-[3px] border-0 font-['Jost'] text-[.72rem] font-medium uppercase tracking-[.25em] transition-all ${
                    addedToCart
                      ? "bg-[#4a7c59] text-white"
                      : "bg-[#c8a96e] text-[#050A18] hover:bg-[#e8d4a8]"
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
                <button className="h-[52px] rounded-[3px] border border-[rgba(200,169,110,0.38)] bg-transparent font-['Jost'] text-[.72rem] uppercase tracking-[.25em] text-[#e8dcc6] transition-all hover:border-[rgba(200,169,110,0.7)] hover:bg-[rgba(200,169,110,0.07)]">
                  Buy Now · Express Checkout
                </button>
              ) : (
                <button
                  onClick={handleWhatsAppInquiry}
                  className="flex h-[52px] items-center justify-center gap-2 rounded-[3px] border border-[rgba(200,169,110,0.38)] bg-transparent font-['Jost'] text-[.72rem] uppercase tracking-[.25em] text-[#e8dcc6] transition-all hover:border-[#25D366] hover:text-[#25D366]"
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
              <span className="font-['Jost'] text-[.65rem] uppercase tracking-[.2em] text-[#9e9585]">
                {wishlisted ? "Saved to Wishlist" : "Add to Wishlist"}
              </span>
            </button>

            {/* Accordion + Tabs */}
            <div className="mt-6 border-t border-[rgba(200,169,110,0.18)]">
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

              <div className="mt-10 overflow-hidden rounded-[4px] border border-[rgba(200,169,110,0.18)] bg-[#0d1527] px-4">
                <div className="flex gap-1 border-b border-[rgba(200,169,110,0.18)]">
                  {(["desc", "details", "specs", "care"] as const).map(
                    (tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 border-0 bg-transparent py-4 font-['Jost'] text-[.65rem] uppercase tracking-[.2em] transition-all ${
                          activeTab === tab
                            ? "-mb-px border-b-[1.5px] border-[#c8a96e] bg-[rgba(200,169,110,0.06)] text-[#c8a96e]"
                            : "text-[#9e9585] hover:text-[#c6bda8]"
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
                    <p className="text-[.88rem] leading-[1.9] text-[#c6bda8]">
                      {product.description}
                    </p>
                  )}
                  {activeTab === "details" && (
                    <ul className="grid list-none grid-cols-1 gap-3 sm:grid-cols-2">
                      {(product.details ?? []).map((d, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2.5 text-[.82rem] text-[#c6bda8]"
                        >
                          <span className="mt-[7px] h-1 w-1 flex-shrink-0 rounded-full bg-[#c8a96e]" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  )}
                  {activeTab === "specs" && (
                    <div className="grid grid-cols-2">
                      {specs.map((s) => (
                        <div key={s.label} className="contents">
                          <span className="border-b border-[rgba(200,169,110,0.18)] py-3 text-[.72rem] uppercase tracking-[.15em] text-[#9e9585]">
                            {s.label}
                          </span>
                          <span className="border-b border-[rgba(200,169,110,0.18)] py-3 text-right text-[.82rem] text-[#c6bda8]">
                            {s.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {activeTab === "care" && (
                    <p className="text-[.88rem] leading-[1.9] text-[#c6bda8]">
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
            <h2 className="font-['Cormorant_Garamond'] text-[2.2rem] font-light text-[#f8f4ec]">
              You May Also Desire
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((item) => (
              <Link
                key={item._id}
                href={`/collection/${item.slug}`}
                className="group block overflow-hidden rounded-[3px] border border-[rgba(200,169,110,0.18)] bg-[#111827] text-inherit no-underline transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(200,169,110,0.45)]"
              >
                <img
                  src={item.images?.[0]?.url ?? "/new.jpg"}
                  alt={item.title}
                  className="block h-[280px] w-full object-cover object-[center_10%] transition-transform duration-500 group-hover:scale-[1.06]"
                />
                <div className="p-4">
                  <p className="mb-0.5 font-['Cormorant_Garamond'] text-[1.5rem] font-light text-[#f8f4ec]">
                    {item.title}
                  </p>
                  <p className="text-[.6rem] uppercase tracking-[.18em] text-[#9e9585]">
                    {item.category} · {item.colors?.[0] ?? "-"}
                  </p>
                  <p className="mt-2 text-[1.25rem] text-[#c8a96e]">
                    {formatPrice(item.price)}
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
            <h2 className="font-['Cormorant_Garamond'] text-[2.2rem] font-light text-[#f8f4ec]">
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
                className="group relative cursor-pointer overflow-hidden rounded-[3px] border border-[rgba(200,169,110,0.18)] no-underline"
                style={i === 0 ? { gridColumn: "1 / 3", gridRow: "1 / 3" } : {}}
              >
                <img
                  src={item.images?.[0]?.url ?? "/new.jpg"}
                  alt={item.title}
                  className="h-full w-full object-cover object-[center_10%] transition-transform duration-500 group-hover:scale-[1.07]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(5,10,24,0.75)] via-[rgba(5,10,24,0.1)] to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                  <span
                    className={`block font-['Cormorant_Garamond'] font-light text-[#f8f4ec] ${
                      i === 0 ? "text-[2.2rem]" : "text-[1.6rem]"
                    }`}
                  >
                    {item.title}
                  </span>
                  <span className="mt-0.5 block text-[.75rem] text-[#c8a96e]">
                    {formatPrice(item.price)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
