"use client";

import { useDisplayPrice } from "@/hooks/useDisplayPrice";
import { getDeliveryBadgeLabel } from "@/lib/delivery-estimate";
import type { Product } from "@/types/product";
import Link from "next/link";
import { useState } from "react";

function colorToSwatch(name: string): string {
  const n = name.toLowerCase();
  const map: Record<string, string> = {
    black: "#1a1a1a",
    white: "#f8fafc",
    navy: "#1e3a5f",
    blue: "#3b6ea8",
    brown: "#6b4423",
    beige: "#d4c4a8",
    cream: "#f5f0e6",
    grey: "#94a3b8",
    gray: "#94a3b8",
    maroon: "#6b1d1d",
    green: "#3d5c4a",
  };
  for (const [key, hex] of Object.entries(map)) {
    if (n.includes(key)) return hex;
  }
  return "#cbd5e1";
}

type Props = {
  product: Product;
  isAdmin?: boolean;
  onEdit?: () => void;
};

export default function CollectionProductCard({
  product,
  isAdmin,
  onEdit,
}: Props) {
  const { format: displayPrice } = useDisplayPrice();
  const [imgIndex, setImgIndex] = useState(0);

  const images = product.images ?? [];
  const currentImg = images[imgIndex]?.url ?? "";
  const href = product.slug
    ? `/collection/${encodeURIComponent(product.slug)}`
    : "/collection";

  const compare =
    product.comparePrice && product.comparePrice > product.price
      ? product.comparePrice
      : null;
  const pct =
    compare != null
      ? Math.round(((compare - product.price) / compare) * 100)
      : product.discount;

  const showSale = (pct != null && pct > 0) || compare != null;
  const showTop =
    product.isFeatured ||
    (product.badge?.toLowerCase().includes("top") ?? false);
  const deliveryLabel = getDeliveryBadgeLabel(product);

  return (
    <article className="group flex flex-col">
      <div className="relative aspect-[3/4] overflow-hidden bg-[#f1f5f9] mb-3">
        <Link href={href} className="absolute inset-0 block">
          {currentImg ? (
            <img
              src={currentImg}
              alt={images[imgIndex]?.alt ?? product.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : null}
        </Link>

        {isAdmin && onEdit ? (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onEdit();
            }}
            className="absolute top-2 right-2 z-20 border border-white/80 bg-white/90 px-2 py-1 text-[9px] uppercase tracking-widest hover:bg-[#0f172a] hover:text-white"
          >
            Edit
          </button>
        ) : null}

        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {showSale && pct != null && pct > 0 ? (
            <span className="bg-[#c45c4a] px-2 py-0.5 text-[10px] font-medium text-white">
              {pct}% Sale
            </span>
          ) : null}
          {showSale ? (
            <span className="w-fit bg-[#0f172a] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
              Sale
            </span>
          ) : null}
          {showTop && !showSale ? (
            <span className="w-fit bg-[#d4a59a] px-2 py-0.5 text-[10px] font-medium text-[#0f172a]">
              Top sale
            </span>
          ) : null}
          {product.badge && !showSale && !showTop ? (
            <span className="w-fit bg-[#7da8c7] px-2 py-0.5 text-[10px] uppercase tracking-wide text-white">
              {product.badge}
            </span>
          ) : null}
        </div>

        {deliveryLabel ? (
          <span className="absolute bottom-2 left-2 z-10 border border-white/40 bg-white/95 px-2.5 py-1 text-[10px] font-medium tracking-wide text-[#0f172a] shadow-sm backdrop-blur-sm">
            {deliveryLabel}
          </span>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 z-10 translate-y-full bg-[#0f172a]/75 px-3 py-2.5 transition-transform duration-300 group-hover:translate-y-0">
          <Link
            href={href}
            className="flex items-center justify-center gap-2 text-[12px] text-white no-underline"
          >
            <span className="text-lg leading-none">+</span>
            Quick view
          </Link>
        </div>
      </div>

      {(product.colors?.length ?? 0) > 0 ? (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {product.colors!.slice(0, 5).map((c) => (
            <span
              key={c}
              title={c}
              className="h-2.5 w-5 border border-[#e2e8f0]"
              style={{ background: colorToSwatch(c) }}
            />
          ))}
        </div>
      ) : null}

      <Link href={href} className="no-underline text-inherit">
        <h3 className="m-0 text-[15px] font-normal leading-snug text-[#0f172a] group-hover:text-[#475569] transition-colors line-clamp-2">
          {product.title}
        </h3>
        <p className="m-0 mt-1 text-[12px] text-[#94a3b8]">ZENmen</p>
        <div className="mt-1.5 flex flex-wrap items-baseline gap-2">
          <span className="text-[14px] font-medium text-[#0f172a]">
            {displayPrice(product.price)}
          </span>
          {compare != null ? (
            <span className="text-[13px] text-[#94a3b8] line-through">
              {displayPrice(compare)}
            </span>
          ) : null}
        </div>
      </Link>

      {images.length > 1 ? (
        <div className="mt-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {images.slice(0, 4).map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Image ${idx + 1}`}
              onClick={() => setImgIndex(idx)}
              className={`h-1 flex-1 max-w-[24px] ${imgIndex === idx ? "bg-[#0f172a]" : "bg-[#cbd5e1]"}`}
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}
