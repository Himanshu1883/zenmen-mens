"use client";

import { useDisplayPrice } from "@/hooks/useDisplayPrice";
import { quickAddProductToCart } from "@/lib/quick-add-cart";
import { useAppDispatch } from "@/store/hooks";
import type { Product } from "@/types/product";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

type Props = {
  product: Product;
};

export default function ProductRecoCard({ product }: Props) {
  const dispatch = useAppDispatch();
  const { format: displayPrice } = useDisplayPrice();

  const image =
    product.images?.find((img) => img.isPrimary) ?? product.images?.[0];
  const imageUrl = image?.url ?? "/new.jpg";
  const unavailable = product.isAvailable === false;

  return (
    <article
      data-reco-card
      data-product-id={product._id}
      className="flex w-[72vw] max-w-[280px] shrink-0 snap-start flex-col overflow-hidden rounded-[3px] border border-[#e2e8f0] bg-white sm:w-[240px] md:w-[260px] lg:w-[280px]"
      role="listitem"
    >
      <Link
        href={`/collection/${encodeURIComponent(product.slug)}`}
        className="group block flex-1 text-inherit no-underline"
      >
        <div className="overflow-hidden" style={{ aspectRatio: "3/4" }}>
          <img
            src={imageUrl}
            alt={image?.alt ?? product.title}
            loading="lazy"
            decoding="async"
            className="block h-full w-full object-cover object-[center_10%] transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <div className="p-4 pb-3">
          <p className="mb-0.5 line-clamp-2 font-['Cormorant_Garamond'] text-[1.35rem] font-light leading-tight text-[#0f172a] sm:text-[1.45rem]">
            {product.title}
          </p>
          <p className="text-[.58rem] uppercase tracking-[.18em] text-[#94a3b8]">
            {product.category ?? "Collection"}
            {product.colors?.[0] ? ` · ${product.colors[0]}` : ""}
          </p>
          <p className="mt-1.5 text-[1.05rem] text-[#0f172a] sm:text-[1.15rem]">
            {displayPrice(product.price)}
          </p>
        </div>
      </Link>
      <div className="border-t border-[#e2e8f0] px-3 pb-3 pt-0">
        <button
          type="button"
          disabled={unavailable}
          onClick={() => quickAddProductToCart(product, dispatch)}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-sm border border-[#0f172a] bg-[#0f172a] font-['Jost'] text-[9px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:border-[#7da8c7] hover:bg-[#7da8c7] hover:text-[#0f172a] disabled:cursor-not-allowed disabled:border-[#e2e8f0] disabled:bg-[#f1f5f9] disabled:text-[#94a3b8] active:opacity-90 [-webkit-tap-highlight-color:transparent]"
        >
          <ShoppingBag className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          {unavailable ? "Unavailable" : "Add to bag"}
        </button>
      </div>
    </article>
  );
}
