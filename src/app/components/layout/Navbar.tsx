"use client";

import { useScrolled } from "@/app/hooks/useScrolled";
import { Menu, ShoppingCartIcon, User, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/services", label: "Services" },
  { href: "/process", label: "Process" },
  { href: "/collection", label: "Collection" },
  { href: "/stories", label: "Stories" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);

  return (
    <nav
    // className={`navbar ${scrolled ? "scrolled" : ""} flex items-center justify-between px-6`}
    >
      {/* LEFT */}
      <Link href="/" className="logo">
        <div className="logo-icon rotate-hover" />
        <div>
          <span className="logo-text">ZENmen</span>
          <span className="logo-sub">Bespoke Tailoring</span>
        </div>
      </Link>

      {/* CENTER (DESKTOP ONLY) */}
      <ul className="hidden md:flex items-center gap-8 flex-1 justify-center">
        {links.map((l) => (
          <li
            key={l.href}
            className="group transition-transform duration-200 hover:-translate-y-[2px]"
          >
            <Link
              href={l.href}
              className="relative text-[11px] tracking-[3px] uppercase text-#FAF8F4 transition-colors duration-300 group-hover:text-[#C8A96E]"
            >
              {l.label}
              <span className="absolute left-0 -bottom-2 h-[1px] w-0 bg-[#C8A96E] transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </li>
        ))}
      </ul>

      {/* RIGHT */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* ICONS (hide some on mobile) */}
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

        <button className="nav-icon hidden sm:flex">
          <User size={18} />
          <span className="nav-tooltip">User</span>
        </button>

        <button className="nav-icon">
          <ShoppingCartIcon size={18} />
          <span className="nav-tooltip">Cart</span>
        </button>

        {/* CTA (hide on small) */}
        <Link href="/contact" className="nav-cta hidden md:block">
          Book Appointment
        </Link>

        {/* HAMBURGER */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-full border border-[#C8A96E] text-[#C8A96E] z-50"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="fixed top-20 left-0 w-full bg-black border-t border-[#2A2A2A] flex flex-col items-center gap-6 py-6 md:hidden z-50">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-[12px] tracking-[3px] uppercase text-[#888880] hover:text-[#C8A96E] transition"
            >
              {l.label}
            </Link>
          ))}

          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="border border-[#C8A96E] px-6 py-2 text-[#C8A96E] text-[11px] tracking-[3px] uppercase"
          >
            Book Appointment
          </Link>
        </div>
      )}
    </nav>
  );
}
