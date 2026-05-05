"use client";

import { useScrolled } from "@/app/hooks/useScrolled";
import { Menu, ShoppingCartIcon, User, X } from "lucide-react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/services", label: "Services" },
  { href: "/process", label: "Process" },
  { href: "/collection", label: "Collection" },
  { href: "/stories", label: "Stories" },
  { href: "/contact", label: "Contact" },
];

/* ── Sample cart items – replace with real cart state ── */
const SAMPLE_ITEMS: {
  id: number;
  name: string;
  subtitle: string;
  price: number;
  qty: number;
}[] = [];

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!cartOpen && !authOpen) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCartOpen(false);
      if (e.key === "Escape") setAuthOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onEsc);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onEsc);
    };
  }, [cartOpen, authOpen]);

  const subtotal = SAMPLE_ITEMS.reduce((s, i) => s + i.price * i.qty, 0);
  const handleGoogleSignIn = async () => {
    setAuthOpen(false);
    await signIn("google", { callbackUrl: "/" });
  };

  return (
    <>
      <style>{`
        /* ── Navbar base ── */
        .znav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 80;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 clamp(16px, 4vw, 48px);
          height: 68px;
          transition: background 0.4s ease, backdrop-filter 0.4s ease, box-shadow 0.4s ease;
        }
        .znav.scrolled {
          background: rgba(3, 8, 19, 0.88);
          backdrop-filter: blur(18px);
          box-shadow: 0 1px 0 rgba(200,169,110,0.12);
        }

        /* ── Logo ── */
        .znav-logo { display:flex; align-items:center; gap:10px; text-decoration:none; }
        .znav-logo-mark {
          width: 40px;
          height: 40px;
          border-radius: 999px;
          border: 1px solid rgba(200,169,110,0.35);
          background: rgba(10,18,36,0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }
        .znav-logo-img {
          width: 36px;
          height: 36px;
          object-fit: contain;
          transition: transform 0.75s cubic-bezier(0.22,1,0.36,1);
        }
        .znav-logo:hover .znav-logo-img {
          transform: rotate(360deg);
        }
        .znav-logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 1.25rem;
          font-weight: 300;
          letter-spacing: 0.08em;
          color: #f7f2e8;
          line-height: 1;
        }
        .znav-logo-sub {
          display: block;
          font-family: 'Cormorant Garamond', serif;
          font-size: 8px;
          letter-spacing: 0.38em;
          text-transform: uppercase;
          color: rgba(200,169,110,0.65);
          margin-top: 3px;
        }

        /* ── Nav links ── */
        .znav-link {
          font-family: 'Cormorant Garamond', serif;
          font-size: 11px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          text-decoration: none;
          color: rgba(247,242,232,0.75);
          position: relative;
          padding-bottom: 2px;
          transition: color 0.3s;
        }
        .znav-link:hover, .znav-link.active { color: #c8a96e; }
        .znav-link::after {
          content: '';
          position: absolute;
          bottom: -1px; left: 0;
          height: 0.5px;
          width: 0;
          background: #c8a96e;
          transition: width 0.35s cubic-bezier(0.22,1,0.36,1);
        }
        .znav-link:hover::after, .znav-link.active::after { width: 100%; }

        /* ── Icon button ── */
        .znav-icon {
          position: relative;
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 36px;
          border-radius: 50%;
          border: 0.5px solid rgba(255,255,255,0.1);
          color: rgba(247,242,232,0.7);
          background: transparent;
          cursor: pointer;
          transition: border-color 0.3s, color 0.3s, background 0.3s;
        }
        .znav-icon:hover {
          border-color: rgba(200,169,110,0.5);
          color: #c8a96e;
          background: rgba(200,169,110,0.06);
        }

        /* ── CTA button ── */
        .znav-cta {
          padding: 9px 20px;
          border: 0.5px solid rgba(200,169,110,0.55);
          font-family: 'Cormorant Garamond', serif;
          font-size: 10px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #c8a96e;
          text-decoration: none;
          transition: background 0.3s, color 0.3s;
          white-space: nowrap;
        }
        .znav-cta:hover {
          background: #c8a96e;
          color: #030813;
        }

        /* ── Hamburger ── */
        .znav-ham {
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 36px;
          border-radius: 50%;
          border: 0.5px solid rgba(200,169,110,0.5);
          color: #c8a96e;
          background: transparent;
          cursor: pointer;
          z-index: 90;
        }

        /* ── Mobile menu ── */
        .znav-mobile {
          position: fixed;
          top: 68px; left: 0; right: 0;
          background: rgba(3,8,19,0.97);
          backdrop-filter: blur(20px);
          border-top: 0.5px solid rgba(200,169,110,0.12);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          padding: 0;
          z-index: 79;
          overflow: hidden;
        }
        .znav-mobile-link {
          width: 100%;
          text-align: center;
          padding: 16px 24px;
          border-bottom: 0.5px solid rgba(200,169,110,0.07);
          font-family: 'Cormorant Garamond', serif;
          font-size: 12px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          text-decoration: none;
          color: rgba(200,169,110,0.5);
          transition: color 0.25s, background 0.25s;
        }
        .znav-mobile-link:hover, .znav-mobile-link.active {
          color: #c8a96e;
          background: rgba(200,169,110,0.04);
        }
        .znav-mobile-cta {
          margin: 20px auto 28px;
          display: inline-block;
          padding: 12px 32px;
          border: 0.5px solid rgba(200,169,110,0.5);
          font-family: 'Cormorant Garamond', serif;
          font-size: 11px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #c8a96e;
          text-decoration: none;
          transition: background 0.3s, color 0.3s;
        }
        .znav-mobile-cta:hover { background: #c8a96e; color: #030813; }

        /* Auth modal */
        .auth-backdrop {
          position: fixed; inset: 0; z-index: 88;
          background: rgba(2, 6, 15, 0.55);
          backdrop-filter: blur(9px);
          opacity: 0; pointer-events: none;
          transition: opacity 0.3s ease;
        }
        .auth-backdrop.open { opacity: 1; pointer-events: auto; }
        .auth-modal-wrap {
          position: fixed; inset: 0; z-index: 89;
          display: grid; place-items: center;
          padding: 20px;
          opacity: 0; pointer-events: none;
          transition: opacity 0.3s ease;
        }
        .auth-modal-wrap.open { opacity: 1; pointer-events: auto; }
        .auth-modal {
          width: min(100%, 480px);
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          border: 1px solid rgba(200,169,110,0.3);
          background: linear-gradient(160deg, rgba(9,15,30,0.98), rgba(7,12,24,0.98));
          box-shadow: 0 24px 70px rgba(0,0,0,0.58);
          transform: translateY(8px) scale(0.985);
          transition: transform 0.32s cubic-bezier(0.22,1,0.36,1);
        }
        .auth-modal-wrap.open .auth-modal { transform: translateY(0) scale(1); }
        .auth-head { display:flex; align-items:center; justify-content:space-between; padding:18px 20px; border-bottom:1px solid rgba(200,169,110,0.14); }
        .auth-title { font-family:'Playfair Display',serif; font-size:30px; color:#f7f2e8; font-weight:400; line-height:1; }
        .auth-tabs { display:grid; grid-template-columns:1fr 1fr; margin:14px 20px 0; border:1px solid rgba(200,169,110,0.2); background:rgba(200,169,110,0.03); }
        .auth-tab { border:0; background:transparent; color:rgba(247,242,232,0.65); font-family:'Cormorant Garamond',serif; letter-spacing:0.18em; text-transform:uppercase; font-size:11px; padding:11px 8px; cursor:pointer; transition:all 0.25s ease; }
        .auth-tab.active { background:rgba(200,169,110,0.16); color:#c8a96e; }
        .auth-body { padding:18px 20px 20px; }
        .auth-google { width:100%; border:1px solid #dadce0; background:#fff; color:#3c4043; padding:11px 14px; display:flex; align-items:center; justify-content:center; gap:10px; font-size:13px; font-weight:500; letter-spacing:0.01em; cursor:pointer; transition:all 0.2s ease; }
        .auth-google:hover { background:#f8f9fa; border-color:#d2d5da; }
        .auth-sep { display:grid; grid-template-columns:1fr auto 1fr; align-items:center; gap:12px; margin:14px 0; color:rgba(247,242,232,0.45); font-size:10px; letter-spacing:0.2em; text-transform:uppercase; }
        .auth-sep::before, .auth-sep::after { content:''; height:1px; background:rgba(200,169,110,0.14); }
        .auth-grid { display:grid; gap:12px; }
        .auth-grid.two { grid-template-columns:1fr 1fr; }
        .auth-field label { display:block; margin-bottom:6px; font-size:10px; letter-spacing:0.18em; text-transform:uppercase; color:rgba(200,169,110,0.82); }
        .auth-input { width:100%; border:1px solid rgba(200,169,110,0.24); background:rgba(7,13,26,0.86); color:#f7f2e8; padding:11px 12px; font-size:14px; outline:none; transition:border-color 0.2s, box-shadow 0.2s; }
        .auth-input:focus { border-color:rgba(200,169,110,0.65); box-shadow:0 0 0 2px rgba(200,169,110,0.14); }
        .auth-row { margin-top:8px; display:flex; justify-content:space-between; align-items:center; gap:10px; font-size:11px; color:rgba(247,242,232,0.62); }
        .auth-check { display:inline-flex; align-items:center; gap:8px; cursor:pointer; }
        .auth-link { color:#c8a96e; text-decoration:none; }
        .auth-link:hover { text-decoration:underline; }
        .auth-submit { margin-top:14px; width:100%; border:1px solid rgba(200,169,110,0.58); background:#c8a96e; color:#030813; padding:12px 14px; font-size:11px; letter-spacing:0.24em; text-transform:uppercase; cursor:pointer; transition:background 0.25s ease, transform 0.2s ease; }
        .auth-submit:hover { background:#e0bd7d; transform:translateY(-1px); }
        .auth-foot { margin-top:12px; text-align:center; font-size:12px; color:rgba(247,242,232,0.64); }

        /* ════════════════════════════════════════
           CART DRAWER
        ════════════════════════════════════════ */
        .cart-backdrop {
          position: fixed; inset: 0;
          z-index: 90;
          background: rgba(0,0,0,0);
          backdrop-filter: blur(0px);
          pointer-events: none;
          transition: background 0.4s ease, backdrop-filter 0.4s ease;
        }
        .cart-backdrop.open {
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(6px);
          pointer-events: auto;
        }

        .cart-drawer {
          position: fixed;
          top: 0; right: 0;
          z-index: 95;
          height: 100dvh;
          width: min(100vw, 480px);
          display: flex;
          flex-direction: column;
          background: #07090f;
          border-left: 0.5px solid rgba(200,169,110,0.15);
          box-shadow: -24px 0 72px rgba(0,0,0,0.6);
          transform: translateX(100%);
          transition: transform 0.45s cubic-bezier(0.22,1,0.36,1);
          overflow: hidden;
        }
        .cart-drawer.open {
          transform: translateX(0);
        }

        /* Drawer ambient glow */
        .cart-drawer::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 280px; height: 280px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(200,169,110,0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        /* ── Drawer header ── */
        .cart-header {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px clamp(20px, 5vw, 32px) 20px;
          border-bottom: 0.5px solid rgba(200,169,110,0.1);
          background: rgba(10,14,26,0.6);
        }
        .cart-header-left { display: flex; flex-direction: column; gap: 4px; }
        .cart-eyebrow {
          font-family: 'Cormorant Garamond', serif;
          font-size: 9px;
          letter-spacing: 0.44em;
          text-transform: uppercase;
          color: #c8a96e;
          margin: 0;
        }
        .cart-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.6rem, 4vw, 2.1rem);
          font-weight: 300;
          color: #f8f4ec;
          margin: 0;
          letter-spacing: -0.01em;
          line-height: 1;
        }
        .cart-close {
          flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          width: 40px; height: 40px;
          border: 0.5px solid rgba(200,169,110,0.28);
          color: rgba(200,169,110,0.7);
          background: transparent;
          cursor: pointer;
          transition: border-color 0.3s, color 0.3s, background 0.3s;
          border-radius: 1px;
        }
        .cart-close:hover {
          border-color: rgba(200,169,110,0.7);
          color: #c8a96e;
          background: rgba(200,169,110,0.07);
        }

        /* ── Drawer body ── */
        .cart-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px clamp(20px, 5vw, 32px);
          display: flex;
          flex-direction: column;
          gap: 16px;
          scrollbar-width: thin;
          scrollbar-color: rgba(200,169,110,0.15) transparent;
        }

        /* ── Empty state ── */
        .cart-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          min-height: 280px;
          gap: 0;
        }
        .cart-empty-icon {
          width: 56px; height: 56px;
          border: 0.5px solid rgba(200,169,110,0.2);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
          color: rgba(200,169,110,0.4);
        }
        .cart-empty-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem;
          font-weight: 300;
          color: #e8d4a8;
          margin: 0 0 8px;
          text-align: center;
        }
        .cart-empty-sub {
          font-family: 'Cormorant Garamond', serif;
          font-size: 0.95rem;
          color: rgba(200,169,110,0.4);
          margin: 0 0 28px;
          text-align: center;
          line-height: 1.6;
        }
        .cart-browse-btn {
          display: inline-block;
          padding: 11px 28px;
          border: 0.5px solid rgba(200,169,110,0.45);
          font-family: 'Cormorant Garamond', serif;
          font-size: 10px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #c8a96e;
          text-decoration: none;
          transition: background 0.3s, color 0.3s;
        }
        .cart-browse-btn:hover { background: #c8a96e; color: #030813; }

        /* ── Info notice ── */
        .cart-notice {
          padding: 14px 16px;
          border: 0.5px solid rgba(200,169,110,0.12);
          background: rgba(200,169,110,0.03);
          border-radius: 1px;
        }
        .cart-notice-label {
          font-family: 'Cormorant Garamond', serif;
          font-size: 9px;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: rgba(200,169,110,0.45);
          margin: 0 0 6px;
        }
        .cart-notice-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: 0.9rem;
          color: rgba(200,169,110,0.3);
          margin: 0;
          line-height: 1.55;
        }

        /* ── Cart item ── */
        .cart-item {
          display: grid;
          grid-template-columns: 64px 1fr auto;
          gap: 14px;
          align-items: start;
          padding-bottom: 16px;
          border-bottom: 0.5px solid rgba(200,169,110,0.08);
        }
        .cart-item-img {
          width: 64px; height: 80px;
          background: rgba(200,169,110,0.06);
          border: 0.5px solid rgba(200,169,110,0.12);
          border-radius: 1px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          font-family: 'Cormorant Garamond', serif;
          font-size: 8px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(200,169,110,0.3);
        }
        .cart-item-name {
          font-family: 'Playfair Display', serif;
          font-size: 0.95rem;
          font-weight: 300;
          color: #f8f4ec;
          margin: 0 0 4px;
          line-height: 1.3;
        }
        .cart-item-sub {
          font-family: 'Cormorant Garamond', serif;
          font-size: 9px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(200,169,110,0.45);
          margin: 0 0 10px;
        }
        .cart-item-qty {
          display: flex; align-items: center; gap: 10px;
        }
        .cart-qty-btn {
          width: 24px; height: 24px;
          border: 0.5px solid rgba(200,169,110,0.25);
          color: rgba(200,169,110,0.6);
          background: transparent;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px;
          line-height: 1;
          transition: border-color 0.2s, color 0.2s;
        }
        .cart-qty-btn:hover { border-color: #c8a96e; color: #c8a96e; }
        .cart-qty-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 0.9rem;
          color: #f8f4ec;
          min-width: 16px;
          text-align: center;
        }
        .cart-item-price {
          font-family: 'Playfair Display', serif;
          font-size: 1rem;
          font-weight: 300;
          color: #c8a96e;
          white-space: nowrap;
        }
        .cart-item-remove {
          display: block;
          margin-top: 6px;
          font-family: 'Cormorant Garamond', serif;
          font-size: 8px;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: rgba(200,169,110,0.25);
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: color 0.2s;
          text-align: right;
        }
        .cart-item-remove:hover { color: rgba(200,169,110,0.65); }

        /* ── Drawer footer ── */
        .cart-footer {
          flex-shrink: 0;
          border-top: 0.5px solid rgba(200,169,110,0.1);
          background: rgba(5,9,22,0.92);
          padding: 20px clamp(20px, 5vw, 32px) clamp(20px, 5vw, 32px);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* Subtotal row */
        .cart-subtotal {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
        }
        .cart-subtotal-label {
          font-family: 'Cormorant Garamond', serif;
          font-size: 10px;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: rgba(200,169,110,0.45);
        }
        .cart-subtotal-value {
          font-family: 'Playfair Display', serif;
          font-size: 1.8rem;
          font-weight: 300;
          color: #e8d4a8;
          letter-spacing: -0.01em;
        }

        /* Shipping note */
        .cart-shipping-note {
          font-family: 'Cormorant Garamond', serif;
          font-size: 9px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(200,169,110,0.25);
          text-align: center;
          margin: 0;
        }

        /* Checkout button */
        .cart-checkout-btn {
          width: 100%;
          padding: 15px 24px;
          background: #c8a96e;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          font-family: 'Cormorant Garamond', serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: #030813;
          border-radius: 1px;
          transition: background 0.3s ease;
        }
        .cart-checkout-btn:hover { background: #d8b97e; }
        .cart-checkout-btn:disabled {
          background: rgba(200,169,110,0.2);
          color: rgba(200,169,110,0.35);
          cursor: not-allowed;
        }

        /* Continue shopping */
        .cart-continue {
          display: block;
          text-align: center;
          font-family: 'Cormorant Garamond', serif;
          font-size: 9px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: rgba(200,169,110,0.3);
          text-decoration: none;
          transition: color 0.3s;
          cursor: pointer;
          background: transparent;
          border: none;
          width: 100%;
        }
        .cart-continue:hover { color: rgba(200,169,110,0.65); }

        /* Divider */
        .cart-divider {
          height: 0.5px;
          background: rgba(200,169,110,0.08);
          width: 100%;
        }

        /* ── Responsive tweaks ── */
        @media (max-width: 400px) {
          .cart-drawer { width: 100vw; border-left: none; }
          .cart-item { grid-template-columns: 56px 1fr auto; gap: 10px; }
          .cart-item-img { width: 56px; height: 70px; }
        }
      `}</style>

      {/* ════════════════ NAVBAR ════════════════ */}
      <nav className={`znav ${scrolled ? "scrolled" : ""}`}>
        {/* LEFT: Logo */}
        <Link href="/" className="znav-logo">
          <span className="znav-logo-mark" aria-hidden="true">
            <img src="/logo_zenmen.png" alt="" className="znav-logo-img" />
          </span>
          <div className="znav-logo-text-wrap">
            <span className="znav-logo-text">ZENmen</span>
            <span className="znav-logo-sub">Bespoke Tailoring</span>
          </div>
        </Link>

        {/* CENTER: Desktop nav */}
        <ul
          style={{
            display: "none",
            listStyle: "none",
            margin: 0,
            padding: 0,
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            gap: "36px",
          }}
          className="md-flex"
        >
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`znav-link${pathname === l.href ? " active" : ""}`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* RIGHT: Actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexShrink: 0,
          }}
        >
          {/* Instagram */}
          <a
            href="https://www.instagram.com/_zenmen/"
            target="_blank"
            rel="noopener noreferrer"
            className="znav-icon sm-flex"
            style={{ textDecoration: "none" }}
            aria-label="Instagram"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle
                cx="17.5"
                cy="6.5"
                r="1"
                fill="currentColor"
                stroke="none"
              />
            </svg>
          </a>

          {/* User */}
          <button
            className="znav-icon sm-flex"
            aria-label="Account"
            onClick={() => setAuthOpen(true)}
          >
            <User size={16} />
          </button>

          {/* Cart */}
          <button
            className="znav-icon"
            onClick={() => setCartOpen(true)}
            aria-label="Cart"
          >
            <ShoppingCartIcon size={16} />
            {SAMPLE_ITEMS.length > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#c8a96e",
                }}
              />
            )}
          </button>

          {/* Book CTA */}
          <Link
            href="/contact"
            className="znav-cta md-block"
            style={{ display: "none" }}
          >
            Book Appointment
          </Link>

          {/* Hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="znav-ham md-hidden"
            aria-label="Menu"
          >
            {open ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </nav>

      {/* ════════════════ MOBILE MENU ════════════════ */}
      <div
        className="znav-mobile md-hidden"
        style={{
          maxHeight: open ? "480px" : "0px",
          transition: "max-height 0.4s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            className={`znav-mobile-link${pathname === l.href ? " active" : ""}`}
          >
            {l.label}
          </Link>
        ))}
        <Link
          href="/contact"
          onClick={() => setOpen(false)}
          className="znav-mobile-cta"
        >
          Book Appointment
        </Link>
      </div>

      {/* ════════════════ CART BACKDROP ════════════════ */}
      <div
        className={`auth-backdrop${authOpen ? " open" : ""}`}
        onClick={() => setAuthOpen(false)}
        aria-hidden
      />
      <div className={`auth-modal-wrap${authOpen ? " open" : ""}`}>
        <div
          className="auth-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Account access"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="auth-head">
            <h3 className="auth-title">
              {authMode === "login" ? "Welcome Back" : "Create Account"}
            </h3>
            <button
              onClick={() => setAuthOpen(false)}
              className="cart-close"
              aria-label="Close account modal"
            >
              <X size={17} />
            </button>
          </div>
          <div className="auth-tabs">
            <button className={`auth-tab${authMode === "login" ? " active" : ""}`} onClick={() => setAuthMode("login")}>Login</button>
            <button className={`auth-tab${authMode === "signup" ? " active" : ""}`} onClick={() => setAuthMode("signup")}>Sign Up</button>
          </div>
          <div className="auth-body">
            {status === "authenticated" ? (
              <div style={{ textAlign: "center", marginBottom: "10px" }}>
                <p style={{ color: "#f7f2e8", fontSize: "14px", marginBottom: "6px" }}>
                  Signed in as {session?.user?.name || session?.user?.email}
                </p>
                <button className="auth-submit" type="button" onClick={() => signOut({ callbackUrl: "/" })}>
                  Sign Out
                </button>
              </div>
            ) : (
            <button className="auth-google" type="button" onClick={handleGoogleSignIn}>
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.2-1.4 3.6-5.5 3.6-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3 14.6 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.8 0 9.6-4.1 9.6-9.8 0-.7-.1-1.3-.2-2H12z"/>
                <path fill="#34A853" d="M2 12c0 1.8.5 3.5 1.4 5l3.3-2.5c-.2-.7-.4-1.6-.4-2.5s.1-1.7.4-2.5L3.4 7C2.5 8.5 2 10.2 2 12z"/>
                <path fill="#FBBC05" d="M12 22c2.7 0 4.9-.9 6.5-2.4l-3.1-2.4c-.9.6-2 .9-3.4.9-2.6 0-4.9-1.8-5.7-4.2L3 16.4C4.7 19.7 8.1 22 12 22z"/>
                <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.3-.2-2H12v3.9h5.5c-.2 1.1-.8 2.1-1.7 2.8l3.1 2.4c1.8-1.7 2.7-4.1 2.7-7.1z"/>
              </svg>
              Sign in with Google
            </button>
            )}
            <div className="auth-sep">or continue with email</div>
            <form className="auth-grid" onSubmit={(e) => e.preventDefault()}>
              {authMode === "signup" && (
                <div className="auth-grid two">
                  <div className="auth-field"><label>First Name</label><input className="auth-input" type="text" placeholder="Aarav" /></div>
                  <div className="auth-field"><label>Last Name</label><input className="auth-input" type="text" placeholder="Sharma" /></div>
                </div>
              )}
              <div className="auth-field"><label>Email</label><input className="auth-input" type="email" placeholder="you@example.com" /></div>
              {authMode === "signup" && (
                <div className="auth-field"><label>Phone Number</label><input className="auth-input" type="tel" placeholder="+91 98765 43210" /></div>
              )}
              <div className="auth-field"><label>Password</label><input className="auth-input" type="password" placeholder="••••••••" /></div>
              {authMode === "signup" && (
                <div className="auth-field"><label>Confirm Password</label><input className="auth-input" type="password" placeholder="••••••••" /></div>
              )}
              <div className="auth-row">
                <label className="auth-check"><input type="checkbox" /><span>{authMode === "login" ? "Remember me" : "I agree to Terms & Privacy"}</span></label>
                {authMode === "login" && <a href="#" className="auth-link">Forgot password?</a>}
              </div>
              <button className="auth-submit" type="submit">{authMode === "login" ? "Sign In Securely" : "Create Premium Account"}</button>
            </form>
            <p className="auth-foot">
              {authMode === "login" ? "New to ZENmen?" : "Already have an account?"}{" "}
              <button type="button" className="auth-link" style={{ background: "transparent", border: 0, cursor: "pointer" }} onClick={() => setAuthMode((m) => (m === "login" ? "signup" : "login"))}>
                {authMode === "login" ? "Create one" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
      <div
        className={`cart-backdrop${cartOpen ? " open" : ""}`}
        onClick={() => setCartOpen(false)}
        aria-hidden
      />

      {/* ════════════════ CART DRAWER ════════════════ */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`cart-drawer${cartOpen ? " open" : ""}`}
      >
        {/* ── Header ── */}
        <div className="cart-header">
          <div className="cart-header-left">
            <p className="cart-eyebrow">Shopping Bag</p>
            <h3 className="cart-title">Your Cart</h3>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="cart-close"
            aria-label="Close cart"
          >
            <X size={17} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="cart-body">
          {SAMPLE_ITEMS.length === 0 ? (
            /* Empty state */
            <div className="cart-empty">
              <div className="cart-empty-icon">
                <ShoppingCartIcon size={22} />
              </div>
              <p className="cart-empty-title">Your cart is empty</p>
              <p className="cart-empty-sub">
                Discover our bespoke collection
                <br />
                and add pieces you love.
              </p>
              <Link
                href="/collection"
                onClick={() => setCartOpen(false)}
                className="cart-browse-btn"
              >
                Browse Collection
              </Link>
            </div>
          ) : (
            /* Items */
            <>
              <div className="cart-notice">
                <p className="cart-notice-label">Bespoke Order</p>
                <p className="cart-notice-text">
                  Each piece is custom made. Final pricing confirmed after
                  consultation.
                </p>
              </div>

              {SAMPLE_ITEMS.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-img">IMG</div>
                  <div>
                    <p className="cart-item-name">{item.name}</p>
                    <p className="cart-item-sub">{item.subtitle}</p>
                    <div className="cart-item-qty">
                      <button className="cart-qty-btn">−</button>
                      <span className="cart-qty-num">{item.qty}</span>
                      <button className="cart-qty-btn">+</button>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                    }}
                  >
                    <span className="cart-item-price">
                      ₹{(item.price * item.qty).toLocaleString("en-IN")}
                    </span>
                    <button className="cart-item-remove">Remove</button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="cart-footer">
          {/* Gold rule */}
          <div
            style={{
              height: "0.5px",
              background:
                "linear-gradient(to right, transparent, rgba(200,169,110,0.3), transparent)",
            }}
          />

          {/* Subtotal */}
          <div className="cart-subtotal">
            <span className="cart-subtotal-label">Subtotal</span>
            <span className="cart-subtotal-value">
              ₹{subtotal.toLocaleString("en-IN")}
            </span>
          </div>

          {/* Checkout */}
          <button
            type="button"
            className="cart-checkout-btn"
            disabled={SAMPLE_ITEMS.length === 0}
          >
            <span>Secure Checkout</span>
            <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
              <path
                d="M0 4h11M8 1.5l3 2.5-3 2.5"
                stroke="currentColor"
                strokeWidth="0.9"
              />
            </svg>
          </button>

          {/* Shipping */}
          <p className="cart-shipping-note">
            Complimentary shipping on orders above ₹5,000
          </p>

          {/* Continue shopping */}
          <button className="cart-continue" onClick={() => setCartOpen(false)}>
            Continue Shopping
          </button>
        </div>
      </aside>

      {/* ── Responsive display helpers ── */}
      <style>{`
        @media (min-width: 768px) {
          .md-flex  { display: flex !important; }
          .md-block { display: block !important; }
          .md-hidden { display: none !important; }
          .sm-flex  { display: flex !important; }
        }
        @media (max-width: 767px) {
          .md-flex  { display: none !important; }
          .md-block { display: none !important; }
          .sm-flex  { display: none !important; }
        }
      `}</style>
    </>
  );
}
