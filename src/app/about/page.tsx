// src/app/about/page.tsx
/* eslint-disable react-hooks/refs */
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

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

// ── Animated counter ──────────────────────────────────────────────────────────
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
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "clamp(42px,6vw,72px)",
          fontWeight: 300,
          color: "#c8a96e",
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
          color: "rgba(247,242,232,0.45)",
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 500,
        }}
      >
        {label}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AboutPage() {
  // Section visibility hooks
  const hero = useVisible(0.05);
  const manifesto = useVisible(0.15);
  const stats = useVisible(0.2);
  const timeline = useVisible(0.1);
  const founder = useVisible(0.15);
  const values = useVisible(0.15);
  const testi = useVisible(0.15);
  const cta = useVisible(0.2);

  // Parallax scroll for hero
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Active timeline item
  const [activeMilestone, setActiveMilestone] = useState(0);

  // Cursor glow
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const h = (e: MouseEvent) => setCursor({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);

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
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Montserrat:wght@200;300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap');

        :root {
          --ink:    #030813;
          --ink2:   #07101f;
          --gold:   #c8a96e;
          --gold2:  #e8d4a8;
          --cream:  #f7f2e8;
          --muted:  rgba(247,242,232,0.45);
          --border: rgba(200,169,110,0.18);
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .about-page {
          background: var(--ink);
          color: var(--cream);
          font-family: 'Montserrat', sans-serif;
          overflow-x: hidden;
        }

        /* ── NOISE TEXTURE ── */
        .noise {
          pointer-events: none; position: fixed; inset: 0; z-index: 0; opacity: .025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px;
        }

        /* ── CURSOR GLOW ── */
        .cursor-glow {
          pointer-events: none; position: fixed; z-index: 1;
          width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(200,169,110,0.07) 0%, transparent 70%);
          transform: translate(-50%, -50%);
          transition: left 0.12s ease, top 0.12s ease;
        }

        /* ── HERO ── */
        .hero-section {
          position: relative; width: 100%; height: 100vh; min-height: 640px;
          display: flex; flex-direction: column; justify-content: flex-end;
          overflow: hidden;
        }
        .hero-bg {
          position: absolute; inset: 0; z-index: 0;
        }
        .hero-img {
          width: 100%; height: 100%; object-fit: cover;
          object-position: center 20%;
          filter: brightness(0.45) contrast(1.1);
        }
        .hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            to top,
            rgba(3,8,19,1) 0%,
            rgba(3,8,19,0.6) 40%,
            rgba(3,8,19,0.15) 75%,
            transparent 100%
          );
        }
        .hero-grid-lines {
          position: absolute; inset: 0; z-index: 1; opacity: 0.04;
          background-image:
            linear-gradient(rgba(200,169,110,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(200,169,110,1) 1px, transparent 1px);
          background-size: 80px 80px;
        }
        .hero-content {
          position: relative; z-index: 2;
          padding: clamp(40px,8vw,100px) clamp(24px,8vw,120px) clamp(60px,8vw,100px);
          max-width: 900px;
        }
        .hero-eyebrow {
          font-size: 9px; letter-spacing: 5px; text-transform: uppercase;
          color: var(--gold); font-weight: 500; margin-bottom: 20px;
          display: flex; align-items: center; gap: 12px;
        }
        .hero-eyebrow::before {
          content: ''; width: 40px; height: 1px; background: var(--gold); opacity: 0.6;
        }
        .hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(52px,9vw,120px);
          font-weight: 300; line-height: 0.92;
          color: var(--cream); margin-bottom: 28px;
          letter-spacing: -1px;
        }
        .hero-title em { font-style: italic; color: var(--gold); }
        .hero-subtitle {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(16px,2vw,22px); font-weight: 300; font-style: italic;
          color: rgba(247,242,232,0.65); line-height: 1.7; max-width: 520px;
        }
        .hero-scroll {
          position: absolute; bottom: 40px; right: clamp(24px,6vw,80px); z-index: 3;
          display: flex; flex-direction: column; align-items: center; gap: 10px;
          font-size: 8px; letter-spacing: 3px; text-transform: uppercase;
          color: rgba(200,169,110,0.4); writing-mode: vertical-rl;
        }
        .hero-scroll-line {
          width: 1px; height: 60px;
          background: linear-gradient(to bottom, transparent, rgba(200,169,110,0.5));
          animation: scrollPulse 2s ease-in-out infinite;
        }
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.3; }
          50%       { opacity: 1; }
        }
        .hero-year-badge {
          position: absolute; top: clamp(90px,12vw,140px); right: clamp(24px,6vw,80px); z-index: 3;
          border: 1px solid var(--border);
          background: rgba(3,8,19,0.6); backdrop-filter: blur(12px);
          padding: 16px 20px; text-align: center;
        }
        .hero-year-num { font-family: 'Cormorant Garamond', serif; font-size: 36px; font-weight: 300; color: var(--gold); line-height: 1; }
        .hero-year-lbl { font-size: 7px; letter-spacing: 3px; text-transform: uppercase; color: var(--muted); margin-top: 4px; }

        /* ── SECTION COMMON ── */
        .section { position: relative; z-index: 2; }

        /* ── MANIFESTO ── */
        .manifesto-section {
          padding: clamp(80px,12vw,140px) clamp(24px,8vw,120px);
          background: var(--ink);
        }
        .manifesto-line {
          display: block;
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(28px,4.5vw,64px);
          font-weight: 300; line-height: 1.1; color: var(--cream);
          border-bottom: 1px solid var(--border);
          padding: 20px 0;
          transition: color 0.4s, padding-left 0.4s;
          cursor: default;
        }
        .manifesto-line em { font-style: italic; color: var(--gold); }
        .manifesto-line:hover { color: var(--gold2); padding-left: 16px; }
        .manifesto-label {
          font-size: 9px; letter-spacing: 4px; text-transform: uppercase;
          color: var(--gold); font-weight: 500; margin-bottom: 40px;
          display: flex; align-items: center; gap: 12px;
        }
        .manifesto-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }

        /* ── STATS ── */
        .stats-section {
          padding: clamp(60px,8vw,100px) clamp(24px,8vw,120px);
          background: var(--ink2);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }
        .stats-grid {
          display: grid; grid-template-columns: repeat(4,1fr);
          gap: 2px;
        }
        .stats-divider {
          width: 1px; background: var(--border);
          align-self: stretch; margin: 0 auto;
        }

        /* ── TIMELINE ── */
        .timeline-section {
          padding: clamp(80px,12vw,140px) clamp(24px,8vw,120px);
          background: var(--ink);
        }
        .timeline-grid {
          display: grid; grid-template-columns: 1fr 2px 1fr;
          gap: 0 40px; align-items: start;
        }
        .timeline-spine {
          width: 2px; background: var(--border);
          grid-row: 1 / span 20; align-self: stretch;
          position: relative;
        }
        .timeline-spine-fill {
          position: absolute; top: 0; left: 0; width: 100%;
          background: linear-gradient(to bottom, var(--gold), rgba(200,169,110,0.2));
          transition: height 0.6s cubic-bezier(.22,1,.36,1);
        }
        .timeline-item {
          padding: 28px 0; cursor: pointer;
          border-bottom: 1px solid rgba(200,169,110,0.08);
          transition: all 0.3s;
        }
        .timeline-item:hover .tl-year { color: var(--gold); }
        .tl-year {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(32px,4vw,52px); font-weight: 300;
          color: rgba(200,169,110,0.25); line-height: 1;
          margin-bottom: 8px; transition: color 0.3s;
        }
        .tl-year.active { color: var(--gold); }
        .tl-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(16px,2vw,22px); font-weight: 400;
          color: var(--cream); margin-bottom: 6px;
        }
        .tl-desc {
          font-size: 12px; color: var(--muted);
          line-height: 1.8; max-width: 360px;
          max-height: 0; overflow: hidden;
          transition: max-height 0.5s ease, opacity 0.4s ease;
          opacity: 0;
        }
        .tl-desc.open { max-height: 120px; opacity: 1; }
        .tl-dot {
          position: absolute; left: -7px; top: 32px;
          width: 14px; height: 14px; border-radius: 50%;
          border: 2px solid var(--border); background: var(--ink);
          transition: all 0.3s;
        }
        .tl-dot.active { border-color: var(--gold); background: var(--gold); box-shadow: 0 0 16px rgba(200,169,110,0.5); }
        .tl-right-content {
          position: sticky; top: 120px;
          padding: 40px;
          border: 1px solid var(--border);
          background: var(--ink2);
        }

        /* ── FOUNDER ── */
        .founder-section {
          padding: clamp(80px,12vw,140px) clamp(24px,8vw,120px);
          background: var(--ink2);
          border-top: 1px solid var(--border);
        }
        .founder-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: clamp(40px,6vw,80px); align-items: center;
        }
        .founder-img-wrap {
          position: relative; aspect-ratio: 3/4; overflow: hidden;
        }
        .founder-img {
          width: 100%; height: 100%; object-fit: cover;
          object-position: center 10%;
          filter: brightness(0.85) contrast(1.05);
          transition: transform 8s ease;
        }
        .founder-img-wrap:hover .founder-img { transform: scale(1.04); }
        .founder-img-frame {
          position: absolute; inset: 16px;
          border: 1px solid rgba(200,169,110,0.25);
          pointer-events: none;
        }
        .founder-img-badge {
          position: absolute; bottom: -1px; right: -1px;
          background: var(--gold); color: var(--ink);
          padding: 16px 20px;
          font-size: 9px; letter-spacing: 3px; text-transform: uppercase; font-weight: 700;
        }
        .founder-quote-mark {
          font-family: 'Cormorant Garamond', serif;
          font-size: 120px; font-weight: 300;
          color: rgba(200,169,110,0.12); line-height: 0.7;
          margin-bottom: -20px; display: block;
        }
        .founder-quote {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(18px,2.5vw,28px); font-weight: 300; font-style: italic;
          color: var(--cream); line-height: 1.6; margin-bottom: 28px;
        }
        .founder-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px; font-weight: 400; color: var(--gold);
          margin-bottom: 4px;
        }
        .founder-role {
          font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
          color: var(--muted);
        }
        .founder-philosophy {
          margin-top: 40px; padding-top: 32px;
          border-top: 1px solid var(--border);
        }
        .philosophy-item {
          display: flex; gap: 16px; padding: 14px 0;
          border-bottom: 1px solid rgba(200,169,110,0.08);
          font-size: 12px; color: rgba(247,242,232,0.6);
          line-height: 1.7;
        }
        .philosophy-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px; color: var(--gold); opacity: 0.4;
          flex-shrink: 0; width: 24px;
        }

        /* ── VALUES ── */
        .values-section {
          padding: clamp(80px,12vw,140px) clamp(24px,8vw,120px);
          background: var(--ink);
        }
        .values-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 2px; margin-top: 60px;
        }
        .value-card {
          background: var(--ink2); padding: clamp(28px,4vw,48px);
          border: 1px solid var(--border);
          position: relative; overflow: hidden;
          transition: border-color 0.4s;
        }
        .value-card::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(200,169,110,0.05) 0%, transparent 60%);
          opacity: 0; transition: opacity 0.4s;
        }
        .value-card:hover { border-color: rgba(200,169,110,0.4); }
        .value-card:hover::before { opacity: 1; }
        .value-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 64px; font-weight: 300;
          color: rgba(200,169,110,0.08); line-height: 1;
          position: absolute; top: 16px; right: 24px;
        }
        .value-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(18px,2.5vw,26px); font-weight: 400;
          color: var(--cream); margin-bottom: 14px; line-height: 1.2;
        }
        .value-desc {
          font-size: 12px; color: var(--muted); line-height: 1.9;
        }
        .value-line {
          width: 32px; height: 1px; background: var(--gold); opacity: 0.5;
          margin-bottom: 16px;
          transition: width 0.4s;
        }
        .value-card:hover .value-line { width: 64px; opacity: 1; }

        /* ── TESTIMONIALS ── */
        .testi-section {
          padding: clamp(80px,12vw,140px) clamp(24px,8vw,120px);
          background: var(--ink2);
          border-top: 1px solid var(--border);
        }
        .testi-grid {
          display: grid; grid-template-columns: repeat(3,1fr);
          gap: 2px; margin-top: 60px;
        }
        .testi-card {
          background: var(--ink); padding: clamp(24px,3vw,40px);
          border: 1px solid var(--border);
          position: relative; transition: border-color 0.4s, transform 0.4s;
        }
        .testi-card:hover { border-color: rgba(200,169,110,0.4); transform: translateY(-4px); }
        .testi-mark {
          font-family: 'Cormorant Garamond', serif;
          font-size: 64px; font-weight: 300; color: var(--gold); opacity: 0.3;
          line-height: 0.7; display: block; margin-bottom: -8px;
        }
        .testi-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(15px,1.6vw,18px); font-weight: 300; font-style: italic;
          color: rgba(247,242,232,0.8); line-height: 1.7;
          margin-bottom: 24px;
        }
        .testi-initials {
          width: 36px; height: 36px; border-radius: 50%;
          background: rgba(200,169,110,0.15); border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; letter-spacing: 1px; color: var(--gold);
          font-weight: 500; margin-bottom: 10px;
        }
        .testi-author { font-size: 12px; color: var(--cream); font-weight: 400; }
        .testi-role   { font-size: 10px; color: var(--muted); letter-spacing: 1px; }

        /* ── CTA ── */
        .cta-section {
          padding: clamp(80px,12vw,140px) clamp(24px,8vw,120px);
          background: var(--ink); text-align: center;
          position: relative; overflow: hidden;
        }
        .cta-glow {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
          width: 800px; height: 400px; border-radius: 50%;
          background: radial-gradient(ellipse, rgba(200,169,110,0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .cta-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(40px,7vw,88px); font-weight: 300;
          color: var(--cream); line-height: 1; margin-bottom: 24px;
          position: relative; z-index: 1;
        }
        .cta-title em { font-style: italic; color: var(--gold); }
        .cta-sub {
          font-size: 12px; color: var(--muted); max-width: 480px;
          margin: 0 auto 48px; line-height: 1.9; position: relative; z-index: 1;
        }
        .cta-buttons {
          display: flex; align-items: center; justify-content: center;
          gap: 16px; flex-wrap: wrap; position: relative; z-index: 1;
        }
        .cta-btn-primary {
          display: inline-flex; align-items: center; gap: 10px;
          background: var(--gold); color: var(--ink);
          font-size: 9px; letter-spacing: 3.5px; text-transform: uppercase; font-weight: 700;
          padding: 16px 36px; border: none; cursor: pointer; text-decoration: none;
          transition: background 0.3s, transform 0.3s;
        }
        .cta-btn-primary:hover { background: var(--gold2); transform: translateY(-2px); }
        .cta-btn-ghost {
          display: inline-flex; align-items: center; gap: 10px;
          border: 1px solid rgba(200,169,110,0.4); color: var(--gold);
          font-size: 9px; letter-spacing: 3px; text-transform: uppercase; font-weight: 500;
          padding: 15px 32px; text-decoration: none;
          transition: all 0.3s;
        }
        .cta-btn-ghost:hover { border-color: var(--gold); background: rgba(200,169,110,0.08); }

        /* Section headers */
        .section-eyebrow {
          font-size: 9px; letter-spacing: 5px; text-transform: uppercase;
          color: var(--gold); font-weight: 500; margin-bottom: 16px;
          display: flex; align-items: center; gap: 12px;
        }
        .section-eyebrow::before { content: ''; width: 32px; height: 1px; background: var(--gold); opacity: 0.5; }
        .section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px,5.5vw,64px); font-weight: 300;
          color: var(--cream); line-height: 1.05;
        }
        .section-title em { font-style: italic; color: var(--gold); }

        /* Horizontal gold rule */
        .gold-rule {
          width: 100%; height: 1px;
          background: linear-gradient(to right, transparent, rgba(200,169,110,0.3) 30%, rgba(200,169,110,0.3) 70%, transparent);
        }

        /* ── MOBILE ── */
        @media (max-width: 900px) {
          .stats-grid        { grid-template-columns: repeat(2,1fr); gap: 32px; }
          .timeline-grid     { grid-template-columns: 1fr; gap: 0; }
          .timeline-spine    { display: none; }
          .tl-right-content  { display: none; }
          .founder-grid      { grid-template-columns: 1fr; }
          .founder-img-wrap  { aspect-ratio: 4/3; max-width: 480px; }
          .values-grid       { grid-template-columns: 1fr; }
          .testi-grid        { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .stats-grid        { grid-template-columns: 1fr 1fr; gap: 24px; }
          .hero-year-badge   { display: none; }
          .manifesto-line    { font-size: clamp(22px,6vw,36px); }
        }
      `}</style>

      {/* Cursor glow */}
      <div className="cursor-glow" style={{ left: cursor.x, top: cursor.y }} />
      {/* Noise */}
      <div className="noise" />

      <div className="about-page">
        {/* ══════════════════════════════════════════
            HERO
        ══════════════════════════════════════════ */}
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

          {/* Year badge */}
          <div className="hero-year-badge" style={fade(hero.vis, 0.5)}>
            <div className="hero-year-num">2021</div>
            <div className="hero-year-lbl">Est. New Delhi</div>
          </div>

          {/* Main content */}
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

          {/* Scroll cue */}
          <div className="hero-scroll">
            <div className="hero-scroll-line" />
            Scroll
          </div>
        </section>

        {/* ══════════════════════════════════════════
            MANIFESTO
        ══════════════════════════════════════════ */}
        <section className="manifesto-section section" ref={manifesto.ref}>
          <div className="manifesto-label" style={fade(manifesto.vis, 0)}>
            Our Manifesto
          </div>
          <div>
            {[
              <>
                Tailored for the <em>Modern Man.</em>
              </>,
              <>
                Rooted in <em>Craft.</em> Refined in Detail.
              </>,
              <>
                Where Tradition Meets <em>Couture.</em>
              </>,
              <>
                Every Stitch, a <em>Statement.</em>
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

        {/* ══════════════════════════════════════════
            STATS
        ══════════════════════════════════════════ */}
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

        <div className="gold-rule" />

        {/* ══════════════════════════════════════════
            TIMELINE
        ══════════════════════════════════════════ */}
        <section className="timeline-section section" ref={timeline.ref}>
          <div style={fade(timeline.vis, 0)}>
            <div className="section-eyebrow">Our Journey</div>
            <h2 className="section-title">
              Four Years of <em>Obsession</em>
            </h2>
          </div>

          <div className="timeline-grid" style={{ marginTop: "60px" }}>
            {/* Left — items */}
            <div>
              {MILESTONES.map((m, i) => (
                <div
                  key={m.year}
                  className="timeline-item"
                  onClick={() => setActiveMilestone(i)}
                  style={{
                    ...fade(timeline.vis, i * 0.1),
                    opacity: timeline.vis ? 1 : 0,
                    position: "relative",
                    paddingLeft: "28px",
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

            {/* Spine */}
            <div className="timeline-spine">
              <div
                className="timeline-spine-fill"
                style={{
                  height: `${((activeMilestone + 1) / MILESTONES.length) * 100}%`,
                }}
              />
            </div>

            {/* Right — sticky detail */}
            <div className="tl-right-content" style={fade(timeline.vis, 0.3)}>
              <div
                style={{
                  fontSize: "9px",
                  letterSpacing: "4px",
                  textTransform: "uppercase",
                  color: "var(--gold)",
                  marginBottom: "16px",
                }}
              >
                {MILESTONES[activeMilestone].year}
              </div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(24px,3vw,36px)",
                  fontWeight: 300,
                  color: "var(--cream)",
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
                  background: "var(--gold)",
                  opacity: 0.5,
                  marginBottom: "20px",
                }}
              />
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--muted)",
                  lineHeight: 1.9,
                }}
              >
                {MILESTONES[activeMilestone].desc}
              </p>
              <div
                style={{
                  marginTop: "40px",
                  padding: "20px",
                  background: "rgba(200,169,110,0.04)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    fontSize: "9px",
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    color: "var(--gold)",
                    marginBottom: "8px",
                  }}
                >
                  {activeMilestone + 1} of {MILESTONES.length}
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "1px",
                    background: "var(--border)",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      height: "100%",
                      background: "var(--gold)",
                      width: `${((activeMilestone + 1) / MILESTONES.length) * 100}%`,
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="gold-rule" />

        {/* ══════════════════════════════════════════
            FOUNDER
        ══════════════════════════════════════════ */}
        <section className="founder-section section" ref={founder.ref}>
          <div className="founder-grid">
            {/* Image */}
            <div style={fade(founder.vis, 0)}>
              <div className="founder-img-wrap">
                <img
                  className="founder-img"
                  src="/founder_model_1.png"
                  alt="Founder"
                />
                <div className="founder-img-frame" />
                <div className="founder-img-badge">Founder</div>
              </div>
            </div>

            {/* Text */}
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
                  background: "var(--gold)",
                  opacity: 0.5,
                  margin: "24px 0 20px",
                }}
              />
              <div className="founder-name">Rohan Zenith</div>
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

        <div className="gold-rule" />

        {/* ══════════════════════════════════════════
            VALUES
        ══════════════════════════════════════════ */}
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

        <div className="gold-rule" />

        {/* ══════════════════════════════════════════
            TESTIMONIALS
        ══════════════════════════════════════════ */}
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

        {/* ══════════════════════════════════════════
            CTA
        ══════════════════════════════════════════ */}
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

          {/* Bottom stamp */}
          <div
            style={{
              marginTop: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "24px",
              opacity: 0.25,
              ...fade(cta.vis, 0.4),
            }}
          >
            <div
              style={{
                width: "60px",
                height: "1px",
                background: "var(--gold)",
              }}
            />
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "11px",
                letterSpacing: "6px",
                textTransform: "uppercase",
                color: "var(--gold)",
              }}
            >
              ZENmen · Est. 2021 · New Delhi
            </span>
            <div
              style={{
                width: "60px",
                height: "1px",
                background: "var(--gold)",
              }}
            />
          </div>
        </section>
      </div>
    </>
  );
}
