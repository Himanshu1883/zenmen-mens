"use client";

import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,700;1,300;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@200;300;400&display=swap');

        /* ── CSS Variables ── */
        :root {
          --gold: #7da8c7;
          --gold-dim: rgba(125,168,199,0.55);
          --gold-faint: rgba(125,168,199,0.14);
          --ivory: #050b16;
          --ivory-dim: black;
          --ink: #eef3f9;
          --ink-mid: #e7eef7;
          --border: #c7d5e6;
        }

        /* ── Footer Shell ── */
        .zf {
          background: #eef3f9;
          color: var(--ivory);
          font-family: 'Jost', sans-serif;
          font-weight: 300;
          position: relative;
          overflow: hidden;
        }

        /* Subtle noise grain */
        .zf::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          background-size: 180px 180px;
          pointer-events: none;
          z-index: 0;
          opacity: 0.28;
        }

        /* Radial gold glow top-left */
        .zf::after {
          content: '';
          position: absolute;
          top: -120px;
          left: -120px;
          width: 480px;
          height: 480px;
          background: radial-gradient(circle, rgba(125,168,199,0.2) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .zf > * { position: relative; z-index: 1; }

        /* ── Divider ── */
        .zf-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, var(--gold-dim) 30%, var(--gold-dim) 70%, transparent 100%);
        }

        /* ── Main Grid ── */
        .zf-main {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 0;
          padding: 64px 80px 56px;
        }

        @media (max-width: 1100px) {
          .zf-main { grid-template-columns: 1fr 1fr; padding: 52px 40px 44px; gap: 40px 32px; }
        }
        @media (max-width: 640px) {
          .zf-main { grid-template-columns: 1fr; padding: 40px 24px 36px; gap: 36px 0; }
        }

        /* ── Brand Column ── */
        .zf-brand { padding-right: 48px; }
        @media (max-width: 1100px) { .zf-brand { padding-right: 0; grid-column: 1 / -1; } }

        .zf-logo {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          margin-bottom: 20px;
        }

        .zf-logo-mark {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid var(--gold-dim);
          background: #f8fbff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          overflow: hidden;
        }

        .zf-logo-img {
          width: 44px;
          height: 44px;
          object-fit: contain;
          transition: transform 0.85s cubic-bezier(0.22,1,0.36,1);
        }
        .zf-logo:hover .zf-logo-img { transform: rotate(360deg); }

        .zf-logo-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.3rem;
          font-weight: 300;
          letter-spacing: 0.1em;
          color: #050b16;
          line-height: 1;
        }

        .zf-logo-tagline {
          display: block;
          font-family: 'Cormorant Garamond', serif;
          font-size: 8px;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: #5f8fb2;
          margin-top: 4px;
        }

        .zf-brand-desc {
          font-size: 0.82rem;
          line-height: 1.75;
          color: var(--ivory-dim);
          letter-spacing: 0.02em;
          max-width: 280px;
          margin-bottom: 28px;
        }

        /* Collection CTA inside brand */
        .zf-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 11px 22px;
          border: 1px solid var(--gold-dim);
          color: var(--gold);
          font-family: 'Cormorant Garamond', serif;
          font-size: 0.78rem;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          text-decoration: none;
          position: relative;
          overflow: hidden;
          transition: color 0.35s ease;
        }
        .zf-cta::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--gold);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.38s cubic-bezier(0.22,1,0.36,1);
        }
        .zf-cta:hover::before { transform: scaleX(1); }
        .zf-cta:hover { color: #070c18; }
        .zf-cta span, .zf-cta svg { position: relative; z-index: 1; }

        .zf-cta-arrow {
          width: 14px;
          height: 14px;
          transition: transform 0.3s ease;
        }
        .zf-cta:hover .zf-cta-arrow { transform: translateX(4px); }

        /* ── Nav Columns ── */
        .zf-col { padding: 0 24px; }
        @media (max-width: 1100px) { .zf-col { padding: 0; } }

        .zf-col-heading {
          font-family: 'Cormorant Garamond', serif;
          font-size: 9px;
          letter-spacing: 0.38em;
          text-transform: uppercase;
          color: var(--gold);
          margin: 0 0 20px;
          font-weight: 500;
        }

        .zf-col ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 11px;
        }

        .zf-col ul li a {
          font-size: 0.82rem;
          color: var(--ivory-dim);
          text-decoration: none;
          letter-spacing: 0.03em;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: color 0.25s ease, gap 0.25s ease;
        }

        .zf-col ul li a::before {
          content: '';
          display: inline-block;
          width: 12px;
          height: 1px;
          background: var(--gold);
          opacity: 0;
          transition: opacity 0.25s ease, width 0.25s ease;
        }

        .zf-col ul li a:hover {
          color: var(--ivory);
          gap: 10px;
        }
        .zf-col ul li a:hover::before { opacity: 1; width: 16px; }

        /* ── Newsletter stripe ── */
        .zf-newsletter {
          background: #e6eef8;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 36px 80px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
          flex-wrap: wrap;
        }

        @media (max-width: 640px) {
          .zf-newsletter { padding: 28px 24px; flex-direction: column; align-items: flex-start; }
        }

        .zf-newsletter-text h5 {
          font-family: 'Playfair Display', serif;
          font-size: 1rem;
          font-weight: 400;
          letter-spacing: 0.04em;
          color: #050b16;
          margin: 0 0 4px;
        }
        .zf-newsletter-text p {
          font-size: 0.78rem;
          color: var(--ivory-dim);
          margin: 0;
          letter-spacing: 0.02em;
        }

        .zf-newsletter-form {
          display: flex;
          gap: 0;
          flex: 0 0 auto;
          min-width: 280px;
        }
        @media (max-width: 480px) { .zf-newsletter-form { min-width: 0; width: 100%; } }

        .zf-newsletter-form input {
          flex: 1;
          background: #f7fbff;
          border: 1px solid var(--border);
          border-right: none;
          color: #050b16;
          font-family: 'Jost', sans-serif;
          font-size: 0.78rem;
          letter-spacing: 0.06em;
          padding: 11px 16px;
          outline: none;
          transition: background 0.25s ease, border-color 0.25s ease;
        }
        .zf-newsletter-form input::placeholder { color: #73879f; }
        .zf-newsletter-form input:focus {
          background: #eaf3fb;
          border-color: var(--gold-dim);
        }

        .zf-newsletter-form button {
          background: var(--gold);
          border: 1px solid var(--gold);
          color: #ffffff;
          font-family: 'Cormorant Garamond', serif;
          font-size: 0.7rem;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          padding: 11px 18px;
          cursor: pointer;
          transition: background 0.25s ease, color 0.25s ease;
          white-space: nowrap;
        }
        .zf-newsletter-form button:hover {
          background: #0f172a;
          border-color: #0f172a;
          color: #ffffff;
        }

        /* ── Bottom Bar ── */
        .zf-bottom {
          padding: 22px 80px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        @media (max-width: 640px) {
          .zf-bottom { padding: 20px 24px; flex-direction: column; align-items: center; text-align: center; gap: 16px; }
        }

        .zf-copy {
          font-size: 0.72rem;
          color: #1f2d40;
          letter-spacing: 0.06em;
        }

        .zf-legal {
          display: flex;
          gap: 24px;
          list-style: none;
          margin: 0;
          padding: 0;
          flex-wrap: wrap;
          justify-content: center;
        }
        .zf-legal li a {
          font-size: 0.68rem;
          color: #1f2d40;
          text-decoration: none;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          transition: color 0.2s ease;
        }
        .zf-legal li a:hover { color: var(--gold); }

        .zf-socials {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .zf-social-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          color: var(--ivory-dim);
          font-size: 0.65rem;
          font-family: 'Cormorant Garamond', serif;
          letter-spacing: 0.05em;
          transition: border-color 0.25s ease, color 0.25s ease, background 0.25s ease;
          position: relative;
          overflow: hidden;
        }
        .zf-social-btn:hover {
          border-color: var(--gold-dim);
          color: var(--gold);
          background: var(--gold-faint);
        }

        /* Instagram gradient hover */
        .zf-social-btn.insta:hover {
          border-color: transparent;
          background: linear-gradient(135deg, #feda75, #d62976, #4f5bd5);
          color: #fff;
        }

        /* ── Hero Banner ── */
        .zf-banner {
          position: relative;
          width: 100%;
          height: 88px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-top: 1px solid var(--border);
        }

        @media (max-width: 640px) { .zf-banner { height: 70px; } }

        /* Faint vertical stripes */
        .zf-banner::before {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            90deg,
            transparent 0px,
            transparent 59px,
            rgba(200,169,110,0.04) 59px,
            rgba(200,169,110,0.04) 60px
          );
          pointer-events: none;
        }

        /* Horizontal gold line mid */
        // .zf-banner::after {
        //   content: '';
        //   position: absolute;
        //   left: 0; right: 0;
        //   top: 50%;
        //   height: 1px;
        //   background: linear-gradient(90deg, transparent, var(--gold-dim) 20%, var(--gold-dim) 80%, transparent);
        //   opacity: 0.4;
        // }

        .zf-banner-text {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.8rem, 8vw, 5.5rem);
          font-weight: 300;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: transparent;
          -webkit-text-stroke: 1px rgba(125,168,199,0.35);
          background: linear-gradient(180deg,
            rgba(125,168,199,0.25) 0%,
            rgba(125,168,199,0.12) 60%,
            rgba(125,168,199,0.06) 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          user-select: none;
          position: relative;
          z-index: 1;
          line-height: 1;
          white-space: nowrap;
        }

        /* View Collection link over banner */
        .zf-banner-link {
          position: absolute;
          right: 80px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 2;
          font-family: 'Cormorant Garamond', serif;
          font-size: 0.72rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--gold);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: gap 0.25s ease, opacity 0.25s ease;
          opacity: 0.75;
        }
        .zf-banner-link:hover { gap: 12px; opacity: 1; }
        .zf-banner-link svg { transition: transform 0.25s ease; }
        .zf-banner-link:hover svg { transform: translateX(3px); }

        @media (max-width: 640px) {
          .zf-banner-link { right: 16px; font-size: 0.62rem; letter-spacing: 0.2em; }
        }

        .zf p, .zf h4, .zf h5, .zf ul { margin: 0; padding: 0; }
      `}</style>

      <footer className="zf">
        {/* ── Top Divider ── */}
        <div className="zf-divider" />

        {/* ── Main Grid ── */}
        <div className="zf-main">
          {/* Brand */}
          <div className="zf-brand">
            <Link href="/" className="zf-logo">
              <span className="zf-logo-mark">
                <img src="/logo_zenmen.png" alt="" className="zf-logo-img" />
              </span>
              <div>
                <span className="zf-logo-name">ZENMEN</span>
                <span className="zf-logo-tagline">Bespoke Tailoring</span>
              </div>
            </Link>

            <p className="zf-brand-desc">
              For over fifteen years, ZENMEN has dressed Delhi's most discerning
              gentlemen. Every garment is a promise of precision, quality, and
              timeless style.
            </p>

            <Link href="/collection" className="zf-cta">
              <span>View Collection</span>
              <svg
                className="zf-cta-arrow"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  d="M2 8h12M10 4l4 4-4 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>

          {/* Services */}
          <div className="zf-col">
            <h4 className="zf-col-heading">Services</h4>
            <ul>
              {[
                "Bespoke Suits",
                "Custom Shirts",
                "Tailored Trousers",
                "Wedding Attire",
                "Alterations",
              ].map((s) => (
                <li key={s}>
                  <Link href="/services">{s}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Collection */}
          <div className="zf-col">
            <h4 className="zf-col-heading">Collection</h4>
            <ul>
              {["Suits", "Shirts", "Trousers", "Accessories"].map((s) => (
                <li key={s}>
                  <Link href="/collection">{s}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="zf-col">
            <h4 className="zf-col-heading">Visit Us</h4>
            <ul>
              {[
                "Visit Store",
                "Book Appointment",
                "Fitting Guide",
                "Care & Alterations",
                "Support",
              ].map((s) => (
                <li key={s}>
                  <a href="#contact">{s}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Newsletter ── */}
        <div className="zf-newsletter">
          <div className="zf-newsletter-text">
            <h5>The Gentleman's Gazette</h5>
            <p>
              New arrivals, exclusive invitations & style notes — delivered
              quietly.
            </p>
          </div>
          <div className="zf-newsletter-form">
            <input
              type="email"
              placeholder="Your email address"
              aria-label="Email address"
            />
            <button type="button">Subscribe</button>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="zf-bottom">
          <p className="zf-copy">© {year} ZENMEN. All rights reserved.</p>

          <ul className="zf-legal">
            <li>
              <a href="#">Privacy Policy</a>
            </li>
            <li>
              <a href="#">Terms of Service</a>
            </li>
            <li>
              <a href="#">Shipping & Returns</a>
            </li>
          </ul>

          <div className="zf-socials">
            {/* Instagram */}
            <a
              href="https://www.instagram.com/_zenmen/"
              target="_blank"
              rel="noopener noreferrer"
              className="zf-social-btn insta"
              aria-label="Instagram"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
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
            {/* Facebook */}
            <a href="#" className="zf-social-btn" aria-label="Facebook">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            {/* WhatsApp */}
            <a href="#" className="zf-social-btn" aria-label="WhatsApp">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </a>
          </div>
        </div>

        {/* ── Full-Width Brand Banner ── */}
        <div className="zf-banner">
          <span className="zf-banner-text" aria-hidden="true">
            ZENmen
          </span>
          <Link href="/collection" className="zf-banner-link">
            View Collection
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                d="M2 8h12M10 4l4 4-4 4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </footer>
    </>
  );
}
