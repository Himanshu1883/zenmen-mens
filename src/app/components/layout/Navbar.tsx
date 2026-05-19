"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCartOpen } from "@/store/slices/cartSlice";
import { motion } from "framer-motion";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import CartDrawer from "./CartDrawer";
import CurrencySwitcher from "./CurrencySwitcher";
import MegaMenu from "./MegaMenu";
import MobileMenu from "./MobileMenu";
import SearchOverlay from "./SearchOverlay";
import UserAuthPanel from "./UserAuthPanel";

const Navbar = () => {
  const dispatch = useAppDispatch();
  const cartCount = useAppSelector((s) =>
    s.cart.items.reduce((n, item) => n + item.qty, 0),
  );
  const cartOpen = useAppSelector((s) => s.cart.open);
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isUserAuthOpen, setIsUserAuthOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    let ticking = false;

    const updateScrollState = () => {
      const nextScrolled = window.scrollY > 20;
      setScrolled((prev) => (prev !== nextScrolled ? nextScrolled : prev));
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateScrollState);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleCart = () => {
    setIsSearchOpen(false);
    setIsUserAuthOpen(false);
    setIsMobileMenuOpen(false);
    dispatch(setCartOpen(!cartOpen));
  };

  const toggleSearch = () => {
    setIsUserAuthOpen(false);
    setIsMobileMenuOpen(false);
    dispatch(setCartOpen(false));
    setIsSearchOpen((v) => !v);
  };

  const navLinks = [
    {
      name: "COLLECTIONS",
      href: "/collection",
      hasMegaMenu: true,
    },

    {
      name: "STORIES",
      href: "/stories",
      hasMegaMenu: false,
    },

    {
      name: "ABOUT",
      href: "/about",
      hasMegaMenu: false,
    },
  ];

  const shellClass =
    "w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-14";

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 will-change-transform transition-[background-color,box-shadow,height] duration-300 ${
          scrolled ? "bg-white/95 shadow-sm" : "bg-white"
        }`}
        initial={false}
        animate={{ y: 0 }}
        transition={{ duration: 0.2, ease: "linear" }}
      >
        <div className={shellClass}>
          <div
            className={`flex items-center justify-between gap-2 sm:gap-3 transition-all duration-300 ${
              scrolled ? "h-[80px]" : "h-[96px] lg:h-[110px]"
            }`}
          >
            {/* Left Navigation - Desktop */}
            <div className="hidden lg:flex items-center gap-12">
              {navLinks.map((link) => (
                <div
                  key={link.name}
                  className="relative"
                  onMouseEnter={() =>
                    link.hasMegaMenu && setIsMegaMenuOpen(true)
                  }
                  onMouseLeave={() =>
                    link.hasMegaMenu && setIsMegaMenuOpen(false)
                  }
                >
                  <Link
                    href={link.href}
                    className="text-[11px] tracking-[0.2em] text-[#0f172a] hover:text-[#7da8c7] transition-colors duration-300 font-[300] uppercase no-underline"
                  >
                    {link.name}
                  </Link>
                </div>
              ))}
            </div>

            {/* Center Logo — compact on small screens, centered on mobile */}
            <Link
              href="/"
              className="flex min-w-0 flex-1 lg:flex-none lg:justify-start"
            >
              <div className="flex min-w-0 items-center gap-2 sm:gap-2.5 lg:gap-3 group select-none">
                <div className="h-10 w-10 sm:h-10 sm:w-10 md:h-10 md:w-10 lg:h-11 lg:w-11 shrink-0 rounded-full overflow-hidden border border-[#1b2232] transition-transform duration-700 group-hover:rotate-[360deg]">
                  <img
                    src="/logo_zenmen.png"
                    alt="ZENmen logo"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex min-w-0 flex-col">
                  <p className="m-0 whitespace-nowrap text-[22px] sm:text-[24px] lg:text-[36px] leading-[0.92] text-[#0f172a]">
                    ZENmen
                  </p>
                  <p className="m-0 whitespace-nowrap text-[8px] sm:text-[8px] lg:text-[9px] tracking-[0.2em] sm:tracking-[0.24em] lg:tracking-[0.36em] text-[#7da8c7] uppercase mt-0.5 lg:mt-1">
                    Bespoke Tailoring
                  </p>
                </div>
              </div>
            </Link>

            {/* Right Actions - Desktop */}
            <div className="hidden lg:flex items-center gap-8">
              <button
                type="button"
                aria-haspopup="dialog"
                aria-expanded={isSearchOpen}
                onClick={toggleSearch}
                className="bg-transparent border-0 text-[#0f172a] hover:text-[#7da8c7] transition-all duration-300 p-2 rounded-full hover:bg-[#f8fafc] cursor-pointer"
                aria-label={isSearchOpen ? "Close search" : "Open search"}
              >
                <Search className="w-5 h-5" strokeWidth={1.5} />
              </button>
              <CurrencySwitcher mode="dropdown" />
              <button
                type="button"
                aria-haspopup="dialog"
                aria-expanded={isUserAuthOpen}
                onClick={() => {
                  setIsSearchOpen(false);
                  dispatch(setCartOpen(false));
                  setIsUserAuthOpen(true);
                }}
                className="bg-transparent border-0 text-[#0f172a] hover:text-[#7da8c7] transition-all duration-300 p-2 rounded-full hover:bg-[#f8fafc] cursor-pointer"
              >
                <User className="w-5 h-5" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                aria-haspopup="dialog"
                aria-expanded={cartOpen}
                onClick={toggleCart}
                className="bg-transparent border-0 text-[#0f172a] hover:text-[#7da8c7] transition-all duration-300 p-2 rounded-full hover:bg-[#f8fafc] relative cursor-pointer"
                aria-label={`Shopping bag, ${cartCount} items`}
              >
                <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
                {cartCount > 0 ? (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[1rem] h-4 px-0.5 bg-[#7da8c7] text-white text-[9px] leading-4 rounded-full flex items-center justify-center tabular-nums">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                ) : null}
              </button>
              <Link
                href="/appointment"
                className="inline-flex items-center justify-center bg-transparent px-6 py-2.5 border border-[#e2e8f0] text-[#0f172a] text-[11px] tracking-[0.15em] uppercase no-underline hover:bg-[#7da8c7] hover:text-white hover:border-[#7da8c7] transition-all duration-300 rounded-sm cursor-pointer"
              >
                Book Appointment
              </Link>
            </div>

            {/* Mobile / small tablet: search, currency, account, bag, menu */}
            <div className="flex lg:hidden items-center gap-1 shrink-0 sm:gap-2 md:gap-2.5">
              <button
                type="button"
                aria-haspopup="dialog"
                aria-expanded={isSearchOpen}
                onClick={toggleSearch}
                className="bg-transparent border-0 text-[#0f172a] hover:text-[#7da8c7] transition-colors duration-300 p-1.5 sm:p-2 rounded-full hover:bg-[#f8fafc] cursor-pointer shrink-0"
                aria-label={isSearchOpen ? "Close search" : "Open search"}
              >
                <Search
                  className="w-[1.125rem] h-[1.125rem] sm:w-5 sm:h-5"
                  strokeWidth={1.5}
                />
              </button>
              <div className="shrink-0 [&_button]:p-1.5 sm:[&_button]:p-2 [&_svg]:h-[1.125rem] [&_svg]:w-[1.125rem] sm:[&_svg]:h-5 sm:[&_svg]:w-5">
                <CurrencySwitcher mode="dropdown" />
              </div>
              <button
                type="button"
                aria-haspopup="dialog"
                aria-expanded={isUserAuthOpen}
                onClick={() => {
                  setIsSearchOpen(false);
                  dispatch(setCartOpen(false));
                  setIsUserAuthOpen(true);
                }}
                className="bg-transparent border-0 text-[#0f172a] hover:text-[#7da8c7] transition-colors duration-300 p-1.5 sm:p-2 rounded-full hover:bg-[#f8fafc] cursor-pointer shrink-0"
              >
                <User
                  className="w-[1.125rem] h-[1.125rem] sm:w-5 sm:h-5"
                  strokeWidth={1.5}
                />
              </button>
              <button
                type="button"
                aria-haspopup="dialog"
                aria-expanded={cartOpen}
                onClick={toggleCart}
                className="bg-transparent border-0 text-[#0f172a] hover:text-[#7da8c7] transition-colors duration-300 p-1.5 sm:p-2 rounded-full hover:bg-[#f8fafc] relative cursor-pointer shrink-0"
                aria-label={`Shopping bag, ${cartCount} items`}
              >
                <ShoppingBag
                  className="w-[1.125rem] h-[1.125rem] sm:w-5 sm:h-5"
                  strokeWidth={1.5}
                />
                {cartCount > 0 ? (
                  <span className="absolute top-0 right-0 min-w-[0.875rem] h-3.5 px-0.5 bg-[#7da8c7] text-white text-[8px] leading-[14px] rounded-full flex items-center justify-center tabular-nums">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                ) : null}
              </button>
              <button
                type="button"
                className="bg-transparent border-0 text-[#0f172a] p-1.5 sm:p-2 cursor-pointer shrink-0"
                aria-expanded={isMobileMenuOpen}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
                ) : (
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mega Menu */}
        <div
          onMouseEnter={() => setIsMegaMenuOpen(true)}
          onMouseLeave={() => setIsMegaMenuOpen(false)}
        >
          <MegaMenu shellClass={shellClass} isOpen={isMegaMenuOpen} />
        </div>

        {/* Thin bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#e2e8f0] to-transparent" />
      </motion.nav>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenAuth={() => {
          setIsSearchOpen(false);
          setIsUserAuthOpen(true);
        }}
      />

      <SearchOverlay
        open={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <UserAuthPanel
        open={isUserAuthOpen}
        onClose={() => setIsUserAuthOpen(false)}
      />

      <CartDrawer />
      <div className="h-[96px] lg:h-[110px]" />
    </>
  );
};

export default Navbar;
