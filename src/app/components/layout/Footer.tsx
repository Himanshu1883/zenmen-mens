"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <style>{`
        .footer-brand .znav-logo { display:flex; align-items:center; gap:10px; text-decoration:none; width: fit-content; }
        .footer-brand .znav-logo-mark {
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
        .footer-brand .znav-logo-img {
          width: 36px;
          height: 36px;
          object-fit: contain;
          transition: transform 0.75s cubic-bezier(0.22,1,0.36,1);
        }
        .footer-brand .znav-logo:hover .znav-logo-img {
          transform: rotate(360deg);
        }
        .footer-brand .znav-logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 1.25rem;
          font-weight: 300;
          letter-spacing: 0.08em;
          color: #f7f2e8;
          line-height: 1;
        }
        .footer-brand .znav-logo-sub {
          display: block;
          font-family: 'Cormorant Garamond', serif;
          font-size: 8px;
          letter-spacing: 0.38em;
          text-transform: uppercase;
          color: rgba(200,169,110,0.65);
          margin-top: 3px;
        }
      `}</style>
      <div className="footer-top">
        {/* Brand */}
        <div className="footer-brand">
          <Link href="/" className="znav-logo">
            <span className="znav-logo-mark" aria-hidden="true">
              <img src="/logo_zenmen.png" alt="" className="znav-logo-img" />
            </span>
            <div>
              <span className="znav-logo-text">ZENmen</span>
              <span className="znav-logo-sub">Bespoke Tailoring</span>
            </div>
          </Link>

          <p>
            For over fifteen years, ZENmen has dressed Delhi's most discerning
            gentlemen. Every garment is a promise of precision, quality, and
            timeless style.
          </p>
        </div>

        {/* Services */}
        <div className="footer-col">
          <h4>Services</h4>
          <ul>
            <li>
              <a href="#services">Bespoke Suits</a>
            </li>
            <li>
              <a href="#services">Custom Shirts</a>
            </li>
            <li>
              <a href="#services">Tailored Trousers</a>
            </li>
            <li>
              <a href="#services">Wedding Attire</a>
            </li>
            <li>
              <a href="#services">Alterations</a>
            </li>
          </ul>
        </div>

        {/* Collection */}
        <div className="footer-col">
          <h4>Collection</h4>
          <ul>
            <li>
              <a href="#products">Suits</a>
            </li>
            <li>
              <a href="#products">Shirts</a>
            </li>
            <li>
              <a href="#products">Trousers</a>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-col">
          <h4>Contact</h4>
          <ul>
            <li>
              <a href="#contact">Visit Store</a>
            </li>
            <li>
              <a href="#contact">Book Appointment</a>
            </li>
            <li>
              <a href="#contact">Support</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} ZENmen. All rights reserved.</p>

        <div className="social-links">
          <a
            href="https://www.instagram.com/_zenmen/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full border border-white/10 hover:border-transparent transition-all duration-300 group relative overflow-hidden"
          >
            {/* Gradient Background on Hover */}
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5]" />

            {/* Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-4 h-4 text-white z-10 transition group-hover:scale-110"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" />
            </svg>

            {/* Tooltip */}
            <span className="absolute -bottom-6 text-[9px] tracking-[2px] text-[#C8A96E] opacity-0 group-hover:opacity-100 transition">
              Instagram
            </span>
          </a>
          <a href="#" className="social-link">
            FB
          </a>
          {/* <a href="#" className="social-link">
            TW
          </a> */}
        </div>
      </div>
    </footer>
  );
}
