"use client";

import { cn } from "@/lib/utils";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const OPEN_CHAT_EVENT = "zenmen:open-chat";

function openZenmenChat() {
  window.dispatchEvent(new CustomEvent(OPEN_CHAT_EVENT));
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface NavItem {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
  icon: React.ReactNode;
}

// ─── Icons ───────────────────────────────────────────────────────────────────
const HomeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <path d="M3 9.75L12 3l9 6.75V21a.75.75 0 0 1-.75.75H15v-5.25a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0-.75.75V21.75H3.75A.75.75 0 0 1 3 21V9.75Z" />
  </svg>
);

const ExploreIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M20.52 3.48A11.85 11.85 0 0 0 12.06 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.16 1.6 5.98L0 24l6.3-1.65a11.86 11.86 0 0 0 5.76 1.47h.01c6.56 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.17-3.45-8.44Zm-8.46 18.33h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.74.98 1-3.64-.24-.37a9.9 9.9 0 0 1-1.53-5.29c0-5.46 4.44-9.9 9.91-9.9 2.64 0 5.12 1.03 6.98 2.89a9.82 9.82 0 0 1 2.92 7.01c0 5.46-4.44 9.9-9.9 9.9Zm5.43-7.42c-.3-.15-1.78-.88-2.06-.98-.27-.1-.47-.15-.67.15-.2.3-.77.98-.95 1.18-.17.2-.35.23-.65.08-.3-.15-1.27-.47-2.42-1.49-.89-.79-1.5-1.76-1.68-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.67-1.62-.92-2.23-.24-.58-.48-.5-.67-.51l-.57-.01c-.2 0-.52.08-.8.38-.27.3-1.05 1.03-1.05 2.5 0 1.48 1.08 2.9 1.23 3.1.15.2 2.12 3.24 5.14 4.54.72.31 1.29.49 1.73.63.73.23 1.4.2 1.92.12.59-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.17-1.43-.08-.13-.28-.2-.58-.35Z" />
  </svg>
);

const BookIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
  </svg>
);

const ChatIcon = () => (
  <MessageCircle className="h-5 w-5" strokeWidth={1.5} aria-hidden />
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MobileBottomNav() {
  const pathname = usePathname();
  /** Product detail replaces global bottom nav with page-local CTAs */
  const isProductDetailPage = /^\/collection\/[^/]+$/.test(pathname);

  const [visible, setVisible] = useState(true);
  const [active, setActive] = useState("home");
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const whatsappNumber = "919650753273";
  const whatsappMessage =
    "Hi ZENmen, I'd like to book an appointment for bespoke tailoring.";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  useEffect(() => {
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
  }, []);

  if (isProductDetailPage) return null;

  const navItems: NavItem[] = [
    {
      id: "home",
      label: "Home",
      href: "/",
      icon: <HomeIcon />,
    },
    {
      id: "explore",
      label: "Explore",
      href: "/collection",
      icon: <ExploreIcon />,
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      href: whatsappLink,
      icon: <WhatsAppIcon />,
    },
    {
      id: "book",
      label: "Book",
      href: "/appointments",
      icon: <BookIcon />,
    },
    {
      id: "chat",
      label: "Chat",
      onClick: () => {
        openZenmenChat();
        setActive("chat");
      },
      icon: <ChatIcon />,
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
                {item.icon}
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
