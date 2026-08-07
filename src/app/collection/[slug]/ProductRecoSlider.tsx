"use client";

import type { Product } from "@/types/product";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useRef } from "react";
import ProductRecoCard from "./ProductRecoCard";

const SCROLL_STEP = 320;

type Props = {
  title: string;
  ariaLabel: string;
  products: Product[];
};

export default function ProductRecoSlider({
  title,
  ariaLabel,
  products,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = useCallback((direction: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * SCROLL_STEP, behavior: "smooth" });
  }, []);

  if (products.length === 0) return null;

  return (
    <section
      className="relative z-10 mx-auto w-full max-w-[1800px] px-5 py-14 sm:px-8 lg:px-10"
      aria-label={ariaLabel}
    >
      <div className="mb-7 flex items-end justify-between gap-4">
        <h2 className="font-heading text-[2rem] font-light text-[#0f172a]">
          {title}
        </h2>
        <div className="flex items-center gap-2 pb-1">
          <p className="font-['Jost'] text-[.62rem] uppercase tracking-[.22em] text-[#94a3b8] md:hidden">
            Swipe →
          </p>
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label={`Scroll ${title} left`}
            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#0f172a] text-[#0f172a] transition-colors hover:bg-[#0f172a] hover:text-white md:flex"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label={`Scroll ${title} right`}
            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#0f172a] text-[#0f172a] transition-colors hover:bg-[#0f172a] hover:text-white md:flex"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="-mx-5 flex gap-3 overflow-x-auto overscroll-x-contain scroll-smooth px-5 pb-2 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0"
        role="list"
      >
        {products.map((product) => (
          <ProductRecoCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}
