// src/app/components/sections/Hero.tsx
"use client";

import { fetchProducts } from "@/store/slices/productSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

// -- HERO SLIDES -------------------------------------------------------------
const heroSlides = [
  {
    img: "/zenmen_founder_hero.jpeg",
    tag: "Premium Tailoring · SS 2025",
    title: ["Crafted for the", "Modern", "Gentleman"],
    titleItalic: 1,
    subtitle:
      "Every stitch tells a story. Bespoke suits, shirts and sherwanis that redefine how you feel.",
    cta: "Begin Your Journey",
    ctaSecondary: "View Collection",
    textAlign: "left",
    overlayDir: "left",
  },
  {
    img: "zenmen_kurta.png",
    tag: "The Sherwani Edit · 2025",
    title: ["Royal Heritage,", "Modern", "Soul"],
    titleItalic: 1,
    subtitle:
      "Hand-embroidered sherwanis crafted for the discerning groom. Tradition reimagined.",
    cta: "Explore Sherwanis",
    ctaSecondary: "Book a Fitting",
    textAlign: "right",
    overlayDir: "right",
  },
  {
    img: "/zenmen_suit.png",
    tag: "Bespoke Suiting · AW 2025",
    title: ["Power Dressing,", "Perfected", "By Hand"],
    titleItalic: 1,
    subtitle:
      "From boardroom to ballroom — our bespoke suits command every room you enter.",
    cta: "Book a Fitting",
    ctaSecondary: "View Collection",
    textAlign: "center",
    overlayDir: "center",
  },
  {
    img: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=1800&q=90",
    tag: "Occasion Wear · Limited",
    title: ["Dressed for", "Extraordinary", "Moments"],
    titleItalic: 1,
    subtitle:
      "Statement coats and occasion wear for men who refuse to blend in.",
    cta: "View Collection",
    ctaSecondary: "Book Appointment",
    textAlign: "left",
    overlayDir: "left",
  },
  {
    img: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1800&q=90",
    tag: "Signature Eveningwear · 2025",
    title: ["Refined After", "Dark", "Elegance"],
    titleItalic: 1,
    subtitle:
      "Velvet tuxedos and black-tie tailoring designed for unforgettable entrances.",
    cta: "Shop Eveningwear",
    ctaSecondary: "View Lookbook",
    textAlign: "right",
    overlayDir: "right",
  },
  {
    img: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=1800&q=90",
    tag: "Winter Edit · Premium Wool",
    title: ["Tailored Layers", "For", "The Season"],
    titleItalic: 1,
    subtitle:
      "Premium wool overcoats and textures curated for polished winter style.",
    cta: "View Winter Edit",
    ctaSecondary: "Explore All",
    textAlign: "center",
    overlayDir: "center",
  },
];

// -- STATIC FALLBACK COLLAGE -------------------------------------------------
const collageItemsFallback = [
  {
    img: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&q=85",
    label: "Overcoats",
    desc: "Structured silhouettes, Italian wool",
    tag: "Featured",
    slug: "overcoats",
  },
  {
    img: "/zenmen_shirt.jpeg",
    label: "Dress Shirts",
    desc: "Egyptian cotton, 200-thread count",
    tag: null,
    slug: "shirts",
  },
  {
    img: "zenmen_blackcoat.jpeg",
    label: "Bespoke Suits",
    desc: "Full canvas construction",
    tag: null,
    slug: "suits",
  },
  {
    img: "/zenmen_kurta.png",
    label: "Kurtas",
    desc: "Hand-embroidered, heritage craft",
    tag: "Bestseller",
    slug: "kurtas",
  },
  {
    img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=85",
    label: "Accessories",
    desc: "Pocket squares, cufflinks & ties",
    tag: null,
    slug: "accessories",
  },
];

export default function Hero() {
  const dispatch = useAppDispatch();
  const { products, loading, loaded } = useAppSelector((s) => s.products);

  // ── Hero slide state ──────────────────────────────────────────────────────
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [animKey, setAnimKey] = useState(0);
  const transitioningRef = useRef(false);
  const currentRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Collage state ─────────────────────────────────────────────────────────
  const [collageStart, setCollageStart] = useState(0);
  const [prevCollageStart, setPrevCollageStart] = useState<number | null>(null);
  const [collageDir, setCollageDir] = useState<"left" | "right">("right");
  const collageTransRef = useRef(false);
  const collageTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!loading && !loaded) dispatch(fetchProducts());
  }, [dispatch, loading, loaded]);

  // ── Hero slide logic ──────────────────────────────────────────────────────
  const goTo = (idx: number) => {
    if (transitioningRef.current || idx === currentRef.current) return;
    setPrev(currentRef.current);
    setCurrent(idx);
    setAnimKey((k) => k + 1);
    currentRef.current = idx;
    transitioningRef.current = true;
    setTimeout(() => {
      setPrev(null);
      transitioningRef.current = false;
    }, 900);
  };
  const heroNext = () => goTo((currentRef.current + 1) % heroSlides.length);
  const heroPrev = () =>
    goTo((currentRef.current - 1 + heroSlides.length) % heroSlides.length);

  useEffect(() => {
    timerRef.current = setInterval(
      () => goTo((currentRef.current + 1) % heroSlides.length),
      6000,
    );
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ── Collage source from Redux products ────────────────────────────────────
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

  const VISIBLE = 5; // cards shown at once

  const collageVisible = useMemo(() => {
    if (collageSource.length <= VISIBLE) return collageSource;
    return Array.from(
      { length: VISIBLE },
      (_, i) => collageSource[(collageStart + i) % collageSource.length],
    );
  }, [collageSource, collageStart]);

  const collagePrevVisible = useMemo(() => {
    if (prevCollageStart === null || collageSource.length <= VISIBLE) return [];
    return Array.from(
      { length: VISIBLE },
      (_, i) => collageSource[(prevCollageStart + i) % collageSource.length],
    );
  }, [collageSource, prevCollageStart]);

  const canSlideCollage = collageSource.length > VISIBLE;

  const slideCollage = (dir: "left" | "right") => {
    if (!canSlideCollage || collageTransRef.current) return;
    collageTransRef.current = true;
    setCollageDir(dir);
    setPrevCollageStart(collageStart);
    setCollageStart((prev) =>
      dir === "right"
        ? (prev + VISIBLE) % collageSource.length
        : (prev - VISIBLE + collageSource.length) % collageSource.length,
    );
    setTimeout(() => {
      setPrevCollageStart(null);
      collageTransRef.current = false;
    }, 650);
  };

  // Auto-slide collage every 4.2s (stops after 3 cycles)
  const collageAutoCount = useRef(0);
  useEffect(() => {
    if (!canSlideCollage) return;
    collageAutoCount.current = 0;
    collageTimerRef.current = setInterval(() => {
      if (collageAutoCount.current >= 3) {
        clearInterval(collageTimerRef.current!);
        return;
      }
      collageAutoCount.current += 1;
      slideCollage("right");
    }, 4200);
    return () => {
      if (collageTimerRef.current) clearInterval(collageTimerRef.current);
    };
  }, [canSlideCollage, collageSource.length]);

  // ── Slide helpers ─────────────────────────────────────────────────────────
  const slide = heroSlides[current];
  const overlayGradient = {
    left: "linear-gradient(to right, rgba(10,8,6,0.82) 0%, rgba(10,8,6,0.45) 55%, rgba(10,8,6,0.08) 100%)",
    right:
      "linear-gradient(to left,  rgba(10,8,6,0.82) 0%, rgba(10,8,6,0.45) 55%, rgba(10,8,6,0.08) 100%)",
    center:
      "linear-gradient(to top,   rgba(10,8,6,0.82) 0%, rgba(10,8,6,0.38) 48%, rgba(10,8,6,0.08) 100%)",
  }[slide.overlayDir];

  return (
    <>
      <style>{`
        /* ── FONTS ── */
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Montserrat:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        /* ══════════════════════════════════════
           HERO
        ══════════════════════════════════════ */
        .fw-hero {
          width: 100%; height: 100vh; min-height: 560px;
          position: relative; overflow: hidden;
          background: #050A18; font-family: 'Montserrat', sans-serif;
        }
        .fw-slide-img {
          position: absolute; inset: 0; width: 100%; height: 100%;
          object-fit: cover; object-position: center;
          transition: opacity 0.9s ease; transform: scale(1.06);
        }
        .fw-slide-img.active  { opacity: 1; z-index: 1; animation: kenBurns 7s ease forwards; }
        .fw-slide-img.exiting { opacity: 0; z-index: 0; }
        .fw-slide-img.hidden  { opacity: 0; z-index: 0; }
        @keyframes kenBurns { from { transform: scale(1.06); } to { transform: scale(1.0); } }

        .fw-overlay {
          position: absolute; inset: 0; z-index: 2;
          display: flex; flex-direction: column; justify-content: flex-end;
          padding-bottom: 90px; transition: background 0.9s ease;
        }
        .fw-text { display: flex; flex-direction: column; padding: 0 24px; }

        .fw-topbar {
          position: absolute; top: 0; left: 0; right: 0; z-index: 5;
          display: flex; align-items: center; justify-content: space-between;
          padding: 28px 32px;
          background: linear-gradient(to bottom, rgba(10,8,6,0.7) 0%, transparent 100%);
        }

        .fw-tag {
          font-size: 9px; letter-spacing: 4px; color: #c9a84c;
          text-transform: uppercase; font-weight: 600; margin-bottom: 14px;
          opacity: 0; animation: fadeUp 0.6s 0.05s forwards;
        }
        .fw-title {
          font-family: 'Playfair Display', serif; font-weight: 700; color: #f5f0e8;
          line-height: 1.0; margin-bottom: 18px;
          opacity: 0; animation: fadeUp 0.7s 0.15s forwards;
        }
        .fw-title-line       { display: block; font-size: clamp(36px, 6.5vw, 96px); }
        .fw-title-line.italic { font-style: italic; color: #c9a84c; }

        .fw-subtitle {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(13px, 1.3vw, 18px); font-weight: 300; font-style: italic;
          color: rgba(245,240,232,0.75); line-height: 1.6; margin-bottom: 28px;
          max-width: 480px;
          opacity: 0; animation: fadeUp 0.7s 0.28s forwards;
        }
        .fw-cta-row {
          display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
          opacity: 0; animation: fadeUp 0.7s 0.4s forwards;
        }
        .fw-btn-primary {
          background: #c9a84c; color: #0a0806; font-family: 'Montserrat', sans-serif;
          font-size: 9px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;
          padding: 13px 28px; border: none; cursor: pointer; text-decoration: none;
          display: inline-block; transition: background 0.25s, transform 0.2s;
        }
        .fw-btn-primary:hover { background: #e2c06a; transform: translateY(-1px); }
        .fw-btn-outline {
          font-size: 9px; letter-spacing: 2.5px; text-transform: uppercase;
          color: rgba(245,240,232,0.65); text-decoration: none; font-weight: 500;
          border: 1px solid rgba(201,168,76,0.45); padding: 12px 22px;
          transition: all 0.25s; display: inline-block;
        }
        .fw-btn-outline:hover { color: #c9a84c; border-color: #c9a84c; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .fw-progress { position: absolute; bottom: 0; left: 0; right: 0; z-index: 5; height: 2px; background: rgba(201,168,76,0.15); }
        .fw-progress-bar { height: 100%; background: #c9a84c; animation: progress 6s linear infinite; }
        @keyframes progress { from { width: 0%; } to { width: 100%; } }

        .fw-counter {
          position: absolute; bottom: 32px; right: 32px; z-index: 5;
          font-size: 9px; letter-spacing: 3px; color: rgba(201,168,76,0.7); font-weight: 500;
        }
        .fw-arrow {
          position: absolute; top: 50%; z-index: 5; transform: translateY(-50%);
          width: 44px; height: 44px; border: 1px solid rgba(201,168,76,0.4);
          background: rgba(10,8,6,0.5); color: #c9a84c; cursor: pointer; font-size: 16px;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.25s, border-color 0.25s; backdrop-filter: blur(4px);
        }
        .fw-arrow:hover { background: rgba(201,168,76,0.2); border-color: #c9a84c; }
        .fw-arrow.left  { left: 20px; }
        .fw-arrow.right { right: 20px; }

        .fw-dots { position: absolute; bottom: 36px; left: 50%; transform: translateX(-50%); z-index: 5; display: flex; align-items: center; gap: 10px; }
        .fw-dot  { width: 20px; height: 2px; background: rgba(201,168,76,0.3); cursor: pointer; transition: background 0.3s, width 0.3s; }
        .fw-dot.active { background: #c9a84c; width: 40px; }

        .fw-scroll-cue {
          position: absolute; bottom: 32px; left: 32px; z-index: 5;
          display: flex; align-items: center; gap: 10px;
          font-size: 8px; letter-spacing: 3px; text-transform: uppercase;
          color: rgba(245,240,232,0.35); font-weight: 500;
        }
        .fw-scroll-line { width: 28px; height: 1px; background: rgba(201,168,76,0.4); }
        .fw-vert-text {
          position: absolute; right: 16px; top: 50%; z-index: 5;
          transform: translateY(-50%) rotate(90deg);
          font-size: 8px; letter-spacing: 4px; text-transform: uppercase;
          color: rgba(201,168,76,0.35); white-space: nowrap; pointer-events: none;
        }

        /* ══════════════════════════════════════
           GOLD DIVIDER
        ══════════════════════════════════════ */
        .gold-divider {
          width: 100%; height: 1px;
          background: linear-gradient(to right, transparent, #c9a84c 30%, #c9a84c 70%, transparent);
          opacity: 0.3;
        }

        /* ══════════════════════════════════════
           EDITORIAL BANNERS
        ══════════════════════════════════════ */
        .banners-section { width: 100%; background: #0a0806; font-family: 'Montserrat', sans-serif; }

        .banner-full { position: relative; width: 100%; height: 460px; overflow: hidden; }
        .banner-full img { width: 100%; height: 100%; object-fit: cover; object-position: center; filter: brightness(0.55) contrast(1.08); transition: transform 8s ease; }
        .banner-full:hover img { transform: scale(1.03); }
        .banner-full-overlay {
          position: absolute; inset: 0; display: flex; flex-direction: column;
          justify-content: flex-end; align-items: flex-start;
          padding: clamp(24px, 5vw, 48px) clamp(20px, 6vw, 60px);
        }
        .banner-full-tag   { font-size: 9px; letter-spacing: 4px; color: #c9a84c; text-transform: uppercase; font-weight: 600; margin-bottom: 10px; }
        .banner-full-title { font-family: 'Playfair Display', serif; font-size: clamp(28px, 5vw, 52px); font-weight: 700; color: #f5f0e8; line-height: 1.05; margin-bottom: 14px; }
        .banner-full-title em { font-style: italic; color: #c9a84c; }
        .banner-full-sub   { font-family: 'Cormorant Garamond', serif; font-size: clamp(14px, 1.5vw, 16px); font-weight: 300; font-style: italic; color: rgba(245,240,232,0.7); margin-bottom: 24px; max-width: 500px; line-height: 1.5; }
        .banner-btn-primary { display: inline-block; background: #c9a84c; color: #0a0806; font-family: 'Montserrat', sans-serif; font-size: 9px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; padding: 12px 26px; border: none; cursor: pointer; transition: background 0.25s; text-decoration: none; }
        .banner-btn-primary:hover { background: #e2c06a; }
        .banner-btn-ghost   { display: inline-block; margin-left: 18px; font-size: 9px; letter-spacing: 2.5px; text-transform: uppercase; color: rgba(245,240,232,0.55); border-bottom: 1px solid rgba(201,168,76,0.4); padding-bottom: 2px; cursor: pointer; transition: color 0.2s; text-decoration: none; }
        .banner-btn-ghost:hover { color: #c9a84c; }

        .banner-duo { display: grid; grid-template-columns: 1fr 1fr; gap: 3px; }
        .duo-cell   { position: relative; height: 480px; overflow: hidden; cursor: pointer; }
        .duo-cell img { width: 100%; height: 100%; object-fit: cover; object-position: center top; filter: brightness(0.58) contrast(1.08); transition: transform 7s ease, filter 0.5s; }
        .duo-cell:hover img { transform: scale(1.05); filter: brightness(0.72) contrast(1.08); }
        .duo-overlay {
          position: absolute; inset: 0; display: flex; flex-direction: column;
          justify-content: flex-end; padding: clamp(20px, 4vw, 36px);
          background: linear-gradient(to top, rgba(10,8,6,0.85) 0%, transparent 60%);
        }
        .duo-tag   { font-size: 8px; letter-spacing: 3.5px; color: #c9a84c; text-transform: uppercase; font-weight: 600; margin-bottom: 8px; }
        .duo-title { font-family: 'Playfair Display', serif; font-size: clamp(22px, 3vw, 34px); font-weight: 700; color: #f5f0e8; line-height: 1.1; margin-bottom: 8px; }
        .duo-title em { font-style: italic; color: #c9a84c; }
        .duo-sub   { font-family: 'Cormorant Garamond', serif; font-size: clamp(13px, 1.4vw, 14px); font-style: italic; color: rgba(245,240,232,0.6); margin-bottom: 18px; }
        .duo-cta   { display: inline-block; font-size: 9px; letter-spacing: 2.5px; text-transform: uppercase; color: #c9a84c; border-bottom: 1px solid rgba(201,168,76,0.5); padding-bottom: 2px; cursor: pointer; }

        /* ══════════════════════════════════════
           COLLECTION COLLAGE — PREMIUM
        ══════════════════════════════════════ */
        .collage-section {
          width: 100%; background: #050A18;
          border-top: 1px solid rgba(201,168,76,0.2);
          font-family: 'Montserrat', sans-serif;
          padding-bottom: 48px;
        }
        .collage-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: clamp(20px, 4vw, 28px) clamp(16px, 4vw, 32px) 20px;
        }
        .collage-title         { font-family: 'Playfair Display', serif; font-size: clamp(22px, 3vw, 28px); font-weight: 700; color: #f5f0e8; letter-spacing: 1px; }
        .collage-title em      { color: #c9a84c; font-style: italic; }
        .collage-subtitle      { font-family: 'Playfair Display', serif; font-size: 11px; letter-spacing: 3px; color: rgba(201,168,76,0.7); text-transform: uppercase; font-weight: 500; }

        /* Arrow buttons */
        .collage-arrows        { display: flex; align-items: center; gap: 10px; }
        .collage-arrow-btn {
          width: 40px; height: 40px; border: 1px solid rgba(201,168,76,0.4);
          background: rgba(10,8,6,0.6); color: #c9a84c; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; transition: all 0.25s; backdrop-filter: blur(4px);
          flex-shrink: 0;
        }
        .collage-arrow-btn:hover         { background: rgba(201,168,76,0.18); border-color: #c9a84c; }
        .collage-arrow-btn:disabled      { opacity: 0.25; cursor: not-allowed; }

        /* Viewport + animation */
        .collage-viewport      { position: relative; overflow: hidden; margin: 0 3px; }
        .collage-grid-track {
          display: grid;
          grid-template-columns: 1.1fr 1fr 1fr 1.4fr 1fr;
          grid-template-rows: clamp(240px, 28vw, 380px);
          gap: 3px;
          width: 100%;
        }
        .collage-grid-track.enter-from-right { animation: collageEnterRight 650ms cubic-bezier(.22,.61,.36,1) both; }
        .collage-grid-track.enter-from-left  { animation: collageEnterLeft  650ms cubic-bezier(.22,.61,.36,1) both; }
        .collage-grid-track.exit-to-left {
          position: absolute; inset: 0;
          animation: collageExitLeft  650ms cubic-bezier(.22,.61,.36,1) both;
        }
        .collage-grid-track.exit-to-right {
          position: absolute; inset: 0;
          animation: collageExitRight 650ms cubic-bezier(.22,.61,.36,1) both;
        }
        @keyframes collageEnterRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes collageEnterLeft  { from { transform: translateX(-100%);} to { transform: translateX(0); } }
        @keyframes collageExitLeft   { from { transform: translateX(0); } to { transform: translateX(-100%); } }
        @keyframes collageExitRight  { from { transform: translateX(0); } to { transform: translateX(100%);  } }

        /* Collage cards */
        .collage-cell          { position: relative; overflow: hidden; cursor: pointer; }
        .collage-cell img      { width: 100%; height: 100%; object-fit: cover; object-position: top center; filter: brightness(0.65) contrast(1.08); transition: filter 0.5s, transform 0.6s; }
        .collage-cell:hover img { filter: brightness(0.9) contrast(1.08); transform: scale(1.07); }

        .collage-cell-overlay  {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(10,8,6,0.82) 0%, rgba(10,8,6,0.1) 55%, transparent 100%);
          display: flex; flex-direction: column; justify-content: flex-end;
          padding: clamp(10px, 2vw, 16px);
          transition: background 0.4s;
        }

        /* Hover "View Collection" reveal */
        .collage-hover-cta {
          position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.35s;
          background: rgba(10,8,6,0.25);
        }
        .collage-cell:hover .collage-hover-cta { opacity: 1; }
        .collage-hover-cta-pill {
          font-size: 9px; letter-spacing: 3px; text-transform: uppercase; font-weight: 700;
          color: #0a0806; background: #c9a84c; padding: 10px 20px;
          border: none; cursor: pointer; white-space: nowrap;
          transition: background 0.2s;
        }
        .collage-hover-cta-pill:hover { background: #e2c06a; }

        .collage-cell-label    { font-family: 'Playfair Display', serif; font-size: clamp(13px, 2vw, 17px); color: #f5f0e8; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 2px; }
        .collage-cell-desc     { font-size: 8px; letter-spacing: 2px; color: #c9a84c; text-transform: uppercase; font-weight: 600; }
        .collage-cell-tag      { position: absolute; top: 10px; left: 10px; font-size: 7px; letter-spacing: 2px; font-weight: 700; text-transform: uppercase; background: rgba(201,168,76,0.15); border: 1px solid rgba(201,168,76,0.4); color: #c9a84c; padding: 3px 8px; }

        /* Dots indicator */
        .collage-dots          { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 20px; }
        .collage-dot           { width: 16px; height: 2px; background: rgba(201,168,76,0.25); cursor: pointer; transition: all 0.3s; }
        .collage-dot.active    { background: #c9a84c; width: 32px; }

        /* View Full Collection button */
        .collage-view-btn-wrap { display: flex; justify-content: center; margin-top: 32px; }
        .collage-view-btn {
          display: inline-flex; align-items: center; gap: 12px;
          font-size: 9px; letter-spacing: 3.5px; text-transform: uppercase; font-weight: 700;
          color: #c9a84c; border: 1px solid rgba(201,168,76,0.45);
          padding: 14px 36px; background: transparent; cursor: pointer;
          text-decoration: none; transition: all 0.3s;
        }
        .collage-view-btn:hover { background: #c9a84c; color: #0a0806; border-color: #c9a84c; }
        .collage-view-btn-arrow { font-size: 14px; transition: transform 0.3s; }
        .collage-view-btn:hover .collage-view-btn-arrow { transform: translateX(4px); }

        /* ══════════════════════════════════════
           MOBILE RESPONSIVE
        ══════════════════════════════════════ */
        @media (max-width: 768px) {
          /* Hero */
          .fw-overlay     { padding-bottom: 70px; }
          .fw-text        { padding: 0 20px !important; }
          .fw-subtitle    { max-width: 100% !important; text-align: inherit; }
          .fw-scroll-cue  { display: none; }
          .fw-vert-text   { display: none; }
          .fw-counter     { bottom: 20px; right: 20px; }
          .fw-arrow       { width: 36px; height: 36px; font-size: 14px; }
          .fw-arrow.left  { left: 10px; }
          .fw-arrow.right { right: 10px; }
          .fw-topbar      { padding: 20px 16px; }

          /* Banners */
          .banner-duo     { grid-template-columns: 1fr; }
          .duo-cell       { height: 300px; }
          .banner-full    { height: 320px; }
          .banner-full-overlay { padding: 20px; }
          .banner-btn-ghost { margin-left: 0; margin-top: 10px; display: block; }

          /* Collage — stack to 2 cols on mobile */
          .collage-grid-track {
            grid-template-columns: 1fr 1fr !important;
            grid-template-rows: 180px 180px 180px !important;
            gap: 2px;
          }
          /* Make first cell span full width on mobile */
          .collage-grid-track .collage-cell:first-child {
            grid-column: 1 / 3;
            grid-row: 1;
          }
          .collage-header { flex-direction: column; align-items: flex-start; gap: 12px; }
          .collage-arrows { align-self: flex-end; }
        }

        @media (max-width: 480px) {
          .fw-cta-row { flex-direction: column; align-items: flex-start; gap: 10px; }
          .fw-btn-outline { width: 100%; text-align: center; }
          .collage-grid-track {
            grid-template-columns: 1fr !important;
            grid-template-rows: repeat(5, 160px) !important;
          }
          .collage-grid-track .collage-cell:first-child {
            grid-column: 1; grid-row: 1;
          }
          .duo-cell { height: 240px; }
        }
      `}</style>

      {/* ══════════════════════════════════════
          SECTION 1 — CINEMATIC HERO
      ══════════════════════════════════════ */}
      <section className="fw-hero" id="home">
        {heroSlides.map((s, i) => (
          <img
            key={i}
            src={s.img}
            alt={s.tag}
            className={`fw-slide-img ${i === current ? "active" : i === prev ? "exiting" : "hidden"}`}
          />
        ))}

        <div className="fw-topbar" />

        <div className="fw-overlay" style={{ background: overlayGradient }}>
          <div
            className="fw-text"
            key={animKey}
            style={{
              alignItems:
                slide.textAlign === "left"
                  ? "flex-start"
                  : slide.textAlign === "right"
                    ? "flex-end"
                    : "center",
              textAlign: slide.textAlign as "left" | "center" | "right",
              paddingLeft:
                slide.textAlign === "left"
                  ? "clamp(24px,6vw,80px)"
                  : slide.textAlign === "right"
                    ? "40%"
                    : "15%",
              paddingRight:
                slide.textAlign === "right"
                  ? "clamp(24px,6vw,80px)"
                  : slide.textAlign === "left"
                    ? "40%"
                    : "15%",
            }}
          >
            <div className="fw-tag">{slide.tag}</div>
            <h1 className="fw-title">
              <span className="fw-title-line">{slide.title[0]}</span>
              <span
                className={`fw-title-line${slide.titleItalic === 1 ? " italic" : ""}`}
              >
                {slide.title[1]}
              </span>
              <span
                className={`fw-title-line${slide.titleItalic === 2 ? " italic" : ""}`}
              >
                {slide.title[2]}
              </span>
            </h1>
            <p
              className="fw-subtitle"
              style={
                slide.textAlign === "center" ? { textAlign: "center" } : {}
              }
            >
              {slide.subtitle}
            </p>
            <div
              className="fw-cta-row"
              style={{
                justifyContent:
                  slide.textAlign === "left"
                    ? "flex-start"
                    : slide.textAlign === "right"
                      ? "flex-end"
                      : "center",
              }}
            >
              <a href="#contact" className="fw-btn-primary">
                {slide.cta}
              </a>
              <Link href="/collection" className="fw-btn-outline">
                {slide.ctaSecondary}
              </Link>
            </div>
          </div>
        </div>

        <button className="fw-arrow left" onClick={heroPrev}>
          &#8592;
        </button>
        <button className="fw-arrow right" onClick={heroNext}>
          &#8594;
        </button>

        <div className="fw-dots">
          {heroSlides.map((_, i) => (
            <div
              key={i}
              className={`fw-dot ${i === current ? "active" : ""}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>

        <div className="fw-counter">
          {String(current + 1).padStart(2, "0")} /{" "}
          {String(heroSlides.length).padStart(2, "0")}
        </div>

        <div className="fw-scroll-cue">
          <span className="fw-scroll-line" />
          Scroll to Explore
        </div>

        <div className="fw-vert-text">Bespoke · Premium · Timeless</div>

        <div className="fw-progress">
          <div className="fw-progress-bar" key={animKey} />
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 2 — EDITORIAL BANNERS
      ══════════════════════════════════════ */}
      <div className="banners-section">
        <div className="gold-divider" />

        {/* Duo banner */}
        <div className="banner-duo">
          <div className="duo-cell">
            <img
              src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=900&q=90"
              alt="Overcoats"
              style={{ objectPosition: "center 35%" }}
            />
            <div className="duo-overlay">
              <div className="duo-tag">Winter Edit · Premium Wool</div>
              <h3 className="duo-title">
                Tailored
                <br />
                <em>Overcoats</em>
              </h3>
              <p className="duo-sub">
                Italian wool layers for polished winter presence.
              </p>
              <Link href="/collection?category=Overcoats" className="duo-cta">
                View Winter Edit →
              </Link>
            </div>
          </div>
          <div className="duo-cell">
            <img
              src="/zenmen_shirt_black.jpeg"
              alt="Shirts"
              style={{ objectPosition: "center 45%" }}
            />
            <div className="duo-overlay">
              <div className="duo-tag">Shirt Bar · Luxury Cotton</div>
              <h3 className="duo-title">
                Crisp
                <br />
                <em>Shirts</em>
              </h3>
              <p className="duo-sub">
                Egyptian cotton, built to impress from dawn to dusk.
              </p>
              <Link href="/collection?category=Shirts" className="duo-cta">
                Browse Shirts →
              </Link>
            </div>
          </div>
        </div>

        <div className="gold-divider" />

        {/* Full-width centered banner */}
        <div className="banner-full">
          <img
            src="https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=1600&q=90"
            alt="Eveningwear"
            style={{ objectPosition: "center 20%" }}
          />
          <div
            className="banner-full-overlay"
            style={{ alignItems: "center", textAlign: "center" }}
          >
            <div className="banner-full-tag">
              Signature Eveningwear · Limited Edition
            </div>
            <h2 className="banner-full-title" style={{ textAlign: "center" }}>
              Dressed for
              <br />
              <em>Extraordinary</em> Moments
            </h2>
            <p
              className="banner-full-sub"
              style={{
                textAlign: "center",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              Velvet tuxedos and black-tie tailoring designed for unforgettable
              entrances. Limited to 40 pieces per season.
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <Link href="/collection" className="banner-btn-primary">
                Shop Eveningwear
              </Link>
              <Link
                href="/contact"
                className="banner-btn-ghost"
                style={{ marginLeft: 0 }}
              >
                View Lookbook
              </Link>
            </div>
          </div>
        </div>

        <div className="gold-divider" />
      </div>

      {/* ══════════════════════════════════════
          SECTION 3 — PREMIUM COLLECTION COLLAGE
      ══════════════════════════════════════ */}
      <section id="collection" className="collage-section">
        {/* Header row: title + arrows */}
        <div className="collage-header">
          <div>
            <h2 className="collage-title">
              The <em>Collection</em>
            </h2>
            <p className="collage-subtitle" style={{ marginTop: "6px" }}>
              Explore Every Category
            </p>
          </div>
          {/* Arrows always visible — clickable */}
          <div className="collage-arrows">
            <button
              className="collage-arrow-btn"
              onClick={() => slideCollage("left")}
              disabled={!canSlideCollage}
              aria-label="Previous collection set"
            >
              &#8592;
            </button>
            <button
              className="collage-arrow-btn"
              onClick={() => slideCollage("right")}
              disabled={!canSlideCollage}
              aria-label="Next collection set"
            >
              &#8594;
            </button>
          </div>
        </div>

        {/* Sliding viewport */}
        <div className="collage-viewport">
          {/* Exiting track */}
          {prevCollageStart !== null && (
            <div
              className={`collage-grid-track ${collageDir === "right" ? "exit-to-left" : "exit-to-right"}`}
            >
              {collagePrevVisible.map((item, i) => (
                <div className="collage-cell" key={`prev-${i}`}>
                  <img src={item.img} alt={item.label} />
                  <div className="collage-cell-overlay">
                    <div className="collage-cell-label">{item.label}</div>
                    <div className="collage-cell-desc">{item.desc}</div>
                  </div>
                  {item.tag && (
                    <div className="collage-cell-tag">{item.tag}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Entering track */}
          <div
            className={`collage-grid-track ${
              prevCollageStart !== null
                ? collageDir === "right"
                  ? "enter-from-right"
                  : "enter-from-left"
                : ""
            }`}
            key={`${collageStart}-${collageSource.length}`}
          >
            {collageVisible.map((item, i) => (
              <Link
                key={i}
                href={item.slug ? `/collection/${item.slug}` : "/collection"}
                className="collage-cell"
              >
                <img src={item.img} alt={item.label} />
                <div className="collage-cell-overlay">
                  <div className="collage-cell-label">{item.label}</div>
                  <div className="collage-cell-desc">{item.desc}</div>
                </div>
                {item.tag && <div className="collage-cell-tag">{item.tag}</div>}
                {/* Hover CTA overlay */}
                <div className="collage-hover-cta">
                  <span className="collage-hover-cta-pill">
                    View Collection
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Dot indicators */}
        {canSlideCollage && (
          <div className="collage-dots">
            {Array.from({
              length: Math.ceil(collageSource.length / VISIBLE),
            }).map((_, i) => (
              <div
                key={i}
                className={`collage-dot ${Math.floor(collageStart / VISIBLE) === i ? "active" : ""}`}
                onClick={() => {
                  if (collageTransRef.current) return;
                  const target = i * VISIBLE;
                  const dir = target > collageStart ? "right" : "left";
                  collageTransRef.current = true;
                  setCollageDir(dir);
                  setPrevCollageStart(collageStart);
                  setCollageStart(target);
                  setTimeout(() => {
                    setPrevCollageStart(null);
                    collageTransRef.current = false;
                  }, 650);
                }}
              />
            ))}
          </div>
        )}

        {/* View Full Collection CTA */}
        <div className="collage-view-btn-wrap">
          <Link href="/collection" className="collage-view-btn">
            View Full Collection
            <span className="collage-view-btn-arrow">→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
