"use client";

import { fetchProducts } from "@/app/store/productSlice";
import type { AppDispatch, RootState } from "@/app/store/store";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

// -- HERO SLIDES -------------------------------------------------------------
// textAlign: "left" | "center" | "right"
const heroSlides = [
  {
    img: "/zenmen_founder_hero.jpeg",
    tag: "Premium Tailoring · SS 2025",
    title: ["Crafted for the", "Modern", "Gentleman"],
    titleItalic: 1, // index of italic word
    subtitle:
      "Every stitch tells a story. Bespoke suits, shirts and sherwanis that redefine how you feel.",
    cta: "Begin Your Journey",
    ctaSecondary: "View Collection",
    textAlign: "left",
    overlayDir: "left", // gradient direction: left=text-left-dark, right=text-right-dark, center=bottom-dark
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

// -- COLLECTION GRID ----------------------------------------------------------
const collageItems = [
  {
    img: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&q=85",
    label: "Overcoats",
    desc: "Structured silhouettes, Italian wool",
    tag: "Featured",
  },
  {
    img: "/zenmen_shirt.jpeg",
    label: "Dress Shirts",
    desc: "Egyptian cotton, 200-thread count",
    tag: null,
  },
  {
    img: "zenmen_blackcoat.jpeg",
    label: "Bespoke Suits",
    desc: "Full canvas construction",
    tag: null,
  },
  {
    img: "/zenmen_kurta.png",
    label: "Kurtas",
    desc: "Hand-embroidered, heritage craft",
    tag: "Bestseller",
  },
  {
    img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=85",
    label: "Accessories",
    desc: "Pocket squares, cufflinks & ties",
    tag: null,
  },
];

export default function Hero() {
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading, loaded } = useSelector(
    (state: RootState) => state.products,
  );
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [animKey, setAnimKey] = useState(0);
  const [collageStart, setCollageStart] = useState(0);
  const [prevCollageStart, setPrevCollageStart] = useState<number | null>(null);
  const transitioningRef = useRef(false);
  const currentRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const collageTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const collageTransitioningRef = useRef(false);
  const collageSlidesDoneRef = useRef(0);

  useEffect(() => {
    if (!loading && !loaded) {
      dispatch(fetchProducts());
    }
  }, [dispatch, loading, loaded]);

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

  const next = () => goTo((currentRef.current + 1) % heroSlides.length);
  const prev_ = () =>
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

  const collageSource = useMemo(() => {
    const fromStore = (products ?? [])
      .filter(
        (p: any) => p?.title && (p?.images?.[0]?.url || p?.images?.[1]?.url),
      )
      .map((p: any, index: number) => ({
        img: p.images?.[0]?.url || p.images?.[1]?.url || "/new.jpg",
        label: p.title,
        desc: `${p.category || "Collection"}${p.colors?.[0] ? ` · ${p.colors[0]}` : ""}`,
        tag:
          index % 4 === 0 ? "Featured" : index % 5 === 0 ? "Bestseller" : null,
      }));

    return fromStore.length > 0 ? fromStore : collageItems;
  }, [products]);

  const collageVisible = useMemo(() => {
    const size = 5;
    if (collageSource.length <= size) return collageSource;
    return Array.from({ length: size }, (_, i) => {
      const idx = (collageStart + i) % collageSource.length;
      return collageSource[idx];
    });
  }, [collageSource, collageStart]);

  const collagePrevVisible = useMemo(() => {
    if (prevCollageStart === null) return [];
    const size = 5;
    if (collageSource.length <= size) return collageSource;
    return Array.from({ length: size }, (_, i) => {
      const idx = (prevCollageStart + i) % collageSource.length;
      return collageSource[idx];
    });
  }, [collageSource, prevCollageStart]);

  const goToNextCollageSet = () => {
    if (collageSource.length <= 5 || collageTransitioningRef.current) return;
    collageTransitioningRef.current = true;
    setPrevCollageStart(collageStart);
    setCollageStart((prevIndex) => (prevIndex + 5) % collageSource.length);
    setTimeout(() => {
      setPrevCollageStart(null);
      collageTransitioningRef.current = false;
    }, 650);
  };

  useEffect(() => {
    if (collageSource.length <= 5) return;
    collageSlidesDoneRef.current = 0;
    collageTimerRef.current = setInterval(() => {
      if (collageSlidesDoneRef.current >= 3) {
        if (collageTimerRef.current) clearInterval(collageTimerRef.current);
        return;
      }
      collageSlidesDoneRef.current += 1;
      goToNextCollageSet();
    }, 4200);

    return () => {
      if (collageTimerRef.current) clearInterval(collageTimerRef.current);
    };
  }, [collageSource.length, collageStart]);

  const slide = heroSlides[current];

  const overlayGradient = {
    left: "linear-gradient(to right, rgba(10,8,6,0.75) 0%, rgba(10,8,6,0.4) 50%, rgba(10,8,6,0.1) 100%)",
    right:
      "linear-gradient(to left, rgba(10,8,6,0.75) 0%, rgba(10,8,6,0.4) 50%, rgba(10,8,6,0.1) 100%)",
    center:
      "linear-gradient(to top, rgba(10,8,6,0.8) 0%, rgba(10,8,6,0.35) 45%, rgba(10,8,6,0.08) 100%)",
  }[slide.overlayDir];

  const textJustify = {
    left: "flex-start",
    center: "center",
    right: "flex-end",
  }[slide.textAlign];

  const textAlignCSS = slide.textAlign as "left" | "center" | "right";

  const paddingStyle =
    slide.textAlign === "left"
      ? { paddingLeft: "80px", paddingRight: "40%" }
      : slide.textAlign === "right"
        ? { paddingRight: "80px", paddingLeft: "40%" }
        : { paddingLeft: "15%", paddingRight: "15%" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Montserrat:wght@300;400;500;600&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        /* -- FULL-WIDTH HERO -- */
        .fw-hero {
          width: 100%;
          height: 100vh;
          min-height: 600px;
          position: relative;
          overflow: hidden;
          background: #050A18;
          font-family: 'Montserrat', sans-serif;
        }

        /* Slides */
        .fw-slide-img {
          position: absolute; inset: 0; width: 100%; height: 100%;
          object-fit: cover; object-position: center;
          // filter: brightness(0.92) contrast(1.08) saturate(0.9);
          transition: opacity 0.9s ease;
          transform: scale(1.06);
        }
        .fw-slide-img.active {
          opacity: 1; z-index: 1;
          animation: kenBurns 7s ease forwards;
        }
        .fw-slide-img.exiting { opacity: 0; z-index: 0; }
        .fw-slide-img.hidden { opacity: 0; z-index: 0; }
        @keyframes kenBurns {
          from { transform: scale(1.06); }
          to { transform: scale(1.0); }
        }

        /* Overlay */
        .fw-overlay {
          position: absolute; inset: 0; z-index: 2;
          display: flex; flex-direction: column; justify-content: flex-end;
          padding-bottom: 90px;
          transition: background 0.9s ease;
        }

        /* Text block */
        .fw-text {
          display: flex; flex-direction: column;
        }

        /* Top bar */
        .fw-topbar {
          position: absolute; top: 0; left: 0; right: 0; z-index: 5;
          display: flex; align-items: center; justify-content: space-between;
          padding: 28px 48px;
          background: linear-gradient(to bottom, rgba(10,8,6,0.7) 0%, transparent 100%);
        }
        .fw-brand-est { font-size: 9px; letter-spacing: 4px; color: #c9a84c; font-weight: 500; text-transform: uppercase; }
        .fw-brand-name { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700; color: #f5f0e8; letter-spacing: 8px; text-transform: uppercase; margin-top: 2px; }
        .fw-topbar-right { display: flex; align-items: center; gap: 28px; }
        .fw-nav-link { font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: rgba(245,240,232,0.6); font-weight: 500; text-decoration: none; cursor: pointer; transition: color 0.2s; }
        .fw-nav-link:hover { color: #c9a84c; }

        /* Slide tag */
        .fw-tag {
          font-size: 9px; letter-spacing: 4px; color: #c9a84c; text-transform: uppercase;
          font-weight: 600; margin-bottom: 14px;
          opacity: 0; animation: fadeUp 0.6s 0.05s forwards;
        }

        /* Title */
        .fw-title {
          font-family: 'Playfair Display', serif; font-weight: 700; color: #f5f0e8;
          line-height: 1.0; margin-bottom: 18px;
          opacity: 0; animation: fadeUp 0.7s 0.15s forwards;
        }
        .fw-title-line { display: block; font-size: clamp(52px, 6.5vw, 96px); }
        .fw-title-line.italic { font-style: italic; color: #c9a84c; }

        /* Subtitle */
        .fw-subtitle {
          font-family: 'Cormorant Garamond', serif; font-size: clamp(14px, 1.3vw, 18px);
          font-weight: 300; font-style: italic; color: rgba(245,240,232,0.7);
          line-height: 1.55; margin-bottom: 30px; max-width: 500px;
          opacity: 0; animation: fadeUp 0.7s 0.28s forwards;
        }

        /* CTAs */
        .fw-cta-row {
          display: flex; align-items: center; gap: 20px;
          opacity: 0; animation: fadeUp 0.7s 0.4s forwards;
        }
        .fw-btn-primary {
          background: #c9a84c; color: #0a0806; font-family: 'Montserrat', sans-serif;
          font-size: 9px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;
          padding: 13px 30px; border: none; cursor: pointer; text-decoration: none;
          display: inline-block; transition: background 0.25s, transform 0.2s;
        }
        .fw-btn-primary:hover { background: #e2c06a; transform: translateY(-1px); }
        .fw-btn-outline {
          font-size: 9px; letter-spacing: 2.5px; text-transform: uppercase;
          color: rgba(245,240,232,0.6); text-decoration: none; font-weight: 500; cursor: pointer;
          border: 1px solid rgba(201,168,76,0.45); padding: 12px 24px; transition: all 0.25s;
          display: inline-block;
        }
        .fw-btn-outline:hover { color: #c9a84c; border-color: #c9a84c; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Progress bar */
        .fw-progress {
          position: absolute; bottom: 0; left: 0; right: 0; z-index: 5;
          height: 2px; background: rgba(201,168,76,0.15);
        }
        .fw-progress-bar {
          height: 100%; background: #c9a84c;
          animation: progress 6s linear infinite;
        }
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }

        /* Slide counter (top right) */
        .fw-counter {
          position: absolute; bottom: 36px; right: 48px; z-index: 5;
          font-size: 9px; letter-spacing: 3px; color: rgba(201,168,76,0.7); font-weight: 500;
        }

        /* Arrows */
        .fw-arrow {
          position: absolute; top: 50%; z-index: 5;
          transform: translateY(-50%);
          width: 48px; height: 48px;
          border: 1px solid rgba(201,168,76,0.4);
          background: rgba(10,8,6,0.5);
          color: #c9a84c; cursor: pointer; font-size: 16px;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.25s, border-color 0.25s, transform 0.25s;
          backdrop-filter: blur(4px);
        }
        .fw-arrow:hover { background: rgba(201,168,76,0.2); border-color: #c9a84c; transform: translateY(-52%); }
        .fw-arrow.left { left: 32px; }
        .fw-arrow.right { right: 32px; }

        /* Dots */
        .fw-dots {
          position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%);
          z-index: 5; display: flex; align-items: center; gap: 10px;
        }
        .fw-dot { width: 20px; height: 2px; background: rgba(201,168,76,0.3); cursor: pointer; transition: background 0.3s, width 0.3s; }
        .fw-dot.active { background: #c9a84c; width: 40px; }

        /* Scroll cue */
        .fw-scroll-cue {
          position: absolute; bottom: 36px; left: 48px; z-index: 5;
          display: flex; align-items: center; gap: 10px;
          font-size: 8px; letter-spacing: 3px; text-transform: uppercase;
          color: rgba(245,240,232,0.35); font-weight: 500;
        }
        .fw-scroll-line { width: 28px; height: 1px; background: rgba(201,168,76,0.4); }

        /* Decorative vertical text */
        .fw-vert-text {
          position: absolute; right: 20px; top: 50%; z-index: 5;
          transform: translateY(-50%) rotate(90deg);
          font-size: 8px; letter-spacing: 4px; text-transform: uppercase;
          color: rgba(201,168,76,0.35); font-weight: 500; white-space: nowrap;
          pointer-events: none;
        }

        /* -- GOLD DIVIDER -- */
        .gold-divider {
          width: 100%; height: 1px;
          background: linear-gradient(to right, transparent, #c9a84c 30%, #c9a84c 70%, transparent);
          opacity: 0.3;
        }

        /* -- COLLECTION SECTION -- */
        .collage-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 28px 32px 20px;
        }
        .collage-title {
          font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700;
          color: #f5f0e8; letter-spacing: 1px;
        }
        .collage-title em { color: #c9a84c; font-style: italic; }
        .collage-subtitle { font-family: 'Playfair Display', serif; font-size: 11px; letter-spacing: 3px; color: rgba(201,168,76,0.7); text-transform: uppercase; font-weight: 500; }
        .collage-grid {
          display: grid;
          grid-template-columns: 1.1fr 1fr 1fr 1.4fr 1fr;
          grid-template-rows: 380px;
          gap: 3px; padding: 0 3px 3px;
        }
        .collage-viewport {
          position: relative;
          overflow: hidden;
        }
        .collage-grid-track {
          display: grid;
          grid-template-columns: 1.1fr 1fr 1fr 1.4fr 1fr;
          grid-template-rows: 380px;
          gap: 3px;
          padding: 0 3px 3px;
          width: 100%;
        }
        .collage-grid-track.current-enter {
          animation: collageSlideIn 650ms cubic-bezier(.22,.61,.36,1) both;
        }
        .collage-grid-track.prev-exit {
          position: absolute;
          inset: 0;
          animation: collageSlideOut 650ms cubic-bezier(.22,.61,.36,1) both;
        }
        @keyframes collageSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes collageSlideOut {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
        .collage-cell { position: relative; overflow: hidden; cursor: pointer; }
        .collage-cell img {
          width: 100%; height: 100%; object-fit: cover; object-position: top center;
          filter: brightness(0.65) contrast(1.08); transition: filter 0.5s, transform 0.6s;
        }
        .collage-cell:hover img { filter: brightness(0.85) contrast(1.08); transform: scale(1.05); }
        .collage-cell-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(10,8,6,0.75) 0%, transparent 50%);
          display: flex; flex-direction: column; justify-content: flex-end; padding: 14px;
          transition: background 0.4s;
        }
        .collage-cell:hover .collage-cell-overlay { background: linear-gradient(to top, rgba(10,8,6,0.6) 0%, transparent 40%); }
        .collage-cell-label { font-family: 'Playfair Display', serif; font-size: 16px; color: #f5f0e8; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 2px; }
        .collage-cell-desc { font-size: 8px; letter-spacing: 2px; color: #c9a84c; text-transform: uppercase; font-weight: 600; }
        .collage-cell-tag {
          position: absolute; top: 10px; left: 10px;
          font-size: 7px; letter-spacing: 2px; font-weight: 700; text-transform: uppercase;
          background: rgba(201,168,76,0.15); border: 1px solid rgba(201,168,76,0.4);
          color: #c9a84c; padding: 3px 8px;
        }

        /* -- EDITORIAL BANNERS -- */
        .banners-section { width: 100%; background: #0a0806; font-family: 'Montserrat', sans-serif; }
        .banner-full { position: relative; width: 100%; height: 650px; overflow: hidden; }
        .banner-full img {
          width: 100%; height: 100%; object-fit: cover; object-position: center;
          filter: brightness(0.55) contrast(1.08); transition: transform 8s ease;
        }
        .banner-full:hover img { transform: scale(1.03); }
        .banner-full-overlay {
          position: absolute; inset: 0; display: flex; flex-direction: column;
          justify-content: flex-end; align-items: flex-start; padding: 48px 60px;
          // background: linear-gradient(to top, rgba(10,8,6,0.88) 0%, rgba(10,8,6,0.2) 55%, transparent 100%);
        }
        .banner-full-tag { font-size: 9px; letter-spacing: 4px; color: #c9a84c; text-transform: uppercase; font-weight: 600; margin-bottom: 10px; }
        .banner-full-title { font-family: 'Playfair Display', serif; font-size: 52px; font-weight: 700; color: #f5f0e8; line-height: 1.05; margin-bottom: 14px; }
        .banner-full-title em { font-style: italic; color: #c9a84c; }
        .banner-full-sub { font-family: 'Cormorant Garamond', serif; font-size: 16px; font-weight: 300; font-style: italic; color: rgba(245,240,232,0.7); margin-bottom: 24px; max-width: 500px; line-height: 1.5; }
        .banner-btn-primary { display: inline-block; background: #c9a84c; color: #0a0806; font-family: 'Montserrat', sans-serif; font-size: 9px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; padding: 12px 28px; border: none; cursor: pointer; transition: background 0.25s; text-decoration: none; }
        .banner-btn-primary:hover { background: #e2c06a; }
        .banner-btn-ghost { display: inline-block; margin-left: 20px; font-size: 9px; letter-spacing: 2.5px; text-transform: uppercase; color: rgba(245,240,232,0.55); border-bottom: 1px solid rgba(201,168,76,0.4); padding-bottom: 2px; cursor: pointer; transition: color 0.2s; text-decoration: none; }
        .banner-btn-ghost:hover { color: #c9a84c; }

        .banner-split { display: grid; grid-template-columns: 1fr 1fr; height: 600px; }
        .banner-split-img { position: relative; overflow: hidden; }
        .banner-split-img img {
          width: 100%; height: 100%; object-fit: cover; object-position: center top;
          filter: brightness(0.6) contrast(1.08); transition: transform 7s ease, filter 0.5s;
        }
        .banner-split-img:hover img { transform: scale(1.04); filter: brightness(0.72) contrast(1.08); }
        .split-text { background: #0f0d0a; display: flex; flex-direction: column; justify-content: center; padding: 60px 52px; }
        .split-tag { font-size: 9px; letter-spacing: 4px; color: #c9a84c; text-transform: uppercase; font-weight: 600; margin-bottom: 16px; }
        .split-title { font-family: 'Playfair Display', serif; font-size: 42px; font-weight: 700; color: #f5f0e8; line-height: 1.08; margin-bottom: 18px; }
        .split-title em { font-style: italic; color: #c9a84c; }
        .split-desc { font-family: 'Cormorant Garamond', serif; font-size: 17px; font-weight: 300; font-style: italic; color: rgba(245,240,232,0.65); line-height: 1.65; margin-bottom: 32px; }
        .split-features { display: flex; flex-direction: column; gap: 8px; margin-bottom: 32px; }
        .split-feature { display: flex; align-items: center; gap: 10px; font-size: 9px; letter-spacing: 2.5px; text-transform: uppercase; color: rgba(245,240,232,0.5); font-weight: 500; }
        .split-feature::before { content: ''; display: block; width: 20px; height: 1px; background: #c9a84c; flex-shrink: 0; }
        .split-btns { display: flex; align-items: center; gap: 20px; }
        .split-cta { display: inline-block; background: #c9a84c; color: #0a0806; font-family: 'Montserrat', sans-serif; font-size: 9px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; padding: 12px 28px; border: none; cursor: pointer; transition: background 0.25s; }
        .split-cta:hover { background: #e2c06a; }
        .split-cta-outline { display: inline-block; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: rgba(201,168,76,0.8); border: 1px solid rgba(201,168,76,0.4); padding: 11px 22px; cursor: pointer; background: transparent; transition: all 0.2s; }
        .split-cta-outline:hover { border-color: #c9a84c; color: #c9a84c; }

        .banner-duo { display: grid; grid-template-columns: 1fr 1fr; gap: 3px; }
        .duo-cell { position: relative; height: 480px; overflow: hidden; cursor: pointer; }
        .duo-cell img {
          width: 100%; height: 100%; object-fit: cover; object-position: center top;
          filter: brightness(0.58) contrast(1.08); transition: transform 7s ease, filter 0.5s;
        }
        .duo-cell:hover img { transform: scale(1.05); filter: brightness(0.72) contrast(1.08); }
        .duo-overlay {
          position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: flex-end;
          padding: 36px; background: linear-gradient(to top, rgba(10,8,6,0.85) 0%, transparent 60%);
        }
        .duo-tag { font-size: 8px; letter-spacing: 3.5px; color: #c9a84c; text-transform: uppercase; font-weight: 600; margin-bottom: 8px; }
        .duo-title { font-family: 'Playfair Display', serif; font-size: 34px; font-weight: 700; color: #f5f0e8; line-height: 1.1; margin-bottom: 8px; }
        .duo-title em { font-style: italic; color: #c9a84c; }
        .duo-sub { font-family: 'Cormorant Garamond', serif; font-size: 14px; font-style: italic; color: rgba(245,240,232,0.6); margin-bottom: 20px; }
        .duo-cta { display: inline-block; font-size: 9px; letter-spacing: 2.5px; text-transform: uppercase; color: #c9a84c; border-bottom: 1px solid rgba(201,168,76,0.5); padding-bottom: 2px; cursor: pointer; }
      `}</style>

      {/* -- SECTION 1: FULL-WIDTH CINEMATIC HERO -- */}
      <section className="fw-hero" id="home">
        {/* Slide images */}
        {heroSlides.map((s, i) => (
          <img
            key={i}
            src={s.img}
            alt={s.tag}
            className={`fw-slide-img ${i === current ? "active" : i === prev ? "exiting" : "hidden"}`}
          />
        ))}

        {/* Top bar — brand + nav */}
        <div className="fw-topbar">
          <div>
            {/* <div className="fw-brand-est">Est. 2010</div>
            <div className="fw-brand-name">ZENmen</div> */}
          </div>
          {/* <div className="fw-topbar-right">
            <a href="#collection" className="fw-nav-link">
              Collection
            </a>
            <a href="#products" className="fw-nav-link">
              Products
            </a>
            <a href="#contact" className="fw-nav-link">
              Contact
            </a>
            <a
              href="#contact"
              className="fw-btn-primary"
              style={{ fontSize: "8px", padding: "9px 18px" }}
            >
              Book Fitting
            </a>
          </div> */}
        </div>

        {/* Overlay gradient */}
        <div className="fw-overlay" style={{ background: overlayGradient }}>
          <div
            className="fw-text"
            key={animKey}
            style={{
              alignItems: textJustify,
              textAlign: textAlignCSS,
              ...paddingStyle,
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
                slide.textAlign === "center"
                  ? { maxWidth: "540px", textAlign: "center" }
                  : {}
              }
            >
              {slide.subtitle}
            </p>
            <div className="fw-cta-row" style={{ justifyContent: textJustify }}>
              <a href="#contact" className="fw-btn-primary">
                {slide.cta}
              </a>
              <a href="#collection" className="fw-btn-outline">
                {slide.ctaSecondary}
              </a>
            </div>
          </div>
        </div>

        {/* Left arrow */}
        <button className="fw-arrow left" onClick={prev_}>
          &#8592;
        </button>

        {/* Right arrow */}
        <button className="fw-arrow right" onClick={next}>
          &#8594;
        </button>

        {/* Dots */}
        <div className="fw-dots">
          {heroSlides.map((_, i) => (
            <div
              key={i}
              className={`fw-dot ${i === current ? "active" : ""}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>

        {/* Counter */}
        <div className="fw-counter">
          {String(current + 1).padStart(2, "0")} /{" "}
          {String(heroSlides.length).padStart(2, "0")}
        </div>

        {/* Scroll cue */}
        <div className="fw-scroll-cue">
          <span className="fw-scroll-line" />
          Scroll to Explore
        </div>

        {/* Vertical decorative text */}
        <div className="fw-vert-text">Bespoke · Premium · Timeless</div>

        {/* Progress bar */}
        <div className="fw-progress">
          <div className="fw-progress-bar" key={animKey} />
        </div>
      </section>

      {/* -- SECTION 3: EDITORIAL BANNERS -- */}
      <div className="banners-section">
        <div className="gold-divider" />

        {/* Banner 1 — Full width, text bottom-left */}
        {/* <div className="banner-full">
          <img src="/founder_model_1.png" alt="Bespoke Suiting" />
          <div className="banner-full-overlay">
            <div className="banner-full-tag">Bespoke Atelier · SS 2025</div>
            <h2 className="banner-full-title">
              The Art of
              <br />
              <em>Perfect Tailoring</em>
            </h2>
            <p className="banner-full-sub">
              Every suit is a masterpiece — sculpted to your form, finished by
              hand, built to endure a lifetime of presence.
            </p>
            <div style={{ display: "flex", alignItems: "center" }}>
              <a href="#contact" className="banner-btn-primary">
                View Collection
              </a>
              <a href="#contact" className="banner-btn-ghost">
                Book a Fitting
              </a>
            </div>
          </div>
        </div>  */}

        <div className="gold-divider" />

        {/* Banner 2 — Split: image left, text right */}
        {/* <div className="banner-split">
          <div className="banner-split-img">
            <img
              src="https://images.unsplash.com/photo-1598808503746-f34c53b9323e?w=900&q=90"
              alt="Sherwani"
            />
          </div>
          <div className="split-text">
            <div className="split-tag">Sherwani Edit · Wedding Season 2025</div>
            <h2 className="split-title">
              Royal
              <br />
              <em>Heritage,</em>
              <br />
              Modern Soul
            </h2>
            <p className="split-desc">
              Hand-embroidered sherwanis crafted for the discerning groom —
              where centuries of tradition meet contemporary artistry.
            </p>
            <div className="split-features">
              <span className="split-feature">
                Hand-embroidered zardozi work
              </span>
              <span className="split-feature">
                Heritage silk &amp; velvet fabrics
              </span>
              <span className="split-feature">
                Fully bespoke, your measurements
              </span>
            </div>
            <div className="split-btns">
              <button className="split-cta">View Collection</button>
              <button className="split-cta-outline">Book Appointment</button>
            </div>
          </div>
        </div> */}

        {/* <div className="gold-divider" /> */}

        {/* Banner 3 — Split: text left, image right */}
        {/* <div className="banner-split">
          <div className="split-text">
            <div className="split-tag">The Suit Studio · AW 2025</div>
            <h2 className="split-title">
              Power
              <br />
              <em>Dressing,</em>
              <br />
              Perfected
            </h2>
            <p className="split-desc">
              From boardroom to ballroom — our full-canvas bespoke suits command
              every room you walk into.
            </p>
            <div className="split-features">
              <span className="split-feature">Full canvas construction</span>
              <span className="split-feature">Super 120s Italian wool</span>
              <span className="split-feature">4–6 week bespoke turnaround</span>
            </div>
            <div className="split-btns">
              <button className="split-cta">Explore Suits</button>
              <button className="split-cta-outline">View Fabrics</button>
            </div>
          </div>
          <div className="banner-split-img">
            <img
              src="https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=900&q=90"
              alt="Bespoke Suits"
            />
          </div>
        </div> */}

        <div className="gold-divider" />

        {/* Banner 5 — Duo */}
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
              <span className="duo-cta">View Winter Edit ?</span>
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
              <span className="duo-cta">Browse Shirts ?</span>
            </div>
          </div>
        </div>

        <div className="gold-divider" />

        {/* Banner 4 — Full width, centered */}
        <div className="banner-full" style={{ height: "460px" }}>
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
            <h2 className="banner-full-title" style={{ fontSize: "56px" }}>
              Dressed for
              <br />
              <em>Extraordinary</em> Moments
            </h2>
            <p
              className="banner-full-sub"
              style={{
                maxWidth: "520px",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              Velvet tuxedos and black-tie tailoring designed for unforgettable
              entrances. Limited to 40 pieces per season.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <a href="#contact" className="banner-btn-primary">
                Shop Eveningwear
              </a>
              <a href="#contact" className="banner-btn-ghost">
                View Lookbook
              </a>
            </div>
          </div>
        </div>

        <div className="gold-divider" />

        {/* <div className="gold-divider" /> */}
      </div>

      {/* -- SECTION 2: COLLECTION GRID -- */}
      <section
        id="collection"
        style={{
          width: "100%",
          background: "#050A18",
          borderTop: "1px solid rgba(201,168,76,0.2)",
          fontFamily: "'Montserrat', sans-serif",
        }}
      >
        <div className="collage-header">
          <h2 className="collage-title">
            The <em>Collection</em>
          </h2>
          <span className="collage-subtitle">Explore Every Category</span>
        </div>
        <div className="collage-viewport">
          {prevCollageStart !== null && (
            <div className="collage-grid-track prev-exit">
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
          <div
            className={`collage-grid-track ${prevCollageStart !== null ? "current-enter" : ""}`}
            key={`${collageStart}-${collageSource.length}`}
          >
            {collageVisible.map((item, i) => (
              <div className="collage-cell" key={i}>
                <img src={item.img} alt={item.label} />
                <div className="collage-cell-overlay">
                  <div className="collage-cell-label">{item.label}</div>
                  <div className="collage-cell-desc">{item.desc}</div>
                </div>
                {item.tag && <div className="collage-cell-tag">{item.tag}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
