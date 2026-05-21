"use client";

import { useDisplayPrice } from "@/hooks/useDisplayPrice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addItem, setCartOpen } from "@/store/slices/cartSlice";
import type { Product } from "@/types/product";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

// ─── Static data ────────────────────────────────────────────────────────────

const COLORS = [
  { name: "Midnight Navy", cls: "bg-[#1a2a4a]" },
  { name: "Charcoal Noir", cls: "bg-[#2a2a2a]" },
  { name: "Deep Wine", cls: "bg-[#5c2030]" },
  { name: "Warm Sand", cls: "bg-[#c8b49a]" },
  { name: "Ivory", cls: "bg-[#e8e0d0]" },
];

const ACCORDION_ITEMS = [
  {
    id: "shipping",
    label: "Shipping & Delivery",
    content:
      "Express delivery in 2-4 business days. Standard delivery in 5-7 days. Free shipping on orders above Rs. 5,000.",
  },
  {
    id: "returns",
    label: "Returns & Exchanges",
    content:
      "Unworn items in original packaging may be returned within 30 days. Exchanges are available for size or color.",
  },
  {
    id: "bespoke",
    label: "Bespoke Services",
    content:
      "Custom alterations can be arranged through our atelier team for a refined personal fit.",
  },
];

// ─── Icons ───────────────────────────────────────────────────────────────────

function IconHeart({ filled }: { filled: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={filled ? "#7da8c7" : "none"}
      stroke={filled ? "#7da8c7" : "currentColor"}
      strokeWidth="1.5"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function IconBag() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

function IconWhatsApp() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path
        d="M12.032 3.024c-4.967 0-9 4.033-9 9 0 1.59.414 3.153 1.2 4.53L3 21.024l4.545-1.212a8.97 8.97 0 0 0 4.287 1.092c4.967 0 9-4.033 9-9s-4.033-9-9-9z"
        fill="currentColor"
      />
      <path
        d="M16.968 13.68c-.276-.144-1.632-.804-1.884-.9-.252-.096-.432-.144-.612.144-.18.288-.696.9-.852 1.08-.156.18-.312.204-.588.06-.804-.372-1.68-.828-2.352-1.488a8.973 8.973 0 0 1-1.62-2.052c-.144-.252-.012-.384.108-.504.108-.108.252-.288.384-.432.12-.144.168-.24.252-.408.084-.168.036-.312-.024-.432-.06-.12-.612-1.476-.84-2.028-.216-.528-.444-.456-.612-.468-.156-.012-.336-.012-.516-.012a.96.96 0 0 0-.696.324 2.94 2.94 0 0 0-.912 2.148c0 1.26.912 2.472 1.032 2.64.12.168 1.764 2.736 4.272 3.84.6.264 1.056.42 1.416.54.6.192 1.152.156 1.584.096.48-.072 1.476-.6 1.68-1.188.204-.588.204-1.092.144-1.2-.06-.096-.216-.156-.48-.3z"
        fill="white"
      />
    </svg>
  );
}

function IconWhatsAppGreen({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="#25D366" aria-hidden>
      <path d="M20.52 3.48A11.85 11.85 0 0 0 12.06 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.16 1.6 5.98L0 24l6.3-1.65a11.86 11.86 0 0 0 5.76 1.47h.01c6.56 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.17-3.45-8.44Zm-8.46 18.33h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.74.98 1-3.64-.24-.37a9.9 9.9 0 0 1-1.53-5.29c0-5.46 4.44-9.9 9.91-9.9 2.64 0 5.12 1.03 6.98 2.89a9.82 9.82 0 0 1 2.92 7.01c0 5.46-4.44 9.9-9.9 9.9Zm5.43-7.42c-.3-.15-1.78-.88-2.06-.98-.27-.1-.47-.15-.67.15-.2.3-.77.98-.95 1.18-.17.2-.35.23-.65.08-.3-.15-1.27-.47-2.42-1.49-.89-.79-1.5-1.76-1.68-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.67-1.62-.92-2.23-.24-.58-.48-.5-.67-.51l-.57-.01c-.2 0-.52.08-.8.38-.27.3-1.05 1.03-1.05 2.5 0 1.48 1.08 2.9 1.23 3.1.15.2 2.12 3.24 5.14 4.54.72.31 1.29.49 1.73.63.73.23 1.4.2 1.92.12.59-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.17-1.43-.08-.13-.28-.2-.58-.35Z" />
    </svg>
  );
}

function IconChevron() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function IconZoomIn() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
      <path d="M11 8v6M8 11h6" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 12 12"
      fill={filled ? "#7da8c7" : "none"}
      stroke={filled ? "none" : "#7da8c7"}
      strokeWidth="1.5"
    >
      <path d="M6 1l1.29 2.61 2.88.42-2.08 2.03.49 2.87L6 7.52l-2.58 1.41.49-2.87L1.83 4.03l2.88-.42z" />
    </svg>
  );
}

// ─── Accordion ───────────────────────────────────────────────────────────────

function AccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: (typeof ACCORDION_ITEMS)[0];
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-[#e2e8f0]">
      <button
        onClick={onToggle}
        className="group flex w-full items-center justify-between bg-transparent py-3.5 text-left"
      >
        <span className="font-['Jost'] text-[.65rem] uppercase tracking-[.22em] text-[#0f172a] transition-colors group-hover:text-[#7da8c7]">
          {item.label}
        </span>
        <span
          className={`text-[#7da8c7] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        >
          <IconChevron />
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-400"
        style={{
          maxHeight: isOpen ? "200px" : "0",
          paddingBottom: isOpen ? "1rem" : "0",
        }}
      >
        <p className="text-[.8rem] leading-[1.85] text-[#64748b]">
          {item.content}
        </p>
      </div>
    </div>
  );
}

// ─── Image Zoom (desktop hover · mobile hold-loupe · pinch modal) ─────────────
// NOTE: All zoom logic preserved exactly as original

const DESKTOP_ZOOM_SCALE = 2;
const LENS_MAGNIFY = 2.75;
const LENS_SIZE_PX = 132;
const LENS_ABOVE_TOUCH_PX = 100;
const HOLD_TO_LENS_MS = 480;
const HOLD_CANCEL_MOVE_PX = 14;
const MODAL_MIN_SCALE = 1;
const MODAL_MAX_SCALE = 5;

function touchDistance(touches: React.TouchList | TouchList) {
  if (touches.length < 2) return 0;
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
}

function PinchZoomModal({
  src,
  alt,
  open,
  onClose,
}: {
  src: string;
  alt: string;
  open: boolean;
  onClose: () => void;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const pinchRef = useRef<{
    startDist: number;
    startScale: number;
    startPan: { x: number; y: number };
    startOrigin: { x: number; y: number };
  } | null>(null);
  const panRef = useRef<{
    startX: number;
    startY: number;
    startPan: { x: number; y: number };
  } | null>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [origin, setOrigin] = useState({ x: 50, y: 50 });

  useEffect(() => {
    if (!open) return;
    setScale(1);
    setPan({ x: 0, y: 0 });
    setOrigin({ x: 50, y: 50 });
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, src]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const clampPan = (next: { x: number; y: number }, s: number) => {
    const el = viewportRef.current;
    if (!el) return next;
    const rect = el.getBoundingClientRect();
    const maxX = ((s - 1) * rect.width) / 2;
    const maxY = ((s - 1) * rect.height) / 2;
    return {
      x: Math.min(maxX, Math.max(-maxX, next.x)),
      y: Math.min(maxY, Math.max(-maxY, next.y)),
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = touchDistance(e.touches);
      const el = viewportRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      pinchRef.current = {
        startDist: dist,
        startScale: scale,
        startPan: { ...pan },
        startOrigin: {
          x: Math.min(100, Math.max(0, ((cx - rect.left) / rect.width) * 100)),
          y: Math.min(100, Math.max(0, ((cy - rect.top) / rect.height) * 100)),
        },
      };
      panRef.current = null;
      return;
    }
    if (e.touches.length === 1 && scale > 1.02) {
      panRef.current = {
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        startPan: { ...pan },
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault();
      const dist = touchDistance(e.touches);
      const ratio = dist / pinchRef.current.startDist;
      const nextScale = Math.min(
        MODAL_MAX_SCALE,
        Math.max(MODAL_MIN_SCALE, pinchRef.current.startScale * ratio),
      );
      setScale(nextScale);
      setOrigin(pinchRef.current.startOrigin);
      return;
    }
    if (e.touches.length === 1 && scale > 1.02 && panRef.current) {
      e.preventDefault();
      const dx = e.touches[0].clientX - panRef.current.startX;
      const dy = e.touches[0].clientY - panRef.current.startY;
      setPan(
        clampPan(
          {
            x: panRef.current.startPan.x + dx,
            y: panRef.current.startPan.y + dy,
          },
          scale,
        ),
      );
    }
  };

  const handleTouchEnd = () => {
    if (pinchRef.current) pinchRef.current = null;
    panRef.current = null;
  };

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-[#0f172a]/96 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Zoom product image"
      onClick={onClose}
    >
      <div
        className="flex shrink-0 items-center justify-between px-4 py-3 sm:px-6"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#7da8c7]/70">
          Pinch to zoom · drag to pan
        </p>
        <button
          type="button"
          onClick={onClose}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-[#7da8c7] hover:border-[#7da8c7] cursor-pointer"
          aria-label="Close zoom"
        >
          <IconClose />
        </button>
      </div>
      <div
        ref={viewportRef}
        className="relative min-h-0 flex-1 overflow-hidden touch-none"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="absolute inset-0 m-auto max-h-full max-w-full select-none object-contain"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: `${origin.x}% ${origin.y}%`,
            transition: pinchRef.current ? "none" : "transform 0.15s ease-out",
            willChange: "transform",
          }}
        />
      </div>
    </div>,
    document.body,
  );
}

function ZoomableImage({
  src,
  alt,
  className,
  style,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lensActiveRef = useRef(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [desktopZoomed, setDesktopZoomed] = useState(false);
  const [desktopOrigin, setDesktopOrigin] = useState({ x: 50, y: 50 });
  const [pinchModalOpen, setPinchModalOpen] = useState(false);
  const [lensDisplay, setLensDisplay] = useState({ x: 50, y: 50 });
  const [lensSample, setLensSample] = useState({ x: 50, y: 50 });
  const [showLens, setShowLens] = useState(false);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const clearHoldTimer = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  const hideLens = useCallback(() => {
    clearHoldTimer();
    lensActiveRef.current = false;
    setShowLens(false);
  }, [clearHoldTimer]);

  const openPinchModal = useCallback(() => {
    clearHoldTimer();
    hideLens();
    setPinchModalOpen(true);
  }, [clearHoldTimer, hideLens]);

  useEffect(() => {
    hideLens();
    setPinchModalOpen(false);
    setDesktopZoomed(false);
    setDesktopOrigin({ x: 50, y: 50 });
    setLensDisplay({ x: 50, y: 50 });
    setLensSample({ x: 50, y: 50 });
  }, [src, isMobile, hideLens]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0]?.contentRect ?? {
        width: 0,
        height: 0,
      };
      setContainerSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !isMobile) return;
    const blockScroll = (e: TouchEvent) => {
      if (lensActiveRef.current) e.preventDefault();
    };
    el.addEventListener("touchmove", blockScroll, { passive: false });
    return () => el.removeEventListener("touchmove", blockScroll);
  }, [isMobile]);

  useEffect(() => () => clearHoldTimer(), [clearHoldTimer]);

  const getLensPositions = useCallback((clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return { display: { x: 50, y: 50 }, sample: { x: 50, y: 50 } };
    const rect = el.getBoundingClientRect();
    const marginX = (LENS_SIZE_PX / 2 / rect.width) * 100;
    const marginY = (LENS_SIZE_PX / 2 / rect.height) * 100;
    const offsetY = (LENS_ABOVE_TOUCH_PX / rect.height) * 100;
    const sampleX = ((clientX - rect.left) / rect.width) * 100;
    const sampleY = ((clientY - rect.top) / rect.height) * 100;
    const clamp = (x: number, y: number) => ({
      x: Math.min(100 - marginX, Math.max(marginX, x)),
      y: Math.min(100 - marginY, Math.max(marginY, y)),
    });
    const sample = clamp(sampleX, sampleY);
    const display = clamp(sampleX, sampleY - offsetY);
    return { display, sample };
  }, []);

  const updateLensFromTouch = useCallback(
    (clientX: number, clientY: number) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const { display, sample } = getLensPositions(clientX, clientY);
        setLensDisplay(display);
        setLensSample(sample);
        rafRef.current = null;
      });
    },
    [getLensPositions],
  );

  const handleMouseEnter = () => {
    if (isMobile) return;
    setDesktopZoomed(true);
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMobile || !desktopZoomed) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setDesktopOrigin({
        x: Math.min(
          100,
          Math.max(0, ((e.clientX - rect.left) / rect.width) * 100),
        ),
        y: Math.min(
          100,
          Math.max(0, ((e.clientY - rect.top) / rect.height) * 100),
        ),
      });
      rafRef.current = null;
    });
  };
  const handleMouseLeave = () => {
    if (isMobile) return;
    setDesktopZoomed(false);
    setDesktopOrigin({ x: 50, y: 50 });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    if (e.touches.length >= 2) {
      clearHoldTimer();
      hideLens();
      openPinchModal();
      return;
    }
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    clearHoldTimer();
    holdTimerRef.current = setTimeout(() => {
      holdTimerRef.current = null;
      lensActiveRef.current = true;
      setShowLens(true);
      updateLensFromTouch(touch.clientX, touch.clientY);
    }, HOLD_TO_LENS_MS);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile) return;
    if (e.touches.length >= 2) {
      clearHoldTimer();
      hideLens();
      if (!pinchModalOpen) openPinchModal();
      return;
    }
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    if (!lensActiveRef.current && touchStartRef.current) {
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      if (Math.hypot(dx, dy) > HOLD_CANCEL_MOVE_PX) {
        clearHoldTimer();
        touchStartRef.current = null;
      }
      return;
    }
    if (!lensActiveRef.current) return;
    e.preventDefault();
    updateLensFromTouch(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    if (!isMobile) return;
    clearHoldTimer();
    touchStartRef.current = null;
    hideLens();
  };
  const handleTouchCancel = () => {
    if (!isMobile) return;
    clearHoldTimer();
    touchStartRef.current = null;
    hideLens();
  };

  const lensW = containerSize.w * LENS_MAGNIFY;
  const lensH = containerSize.h * LENS_MAGNIFY;
  const lensImgLeft =
    containerSize.w > 0 ? -(lensSample.x / 100) * lensW + LENS_SIZE_PX / 2 : 0;
  const lensImgTop =
    containerSize.h > 0 ? -(lensSample.y / 100) * lensH + LENS_SIZE_PX / 2 : 0;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className ?? ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      style={{
        cursor: isMobile ? "zoom-in" : desktopZoomed ? "zoom-out" : "zoom-in",
        touchAction: isMobile ? "pan-y" : undefined,
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
        userSelect: "none",
        ...style,
      }}
    >
      <img
        src={src}
        alt={alt}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        draggable={false}
        className="block h-full w-full select-none object-cover object-[center_15%]"
        style={
          isMobile
            ? undefined
            : {
                transform: desktopZoomed
                  ? `scale(${DESKTOP_ZOOM_SCALE})`
                  : "scale(1)",
                transformOrigin: `${desktopOrigin.x}% ${desktopOrigin.y}%`,
                transition: desktopZoomed
                  ? "transform 0.12s ease-out"
                  : "transform 0.2s ease",
                willChange: "transform",
              }
        }
      />

      {isMobile && showLens && containerSize.w > 0 && (
        <div
          className="pointer-events-none absolute z-30 rounded-full border-[2.5px] border-white/90 bg-[#0f172a] shadow-[0_8px_32px_rgba(15,23,42,0.45)] ring-2 ring-[#7da8c7]/40 transition-opacity duration-100"
          style={{
            width: LENS_SIZE_PX,
            height: LENS_SIZE_PX,
            left: `${lensDisplay.x}%`,
            top: `${lensDisplay.y}%`,
            transform: "translate(-50%, -50%)",
          }}
          aria-hidden
        >
          <div
            className="absolute left-1/2 top-full z-10 -translate-x-1/2"
            aria-hidden
          >
            <div className="mx-auto h-0 w-0 border-x-[7px] border-t-[9px] border-x-transparent border-t-white/90" />
          </div>
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <img
              src={src}
              alt=""
              draggable={false}
              className="absolute max-w-none select-none object-cover object-[center_15%]"
              style={{
                width: lensW,
                height: lensH,
                left: lensImgLeft,
                top: lensImgTop,
              }}
            />
          </div>
          <div className="absolute inset-0 rounded-full shadow-[inset_0_0_12px_rgba(15,23,42,0.25)]" />
        </div>
      )}

      {!isMobile && !desktopZoomed && (
        <div className="pointer-events-none absolute bottom-5 right-5 flex items-center gap-1.5 rounded-sm border border-white/20 bg-[#0f172a]/75 px-2.5 py-1.5 text-[9px] tracking-[0.15em] uppercase text-[#f8fafc] backdrop-blur-sm">
          <IconZoomIn />
          <span className="hidden sm:inline">Hover to zoom</span>
        </div>
      )}

      {isMobile && !showLens && !pinchModalOpen && (
        <div className="pointer-events-none absolute bottom-4 right-4 flex flex-col items-end gap-1 rounded-sm border border-white/20 bg-[#0f172a]/75 px-2.5 py-1.5 text-[9px] tracking-[0.15em] uppercase text-[#f8fafc] backdrop-blur-sm text-right">
          <span className="flex items-center gap-1.5">
            <IconZoomIn />
            Hold to magnify
          </span>
          <span className="text-[8px] text-white/50">Pinch for fullscreen</span>
        </div>
      )}

      <PinchZoomModal
        src={src}
        alt={alt}
        open={pinchModalOpen}
        onClose={() => setPinchModalOpen(false)}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProductDetailClient({ product }: { product: Product }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { format: displayPrice } = useDisplayPrice();
  const allProducts = useAppSelector((s) => s.products.products);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] ?? "M");
  const [selectedColor, setSelectedColor] = useState(
    product.colors?.[0] ?? COLORS[0].name,
  );
  const [activeTab, setActiveTab] = useState<
    "desc" | "details" | "specs" | "care"
  >("desc");
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    setActiveImage(0);
    setSelectedSize(product.sizes?.[0] ?? "M");
    setSelectedColor(product.colors?.[0] ?? COLORS[0].name);
  }, [product._id]);

  const isColorAvailable = useMemo(
    () => !!product.colors?.includes(selectedColor),
    [product.colors, selectedColor],
  );
  const canAddToCart = useMemo(
    () => isColorAvailable || selectedColor === product.colors?.[0],
    [isColorAvailable, selectedColor, product.colors],
  );

  const rating = product.rating ?? 4.6;
  const reviewCount = product.numReviews ?? 42;
  const stars = Array.from({ length: 5 }, (_, i) => i < Math.floor(rating));

  const specs = [
    { label: "Category", value: product.category ?? "-" },
    { label: "Color", value: product.colors?.[0] ?? "-" },
    {
      label: "Fit",
      value: product.category === "Kurta" ? "Relaxed" : "Tailored",
    },
    { label: "Sizes", value: product.sizes?.join(", ") ?? "-" },
  ];

  const relatedProducts = useMemo(
    () =>
      allProducts
        .filter(
          (item) =>
            item._id !== product._id &&
            (item.category === product.category ||
              item.colors?.[0] === product.colors?.[0]),
        )
        .slice(0, 4),
    [allProducts, product._id, product.category, product.colors],
  );

  const mosaicData = useMemo(
    () => allProducts.filter((item) => item._id !== product._id).slice(0, 5),
    [allProducts, product._id],
  );

  const handleWhatsAppInquiry = () => {
    const msg = `Hi Zenmen, I'm interested in the "${product.title}" in ${selectedColor} color, size ${selectedSize}. Is this available?`;
    window.open(
      `https://wa.me/919650753273?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
  };

  const handleWhatsAppBestPrice = () => {
    const msg = `Hi ZENmen — I'd like your best price on "${product.title}" (${selectedColor}, size ${selectedSize}). Thank you.`;
    window.open(
      `https://wa.me/919650753273?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
  };

  function buildCartLine() {
    return {
      _id: product._id,
      title: product.title,
      slug: product.slug,
      price: product.price,
      image: product.images?.[0] ?? { url: "" },
      selectedColor: selectedColor || undefined,
      selectedSize: selectedSize || undefined,
      qty: 1,
    };
  }

  function handleAddToCart() {
    dispatch(addItem(buildCartLine()));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  function handleBuyNow() {
    dispatch(addItem(buildCartLine()));
    dispatch(setCartOpen(false));
    router.push("/checkout");
  }

  const currentImageSrc =
    product.images?.[activeImage]?.url ??
    product.images?.[0]?.url ??
    "/new.jpg";

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#f8fafc] pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))] font-['Jost'] font-light text-[#0f172a] md:pb-0">
      {/* ── Breadcrumb ── */}
      <div className="relative z-10 mx-auto flex max-w-[1800px] items-center gap-2 px-5 pb-0 pt-8 text-[.6rem] uppercase tracking-[.25em] text-[#94a3b8] sm:px-8 lg:px-10">
        <Link
          href="/"
          className="transition-colors hover:text-[#7da8c7] no-underline text-[#94a3b8]"
        >
          Home
        </Link>
        <span className="opacity-40">/</span>
        <Link
          href="/collection"
          className="transition-colors hover:text-[#7da8c7] no-underline text-[#94a3b8]"
        >
          Collection
        </Link>
        <span className="opacity-40">/</span>
        <span className="text-[#7da8c7]">{product.title}</span>
      </div>

      {/* ── Main layout: full-bleed image left + wide details right ── */}
      <div className="relative z-10 mx-auto grid w-full max-w-[1800px] grid-cols-1 items-start gap-0 px-5 pt-6 pb-16 sm:px-8 lg:px-10 xl:grid-cols-[1fr_560px] xl:gap-10 2xl:grid-cols-[1fr_620px]">
        {/* ── LEFT: Full image gallery ── */}
        <div className="xl:sticky xl:top-[76px] xl:self-start">
          <div className="flex items-start gap-3">
            {/* Desktop vertical thumbnails */}
            <div className="hidden xl:flex w-[74px] shrink-0 flex-col gap-2.5">
              {(product.images ?? []).map((img, i) => (
                <button
                  key={`thumb-${i}`}
                  onClick={() => setActiveImage(i)}
                  className={`overflow-hidden rounded-[2px] border p-0 bg-transparent transition-all duration-200 ${
                    activeImage === i
                      ? "border-[#7da8c7]"
                      : "border-[#cbd5e1] hover:border-[#9fbdd5]"
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.alt ?? `Thumbnail ${i + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="block h-[88px] w-full object-cover object-[center_15%]"
                  />
                </button>
              ))}
            </div>

            {/* Main image — full aspect, no crop */}
            <div className="relative min-w-0 flex-1 overflow-hidden rounded-[3px] bg-[#f1f5f9]">
              {/* Badge */}
              <div className="absolute left-5 top-5 z-20 pointer-events-none rounded-[2px] border border-white/20 bg-[#0f172a]/70 px-3.5 py-1.5 text-[.55rem] uppercase tracking-[.3em] text-[#7da8c7] backdrop-blur-sm">
                {product.badge ?? "Featured"}
              </div>

              {/* Full-fit image — object-contain so nothing is cropped */}
              <ZoomableImage
                src={currentImageSrc}
                alt={product.title}
                className="w-full"
                style={{ aspectRatio: "3/4", maxHeight: "82vh" }}
              />
            </div>
          </div>

          {/* Mobile thumbnails */}
          <div className="mt-3 grid grid-cols-4 gap-2 xl:hidden">
            {(product.images ?? []).map((img, i) => (
              <button
                key={`thumb-mobile-${i}`}
                onClick={() => setActiveImage(i)}
                className={`overflow-hidden rounded-[2px] border p-0 bg-transparent transition-all duration-200 ${
                  activeImage === i
                    ? "border-[#7da8c7]"
                    : "border-[#cbd5e1] hover:border-[#9fbdd5]"
                }`}
              >
                <img
                  src={img.url}
                  alt={img.alt ?? `Thumbnail ${i + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="block h-[72px] w-full object-cover object-[center_15%]"
                />
              </button>
            ))}
          </div>

          <p className="mt-3 text-center text-[9px] tracking-[0.12em] uppercase text-[#94a3b8]">
            <span className="hidden md:inline">
              Hover to zoom · move cursor to explore
            </span>
            <span className="md:hidden">
              Hold to magnify · pinch for fullscreen
            </span>
          </p>
        </div>

        {/* ── RIGHT: Wide details panel ── */}
        <aside className="mt-8 xl:mt-0 xl:max-h-[calc(100vh-92px)] xl:overflow-y-auto xl:[scrollbar-width:none] xl:[&::-webkit-scrollbar]:hidden">
          <div className="rounded-[3px] border border-[#e2e8f0] bg-white px-8 py-9 sm:px-10 sm:py-10">
            {/* Label + title */}
            <p className="mb-1.5 text-[11px] uppercase tracking-[0.3em] text-[#7da8c7]">
              {product.category}
              {product.subCategory ? ` · ${product.subCategory}` : ""}
            </p>
            <h1 className="font-['Cormorant_Garamond'] text-[3.2rem] font-light leading-[.93] text-[#0f172a] sm:text-[3.8rem]">
              {product.title}
            </h1>
            <p className="mt-3 text-[.83rem] leading-[1.85] text-[#64748b]">
              {product.tagline ??
                "Crafted for timeless style and everyday confidence."}
            </p>

            {/* Stars + price on same row */}
            <div className="mt-5 flex items-center justify-between border-t border-[#e2e8f0] pt-5">
              <div className="flex items-center gap-2.5">
                <div className="flex gap-[3px]">
                  {stars.map((filled, i) => (
                    <StarIcon key={i} filled={filled} />
                  ))}
                </div>
                <span className="text-[.68rem] tracking-[.08em] text-[#64748b]">
                  {rating} · {reviewCount} reviews
                </span>
              </div>
              <p className="font-['Cormorant_Garamond'] text-[2.4rem] font-normal leading-none text-[#0f172a]">
                {displayPrice(product.price)}
              </p>
            </div>

            {/* Color picker */}
            <div className="mt-6">
              <p className="mb-3 flex items-center justify-between text-[.6rem] uppercase tracking-[.22em] text-[#0f172a]">
                Color
                <span
                  className={`normal-case tracking-normal text-[.75rem] ${!isColorAvailable && selectedColor !== COLORS[0].name ? "text-[#7da8c7]" : "text-[#94a3b8]"}`}
                >
                  {selectedColor}
                  {!isColorAvailable && selectedColor !== COLORS[0].name && (
                    <span className="ml-2 text-[.6rem] text-[#7da8c7]">
                      (Custom Order)
                    </span>
                  )}
                </span>
              </p>
              <div className="flex gap-3">
                {COLORS.map((c) => (
                  <button
                    key={c.name}
                    title={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    className={`relative h-7 w-7 rounded-full border-0 transition-transform hover:scale-110 ${c.cls} ${
                      selectedColor === c.name
                        ? "ring-[1.5px] ring-[#7da8c7] ring-offset-2 ring-offset-white"
                        : ""
                    } ${
                      !product.colors?.includes(c.name) &&
                      c.name !== product.colors?.[0]
                        ? "opacity-50 ring-1 ring-[rgba(125,168,199,0.3)]"
                        : ""
                    }`}
                  >
                    {!product.colors?.includes(c.name) &&
                      c.name !== product.colors?.[0] && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="h-full w-[1.5px] rotate-45 bg-[rgba(125,168,199,0.5)]" />
                        </span>
                      )}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[.65rem] text-[#94a3b8]">
                {!isColorAvailable && selectedColor !== product.colors?.[0]
                  ? "✨ This color is available on custom order. Contact us for details."
                  : product.colors?.includes(selectedColor)
                    ? "✓ In stock · ready to ship"
                    : "Select a color to check availability"}
              </p>
            </div>

            {/* Size picker */}
            <div className="mt-6">
              <p className="mb-3 flex items-center justify-between text-[.6rem] uppercase tracking-[.22em] text-[#0f172a]">
                Size
                <span className="normal-case tracking-normal text-[.75rem] text-[#94a3b8]">
                  {selectedSize}
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                {(product.sizes ?? ["M"]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`h-11 min-w-[52px] cursor-pointer rounded-[2px] border px-4 font-['Jost'] text-[.76rem] tracking-[.1em] transition-all ${
                      selectedSize === s
                        ? "border-[#7da8c7] bg-[#f0f6fb] text-[#0f172a]"
                        : "border-[#e2e8f0] bg-transparent text-[#64748b] hover:border-[#7da8c7] hover:text-[#0f172a]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA buttons */}
            <div className="mt-7 hidden flex-col gap-3 md:flex">
              {isColorAvailable || selectedColor === product.colors?.[0] ? (
                <button
                  onClick={handleAddToCart}
                  className={`flex h-[54px] items-center justify-center gap-2.5 rounded-[2px] border-0 font-['Jost'] text-[.7rem] font-medium uppercase tracking-[.28em] transition-all ${
                    addedToCart
                      ? "bg-[#4a7c59] text-white"
                      : "bg-[#0f172a] text-white hover:bg-[#7da8c7] hover:text-[#0f172a]"
                  }`}
                >
                  <IconBag />
                  {addedToCart ? "Added to Bag" : "Add to Bag"}
                </button>
              ) : (
                <button
                  onClick={handleWhatsAppInquiry}
                  className="flex h-[54px] items-center justify-center gap-2.5 rounded-[2px] border-0 bg-[#25D366] font-['Jost'] text-[.7rem] font-medium uppercase tracking-[.28em] text-white transition-all hover:bg-[#1cb757]"
                >
                  <IconWhatsApp />
                  Book Now
                </button>
              )}

              {isColorAvailable || selectedColor === product.colors?.[0] ? (
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="h-[54px] rounded-[2px] border border-[#9fbdd5] bg-transparent font-['Jost'] text-[.7rem] uppercase tracking-[.28em] text-[#0f172a] transition-all hover:border-[#7da8c7] hover:bg-[#f0f6fb]"
                >
                  Buy Now · Express Checkout
                </button>
              ) : (
                <button
                  onClick={handleWhatsAppInquiry}
                  className="flex h-[54px] items-center justify-center gap-2 rounded-[2px] border border-[#e2e8f0] bg-transparent font-['Jost'] text-[.7rem] uppercase tracking-[.28em] text-[#64748b] transition-all hover:border-[#7da8c7] hover:text-[#7da8c7]"
                >
                  <IconWhatsApp />
                  Inquire on WhatsApp
                </button>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={() => setWishlisted((w) => !w)}
              className="mt-4 flex w-full items-center justify-center gap-2 border-0 bg-transparent opacity-50 transition-opacity hover:opacity-100"
            >
              <IconHeart filled={wishlisted} />
              <span className="font-['Jost'] text-[.62rem] uppercase tracking-[.22em] text-[#64748b]">
                {wishlisted ? "Saved to Wishlist" : "Add to Wishlist"}
              </span>
            </button>

            {/* Divider */}
            <div className="my-7 border-t border-[#e2e8f0]" />

            {/* Accordion */}
            <div>
              {ACCORDION_ITEMS.map((item) => (
                <AccordionItem
                  key={item.id}
                  item={item}
                  isOpen={openAccordion === item.id}
                  onToggle={() =>
                    setOpenAccordion(openAccordion === item.id ? null : item.id)
                  }
                />
              ))}
            </div>

            {/* Tabs */}
            <div className="mt-8 overflow-hidden rounded-[3px] border border-[#e2e8f0] bg-[#f8fafc]">
              <div className="flex border-b border-[#e2e8f0]">
                {(["desc", "details", "specs", "care"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 border-0 bg-transparent py-4 font-['Jost'] text-[.6rem] uppercase tracking-[.2em] transition-all ${
                      activeTab === tab
                        ? "-mb-px border-b-[1.5px] border-[#7da8c7] bg-white text-[#7da8c7]"
                        : "text-[#94a3b8] hover:text-[#0f172a]"
                    }`}
                  >
                    {tab === "desc"
                      ? "Description"
                      : tab === "details"
                        ? "Details"
                        : tab === "specs"
                          ? "Specs"
                          : "Care"}
                  </button>
                ))}
              </div>
              <div className="p-7 sm:p-8">
                {activeTab === "desc" && (
                  <p className="text-[.85rem] leading-[1.95] text-[#64748b]">
                    {product.description}
                  </p>
                )}
                {activeTab === "details" && (
                  <ul className="grid list-none grid-cols-1 gap-3 sm:grid-cols-2">
                    {(product.details ?? []).map((d, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-[.82rem] text-[#64748b]"
                      >
                        <span className="mt-[7px] h-1 w-1 flex-shrink-0 rounded-full bg-[#7da8c7]" />
                        {d}
                      </li>
                    ))}
                  </ul>
                )}
                {activeTab === "specs" && (
                  <div className="grid grid-cols-2">
                    {specs.map((s) => (
                      <div key={s.label} className="contents">
                        <span className="border-b border-[#e2e8f0] py-3 text-[.68rem] uppercase tracking-[.15em] text-[#94a3b8]">
                          {s.label}
                        </span>
                        <span className="border-b border-[#e2e8f0] py-3 text-right text-[.82rem] text-[#0f172a]">
                          {s.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === "care" && (
                  <p className="text-[.85rem] leading-[1.95] text-[#64748b]">
                    {product.care ??
                      "Dry clean only. Steam preferred. Store on a shaped hanger away from direct sunlight."}
                  </p>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ── You May Also Desire ── */}
      {relatedProducts.length > 0 && (
        <section className="relative z-10 mx-auto w-full max-w-[1800px] px-5 py-14 sm:px-8 lg:px-10">
          <div className="mb-7 flex items-baseline justify-between">
            <h2 className="font-['Cormorant_Garamond'] text-[2rem] font-light text-[#0f172a]">
              You May Also Desire
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {relatedProducts.map((item) => (
              <Link
                key={item._id}
                href={`/collection/${encodeURIComponent(item.slug)}`}
                className="group block overflow-hidden rounded-[3px] border border-[#e2e8f0] bg-white text-inherit no-underline transition-all duration-300 hover:-translate-y-0.5 hover:border-[#7da8c7] hover:shadow-[0_6px_28px_rgba(125,168,199,0.12)]"
              >
                <div className="overflow-hidden" style={{ aspectRatio: "3/4" }}>
                  <img
                    src={item.images?.[0]?.url ?? "/new.jpg"}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="block h-full w-full object-cover object-[center_10%] transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-4">
                  <p className="mb-0.5 font-['Cormorant_Garamond'] text-[1.45rem] font-light text-[#0f172a]">
                    {item.title}
                  </p>
                  <p className="text-[.58rem] uppercase tracking-[.18em] text-[#94a3b8]">
                    {item.category} · {item.colors?.[0] ?? "-"}
                  </p>
                  <p className="mt-1.5 text-[1.15rem] text-[#0f172a]">
                    {displayPrice(item.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── More from the Collection (mosaic) ── */}
      {mosaicData.length > 0 && (
        <section className="relative z-10 mx-auto w-full max-w-[1800px] px-5 py-14 sm:px-8 lg:px-10">
          <div className="mb-7 flex items-baseline justify-between">
            <h2 className="font-['Cormorant_Garamond'] text-[2rem] font-light text-[#0f172a]">
              More from the Collection
            </h2>
          </div>
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: "repeat(4, 1fr)",
              gridTemplateRows: "220px 220px",
            }}
          >
            {mosaicData.map((item, i) => (
              <Link
                key={`${item._id}-mosaic`}
                href={`/collection/${encodeURIComponent(item.slug)}`}
                className="group relative cursor-pointer overflow-hidden rounded-[3px] border border-[#e2e8f0] no-underline"
                style={i === 0 ? { gridColumn: "1 / 3", gridRow: "1 / 3" } : {}}
              >
                <img
                  src={item.images?.[0]?.url ?? "/new.jpg"}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover object-[center_10%] transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(15,23,42,0.65)] via-[rgba(15,23,42,0.05)] to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                  <span
                    className={`block font-['Cormorant_Garamond'] font-light text-white ${i === 0 ? "text-[2.1rem]" : "text-[1.5rem]"}`}
                  >
                    {item.title}
                  </span>
                  <span className="mt-0.5 block text-[.72rem] text-[#7da8c7]">
                    {displayPrice(item.price)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Mobile fixed CTA bar ── */}
      <div
        className="fixed inset-x-0 bottom-0 z-[100] border-t border-[#e2e8f0] bg-[#f8fafc]/96 px-3 pt-2.5 pb-[calc(0.65rem+env(safe-area-inset-bottom,0px))] backdrop-blur-md md:hidden"
        role="region"
        aria-label="Product actions"
      >
        <div className="mx-auto grid max-w-lg grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleWhatsAppBestPrice}
            className="flex h-[52px] min-h-[52px] items-center justify-center gap-2 rounded-sm border border-[#7da8c7] bg-white px-1.5 font-['Jost'] text-[8.5px] font-semibold uppercase leading-[1.15] tracking-[0.12em] text-[#0f172a] transition-colors hover:bg-[#f0f6fb] active:opacity-80 [-webkit-tap-highlight-color:transparent]"
          >
            <IconWhatsAppGreen className="h-[17px] w-[17px] shrink-0" />
            <span className="max-[360px]:text-[8px]">Chat for best price</span>
          </button>
          <button
            type="button"
            onClick={canAddToCart ? handleAddToCart : handleWhatsAppInquiry}
            className="flex h-[52px] min-h-[52px] items-center justify-center rounded-sm border border-[#0f172a] bg-[#0f172a] px-1.5 font-['Jost'] text-[9.5px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#7da8c7] hover:border-[#7da8c7] hover:text-[#0f172a] active:opacity-90 [-webkit-tap-highlight-color:transparent]"
          >
            {addedToCart ? "Added" : canAddToCart ? "Add to bag" : "Book now"}
          </button>
        </div>
      </div>
    </main>
  );
}
