// src/app/about/page.tsx
/* eslint-disable react-hooks/refs */
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// ── Data ──────────────────────────────────────────────────────────────────────
const STATS = [
  { value: "53K+", label: "Community" },
  { value: "2021", label: "Founded" },
  { value: "100%", label: "Bespoke" },
  { value: "∞", label: "Worldwide" },
];

const MILESTONES = [
  {
    year: "2021",
    title: "The Atelier Opens",
    desc: "ZENmen was born in a single studio in New Delhi — a conviction that modern Indian men deserved world-class tailoring without compromise.",
  },
  {
    year: "2022",
    title: "First Collection Drops",
    desc: "The debut collection of hand-stitched kurtas and slim-cut suits sold out in 72 hours, building a devoted community from day one.",
  },
  {
    year: "2023",
    title: "Bespoke Studio Expands",
    desc: "A dedicated fitting lounge and fabric library opened, offering clients access to over 400 curated Italian, Japanese, and Indian textiles.",
  },
  {
    year: "2024",
    title: "Wedding Division Launches",
    desc: "The sherwani and wedding wear division was born — hand-embroidered pieces that became the centrepiece of hundreds of ceremonies.",
  },
  {
    year: "2025",
    title: "International Reach",
    desc: "ZENmen now ships to 22 countries. Every garment still made by hand in New Delhi, carrying the soul of the city to the world.",
  },
];

const VALUES = [
  {
    num: "01",
    title: "Craft Without Compromise",
    desc: "Every seam, every button, every finishing stitch is executed with the same precision applied to the very first garment we ever made. We do not scale down quality to scale up speed.",
  },
  {
    num: "02",
    title: "The Gentleman's Fit",
    desc: "A garment should feel like a second skin — not borrowed armour. We spend more time on your measurements than any machine ever could.",
  },
  {
    num: "03",
    title: "Fabrics with a Lineage",
    desc: "We source only from mills with a proven heritage: Zegna wool from Biella, Albini cotton from Bergamo, and silk woven in Varanasi for generations.",
  },
  {
    num: "04",
    title: "Discretion as a Standard",
    desc: "Our clients include founders, diplomats, and artists who value privacy as much as precision. What happens in the fitting room stays there.",
  },
];

const TESTIMONIALS = [
  {
    initials: "RK",
    text: "ZENmen transformed how I present myself. My wedding suit was a masterpiece — everyone asked where I got it.",
    author: "Rahul Kumar",
    title: "Entrepreneur · Delhi",
  },
  {
    initials: "AS",
    text: "As someone who travels for business, having a ZENmen wardrobe gives me unmatched confidence in every boardroom.",
    author: "Arjun Sharma",
    title: "Director · Mumbai",
  },
  {
    initials: "VP",
    text: "I've tried many tailors but ZENmen is truly bespoke. The fabric selection, the fit, the team — all exceptional.",
    author: "Vikram Patel",
    title: "Architect · Ahmedabad",
  },
];

// ── Scroll-triggered visibility hook ─────────────────────────────────────────
function useVisible(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVis(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, vis };
}

// ── Animated stat ─────────────────────────────────────────────────────────────
function AnimatedStat({
  value,
  label,
  delay,
  vis,
}: {
  value: string;
  label: string;
  delay: number;
  vis: boolean;
}) {
  return (
    <div
      style={{
        textAlign: "center",
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.9s ease ${delay}s, transform 0.9s cubic-bezier(.22,1,.36,1) ${delay}s`,
      }}
    >
      <div
        style={{
          fontFamily: "var(--heading-font-family)",
          fontSize: "clamp(42px,6vw,72px)",
          fontWeight: 300,
          color: "#7da8c7",
          lineHeight: 1,
          marginBottom: "8px",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "9px",
          letterSpacing: "4px",
          textTransform: "uppercase",
          color: "#475569",
          fontFamily: "'Jost', sans-serif",
          fontWeight: 600,
        }}
      >
        {label}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AboutPage() {
  const hero = useVisible(0.05);
  const manifesto = useVisible(0.15);
  const stats = useVisible(0.2);
  const timeline = useVisible(0.1);
  const founder = useVisible(0.15);
  const values = useVisible(0.15);
  const testi = useVisible(0.15);
  const cta = useVisible(0.2);

  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const [activeMilestone, setActiveMilestone] = useState(0);

  const fade = (
    vis: boolean,
    delay = 0,
    extra: React.CSSProperties = {},
  ): React.CSSProperties => ({
    opacity: vis ? 1 : 0,
    transform: vis ? "translateY(0)" : "translateY(28px)",
    transition: `opacity 0.9s ease ${delay}s, transform 0.9s cubic-bezier(.22,1,.36,1) ${delay}s`,
    ...extra,
  });

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        :root {
          --bg:      #f8fafc;
          --bg2:     #f1f5f9;
          --accent:  #7da8c7;
          --accent2: #5a8faf;
          --ink:     #0f172a;
          --ink2:    #334155;
          --muted:   #64748b;
          --border:  #e2e8f0;
          --border2: #cbd5e1;
          --hover-bg:#e8f0f7;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .about-page {
          background: var(--bg);
          color: black;
          font-family: 'Jost', sans-serif;
          overflow-x: hidden;
        }

        /* ── NOISE ── */
        .noise {
          pointer-events: none; position: fixed; inset: 0; z-index: 0; opacity: .018;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px;
        }

        /* ── HERO ── */
        .hero-section {
          position: relative; width: 100%; height: 100vh; min-height: 640px;
          display: flex; flex-direction: column; justify-content: flex-end;
          overflow: hidden;
        }
        .hero-bg { position: absolute; inset: 0; z-index: 0; }
        .hero-img {
          width: 100%; height: 100%; object-fit: cover;
          object-position: center 40%;
          filter: brightness(0.58) contrast(1.05);
        }
        .hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            to top,
            rgba(15, 23, 42, 0.94) 0%,
            rgba(15, 23, 42, 0.72) 28%,
            rgba(15, 23, 42, 0.35) 52%,
            rgba(15, 23, 42, 0.08) 78%,
            transparent 100%
          );
        }
        .hero-grid-lines {
          position: absolute; inset: 0; z-index: 1; opacity: 0.03;
          background-image:
            linear-gradient(rgba(125,168,199,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(125,168,199,1) 1px, transparent 1px);
          background-size: 80px 80px;
        }
        .hero-content {
          position: relative; z-index: 2;
          padding: clamp(40px,8vw,100px) clamp(24px,8vw,120px) clamp(60px,8vw,100px);
          max-width: 900px;
        }
        .hero-eyebrow {
          font-size: 9px; letter-spacing: 5px; text-transform: uppercase;
          color: var(--accent); font-weight: 500; margin-bottom: 20px;
          display: flex; align-items: center; gap: 12px;
        }
        .hero-eyebrow::before { content: ''; width: 40px; height: 1px; background: var(--accent); opacity: 0.7; }
        .hero-title {
          font-family: var(--heading-font-family);
          font-size: clamp(52px,9vw,120px);
          font-weight: 300; line-height: 0.92;
          color: #ffffff; margin-bottom: 28px;
          letter-spacing: -1px;
          text-shadow: 0 2px 24px rgba(15,23,42,0.35);
        }
        .hero-title em { font-style: italic; color: var(--accent); }
        .hero-subtitle {
          font-family: var(--heading-font-family);
          font-size: clamp(16px,2vw,22px); font-weight: 300; font-style: italic;
          color: rgba(248,250,252,0.92); line-height: 1.7; max-width: 520px;
        }
        .hero-scroll {
          position: absolute; bottom: 40px; right: clamp(24px,6vw,80px); z-index: 3;
          display: flex; flex-direction: column; align-items: center; gap: 10px;
          font-size: 8px; letter-spacing: 3px; text-transform: uppercase;
          color: rgba(248,250,252,0.75); writing-mode: vertical-rl;
        }
        .hero-scroll-line {
          width: 1px; height: 60px;
          background: linear-gradient(to bottom, transparent, rgba(248,250,252,0.55));
          animation: scrollPulse 2s ease-in-out infinite;
        }
        @keyframes scrollPulse { 0%,100% { opacity:0.3; } 50% { opacity:1; } }
        .hero-year-badge {
          position: absolute; top: clamp(90px,12vw,140px); right: clamp(24px,6vw,80px); z-index: 3;
          border: 1px solid rgba(255,255,255,0.18);
          background: rgba(15, 23, 42, 0.78); backdrop-filter: blur(12px);
          padding: 16px 20px; text-align: center;
        }
        .hero-year-num { font-family: var(--heading-font-family); font-size: 36px; font-weight: 300; color: #7da8c7; line-height: 1; }
        .hero-year-lbl { font-size: 7px; letter-spacing: 3px; text-transform: uppercase; color: rgba(248,250,252,0.82); margin-top: 4px; }

        /* ── SECTION COMMON ── */
        .section { position: relative; z-index: 2; }

        /* ── MANIFESTO ── */
        .manifesto-section {
          padding: clamp(80px,12vw,140px) clamp(24px,8vw,120px);
          background: var(--bg);
        }
        .manifesto-line {
          display: block;
          font-family: var(--heading-font-family);
          font-size: clamp(28px,4.5vw,64px);
          font-weight: 300; line-height: 1.1; color: black;
          border-bottom: 1px solid var(--border);
          padding: 20px 0;
          transition: color 0.4s, padding-left 0.4s, background 0.3s;
          cursor: default;
        }
        .manifesto-line em { font-style: italic; color: var(--accent); }
        .manifesto-line:hover { color: black; padding-left: 16px; background: var(--hover-bg); }
        .manifesto-label {
          font-size: 9px; letter-spacing: 4px; text-transform: uppercase;
          color: var(--accent); font-weight: 500; margin-bottom: 40px;
          display: flex; align-items: center; gap: 12px;
        }
        .manifesto-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }

        /* ── STATS ── */
        .stats-section {
          padding: clamp(60px,8vw,100px) clamp(24px,8vw,120px);
          background: var(--bg2);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }
        .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 2px; }

        /* ── TIMELINE ── */
        .timeline-section {
          padding: clamp(80px,12vw,140px) clamp(24px,8vw,120px);
          background: var(--bg);
        }
        .timeline-grid {
          display: grid;
          grid-template-columns: minmax(300px,420px) minmax(0,1fr);
          gap: clamp(24px,3vw,56px);
          align-items: start;
          margin-top: 56px;
        }
        .timeline-list {
          position: relative;
          border: 1px solid var(--border);
          background: var(--bg2);
          padding: 8px 0;
        }
        .timeline-item {
          position: relative;
          padding: 22px 20px 22px 44px;
          cursor: pointer;
          border-bottom: 1px solid var(--border);
          transition: background-color 0.3s;
        }
        .timeline-item:last-child { border-bottom: none; }
        .timeline-item.active { background: var(--hover-bg); }
        .timeline-item:hover .tl-year { color: var(--accent); }
        .tl-year {
          font-family: var(--heading-font-family);
          font-size: clamp(32px,4vw,52px); font-weight: 300;
          color: #64748b; line-height: 1;
          margin-bottom: 8px; transition: color 0.3s;
        }
        .tl-year.active { color: var(--accent); }
        .tl-title {
          font-family: var(--heading-font-family);
          font-size: clamp(16px,2vw,22px); font-weight: 400;
          color: black; margin-bottom: 6px;
        }
        .tl-desc {
          font-size: 13px; color: var(--ink2);
          line-height: 1.75; max-width: 360px;
          max-height: 0; overflow: hidden;
          transition: max-height 0.5s ease, opacity 0.4s ease;
          opacity: 0;
        }
        .tl-desc.open { max-height: 120px; opacity: 1; }
        .tl-dot {
          position: absolute; left: 18px; top: 30px;
          width: 12px; height: 12px; border-radius: 50%;
          border: 2px solid var(--border2); background: var(--bg);
          transition: all 0.3s;
        }
        .tl-dot.active { border-color: var(--accent); background: var(--accent); box-shadow: 0 0 16px rgba(125,168,199,0.4); }
        .tl-right-content {
          position: sticky; top: 110px;
          padding: clamp(24px,3vw,40px);
          border: 1px solid var(--border);
          background: var(--bg2);
          box-shadow: 0 8px 32px rgba(125,168,199,0.08);
          min-height: 320px;
        }

        /* ── FOUNDER ── */
        .founder-section {
          padding: clamp(80px,12vw,140px) clamp(24px,8vw,120px);
          background: var(--bg2);
          border-top: 1px solid var(--border);
        }
        .founder-grid { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(40px,6vw,80px); align-items: center; }
        .founder-img-wrap { position: relative; aspect-ratio: 3/4; overflow: hidden; }
        .founder-img {
          width: 100%; height: 100%; object-fit: cover; object-position: center 60%;
          filter: brightness(0.9) contrast(1.02);
          transition: transform 8s ease;
        }
        .founder-img-wrap:hover .founder-img { transform: scale(1.04); }
        .founder-img-frame { position: absolute; inset: 16px; border: 1px solid rgba(125,168,199,0.3); pointer-events: none; }
        .founder-img-badge {
          position: absolute; bottom: -1px; right: -1px;
          background: var(--accent); color: #ffffff;
          padding: 16px 20px;
          font-size: 9px; letter-spacing: 3px; text-transform: uppercase; font-weight: 700;
        }
        .founder-quote-mark {
          font-family: var(--heading-font-family);
          font-size: 120px; font-weight: 300;
          color: rgba(125,168,199,0.15); line-height: 0.7;
          margin-bottom: -20px; display: block;
        }
        .founder-quote {
          font-family: var(--heading-font-family);
          font-size: clamp(18px,2.5vw,28px); font-weight: 300; font-style: italic;
          color: black; line-height: 1.6; margin-bottom: 28px;
        }
        .founder-name { font-family: var(--heading-font-family); font-size: 20px; font-weight: 400; color: var(--accent); margin-bottom: 4px; }
        .founder-role { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #475569; }
        .founder-philosophy { margin-top: 40px; padding-top: 32px; border-top: 1px solid var(--border); }
        .philosophy-item {
          display: flex; gap: 16px; padding: 14px 0;
          border-bottom: 1px solid var(--border);
          font-size: 13px; color: var(--ink2); line-height: 1.75;
        }
        .philosophy-num { font-family: var(--heading-font-family); font-size: 18px; color: var(--accent); opacity: 0.6; flex-shrink: 0; width: 24px; }

        /* ── VALUES ── */
        .values-section {
          padding: clamp(80px,12vw,140px) clamp(24px,8vw,120px);
          background: var(--bg);
        }
        .values-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; margin-top: 60px; }
        .value-card {
          background: var(--bg2); padding: clamp(28px,4vw,48px);
          border: 1px solid var(--border);
          position: relative; overflow: hidden;
          transition: border-color 0.4s, box-shadow 0.4s;
        }
        .value-card::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(125,168,199,0.06) 0%, transparent 60%);
          opacity: 0; transition: opacity 0.4s;
        }
        .value-card:hover { border-color: rgba(125,168,199,0.5); box-shadow: 0 8px 32px rgba(125,168,199,0.1); }
        .value-card:hover::before { opacity: 1; }
        .value-num {
          font-family: var(--heading-font-family);
          font-size: 64px; font-weight: 300;
          color: rgba(125,168,199,0.1); line-height: 1;
          position: absolute; top: 16px; right: 24px;
        }
        .value-title { font-family: var(--heading-font-family); font-size: clamp(18px,2.5vw,26px); font-weight: 400; color: black; margin-bottom: 14px; line-height: 1.2; }
        .value-desc { font-size: 13px; color: var(--ink2); line-height: 1.85; }
        .value-line {
          width: 32px; height: 1px; background: var(--accent); opacity: 0.5;
          margin-bottom: 16px; transition: width 0.4s;
        }
        .value-card:hover .value-line { width: 64px; opacity: 1; }

        /* ── TESTIMONIALS ── */
        .testi-section {
          padding: clamp(80px,12vw,140px) clamp(24px,8vw,120px);
          background: var(--bg2);
          border-top: 1px solid var(--border);
        }
        .testi-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 2px; margin-top: 60px; }
        .testi-card {
          background: var(--bg); padding: clamp(24px,3vw,40px);
          border: 1px solid var(--border);
          position: relative; transition: border-color 0.4s, transform 0.4s, box-shadow 0.4s;
        }
        .testi-card:hover { border-color: rgba(125,168,199,0.45); transform: translateY(-4px); box-shadow: 0 12px 40px rgba(125,168,199,0.1); }
        .testi-mark { font-family: var(--heading-font-family); font-size: 64px; font-weight: 300; color: var(--accent); opacity: 0.25; line-height: 0.7; display: block; margin-bottom: -8px; }
        .testi-text { font-family: var(--heading-font-family); font-size: clamp(15px,1.6vw,18px); font-weight: 400; font-style: italic; color: black; line-height: 1.75; margin-bottom: 24px; }
        .testi-initials {
          width: 36px; height: 36px; border-radius: 50%;
          background: rgba(125,168,199,0.12); border: 1px solid var(--border2);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; letter-spacing: 1px; color: var(--accent);
          font-weight: 500; margin-bottom: 10px;
        }
        .testi-author { font-size: 12px; color: black; font-weight: 400; }
        .testi-role   { font-size: 10px; color: #475569; letter-spacing: 1px; }

        /* ── CTA ── */
        .cta-section {
          padding: clamp(80px,12vw,140px) clamp(24px,8vw,120px);
          background: var(--bg); text-align: center;
          position: relative; overflow: hidden;
        }
        .cta-glow {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
          width: 800px; height: 400px; border-radius: 50%;
          background: radial-gradient(ellipse, rgba(125,168,199,0.1) 0%, transparent 70%);
          pointer-events: none;
        }
        .cta-title {
          font-family: var(--heading-font-family);
          font-size: clamp(40px,7vw,88px); font-weight: 300;
          color: black; line-height: 1; margin-bottom: 24px;
          position: relative; z-index: 1;
        }
        .cta-title em { font-style: italic; color: var(--accent); }
        .cta-sub { font-size: 13px; color: var(--ink2); max-width: 520px; margin: 0 auto 48px; line-height: 1.85; position: relative; z-index: 1; }
        .cta-buttons { display: flex; align-items: center; justify-content: center; gap: 16px; flex-wrap: wrap; position: relative; z-index: 1; }
        .cta-btn-primary {
          display: inline-flex; align-items: center; gap: 10px;
          background: var(--accent); color: #ffffff;
          font-size: 9px; letter-spacing: 3.5px; text-transform: uppercase; font-weight: 700;
          padding: 16px 36px; border: none; cursor: pointer; text-decoration: none;
          transition: background 0.3s, transform 0.3s;
        }
        .cta-btn-primary:hover { background: var(--accent2); transform: translateY(-2px); }
        .cta-btn-ghost {
          display: inline-flex; align-items: center; gap: 10px;
          border: 1px solid var(--border2); color: var(--accent);
          font-size: 9px; letter-spacing: 3px; text-transform: uppercase; font-weight: 500;
          padding: 15px 32px; text-decoration: none;
          transition: all 0.3s;
        }
        .cta-btn-ghost:hover { border-color: var(--accent); background: var(--hover-bg); }

        /* ── SECTION HEADERS ── */
        .section-eyebrow {
          font-size: 9px; letter-spacing: 5px; text-transform: uppercase;
          color: var(--accent); font-weight: 500; margin-bottom: 16px;
          display: flex; align-items: center; gap: 12px;
        }
        .section-eyebrow::before { content: ''; width: 32px; height: 1px; background: var(--accent); opacity: 0.5; }
        .section-title { font-family: var(--heading-font-family); font-size: clamp(36px,5.5vw,64px); font-weight: 300; color: black; line-height: 1.05; }
        .section-title em { font-style: italic; color: var(--accent); }

        /* ── DIVIDER ── */
        .slate-rule {
          width: 100%; height: 1px;
          background: linear-gradient(to right, transparent, rgba(125,168,199,0.25) 30%, rgba(125,168,199,0.25) 70%, transparent);
        }

        /* ── MOBILE ── */
        @media (max-width: 900px) {
          .stats-grid       { grid-template-columns: repeat(2,1fr); gap: 32px; }
          .timeline-grid    { grid-template-columns: 1fr; gap: 18px; margin-top: 38px; }
          .tl-right-content { position: static; min-height: 0; }
          .timeline-item    { padding: 18px 16px 18px 36px; }
          .tl-dot           { left: 12px; top: 26px; }
          .founder-grid     { grid-template-columns: 1fr; }
          .founder-img-wrap { aspect-ratio: 4/3; max-width: 480px; }
          .values-grid      { grid-template-columns: 1fr; }
          .testi-grid       { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .stats-grid      { grid-template-columns: 1fr 1fr; gap: 24px; }
          .hero-year-badge { display: none; }
          .manifesto-line  { font-size: clamp(22px,6vw,36px); }
        }
      `}</style>

      <div className="noise" />

      <div className="about-page">
        {/* ══════ HERO ══════ */}
        <section className="hero-section section" ref={hero.ref}>
          <div className="hero-bg">
            <img
              className="hero-img"
              src="/zenmen_founder_hero.jpeg"
              alt="ZENmen Atelier"
              style={{ transform: `translateY(${scrollY * 0.3}px)` }}
            />
            <div className="hero-overlay" />
            <div className="hero-grid-lines" />
          </div>

          <div className="hero-year-badge" style={fade(hero.vis, 0.5)}>
            <div className="hero-year-num">2021</div>
            <div className="hero-year-lbl">Est. New Delhi</div>
          </div>

          <div className="hero-content">
            <div className="hero-eyebrow" style={fade(hero.vis, 0)}>
              About ZENmen
            </div>
            <h1 className="hero-title" style={fade(hero.vis, 0.15)}>
              The Art of
              <br />
              Being <em>Dressed</em>
              <br />
              Right.
            </h1>
            <p className="hero-subtitle" style={fade(hero.vis, 0.3)}>
              We are not a fashion label. We are a conviction — that a man
              dressed with intention commands every room without saying a word.
            </p>
          </div>

          <div className="hero-scroll">
            <div className="hero-scroll-line" />
            Scroll
          </div>
        </section>

        {/* ══════ MANIFESTO ══════ */}
        <section className="manifesto-section section" ref={manifesto.ref}>
          <div className="manifesto-label" style={fade(manifesto.vis, 0)}>
            Our Manifesto
          </div>
          <div>
            {[
              <>
                <>Tailored for the </>
                <em>Modern Man.</em>
              </>,
              <>
                <>Rooted in </>
                <em>Craft.</em>
                <> Refined in Detail.</>
              </>,
              <>
                <>Where Tradition Meets </>
                <em>Couture.</em>
              </>,
              <>
                <>Every Stitch, a </>
                <em>Statement.</em>
              </>,
            ].map((line, i) => (
              <span
                key={i}
                className="manifesto-line"
                style={{ ...fade(manifesto.vis, i * 0.12), display: "block" }}
              >
                {line}
              </span>
            ))}
          </div>
        </section>

        {/* ══════ STATS ══════ */}
        <section className="stats-section section" ref={stats.ref}>
          <div className="stats-grid">
            {STATS.map((s, i) => (
              <AnimatedStat
                key={s.label}
                value={s.value}
                label={s.label}
                delay={i * 0.12}
                vis={stats.vis}
              />
            ))}
          </div>
        </section>

        <div className="slate-rule" />

        {/* ══════ TIMELINE ══════ */}
        <section className="timeline-section section" ref={timeline.ref}>
          <div style={fade(timeline.vis, 0)}>
            <div className="section-eyebrow">Our Journey</div>
            <h2 className="section-title">
              Four Years of <em>Obsession</em>
            </h2>
          </div>

          <div className="timeline-grid">
            <div className="timeline-list">
              {MILESTONES.map((m, i) => (
                <div
                  key={m.year}
                  className={`timeline-item ${activeMilestone === i ? "active" : ""}`}
                  onClick={() => setActiveMilestone(i)}
                  style={{
                    ...fade(timeline.vis, i * 0.1),
                    opacity: timeline.vis ? 1 : 0,
                  }}
                >
                  <div
                    className={`tl-dot ${activeMilestone === i ? "active" : ""}`}
                  />
                  <div
                    className={`tl-year ${activeMilestone === i ? "active" : ""}`}
                  >
                    {m.year}
                  </div>
                  <div className="tl-title">{m.title}</div>
                  <div
                    className={`tl-desc ${activeMilestone === i ? "open" : ""}`}
                  >
                    {m.desc}
                  </div>
                </div>
              ))}
            </div>

            <div className="tl-right-content" style={fade(timeline.vis, 0.3)}>
              <div
                style={{
                  fontSize: "9px",
                  letterSpacing: "4px",
                  textTransform: "uppercase",
                  color: "#7da8c7",
                  marginBottom: "16px",
                }}
              >
                {MILESTONES[activeMilestone].year}
              </div>
              <div
                style={{
                  fontFamily: "var(--heading-font-family)",
                  fontSize: "clamp(24px,3vw,36px)",
                  fontWeight: 300,
                  color: "#0f172a",
                  lineHeight: 1.2,
                  marginBottom: "20px",
                }}
              >
                {MILESTONES[activeMilestone].title}
              </div>
              <div
                style={{
                  width: "40px",
                  height: "1px",
                  background: "#7da8c7",
                  opacity: 0.5,
                  marginBottom: "20px",
                }}
              />
              <p
                style={{ fontSize: "14px", color: "#334155", lineHeight: 1.85 }}
              >
                {MILESTONES[activeMilestone].desc}
              </p>
              <div
                style={{
                  marginTop: "40px",
                  padding: "20px",
                  background: "rgba(125,168,199,0.05)",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    fontSize: "9px",
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    color: "#7da8c7",
                    marginBottom: "8px",
                  }}
                >
                  {activeMilestone + 1} of {MILESTONES.length}
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "1px",
                    background: "#e2e8f0",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      height: "100%",
                      background: "#7da8c7",
                      width: `${((activeMilestone + 1) / MILESTONES.length) * 100}%`,
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="slate-rule" />

        {/* ══════ FOUNDER ══════ */}
        <section className="founder-section section" ref={founder.ref}>
          <div className="founder-grid">
            <div style={fade(founder.vis, 0)}>
              <div className="founder-img-wrap">
                <img
                  className="founder-img"
                  src="/zenmen_green_kurta.jpeg"
                  alt="Founder"
                />
                <div className="founder-img-frame" />
                <div className="founder-img-badge">Founder</div>
              </div>
            </div>

            <div style={fade(founder.vis, 0.2)}>
              <div className="section-eyebrow">The Maker</div>
              <h2 className="section-title" style={{ marginBottom: "32px" }}>
                A Word from
                <br />
                the <em>Founder</em>
              </h2>
              <span className="founder-quote-mark">&quot;</span>
              <p className="founder-quote">
                I started ZENmen because I believed every man deserves to feel
                extraordinary in what he wears — not just on his wedding day,
                not just in a boardroom, but every single day. We craft for
                permanence, not trends.
              </p>
              <div
                style={{
                  width: "40px",
                  height: "1px",
                  background: "#7da8c7",
                  opacity: 0.5,
                  margin: "24px 0 20px",
                }}
              />
              <div className="founder-name">Anurag</div>
              <div className="founder-role">
                Founder & Creative Director, ZENmen
              </div>

              <div className="founder-philosophy">
                {[
                  "Trained under master tailors in Florence & Mumbai",
                  "Over 2,000 bespoke garments delivered",
                  "Fabric sourced from 12 countries",
                ].map((line, i) => (
                  <div key={i} className="philosophy-item">
                    <span className="philosophy-num">0{i + 1}</span>
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="slate-rule" />

        {/* ══════ VALUES ══════ */}
        <section className="values-section section" ref={values.ref}>
          <div style={fade(values.vis, 0)}>
            <div className="section-eyebrow">Our Principles</div>
            <h2 className="section-title">
              What We <em>Stand For</em>
            </h2>
          </div>
          <div className="values-grid">
            {VALUES.map((v, i) => (
              <div
                key={v.num}
                className="value-card"
                style={fade(values.vis, i * 0.1)}
              >
                <div className="value-num">{v.num}</div>
                <div className="value-line" />
                <h3 className="value-title">{v.title}</h3>
                <p className="value-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="slate-rule" />

        {/* ══════ TESTIMONIALS ══════ */}
        <section className="testi-section section" ref={testi.ref}>
          <div style={fade(testi.vis, 0)}>
            <div className="section-eyebrow">Client Voices</div>
            <h2 className="section-title">
              Words from <em>Gentlemen</em>
            </h2>
          </div>
          <div className="testi-grid">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={t.author}
                className="testi-card"
                style={fade(testi.vis, i * 0.12)}
              >
                <span className="testi-mark">&quot;</span>
                <p className="testi-text">{t.text}</p>
                <div className="testi-initials">{t.initials}</div>
                <div className="testi-author">{t.author}</div>
                <div className="testi-role">{t.title}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════ CTA ══════ */}
        <section className="cta-section section" ref={cta.ref}>
          <div className="cta-glow" />

          <div style={fade(cta.vis, 0)}>
            <div
              className="section-eyebrow"
              style={{ justifyContent: "center" }}
            >
              Begin
            </div>
          </div>

          <h2 className="cta-title" style={fade(cta.vis, 0.1)}>
            Ready to be
            <br />
            <em>Measured</em>?
          </h2>

          <p className="cta-sub" style={fade(cta.vis, 0.2)}>
            Every ZENmen garment begins with a conversation. Book your
            complimentary consultation and let us craft something that is
            entirely, irreversibly yours.
          </p>

          <div className="cta-buttons" style={fade(cta.vis, 0.3)}>
            <Link href="/contact" className="cta-btn-primary">
              Book a Fitting →
            </Link>
            <Link href="/collection" className="cta-btn-ghost">
              View Collection
            </Link>
          </div>

          <div
            style={{
              marginTop: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "24px",
              opacity: 0.72,
              ...fade(cta.vis, 0.4),
            }}
          >
            <div
              style={{ width: "60px", height: "1px", background: "#94a3b8" }}
            />
            <span
              style={{
                fontFamily: "var(--heading-font-family)",
                fontSize: "11px",
                letterSpacing: "6px",
                textTransform: "uppercase",
                color: "#475569",
              }}
            >
              ZENmen · Est. 2021 · New Delhi
            </span>
            <div
              style={{ width: "60px", height: "1px", background: "#94a3b8" }}
            />
          </div>
        </section>
      </div>
    </>
  );
}
