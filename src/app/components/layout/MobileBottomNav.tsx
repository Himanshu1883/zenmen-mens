"use client";

import { ZenIcon, type ZenIconName } from "@/components/icons";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const OPEN_CHAT_EVENT = "zenmen:open-chat";

function openZenmenChat() {
  window.dispatchEvent(new CustomEvent(OPEN_CHAT_EVENT));
}

interface NavItem {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
  icon: ZenIconName;
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const isProductDetailPage = /^\/collection\/[^/]+$/.test(pathname);
  const isCollectionListing = pathname === "/collection";
  const isAdminPage = pathname.startsWith("/admin");

  const [visible, setVisible] = useState(true);
  const [active, setActive] = useState("home");
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const whatsappNumber = "919650753273";
  const whatsappMessage =
    "Hi ZENmen, I'd like to book an appointment for bespoke tailoring.";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  useEffect(() => {
    if (isAdminPage) {
      setVisible(true);
      return;
    }

    const onScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          const currentY = window.scrollY;
          if (currentY < 10) {
            setVisible(true);
          } else if (currentY > lastScrollY.current + 6) {
            setVisible(false);
          } else if (currentY < lastScrollY.current - 6) {
            setVisible(true);
          }
          lastScrollY.current = currentY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isAdminPage]);

  if (isProductDetailPage || isCollectionListing || isAdminPage) return null;

  const navItems: NavItem[] = [
    { id: "home", label: "Home", href: "/", icon: "home" },
    { id: "explore", label: "Explore", href: "/collection", icon: "search" },
    { id: "whatsapp", label: "WhatsApp", href: whatsappLink, icon: "whatsapp" },
    { id: "book", label: "Book", href: "/appointments", icon: "calendar" },
    {
      id: "chat",
      label: "Chat",
      icon: "comment",
      onClick: () => {
        openZenmenChat();
        setActive("chat");
      },
    },
  ];

  const itemColors = (
    id: string,
    isActive: boolean,
  ): { text: string; pip?: boolean } => {
    if (id === "whatsapp") return { text: "text-[#25D366]" };
    if (id === "chat")
      return { text: "text-[#7da8c7]", pip: isActive };
    if (isActive) return { text: "text-[#0f172a]", pip: true };
    return { text: "text-[#64748b]" };
  };

  return (
    <>
      <nav
        aria-label="Mobile navigation"
        className={cn(
          "fixed bottom-0 left-0 right-0 z-[100] md:hidden",
          "border-t border-[#e8edf2] bg-white/95 shadow-[0_-10px_36px_-18px_rgba(15,23,42,0.12)] backdrop-blur-md",
          "pb-[env(safe-area-inset-bottom,0px)] transition-transform duration-300 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]",
          visible ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#7da8c7]/35 to-transparent"
          aria-hidden
        />

        <div className="grid grid-cols-5 px-1">
          {navItems.map((item) => {
            const isActive = active === item.id;
            const colors = itemColors(item.id, isActive);
            const showPip = colors.pip && item.id !== "whatsapp";

            const iconWrap = (
              <span
                className={cn(
                  "flex items-center justify-center transition-transform duration-200 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]",
                  isActive && item.id !== "whatsapp" ? "scale-[1.08]" : "scale-100",
                )}
              >
                <ZenIcon name={item.icon} className="h-5 w-5" />
              </span>
            );

            const label = (
              <span
                className={cn(
                  "font-[family-name:var(--font-montserrat)] text-[9px] uppercase tracking-[0.1em]",
                  isActive && item.id !== "whatsapp" ? "font-medium" : "font-light",
                )}
              >
                {item.label}
              </span>
            );

            const tapButtonClass =
              "relative flex w-full flex-col items-center justify-center gap-1 py-3 [-webkit-tap-highlight-color:transparent]";

            if (item.id === "whatsapp" && item.href) {
              return (
                <a
                  key={item.id}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    tapButtonClass,
                    "text-[#25D366] no-underline",
                  )}
                  aria-label={item.label}
                  onClick={() => setActive(item.id)}
                >
                  {iconWrap}
                  {label}
                </a>
              );
            }

            if (item.href) {
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    tapButtonClass,
                    colors.text,
                    "no-underline",
                  )}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={item.label}
                  onClick={() => setActive(item.id)}
                >
                  {showPip ? (
                    <span
                      className="absolute top-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#7da8c7]"
                      aria-hidden
                    />
                  ) : null}
                  {iconWrap}
                  {label}
                </Link>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                className={cn(
                  tapButtonClass,
                  colors.text,
                  "cursor-pointer border-0 bg-transparent",
                )}
                aria-label={item.label}
                aria-current={isActive ? "true" : undefined}
                onClick={() => {
                  item.onClick?.();
                }}
              >
                {showPip ? (
                  <span
                    className="absolute top-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#7da8c7]"
                    aria-hidden
                  />
                ) : null}
                {iconWrap}
                {label}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="h-16 md:hidden" aria-hidden />
    </>
  );
}
