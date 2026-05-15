// src/app/components/sections/Hero.tsx
"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProducts } from "@/store/slices/productSlice";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

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
    title: ["Refined", "Evening", "Elegance"],
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
    left: "linear-gradient(to right, rgba(15,23,42,0.5) 0%, rgba(15,23,42,0.18) 48%, transparent 100%)",
    right:
      "linear-gradient(to left, rgba(15,23,42,0.5) 0%, rgba(15,23,42,0.18) 48%, transparent 100%)",
    center:
      "linear-gradient(to top, rgba(15,23,42,0.58) 0%, rgba(15,23,42,0.12) 42%, transparent 72%)",
  }[slide.overlayDir];

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        /* ══════════════════════════════════════
           HERO — light ZENmen theme
        ══════════════════════════════════════ */
        .fw-hero {
          width: 100%; height: 100vh; min-height: 580px;
          position: relative; overflow: hidden;
          background: #f1f5f9;
          font-family: var(--font-montserrat), system-ui, sans-serif;
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
          background: linear-gradient(to bottom, rgba(15,23,42,0.35) 0%, transparent 100%);
        }

        .fw-tag {
          font-size: 9px; letter-spacing: 4px; color: #7da8c7;
          text-transform: uppercase; font-weight: 600; margin-bottom: 14px;
          opacity: 0; animation: fadeUp 0.6s 0.05s forwards;
        }
        .fw-title {
          font-family: var(--font-playfair), Georgia, serif; font-weight: 700; color: #f8fafc;
          line-height: 1.0; margin-bottom: 18px;
          opacity: 0; animation: fadeUp 0.7s 0.15s forwards;
        }
        .fw-title-line       { display: block; font-size: clamp(36px, 6.5vw, 96px); }
        .fw-title-line.italic { font-style: italic; color: #7da8c7; }

        .fw-subtitle {
          font-family: var(--font-cormorant), Georgia, serif;
          font-size: clamp(13px, 1.3vw, 18px); font-weight: 300; font-style: italic;
          color: rgba(248,250,252,0.88); line-height: 1.6; margin-bottom: 28px;
          max-width: 480px;
          opacity: 0; animation: fadeUp 0.7s 0.28s forwards;
        }
        .fw-cta-row {
          display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
          opacity: 0; animation: fadeUp 0.7s 0.4s forwards;
        }
        .fw-btn-primary {
          background: #7da8c7; color: #ffffff; font-family: var(--font-montserrat), sans-serif;
          font-size: 9px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;
          padding: 13px 28px; border: none; cursor: pointer; text-decoration: none;
          display: inline-block; transition: background 0.25s, transform 0.2s;
        }
        .fw-btn-primary:hover { background: #5f92b5; transform: translateY(-1px); }
        .fw-btn-outline {
          font-size: 9px; letter-spacing: 2.5px; text-transform: uppercase;
          color: rgba(248,250,252,0.92); text-decoration: none; font-weight: 500;
          border: 1px solid rgba(255,255,255,0.35); padding: 12px 22px;
          background: rgba(15,23,42,0.2);
          transition: all 0.25s; display: inline-block;
        }
        .fw-btn-outline:hover { color: #fff; border-color: #7da8c7; background: rgba(125,168,199,0.25); }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .fw-progress { position: absolute; bottom: 0; left: 0; right: 0; z-index: 5; height: 2px; background: rgba(255,255,255,0.15); }
        .fw-progress-bar { height: 100%; background: #7da8c7; animation: progress 6s linear infinite; }
        @keyframes progress { from { width: 0%; } to { width: 100%; } }

        .fw-counter {
          position: absolute; bottom: 32px; right: 32px; z-index: 5;
          font-size: 9px; letter-spacing: 3px; color: rgba(248,250,252,0.55); font-weight: 500;
        }
        .fw-arrow {
          position: absolute; top: 50%; z-index: 5; transform: translateY(-50%);
          width: 44px; height: 44px; border: 1px solid rgba(255,255,255,0.25);
          background: rgba(15,23,42,0.45); color: #f8fafc; cursor: pointer; font-size: 16px;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.25s, border-color 0.25s, color 0.2s; backdrop-filter: blur(8px);
        }
        .fw-arrow:hover { background: rgba(125,168,199,0.35); border-color: #7da8c7; color: #fff; }
        .fw-arrow.left  { left: 20px; }
        .fw-arrow.right { right: 20px; }

        .fw-dots { position: absolute; bottom: 36px; left: 50%; transform: translateX(-50%); z-index: 5; display: flex; align-items: center; gap: 10px; }
        .fw-dot  { width: 20px; height: 2px; background: rgba(255,255,255,0.28); cursor: pointer; transition: background 0.3s, width 0.3s; }
        .fw-dot.active { background: #7da8c7; width: 40px; }

        .fw-scroll-cue {
          position: absolute; bottom: 32px; left: 32px; z-index: 5;
          display: flex; align-items: center; gap: 10px;
          font-size: 8px; letter-spacing: 3px; text-transform: uppercase;
          color: rgba(248,250,252,0.45); font-weight: 500;
        }
        .fw-scroll-line { width: 28px; height: 1px; background: rgba(125,168,199,0.55); }
        .fw-vert-text {
          position: absolute; right: 16px; top: 50%; z-index: 5;
          transform: translateY(-50%) rotate(90deg);
          font-size: 8px; letter-spacing: 4px; text-transform: uppercase;
          color: rgba(248,250,252,0.4); white-space: nowrap; pointer-events: none;
        }

        /* ══════════════════════════════════════
           ACCENT HAIRLINE
        ══════════════════════════════════════ */
        .gold-divider {
          width: 100%; height: 1px;
          background: linear-gradient(to right, transparent, rgba(125,168,199,0.55) 28%, rgba(125,168,199,0.55) 72%, transparent);
          opacity: 0.85;
        }

        /* ══════════════════════════════════════
           EDITORIAL BANNERS — light
        ══════════════════════════════════════ */
        .banners-section { width: 100%; background: #f8fafc; font-family: var(--font-montserrat), system-ui, sans-serif; }

        .banner-full { position: relative; width: 100%; min-height: clamp(420px, 72vh, 820px); height: 72vh; max-height: 900px; overflow: hidden; }
        .banner-full img { width: 100%; height: 100%; object-fit: cover; object-position: center; transition: transform 8s ease; }
        .banner-full:hover img { transform: scale(1.03); }
        .banner-full-overlay {
          position: absolute; inset: 0; display: flex; flex-direction: column;
          justify-content: flex-end; align-items: flex-start;
          padding: clamp(28px, 5vw, 56px) clamp(20px, 6vw, 60px);
          background: linear-gradient(to top, rgba(15,23,42,0.82) 0%, rgba(15,23,42,0.2) 50%, transparent 78%);
        }
        .banner-full-tag   { font-size: 9px; letter-spacing: 4px; color: #7da8c7; text-transform: uppercase; font-weight: 600; margin-bottom: 10px; }
        .banner-full-title { font-family: var(--font-playfair), Georgia, serif; font-size: clamp(30px, 5.2vw, 56px); font-weight: 700; color: #f8fafc; line-height: 1.05; margin-bottom: 14px; }
        .banner-full-title em { font-style: italic; color: #7da8c7; }
        .banner-full-sub   { font-family: var(--font-cormorant), Georgia, serif; font-size: clamp(14px, 1.5vw, 17px); font-weight: 300; font-style: italic; color: rgba(248,250,252,0.78); margin-bottom: 24px; max-width: 520px; line-height: 1.55; }
        .banner-btn-primary { display: inline-block; background: #7da8c7; color: #ffffff; font-family: var(--font-montserrat), sans-serif; font-size: 9px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; padding: 12px 26px; border: none; cursor: pointer; transition: background 0.25s; text-decoration: none; }
        .banner-btn-primary:hover { background: #5f92b5; }
        .banner-btn-ghost   { display: inline-block; margin-left: 18px; font-size: 9px; letter-spacing: 2.5px; text-transform: uppercase; color: rgba(248,250,252,0.85); border-bottom: 1px solid rgba(125,168,199,0.65); padding-bottom: 2px; cursor: pointer; transition: color 0.2s; text-decoration: none; }
        .banner-btn-ghost:hover { color: #7da8c7; }

        .banner-duo { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(8px, 1.2vw, 14px); padding: 0 clamp(8px, 1.2vw, 14px); }
        .duo-cell   { position: relative; min-height: clamp(380px, 58vh, 720px); height: 58vh; max-height: 760px; overflow: hidden; cursor: pointer; border-radius: 2px; }
        .duo-cell img { width: 100%; height: 100%; object-fit: cover; object-position: center top; transition: transform 7s ease; }
        .duo-cell:hover img { transform: scale(1.05); }
        .duo-overlay {
          position: absolute; inset: 0; display: flex; flex-direction: column;
          justify-content: flex-end; padding: clamp(24px, 4vw, 44px);
          background: linear-gradient(to top, rgba(15,23,42,0.82) 0%, rgba(15,23,42,0.18) 52%, transparent 100%);
        }
        .duo-tag   { font-size: 8px; letter-spacing: 3.5px; color: #7da8c7; text-transform: uppercase; font-weight: 600; margin-bottom: 8px; }
        .duo-title { font-family: var(--font-playfair), Georgia, serif; font-size: clamp(24px, 3.2vw, 40px); font-weight: 700; color: #f8fafc; line-height: 1.1; margin-bottom: 8px; }
        .duo-title em { font-style: italic; color: #7da8c7; }
        .duo-sub   { font-family: var(--font-cormorant), Georgia, serif; font-size: clamp(13px, 1.4vw, 15px); font-style: italic; color: rgba(248,250,252,0.78); margin-bottom: 18px; }
        .duo-cta   { display: inline-block; font-size: 9px; letter-spacing: 2.5px; text-transform: uppercase; color: #7da8c7; font-weight: 600; border-bottom: 2px solid rgba(125,168,199,0.7); padding-bottom: 2px; cursor: pointer; }

        /* ══════════════════════════════════════
           COLLECTION COLLAGE — bento, tall, light chrome
        ══════════════════════════════════════ */
        .collage-section {
          width: 100%; background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          font-family: var(--font-montserrat), system-ui, sans-serif;
          padding-bottom: clamp(40px, 6vw, 72px);
        }
        .collage-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: clamp(24px, 4vw, 40px) clamp(16px, 4vw, 40px) clamp(12px, 2vw, 20px);
        }
        .collage-title         { font-family: var(--font-playfair), Georgia, serif; font-size: clamp(26px, 3.5vw, 40px); font-weight: 700; color: #0f172a; letter-spacing: 0.5px; }
        .collage-title em      { color: #7da8c7; font-style: italic; }
        .collage-subtitle      { font-family: var(--font-montserrat), sans-serif; font-size: 10px; letter-spacing: 0.28em; color: rgba(15,23,42,0.5); text-transform: uppercase; font-weight: 600; }

        .collage-arrows        { display: flex; align-items: center; gap: 10px; }
        .collage-arrow-btn {
          width: 44px; height: 44px; border: 1px solid rgba(15,23,42,0.12);
          background: #ffffff; color: #0f172a; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; transition: all 0.25s;
          flex-shrink: 0;
        }
        .collage-arrow-btn:hover         { border-color: #7da8c7; color: #7da8c7; }
        .collage-arrow-btn:disabled      { opacity: 0.3; cursor: not-allowed; }

        .collage-viewport      { position: relative; overflow: hidden; margin: 0 clamp(8px, 1.5vw, 20px); min-height: min(78vh, 900px); }
        .collage-grid-track {
          display: grid;
          grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr) minmax(0, 1fr);
          grid-template-rows: minmax(280px, 44vh) minmax(200px, 32vh);
          gap: clamp(8px, 1.1vw, 14px);
          width: 100%;
        }
        .collage-grid-track .collage-cell:nth-child(1) {
          grid-column: 1;
          grid-row: 1 / span 2;
        }
        .collage-grid-track .collage-cell:nth-child(2) { grid-column: 2; grid-row: 1; }
        .collage-grid-track .collage-cell:nth-child(3) { grid-column: 3; grid-row: 1; }
        .collage-grid-track .collage-cell:nth-child(4) { grid-column: 2; grid-row: 2; }
        .collage-grid-track .collage-cell:nth-child(5) { grid-column: 3; grid-row: 2; }

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

        .collage-cell          { position: relative; overflow: hidden; cursor: pointer; border-radius: 3px; border: 1px solid rgba(15,23,42,0.06); background: #e2e8f0; }
        .collage-cell img      { width: 100%; height: 100%; object-fit: cover; object-position: center top; transition: transform 0.75s cubic-bezier(.22,.61,.36,1); }
        .collage-cell:hover img { transform: scale(1.06); }

        .collage-cell-overlay  {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(15,23,42,0.78) 0%, rgba(15,23,42,0.2) 50%, transparent 100%);
          display: flex; flex-direction: column; justify-content: flex-end;
          padding: clamp(14px, 2.2vw, 22px);
          transition: background 0.4s;
        }
        .collage-cell:hover .collage-cell-overlay {
          background: linear-gradient(to top, rgba(15,23,42,0.88) 0%, rgba(15,23,42,0.35) 55%, transparent 100%);
        }

        .collage-hover-cta {
          position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.35s;
          background: rgba(15,23,42,0.12);
        }
        .collage-cell:hover .collage-hover-cta { opacity: 1; }
        .collage-hover-cta-pill {
          font-size: 9px; letter-spacing: 3px; text-transform: uppercase; font-weight: 700;
          color: #0f172a; background: #ffffff; padding: 12px 22px;
          border: 1px solid rgba(125,168,199,0.5);
          cursor: pointer; white-space: nowrap;
          transition: background 0.2s, color 0.2s;
        }
        .collage-hover-cta-pill:hover { background: #7da8c7; color: #fff; border-color: #7da8c7; }

        .collage-cell-label    { font-family: var(--font-playfair), Georgia, serif; font-size: clamp(15px, 1.8vw, 22px); color: #f8fafc; font-weight: 700; letter-spacing: 0.3px; margin-bottom: 4px; text-shadow: 0 1px 12px rgba(0,0,0,0.35); }
        .collage-cell-desc     { font-size: 8px; letter-spacing: 0.2em; color: rgba(248,250,252,0.88); text-transform: uppercase; font-weight: 600; }
        .collage-cell-tag      { position: absolute; top: 12px; left: 12px; font-size: 7px; letter-spacing: 2px; font-weight: 700; text-transform: uppercase; background: rgba(248,250,252,0.95); border: 1px solid rgba(125,168,199,0.45); color: #0f172a; padding: 4px 10px; z-index: 2; }

        .collage-dots          { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 24px; }
        .collage-dot           { width: 16px; height: 2px; background: rgba(125,168,199,0.3); cursor: pointer; transition: all 0.3s; }
        .collage-dot.active    { background: #7da8c7; width: 32px; }

        .collage-view-btn-wrap { display: flex; justify-content: center; margin-top: clamp(28px, 4vw, 40px); }
        .collage-view-btn {
          display: inline-flex; align-items: center; gap: 12px;
          font-size: 9px; letter-spacing: 3.5px; text-transform: uppercase; font-weight: 700;
          color: #0f172a; border: 1px solid rgba(15,23,42,0.18);
          padding: 14px 36px; background: #ffffff; cursor: pointer;
          text-decoration: none; transition: all 0.3s;
        }
        .collage-view-btn:hover { background: #7da8c7; color: #ffffff; border-color: #7da8c7; }
        .collage-view-btn-arrow { font-size: 14px; transition: transform 0.3s; }
        .collage-view-btn:hover .collage-view-btn-arrow { transform: translateX(4px); }

        /* ══════════════════════════════════════
           MOBILE RESPONSIVE
        ══════════════════════════════════════ */
        @media (max-width: 768px) {
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

          .banner-duo     { grid-template-columns: 1fr; padding: 0 10px; }
          .duo-cell       { min-height: 320px; height: 48vh; max-height: none; }
          .banner-full    { min-height: 360px; height: 58vh; max-height: none; }
          .banner-full-overlay { padding: 22px; }
          .banner-btn-ghost { margin-left: 0; margin-top: 10px; display: block; }

          .collage-viewport { min-height: auto; margin: 0 10px; }
          .collage-grid-track {
            grid-template-columns: 1fr 1fr !important;
            grid-template-rows: minmax(200px, 28vh) minmax(140px, 20vh) minmax(140px, 20vh) !important;
            gap: 8px;
          }
          .collage-grid-track .collage-cell:nth-child(1) {
            grid-column: 1 / -1 !important;
            grid-row: 1 !important;
            min-height: 200px;
          }
          .collage-grid-track .collage-cell:nth-child(2) { grid-column: 1 !important; grid-row: 2 !important; }
          .collage-grid-track .collage-cell:nth-child(3) { grid-column: 2 !important; grid-row: 2 !important; }
          .collage-grid-track .collage-cell:nth-child(4) { grid-column: 1 !important; grid-row: 3 !important; }
          .collage-grid-track .collage-cell:nth-child(5) { grid-column: 2 !important; grid-row: 3 !important; }
          .collage-header { flex-direction: column; align-items: flex-start; gap: 12px; }
          .collage-arrows { align-self: flex-end; }
        }

        @media (max-width: 480px) {
          .fw-cta-row { flex-direction: column; align-items: flex-start; gap: 10px; }
          .fw-btn-outline { width: 100%; text-align: center; }
          .collage-grid-track {
            grid-template-columns: 1fr !important;
            grid-template-rows: minmax(220px, 34vh) repeat(4, minmax(160px, 22vh)) !important;
          }
          .collage-grid-track .collage-cell:nth-child(1) { grid-column: 1 !important; grid-row: 1 !important; }
          .collage-grid-track .collage-cell:nth-child(2) { grid-row: 2 !important; }
          .collage-grid-track .collage-cell:nth-child(3) { grid-row: 3 !important; }
          .collage-grid-track .collage-cell:nth-child(4) { grid-row: 4 !important; }
          .collage-grid-track .collage-cell:nth-child(5) { grid-row: 5 !important; }
          .duo-cell { min-height: 280px; height: 42vh; }
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
    </>
  );
}
