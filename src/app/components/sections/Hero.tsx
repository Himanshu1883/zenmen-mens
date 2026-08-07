"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProducts } from "@/store/slices/productSlice";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

// -- HERO SLIDES -------------------------------------------------------------
type HeroSlide = {
  img: string;
  tag: string;
  title: [string, string, string];
  titleItalic: 1 | 2;
  subtitle: string;
  cta: string;
  ctaHref: string;
  ctaSecondary: string;
  ctaSecondaryHref: string;
  textAlign: "left" | "center" | "right";
  overlayDir: "left" | "center" | "right";
};

const heroSlides: HeroSlide[] = [
  {
    img: "/ChatGPT_Image_May_20__2026__12_08_02_PM.png",
    tag: "Bespoke Suiting · SS 2025",
    title: ["Command", "Every", "Room"],
    titleItalic: 1,
    subtitle:
      "Five silhouettes. One uncompromising standard. Bespoke suits built for the modern gentleman.",
    cta: "Begin Your Journey",
    ctaHref: "/collection?q=suit",
    ctaSecondary: "View Collection",
    ctaSecondaryHref: "/collection",
    textAlign: "center",
    overlayDir: "center",
  },
  {
    img: "/banner_kurta.png",
    tag: "The Kurta Edit · Heritage 2025",
    title: ["Royal Heritage,", "Modern", "Soul"],
    titleItalic: 1,
    subtitle:
      "Hand-embroidered kurtas crafted for the discerning groom. Tradition reimagined.",
    cta: "Explore Kurtas",
    ctaHref: "/collection?q=kurta",
    ctaSecondary: "Book a Fitting",
    ctaSecondaryHref: "/appointment",
    textAlign: "left",
    overlayDir: "left",
  },
  {
    img: "/banner_white.png",
    tag: "Signature Collection · Limited",
    title: ["Elevate", "Every", "Moment"],
    titleItalic: 2,
    subtitle:
      "Impeccably tailored tuxedos and suits crafted for unforgettable entrances. Timeless style, modern sophistication.",
    cta: "Shop Now",
    ctaHref: "/collection?q=suit",
    ctaSecondary: "View Lookbook",
    ctaSecondaryHref: "/collection?q=suit",
    textAlign: "center",
    overlayDir: "center",
  },
];

/** Third hero slide (`banner_white`) is omitted below 768px — see `heroSlidesActive`. */
const HERO_EXCLUDE_MOBILE_IMG = "/banner_white.png";

/** Full-bleed dual banners: visible only ≤768px, directly under main hero */
const mobileDualBanners = [
  {
    src: "/hero_mobile_formal_boat.png",
    alt: "White double-breasted tuxedo at sea",
    href: "/collection?q=suit",
    tag: "Evening · Maritime",
    titleStrong: "Yacht",
    titleItalic: "formal",
    align: "left" as const,
  },
  {
    src: "/hero_mobile_formal_deck.png",
    alt: "White shawl-collar tuxedo, formal evening",
    href: "/collection?q=tuxedo",
    tag: "Deck · Limited",
    titleStrong: "White",
    titleItalic: "evening",
    align: "right" as const,
  },
] as const;

// -- STATIC FALLBACK COLLAGE -------------------------------------------------
const collageItemsFallback = [
  {
    img: "/ChatGPT_Image_May_20__2026__12_08_02_PM.png",
    label: "Bespoke Suits",
    desc: "Full canvas construction",
    tag: "Bestseller",
    slug: "suits",
  },
  {
    img: "/zenmen_shirt.jpeg",
    label: "Dress Shirts",
    desc: "Egyptian cotton, luxury crafted",
    tag: null,
    slug: "shirts",
  },
  {
    img: "/banner_kurta.png",
    label: "Kurtas",
    desc: "Hand-embroidered, heritage craft",
    tag: "Featured",
    slug: "kurtas",
  },
  {
    img: "/zenmen_shirt_black.jpeg",
    label: "Dark Edition",
    desc: "Contrast stitch, bold silhouettes",
    tag: null,
    slug: "dark-edit",
  },
  {
    img: "/banner_white.png",
    label: "Eveningwear",
    desc: "Tailored to perfection",
    tag: "Limited",
    slug: "eveningwear",
  },
];

export default function Hero() {
  const dispatch = useAppDispatch();
  const { products, loading, loaded } = useAppSelector((s) => s.products);

  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [animKey, setAnimKey] = useState(0);
  const transitioningRef = useRef(false);
  const currentRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [collageStart, setCollageStart] = useState(0);
  const [prevCollageStart, setPrevCollageStart] = useState<number | null>(null);
  const [collageDir, setCollageDir] = useState<"left" | "right">("right");
  const collageTransRef = useRef(false);
  const collageTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isMobileHero, setIsMobileHero] = useState(false);

  useEffect(() => {
    if (!loading && !loaded) dispatch(fetchProducts());
  }, [dispatch, loading, loaded]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const apply = () => setIsMobileHero(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const heroSlidesActive = useMemo(
    () =>
      isMobileHero
        ? heroSlides.filter((s) => s.img !== HERO_EXCLUDE_MOBILE_IMG)
        : heroSlides,
    [isMobileHero],
  );

  const goTo = (idx: number) => {
    if (transitioningRef.current || idx === currentRef.current) return;
    setPrev(currentRef.current);
    setCurrent(idx);
    setAnimKey((k) => k + 1);
    currentRef.current = idx;
    transitioningRef.current = true;
    setTimeout(() => { setPrev(null); transitioningRef.current = false; }, 900);
  };
  const heroNext = () =>
    goTo((currentRef.current + 1) % heroSlidesActive.length);
  const heroPrev = () =>
    goTo(
      (currentRef.current - 1 + heroSlidesActive.length) %
        heroSlidesActive.length,
    );

  useEffect(() => {
    const n = heroSlidesActive.length;
    if (n < 1) return;
    if (currentRef.current >= n) {
      currentRef.current = 0;
      setCurrent(0);
    }
  }, [heroSlidesActive.length]);

  useEffect(() => {
    const n = heroSlidesActive.length;
    if (n < 1) return;
    timerRef.current = setInterval(
      () => goTo((currentRef.current + 1) % n),
      6000,
    );
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [heroSlidesActive.length]);

  const collageSource = useMemo(() => {
    const fromStore = (products ?? [])
      .filter((p) => p?.title && p?.images?.[0]?.url)
      .map((p, i) => ({
        img: p.images[0].url,
        label: p.title,
        desc: `${p.category ?? "Collection"}${p.colors?.[0] ? ` · ${p.colors[0]}` : ""}`,
        tag: i % 4 === 0 ? "Featured" : i % 5 === 0 ? "Bestseller" : null,
        slug: p.slug,
      }));
    return fromStore.length > 0 ? fromStore : collageItemsFallback;
  }, [products]);

  const VISIBLE = 5;
  const collageVisible = useMemo(() => {
    if (collageSource.length <= VISIBLE) return collageSource;
    return Array.from({ length: VISIBLE }, (_, i) => collageSource[(collageStart + i) % collageSource.length]);
  }, [collageSource, collageStart]);

  const collagePrevVisible = useMemo(() => {
    if (prevCollageStart === null || collageSource.length <= VISIBLE) return [];
    return Array.from({ length: VISIBLE }, (_, i) => collageSource[(prevCollageStart + i) % collageSource.length]);
  }, [collageSource, prevCollageStart]);

  const canSlideCollage = collageSource.length > VISIBLE;
  const slideCollage = (dir: "left" | "right") => {
    if (!canSlideCollage || collageTransRef.current) return;
    collageTransRef.current = true;
    setCollageDir(dir);
    setPrevCollageStart(collageStart);
    setCollageStart((prev) =>
      dir === "right" ? (prev + VISIBLE) % collageSource.length : (prev - VISIBLE + collageSource.length) % collageSource.length
    );
    setTimeout(() => { setPrevCollageStart(null); collageTransRef.current = false; }, 650);
  };

  const collageAutoCount = useRef(0);
  useEffect(() => {
    if (!canSlideCollage) return;
    collageAutoCount.current = 0;
    collageTimerRef.current = setInterval(() => {
      if (collageAutoCount.current >= 3) { clearInterval(collageTimerRef.current!); return; }
      collageAutoCount.current += 1;
      slideCollage("right");
    }, 4200);
    return () => { if (collageTimerRef.current) clearInterval(collageTimerRef.current); };
  }, [canSlideCollage, collageSource.length]);

  const slide =
    heroSlidesActive[current] ?? heroSlidesActive[0] ?? heroSlides[0];
  const overlayGradient = slide
    ? {
        left: "linear-gradient(105deg, rgba(5,8,15,0.78) 0%, rgba(5,8,15,0.35) 50%, transparent 100%)",
        right:
          "linear-gradient(255deg, rgba(5,8,15,0.78) 0%, rgba(5,8,15,0.35) 50%, transparent 100%)",
        center:
          "linear-gradient(to top, rgba(5,8,15,0.82) 0%, rgba(5,8,15,0.28) 45%, transparent 72%)",
      }[slide.overlayDir]
    : "transparent";

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ══════════════════════════════════════
           TOKENS
        ══════════════════════════════════════ */
        :root {
          --zen-ink: #0f172a;
          --zen-surface: #f8fafc;
          --zen-accent: #7da8c7;
          --zen-accent-soft: #a3c4d9;
          --zen-muted: #94a3b8;
          --zen-deep: #0b1220;
          /* semantic aliases (brand theme) */
          --ink: var(--zen-ink);
          --ivory: var(--zen-surface);
          --fog: #e2e8f0;
          --gold: var(--zen-accent);
          --gold-light: var(--zen-accent-soft);
          --slate: var(--zen-muted);
          --ff-display: var(--heading-font-family);
          --ff-sans: var(--base-font-family);
          --ff-ui: var(--base-font-family);
        }

        /* ══════════════════════════════════════
           HERO
        ══════════════════════════════════════ */
        .zn-hero {
          width: 100%; height: 100vh; min-height: 600px;
          position: relative; overflow: hidden;
          background: var(--zen-ink);
        }

        .zn-slide-img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover; object-position: center center;
          transition: opacity 1.1s cubic-bezier(.4,0,.2,1);
        }
        .zn-slide-img.active  { opacity: 1; z-index: 1; animation: zoomSlow 8s ease forwards; }
        .zn-slide-img.exiting { opacity: 0; z-index: 0; }
        .zn-slide-img.hidden  { opacity: 0; z-index: 0; }
        @keyframes zoomSlow { from { transform: scale(1.07); } to { transform: scale(1.0); } }

        .zn-overlay {
          position: absolute; inset: 0; z-index: 2;
          display: flex; flex-direction: column; justify-content: flex-end;
          padding-bottom: 100px;
        }

        .zn-text { display: flex; flex-direction: column; }

        .zn-tag {
          font-family: var(--ff-ui); font-size: 9px; letter-spacing: 5px;
          color: var(--zen-accent); text-transform: uppercase; font-weight: 600;
          margin-bottom: 16px;
          opacity: 0; animation: riseIn 0.7s 0.1s forwards;
        }

        .zn-title {
          font-family: var(--ff-display); font-weight: 700; color: var(--zen-surface);
          line-height: 0.95; margin-bottom: 22px;
          opacity: 0; animation: riseIn 0.8s 0.22s forwards;
        }
        .zn-title-line       { display: block; font-size: clamp(48px, 8.5vw, 120px); letter-spacing: -0.01em; }
        .zn-title-line.ital  { font-style: italic; color: var(--zen-accent-soft); font-weight: 300; }

        .zn-sub {
          font-family: var(--ff-display); font-size: clamp(14px, 1.4vw, 19px);
          font-weight: 300; font-style: italic; color: color-mix(in srgb, var(--zen-surface) 82%, transparent);
          line-height: 1.65; margin-bottom: 34px; max-width: 520px;
          opacity: 0; animation: riseIn 0.8s 0.36s forwards;
        }

        .zn-btns {
          display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
          opacity: 0; animation: riseIn 0.8s 0.5s forwards;
        }
        .zn-btn-fill {
          background: var(--zen-accent); color: var(--zen-ink);
          font-family: var(--ff-ui); font-size: 9px; font-weight: 700;
          letter-spacing: 3.5px; text-transform: uppercase;
          padding: 14px 32px; border: none; cursor: pointer;
          text-decoration: none; display: inline-block;
          transition: background 0.25s, transform 0.2s;
          clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
        }
        .zn-btn-fill:hover { background: var(--zen-accent-soft); transform: translateY(-2px); }
        .zn-btn-ghost {
          font-family: var(--ff-ui); font-size: 9px; letter-spacing: 3px;
          text-transform: uppercase; color: color-mix(in srgb, var(--zen-surface) 90%, transparent);
          text-decoration: none; font-weight: 500;
          border: 1px solid color-mix(in srgb, var(--zen-accent) 55%, transparent); padding: 13px 24px;
          background: color-mix(in srgb, var(--zen-ink) 35%, transparent); transition: all 0.25s; display: inline-block;
        }
        .zn-btn-ghost:hover { color: var(--zen-surface); border-color: var(--zen-accent); background: color-mix(in srgb, var(--zen-accent) 22%, transparent); }

        @keyframes riseIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* nav controls */
        .zn-topbar {
          position: absolute; top: 0; left: 0; right: 0; z-index: 6;
          height: 80px;
          background: linear-gradient(to bottom, rgba(5,8,15,0.4) 0%, transparent 100%);
        }

        .zn-arrow {
          position: absolute; top: 50%; z-index: 6; transform: translateY(-50%);
          width: 48px; height: 48px;
          border: 1px solid color-mix(in srgb, var(--zen-accent) 35%, transparent);
          background: color-mix(in srgb, var(--zen-ink) 50%, transparent); color: var(--zen-surface); cursor: pointer;
          font-size: 18px; display: flex; align-items: center; justify-content: center;
          transition: all 0.25s; backdrop-filter: blur(10px);
        }
        .zn-arrow:hover { background: color-mix(in srgb, var(--zen-accent) 28%, transparent); border-color: var(--zen-accent); }
        .zn-arrow.l { left: 24px; }
        .zn-arrow.r { right: 24px; }

        .zn-dots { position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%); z-index: 6; display: flex; gap: 12px; align-items: center; }
        .zn-dot  { width: 22px; height: 2px; background: color-mix(in srgb, var(--zen-surface) 28%, transparent); cursor: pointer; transition: all 0.35s; }
        .zn-dot.on { background: var(--zen-accent); width: 44px; }

        .zn-counter {
          position: absolute; bottom: 38px; right: 32px; z-index: 6;
          font-family: var(--ff-ui); font-size: 9px; letter-spacing: 3px;
          color: color-mix(in srgb, var(--zen-surface) 42%, transparent); font-weight: 400;
        }
        .zn-scroll {
          position: absolute; bottom: 36px; left: 32px; z-index: 6;
          display: flex; align-items: center; gap: 12px;
          font-family: var(--ff-ui); font-size: 8px; letter-spacing: 4px;
          text-transform: uppercase; color: color-mix(in srgb, var(--zen-surface) 40%, transparent);
        }
        .zn-scroll-ln { width: 32px; height: 1px; background: color-mix(in srgb, var(--zen-accent) 55%, transparent); }

        .zn-progress { position: absolute; bottom: 0; left: 0; right: 0; z-index: 6; height: 2px; background: color-mix(in srgb, var(--zen-surface) 12%, transparent); }
        .zn-bar { height: 100%; background: var(--zen-accent); animation: prog 6s linear infinite; }
        @keyframes prog { from { width:0%; } to { width:100%; } }

        /* vertical accent */
        .zn-vert {
          position: absolute; right: 20px; top: 50%; z-index: 6;
          transform: translateY(-50%) rotate(90deg);
          font-family: var(--ff-ui); font-size: 8px; letter-spacing: 5px;
          text-transform: uppercase; color: color-mix(in srgb, var(--zen-surface) 32%, transparent);
          white-space: nowrap; pointer-events: none;
        }

        /* ══════════════════════════════════════
           DIVIDER
        ══════════════════════════════════════ */
        .zn-divider {
          width: 100%; height: 1px;
          background: linear-gradient(to right, transparent, var(--zen-accent) 30%, var(--zen-accent) 70%, transparent);
          opacity: 0.35;
        }

        /* Mobile only: two portrait banners, one row, edge-to-edge */
        .zn-mobile-dual-banner {
          display: none;
        }
        .zn-mobile-dual-cell {
          position: relative;
          overflow: hidden;
          margin: 0;
          padding: 0;
          line-height: 0;
          text-decoration: none;
          color: inherit;
          min-height: 0;
        }
        .zn-mobile-dual-cell img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 22%;
        }

        .zn-mobile-dual-ov {
          position: absolute;
          inset: 0;
          z-index: 2;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: flex-start;
          text-align: left;
          padding: 0.65rem 0.45rem 0.9rem;
          background: linear-gradient(
            to top,
            rgba(15, 23, 42, 0.94) 0%,
            rgba(15, 23, 42, 0.42) 48%,
            transparent 78%
          );
          pointer-events: none;
          line-height: 1.2;
        }
        .zn-mobile-dual-ov--right {
          align-items: flex-end;
          text-align: right;
        }
        .zn-mobile-dual-tag {
          font-family: var(--ff-ui);
          font-size: 6px;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: var(--zen-accent);
          font-weight: 600;
          margin-bottom: 0.3rem;
        }
        .zn-mobile-dual-title {
          font-family: var(--ff-display);
          font-size: clamp(12px, 3.4vw, 16px);
          font-weight: 700;
          color: var(--zen-surface);
          margin: 0 0 0.4rem;
          letter-spacing: -0.02em;
          line-height: 1.05;
        }
        .zn-mobile-dual-title em {
          display: block;
          font-style: italic;
          font-weight: 400;
          color: var(--zen-accent-soft);
          margin-top: 0.06em;
        }
        .zn-mobile-dual-cta {
          font-family: var(--ff-ui);
          font-size: 6px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          font-weight: 700;
          color: var(--zen-surface);
          border-bottom: 1px solid var(--zen-accent);
          padding-bottom: 3px;
          display: inline-block;
        }

        /* ══════════════════════════════════════
           BANNER 1 — FULL WIDTH SUITS (dark editorial)
        ══════════════════════════════════════ */
        .bn-full {
          position: relative; width: 100%;
          height: clamp(480px, 88vh, 960px);
          overflow: hidden;
          background: var(--zen-ink);
        }
        .bn-full img {
          width: 100%; height: 100%;
          object-fit: cover; object-position: center center;
          transition: transform 8s ease;
        }
        .bn-full:hover img { transform: scale(1.03); }

        .bn-full-ov {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          justify-content: flex-end; align-items: center;
          padding: clamp(32px,6vw,72px);
          text-align: center;
          background: linear-gradient(to top, rgba(5,8,15,0.9) 0%, rgba(5,8,15,0.25) 50%, transparent 80%);
        }
        .bn-eyebrow {
          font-family: var(--ff-ui); font-size: 9px; letter-spacing: 6px;
          color: var(--gold); text-transform: uppercase; font-weight: 600;
          margin-bottom: 14px;
          display: flex; align-items: center; gap: 16px;
        }
        .bn-eyebrow::before, .bn-eyebrow::after { content:''; flex: 1; max-width: 60px; height: 1px; background: var(--gold); opacity: 0.6; }
        .bn-full-title {
          font-family: var(--ff-display); font-size: clamp(48px, 9vw, 128px);
          font-weight: 700; color: var(--zen-surface); line-height: 0.9;
          letter-spacing: -0.02em; margin-bottom: 18px;
        }
        .bn-full-title em { font-style: italic; color: var(--zen-accent-soft); font-weight: 300; }
        .bn-full-sub {
          font-family: var(--ff-display); font-size: clamp(14px, 1.5vw, 18px);
          font-style: italic; font-weight: 300; color: color-mix(in srgb, var(--zen-surface) 76%, transparent);
          max-width: 560px; margin: 0 auto 30px; line-height: 1.65;
        }
        .bn-btn-row { display: flex; align-items: center; gap: 18px; justify-content: center; flex-wrap: wrap; }
        .bn-btn-gold {
          display: inline-block; background: var(--zen-accent); color: var(--zen-ink);
          font-family: var(--ff-ui); font-size: 9px; font-weight: 700;
          letter-spacing: 3.5px; text-transform: uppercase;
          padding: 14px 34px; text-decoration: none; transition: background 0.25s, transform 0.2s;
        }
        .bn-btn-gold:hover { background: var(--zen-accent-soft); transform: translateY(-2px); }
        .bn-btn-line {
          display: inline-block; font-family: var(--ff-ui); font-size: 9px;
          letter-spacing: 3px; text-transform: uppercase;
          color: color-mix(in srgb, var(--zen-surface) 85%, transparent); text-decoration: none;
          border-bottom: 1px solid color-mix(in srgb, var(--zen-accent) 55%, transparent); padding-bottom: 3px;
          transition: color 0.2s, border-color 0.2s;
        }
        .bn-btn-line:hover { color: var(--zen-accent-soft); border-color: var(--zen-accent-soft); }

        /* ══════════════════════════════════════
           BANNER 2 — DUO SPLIT (shirts)
        ══════════════════════════════════════ */
        .bn-duo {
          display: grid; grid-template-columns: 1fr 1fr;
          height: clamp(420px, 78vh, 860px);
          overflow: hidden;
        }
        .bn-duo-cell { position: relative; overflow: hidden; cursor: pointer; }
        .bn-duo-cell img {
          width: 100%; height: 100%;
          object-fit: cover; object-position: center center;
          transition: transform 7s ease;
        }
        .bn-duo-cell:hover img { transform: scale(1.06); }
        .bn-duo-ov {
          position: absolute; inset: 0;
          display: flex; flex-direction: column; justify-content: flex-end;
          padding: clamp(24px, 4vw, 48px);
          background: linear-gradient(to top, rgba(5,8,15,0.85) 0%, rgba(5,8,15,0.2) 55%, transparent 100%);
          transition: background 0.4s;
        }
        .bn-duo-cell:hover .bn-duo-ov {
          background: linear-gradient(to top, rgba(5,8,15,0.92) 0%, rgba(5,8,15,0.35) 60%, transparent 100%);
        }
        .bn-duo-tag {
          font-family: var(--ff-ui); font-size: 8px; letter-spacing: 4px;
          color: var(--gold); text-transform: uppercase; font-weight: 600; margin-bottom: 10px;
        }
        .bn-duo-h {
          font-family: var(--ff-display); font-size: clamp(28px, 4vw, 52px);
          font-weight: 700; color: var(--zen-surface); line-height: 1.0; margin-bottom: 10px;
        }
        .bn-duo-h em { font-style: italic; color: var(--zen-accent-soft); font-weight: 300; }
        .bn-duo-sub {
          font-family: var(--ff-display); font-size: clamp(13px, 1.3vw, 15px);
          font-style: italic; font-weight: 300; color: color-mix(in srgb, var(--zen-surface) 76%, transparent);
          margin-bottom: 20px; line-height: 1.55;
        }
        .bn-duo-cta {
          display: inline-flex; align-items: center; gap: 10px;
          font-family: var(--ff-ui); font-size: 9px; letter-spacing: 3px;
          text-transform: uppercase; font-weight: 600;
          color: var(--zen-accent); text-decoration: none;
          border-bottom: 1px solid color-mix(in srgb, var(--zen-accent) 50%, transparent); padding-bottom: 3px;
          transition: color 0.2s;
        }
        .bn-duo-cta:hover { color: var(--zen-accent-soft); }

        /* vertical label on duo left */
        .bn-side-label {
          position: absolute; left: 20px; top: 50%;
          transform: translateY(-50%) rotate(-90deg);
          font-family: var(--ff-ui); font-size: 8px; letter-spacing: 5px;
          text-transform: uppercase; color: color-mix(in srgb, var(--zen-surface) 32%, transparent);
          white-space: nowrap; z-index: 2; pointer-events: none;
        }

        /* ══════════════════════════════════════
           BANNER 3 — FULL WIDTH KURTA (heritage)
        ══════════════════════════════════════ */
        .bn-heritage {
          position: relative; width: 100%;
          height: clamp(500px, 90vh, 980px);
          overflow: hidden; background: var(--zen-deep);
        }
        .bn-heritage img {
          width: 100%; height: 100%;
          object-fit: cover; object-position: center center;
          transition: transform 8s ease;
        }
        .bn-heritage:hover img { transform: scale(1.025); }

        .bn-heritage-ov {
          position: absolute; inset: 0;
          background: linear-gradient(to right, rgba(8,5,2,0.88) 0%, rgba(8,5,2,0.3) 55%, transparent 100%);
          display: flex; flex-direction: column; justify-content: center;
          padding: clamp(32px, 8vw, 96px);
        }
        .bn-heritage-season {
          font-family: var(--ff-ui); font-size: 8px; letter-spacing: 6px;
          color: var(--gold); text-transform: uppercase; font-weight: 600;
          margin-bottom: 18px; opacity: 0.9;
        }
        .bn-heritage-h {
          font-family: var(--ff-display); font-size: clamp(40px, 7.5vw, 108px);
          font-weight: 700; color: var(--zen-surface); line-height: 0.92;
          letter-spacing: -0.015em; margin-bottom: 22px;
        }
        .bn-heritage-h .line-ital { display: block; font-style: italic; color: var(--zen-accent-soft); font-weight: 300; }
        .bn-heritage-sub {
          font-family: var(--ff-display); font-size: clamp(14px, 1.5vw, 18px);
          font-style: italic; font-weight: 300; color: color-mix(in srgb, var(--zen-surface) 78%, transparent);
          max-width: 440px; line-height: 1.65; margin-bottom: 32px;
        }
        .bn-heritage-btns { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }

        /* ══════════════════════════════════════
           COLLECTION COLLAGE
        ══════════════════════════════════════ */
        .collage-section {
          width: 100%; background: var(--zen-surface);
          border-top: 1px solid var(--fog);
          font-family: var(--ff-ui);
          padding-bottom: clamp(48px, 7vw, 80px);
        }
        .collage-hdr {
          display: flex; align-items: flex-end; justify-content: space-between;
          padding: clamp(28px, 4.5vw, 52px) clamp(20px, 4vw, 48px) clamp(14px, 2vw, 24px);
        }
        .collage-hdr-left { display: flex; flex-direction: column; gap: 6px; }
        .collage-sup { font-family: var(--ff-ui); font-size: 9px; letter-spacing: 5px; text-transform: uppercase; color: var(--gold); font-weight: 600; }
        .collage-ttl { font-family: var(--ff-display); font-size: clamp(28px, 4vw, 46px); font-weight: 700; color: var(--zen-ink); }
        .collage-ttl em { color: var(--zen-accent); font-style: italic; }
        .collage-arrows { display: flex; gap: 10px; }
        .c-arr-btn {
          width: 46px; height: 46px; border: 1px solid rgba(15, 23, 42, 0.12);
          background: #fff; color: var(--zen-ink); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; transition: all 0.25s;
        }
        .c-arr-btn:hover { border-color: var(--zen-accent); color: var(--zen-accent); }
        .c-arr-btn:disabled { opacity: 0.25; cursor: default; }

        .collage-vp { position: relative; overflow: hidden; margin: 0 clamp(10px, 2vw, 24px); min-height: min(80vh, 920px); }
        .collage-grid {
          display: grid;
          grid-template-columns: minmax(0,1.6fr) minmax(0,1fr) minmax(0,1fr);
          grid-template-rows: minmax(290px,46vh) minmax(210px,34vh);
          gap: clamp(8px, 1.1vw, 14px); width: 100%;
        }
        .collage-grid .c-cell:nth-child(1) { grid-column:1; grid-row:1/span 2; }
        .collage-grid .c-cell:nth-child(2) { grid-column:2; grid-row:1; }
        .collage-grid .c-cell:nth-child(3) { grid-column:3; grid-row:1; }
        .collage-grid .c-cell:nth-child(4) { grid-column:2; grid-row:2; }
        .collage-grid .c-cell:nth-child(5) { grid-column:3; grid-row:2; }

        .collage-grid.enter-r { animation: cEnR 650ms cubic-bezier(.22,.61,.36,1) both; }
        .collage-grid.enter-l { animation: cEnL 650ms cubic-bezier(.22,.61,.36,1) both; }
        .collage-grid.exit-l  { position:absolute;inset:0; animation: cExL 650ms cubic-bezier(.22,.61,.36,1) both; }
        .collage-grid.exit-r  { position:absolute;inset:0; animation: cExR 650ms cubic-bezier(.22,.61,.36,1) both; }
        @keyframes cEnR { from{transform:translateX(100%)} to{transform:translateX(0)} }
        @keyframes cEnL { from{transform:translateX(-100%)} to{transform:translateX(0)} }
        @keyframes cExL { from{transform:translateX(0)} to{transform:translateX(-100%)} }
        @keyframes cExR { from{transform:translateX(0)} to{transform:translateX(100%)} }

        .c-cell { position:relative; overflow:hidden; cursor:pointer; background: var(--fog); }
        .c-cell img { width:100%; height:100%; object-fit:cover; object-position:center top; transition:transform 0.75s cubic-bezier(.22,.61,.36,1); }
        .c-cell:hover img { transform:scale(1.07); }
        .c-cell-ov {
          position:absolute; inset:0;
          background:linear-gradient(to top, rgba(5,8,15,0.82) 0%, rgba(5,8,15,0.18) 52%, transparent 100%);
          display:flex; flex-direction:column; justify-content:flex-end;
          padding: clamp(14px,2vw,22px); transition:background 0.4s;
        }
        .c-cell:hover .c-cell-ov { background:linear-gradient(to top, rgba(5,8,15,0.9) 0%, rgba(5,8,15,0.35) 56%, transparent 100%); }
        .c-cell-lbl { font-family:var(--ff-display); font-size:clamp(15px,1.9vw,24px); color:var(--zen-surface); font-weight:700; margin-bottom:4px; }
        .c-cell-desc { font-family:var(--ff-ui); font-size:8px; letter-spacing:0.22em; color:color-mix(in srgb, var(--zen-surface) 82%, transparent); text-transform:uppercase; font-weight:500; }
        .c-cell-tag { position:absolute; top:12px; left:12px; font-family:var(--ff-ui); font-size:7px; letter-spacing:2.5px; font-weight:700; text-transform:uppercase; background:var(--zen-surface); border:1px solid color-mix(in srgb, var(--zen-accent) 45%, transparent); color:var(--zen-ink); padding:4px 10px; z-index:2; }

        .c-hover-pill {
          position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
          opacity:0; transition:opacity 0.35s; background:rgba(5,8,15,0.1);
        }
        .c-cell:hover .c-hover-pill { opacity:1; }
        .c-pill-inner {
          font-family:var(--ff-ui); font-size:9px; letter-spacing:3px; text-transform:uppercase; font-weight:700;
          color:var(--zen-ink); background:var(--zen-surface); padding:12px 24px;
          border:1px solid color-mix(in srgb, var(--zen-accent) 50%, transparent); transition:background 0.2s, color 0.2s;
        }
        .c-pill-inner:hover { background:var(--zen-accent); color:var(--zen-surface); border-color:var(--zen-accent); }

        .collage-dots { display:flex; align-items:center; justify-content:center; gap:8px; margin-top:24px; }
        .collage-dot  { width:18px; height:2px; background:color-mix(in srgb, var(--zen-accent) 25%, transparent); cursor:pointer; transition:all 0.3s; }
        .collage-dot.on { background:var(--zen-accent); width:36px; }

        .collage-view-wrap { display:flex; justify-content:center; margin-top:clamp(28px,4vw,44px); }
        .collage-view-btn {
          display:inline-flex; align-items:center; gap:14px;
          font-family:var(--ff-ui); font-size:9px; letter-spacing:3.5px; text-transform:uppercase; font-weight:700;
          color:var(--zen-ink); border:1px solid rgba(15, 23, 42, 0.15); padding:15px 40px;
          background:#fff; cursor:pointer; text-decoration:none; transition:all 0.3s;
        }
        .collage-view-btn:hover { background:var(--zen-accent); color:var(--zen-surface); border-color:var(--zen-accent); }
        .c-v-arrow { font-size:14px; transition:transform 0.3s; }
        .collage-view-btn:hover .c-v-arrow { transform:translateX(5px); }

        /* ══════════════════════════════════════
           MOBILE
        ══════════════════════════════════════ */
        @media (max-width: 768px) {
          .zn-mobile-dual-banner {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: min(88svh, 780px);
            width: 100%;
            gap: 0;
            background: var(--zen-ink);
          }
          .zn-mobile-dual-cell {
            height: 100%;
            align-self: stretch;
          }
          .zn-mobile-dual-cell img {
            position: absolute;
            inset: 0;
            min-height: 100%;
            object-fit: cover;
            object-position: center 28%;
          }

          /* Full-bleed hero: image fills the viewport (cover), not letterboxed */
          .zn-hero {
            min-height: 100svh;
            min-height: 100dvh;
            height: 100svh;
            height: 100dvh;
            min-height: -webkit-fill-available;
            max-height: none;
          }
          .zn-slide-img {
            object-fit: cover;
            object-position: center 32%;
            width: 100%;
            height: 100%;
          }
          .zn-slide-img.active {
            animation: zoomSlowMobile 9s ease forwards;
          }
          @keyframes zoomSlowMobile {
            from { transform: scale(1.04); }
            to { transform: scale(1); }
          }

          .zn-overlay { padding-bottom: 72px; }
          .zn-sub { max-width:100% !important; }
          .zn-scroll { display:none; }
          .zn-vert { display:none; }
          .zn-arrow { width:38px; height:38px; font-size:13px; }
          .zn-arrow.l { left:10px; } .zn-arrow.r { right:10px; }
          .zn-title-line { font-size: clamp(32px, 10vw, 56px); }

          .bn-full {
            height: min(92vh, 800px);
            min-height: 420px;
          }
          .bn-full img {
            object-fit: cover;
            object-position: center 30%;
          }
          .bn-duo { grid-template-columns:1fr; height:auto; }
          .bn-duo-cell { height:clamp(340px, 58vh, 580px); }
          .bn-duo-cell img {
            object-fit: cover;
            object-position: center 28%;
          }
          .bn-heritage {
            height: min(92vh, 840px);
            min-height: 420px;
          }
          .bn-heritage img {
            object-fit: cover;
            object-position: center 25%;
          }
          .bn-heritage-ov { background: linear-gradient(to top, rgba(8,5,2,0.88) 0%, rgba(8,5,2,0.45) 55%, transparent 100%); justify-content:flex-end; padding-bottom: clamp(32px,6vw,56px); }

          .collage-vp { min-height:auto; margin:0 10px; }
          .collage-grid {
            grid-template-columns:1fr 1fr !important;
            grid-template-rows:minmax(200px,28vh) minmax(150px,22vh) minmax(150px,22vh) !important;
            gap:8px;
          }
          .collage-grid .c-cell:nth-child(1) { grid-column:1/-1 !important; grid-row:1 !important; }
          .collage-grid .c-cell:nth-child(2) { grid-column:1 !important; grid-row:2 !important; }
          .collage-grid .c-cell:nth-child(3) { grid-column:2 !important; grid-row:2 !important; }
          .collage-grid .c-cell:nth-child(4) { grid-column:1 !important; grid-row:3 !important; }
          .collage-grid .c-cell:nth-child(5) { grid-column:2 !important; grid-row:3 !important; }
          .collage-hdr { flex-direction:column; align-items:flex-start; gap:14px; }
          .collage-arrows { align-self:flex-end; }
          .c-cell img {
            object-fit: cover;
            object-position: center 35%;
          }
        }

        @media (max-width: 480px) {
          .zn-btns { flex-direction:column; align-items:flex-start; gap:10px; }
          .zn-btn-ghost { width:100%; text-align:center; }
          .bn-btn-row { flex-direction:column; align-items:center; }
          .collage-grid {
            grid-template-columns:1fr !important;
            grid-template-rows:repeat(5, minmax(180px,28vh)) !important;
          }
          .collage-grid .c-cell:nth-child(1) { grid-row:1 !important; }
          .collage-grid .c-cell:nth-child(2) { grid-row:2 !important; }
          .collage-grid .c-cell:nth-child(3) { grid-row:3 !important; }
          .collage-grid .c-cell:nth-child(4) { grid-row:4 !important; }
          .collage-grid .c-cell:nth-child(5) { grid-row:5 !important; }
        }
      `}</style>

      {/* ══════════════════════════════════════
          SECTION 1 — CINEMATIC HERO
      ══════════════════════════════════════ */}
      <section className="zn-hero" id="home">
        {heroSlidesActive.map((s, i) => (
          <img key={s.img + i} src={s.img} alt={s.tag}
            className={`zn-slide-img ${i === current ? "active" : i === prev ? "exiting" : "hidden"}`}
          />
        ))}

        <div className="zn-topbar" />

        <div className="zn-overlay" style={{ background: overlayGradient }}>
          <div className="zn-text" key={animKey} style={{
            alignItems: isMobileHero
              ? "center"
              : slide.textAlign === "left"
                ? "flex-start"
                : slide.textAlign === "right"
                  ? "flex-end"
                  : "center",
            textAlign: (isMobileHero ? "center" : slide.textAlign) as "left" | "center" | "right",
            paddingLeft: isMobileHero
              ? "1.25rem"
              : slide.textAlign === "left"
                ? "clamp(24px,7vw,96px)"
                : slide.textAlign === "right"
                  ? "38%"
                  : "12%",
            paddingRight: isMobileHero
              ? "1.25rem"
              : slide.textAlign === "right"
                ? "clamp(24px,7vw,96px)"
                : slide.textAlign === "left"
                  ? "38%"
                  : "12%",
          }}>
            <div className="zn-tag">{slide.tag}</div>
            <h1 className="zn-title">
              <span className="zn-title-line">{slide.title[0]}</span>
              <span className={`zn-title-line${slide.titleItalic === 1 ? " ital" : ""}`}>{slide.title[1]}</span>
              <span className={`zn-title-line${slide.titleItalic === 2 ? " ital" : ""}`}>{slide.title[2]}</span>
            </h1>
            <p className="zn-sub" style={(isMobileHero || slide.textAlign === "center") ? { textAlign: "center" } : {}}>{slide.subtitle}</p>
            <div className="zn-btns" style={{ justifyContent: isMobileHero ? "center" : slide.textAlign === "left" ? "flex-start" : slide.textAlign === "right" ? "flex-end" : "center" }}>
              <Link href={slide.ctaHref} className="zn-btn-fill no-underline">
                {slide.cta}
              </Link>
              <Link href={slide.ctaSecondaryHref} className="zn-btn-ghost no-underline">
                {slide.ctaSecondary}
              </Link>
            </div>
          </div>
        </div>

        <button className="zn-arrow l" onClick={heroPrev}>&#8592;</button>
        <button className="zn-arrow r" onClick={heroNext}>&#8594;</button>

        <div className="zn-dots">
          {heroSlidesActive.map((_, i) => (
            <div key={i} className={`zn-dot ${i === current ? "on" : ""}`} onClick={() => goTo(i)} />
          ))}
        </div>

        <div className="zn-counter">{String(current + 1).padStart(2, "0")} / {String(heroSlidesActive.length).padStart(2, "0")}</div>
        <div className="zn-scroll"><span className="zn-scroll-ln" />Scroll to Explore</div>
        <div className="zn-vert">Bespoke · Premium · Timeless</div>
        <div className="zn-progress"><div className="zn-bar" key={animKey} /></div>
      </section>

      <section
        className="zn-mobile-dual-banner"
        aria-label="Formal and evening tailoring"
      >
        {mobileDualBanners.map((b) => (
          <Link
            key={b.src}
            href={b.href}
            className="zn-mobile-dual-cell"
          >
            <img src={b.src} alt={b.alt} sizes="50vw" decoding="async" />
            <div
              className={`zn-mobile-dual-ov${b.align === "right" ? " zn-mobile-dual-ov--right" : ""}`}
            >
              <span className="zn-mobile-dual-tag">{b.tag}</span>
              <h2 className="zn-mobile-dual-title">
                {b.titleStrong}
                <em>{b.titleItalic}</em>
              </h2>
              <span className="zn-mobile-dual-cta">View collection</span>
            </div>
          </Link>
        ))}
      </section>

      <div className="zn-divider" />
    </>
  );
}