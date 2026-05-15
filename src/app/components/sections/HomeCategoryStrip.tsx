"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type CategoryItem = {
  label: string;
  /** Deep-link into collection search */
  q: string;
  img: string;
  alt: string;
};

const categories: CategoryItem[] = [
  {
    label: "KURTA SETS",
    q: "kurta",
    img: "/zenmen_kurta_hero.jpeg",
    alt: "Kurta sets",
  },
  {
    label: "SHERWANIS",
    q: "sherwani",
    img: "/sherwani.webp",
    alt: "Sherwanis",
  },
  {
    label: "SHIRTS",
    q: "shirt",
    img: "/zenmen_shirts.jpeg",
    alt: "Shirts",
  },
  {
    label: "NEHRU JACKETS",
    q: "nehru",
    img: "/zenmen_white.jpeg",
    alt: "Nehru jackets",
  },
  {
    label: "INDO-WESTERN",
    q: "indo-western",
    img: "/zenmen_blackcoat.jpeg",
    alt: "Indo-western",
  },
  {
    label: "WESTERN",
    q: "western",
    img: "/zenmen_suit.png",
    alt: "Western",
  },
];

/** Ignore tiny scroll jitter (sub‑pixel / touch). */
const SCROLL_DIR_DELTA = 8;
/** Always show when near the top of the page. */
const SCROLL_TOP_ALWAYS_VISIBLE = 24;
/** After scrolling pauses, show the strip again. */
const SCROLL_IDLE_SHOW_MS = 220;
/**
 * After changing visibility, ignore scroll-driven updates briefly so layout
 * corrections (scroll anchoring / sub-pixel scroll) cannot re-trigger show/hide.
 */
const SCROLL_SUPPRESS_MS = 220;

export default function HomeCategoryStrip() {
  const [visible, setVisible] = useState(true);
  const lastYRef = useRef(0);
  const idleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressUntilRef = useRef(0);

  const setVisibleSafe = useCallback((next: boolean) => {
    setVisible((prev) => {
      if (prev === next) return prev;
      suppressUntilRef.current = performance.now() + SCROLL_SUPPRESS_MS;
      return next;
    });
  }, []);

  useEffect(() => {
    lastYRef.current = window.scrollY;

    const clearIdle = () => {
      if (idleRef.current !== null) {
        clearTimeout(idleRef.current);
        idleRef.current = null;
      }
    };

    const armIdleShow = () => {
      clearIdle();
      idleRef.current = setTimeout(() => {
        setVisibleSafe(true);
        idleRef.current = null;
      }, SCROLL_IDLE_SHOW_MS);
    };

    const onScroll = () => {
      const y = window.scrollY;
      const now = performance.now();

      if (now < suppressUntilRef.current) {
        lastYRef.current = y;
        return;
      }

      const dy = y - lastYRef.current;
      lastYRef.current = y;

      if (y <= SCROLL_TOP_ALWAYS_VISIBLE) {
        clearIdle();
        setVisibleSafe(true);
        return;
      }

      if (dy > SCROLL_DIR_DELTA) {
        clearIdle();
        setVisibleSafe(false);
        armIdleShow();
        return;
      }

      if (dy < -SCROLL_DIR_DELTA) {
        clearIdle();
        setVisibleSafe(true);
        return;
      }

      armIdleShow();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearIdle();
    };
  }, [setVisibleSafe]);

  return (
    <div
      role="region"
      aria-label="Shop by category"
      aria-hidden={!visible}
      className={cn(
        "relative overflow-hidden border-b border-[#e8edf2] bg-[#f4f6f9] [overflow-anchor:none]",
        /* Stable height: collapsing the row was shifting scrollY → feedback “vibration”. */
        "min-h-[96px] sm:min-h-[128px] lg:min-h-[152px]",
      )}
    >
      <div
        className={cn(
          "transition-transform duration-300 ease-out motion-reduce:transition-none",
          visible ? "translate-y-0" : "-translate-y-[calc(100%+12px)]",
          !visible && "pointer-events-none",
        )}
      >
        <div className="bg-[#f4f6f9]">
          <div className="mx-auto max-w-screen-2xl min-w-0 px-4 sm:px-6 lg:px-10 xl:px-14">
            <div
              className="flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain py-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:justify-center sm:overflow-x-visible sm:py-5 md:gap-8 lg:gap-10 [&::-webkit-scrollbar]:hidden"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {categories.map((c) => (
                <Link
                  key={c.label}
                  href={`/collection?q=${encodeURIComponent(c.q)}`}
                  className="group flex w-[56px] shrink-0 snap-center flex-col items-center sm:w-[56px] md:w-[66px] lg:w-[86px]"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-full border-[2.5px] border-white bg-[#e2e8f0] shadow-[0_6px_20px_-6px_rgba(15,23,42,0.18)] ring-1 ring-[#e2e8f0] transition-[box-shadow,transform,ring-color] duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_12px_28px_-8px_rgba(125,168,199,0.35)] group-hover:ring-[#7da8c7]/40">
                    <Image
                      src={c.img}
                      alt={c.alt}
                      fill
                      sizes="(max-width: 640px) 56px, 86px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <span className="mt-2.5 max-w-[7.5rem] text-center font-[family-name:var(--font-montserrat)] text-[9px] font-semibold uppercase leading-tight tracking-[0.12em] text-[#0f172a] sm:text-[10px] sm:tracking-[0.14em]">
                    {c.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
