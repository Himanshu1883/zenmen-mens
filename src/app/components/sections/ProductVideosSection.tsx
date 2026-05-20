"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useDisplayPrice } from "@/hooks/useDisplayPrice";
import { useSwipeSlider } from "@/hooks/useSwipeSlider";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

/** Edit copy, prices, and slugs here — not loaded from the API */
const PRODUCT_VIDEO_SLIDES = [
  {
    id: 1,
    videoSrc: "/product_video_1.mp4",
    productName: "Royal Purple Jodhpuri Suit",
    category: "Three Piece Collection",
    priceInr: 58000,
    description: "Handcrafted excellence in navy blue",
    slug: "royal-purple-jodhpuri-suit",
  },
  {
    id: 2,
    videoSrc: "/product_video_3.mp4",
    productName: "Classic Black Peak Lapel Tuxedo",
    category: "Wedding Collection",
    priceInr: 42000,
    description: "Contemporary fusion elegance",
    slug: "classic-black-peak-lapel-tuxedo",
  },
  {
    id: 3,
    videoSrc: "/product_video_2.mp4",
    productName: "Midnight Black Bandh gala",
    category: "Bandhgala Collection",
    priceInr: 72000,
    description: "Timeless sophistication",
    slug: "midnight-black-bandh-gala",
  },
  {
    id: 4,
    videoSrc: "/product_video_4.mp4",
    productName: "White Fringe Detail Statement Blazer",
    category: "Western Wear",
    priceInr: 65000,
    description: "Royal elegance redefined",
    slug: "white-fringe-detail-statement-blazer",
  },
] as const;

type VideoSlide = (typeof PRODUCT_VIDEO_SLIDES)[number];

function getVisibleCount() {
  if (typeof window === "undefined") return 1;
  if (window.innerWidth >= 1280) return 4;
  if (window.innerWidth >= 1024) return 3;
  if (window.innerWidth >= 640) return 2;
  return 1;
}

const slides: VideoSlide[] = [...PRODUCT_VIDEO_SLIDES];

const ProductVideosSection = () => {
  const { format: formatPrice } = useDisplayPrice();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState<Record<number, boolean>>({});
  const [visibleCount, setVisibleCount] = useState(1);
  const [gapPx, setGapPx] = useState(16);
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});

  useEffect(() => {
    const updateLayout = () => {
      setVisibleCount(getVisibleCount());
      setGapPx(window.innerWidth >= 768 ? 16 : 12);
    };
    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  }, []);

  const maxIndex = Math.max(0, slides.length - visibleCount);

  useEffect(() => {
    if (currentIndex > maxIndex) setCurrentIndex(maxIndex);
  }, [currentIndex, maxIndex]);

  const syncVideoPlayback = useCallback(() => {
    slides.forEach((slide, index) => {
      const video = videoRefs.current[slide.id];
      if (!video) return;
      const inView =
        index >= currentIndex && index < currentIndex + visibleCount;
      video.muted = isMuted[slide.id] !== false;
      if (inView) void video.play().catch(() => {});
      else video.pause();
    });
  }, [slides, currentIndex, visibleCount, isMuted]);

  useEffect(() => {
    syncVideoPlayback();
  }, [syncVideoPlayback]);

  const handleNext = useCallback(
    () => setCurrentIndex((p) => Math.min(p + 1, maxIndex)),
    [maxIndex],
  );
  const handlePrev = useCallback(
    () => setCurrentIndex((p) => Math.max(p - 1, 0)),
    [],
  );

  const swipeHandlers = useSwipeSlider({
    onNext: handleNext,
    onPrev: handlePrev,
    enabled: maxIndex > 0,
  });

  const toggleMute = (id: number) => {
    const video = videoRefs.current[id];
    if (!video) return;
    const wasUnmuted = isMuted[id] === false;
    video.muted = wasUnmuted;
    setIsMuted((prev) => ({ ...prev, [id]: wasUnmuted }));
  };

  if (slides.length === 0) return null;

  return (
    <section className="py-14 md:py-20 bg-white overflow-hidden">
      <motion.div
        className="max-w-[1800px] mx-auto px-4 md:px-8 lg:px-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {/* ── Header ── */}
        <div className="flex items-end justify-between mb-8 md:mb-10">
          <div>
            <p className="text-[11px] tracking-[0.3em] text-[#7da8c7] uppercase mb-3">
              In Motion
            </p>
            <h2
              className="text-[#0f172a]"
              style={{
                fontFamily: "Playfair Display, serif",
                fontSize: "clamp(28px, 4vw, 52px)",
                fontWeight: 600,
                lineHeight: 1.2,
              }}
            >
              Featured Products
            </h2>
          </div>

          {slides.length > visibleCount && (
            <div className="hidden md:flex items-center gap-2">
              {/* Progress text */}
              <span className="text-[11px] tracking-[0.08em] text-[#94a3b8] mr-2">
                {currentIndex + 1} —{" "}
                {Math.min(currentIndex + visibleCount, slides.length)} /{" "}
                {slides.length}
              </span>

              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className={`w-11 h-11 border flex items-center justify-center transition-all duration-200 ${
                  currentIndex === 0
                    ? "border-[#e2e8f0] text-[#cbd5e1] cursor-not-allowed"
                    : "border-[#0f172a] text-[#0f172a] hover:bg-[#0f172a] hover:text-white"
                }`}
                aria-label="Previous"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
              </motion.button>

              <motion.button
                type="button"
                whileTap={{ scale: 0.9 }}
                onClick={handleNext}
                disabled={currentIndex >= maxIndex}
                className={`w-11 h-11 border flex items-center justify-center transition-all duration-200 ${
                  currentIndex >= maxIndex
                    ? "border-[#e2e8f0] text-[#cbd5e1] cursor-not-allowed"
                    : "border-[#0f172a] text-[#0f172a] hover:bg-[#0f172a] hover:text-white"
                }`}
                aria-label="Next"
              >
                <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
              </motion.button>
            </div>
          )}
        </div>

        {/* ── Progress bar ── */}
        {/* <div className="h-px w-full bg-[#e2e8f0] mb-6">
          <div
            className="h-full bg-[#7da8c7] transition-all duration-500 ease-out"
            style={{
              width: `${((currentIndex + visibleCount) / slides.length) * 100}%`,
            }}
          />
        </div> */}

        {/* ── Slider ── */}
        <div className="overflow-hidden touch-pan-y" {...swipeHandlers}>
          <motion.div
            animate={{
              x: `-${currentIndex * (100 / visibleCount)}%`,
            }}
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 28,
            }}
            className="flex"
            style={{ gap: `${gapPx}px` }}
          >
            {slides.map((video, index) => {
              const detailHref = video.slug
                ? `/collection/${encodeURIComponent(video.slug)}`
                : "/collection";

              return (
                <div
                  key={video.id}
                  className="group flex-shrink-0"
                  style={{
                    flexBasis: `calc(${100 / visibleCount}% - ${
                      ((visibleCount - 1) * gapPx) / visibleCount
                    }px)`,
                  }}
                >
                  {/* Card */}
                  <div
                    className="relative overflow-hidden bg-[#f1f5f9]"
                    style={{ height: "clamp(650px, 49vw, 650px)" }}
                  >
                    {/* Video */}
                    <video
                      ref={(el) => {
                        videoRefs.current[video.id] = el;
                        if (el) {
                          el.muted = isMuted[video.id] !== false;
                          const inView =
                            index >= currentIndex &&
                            index < currentIndex + visibleCount;
                          if (inView) void el.play().catch(() => {});
                        }
                      }}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      loop
                      playsInline
                      autoPlay
                      muted
                      preload="metadata"
                      onLoadedData={syncVideoPlayback}
                    >
                      <source src={video.videoSrc} type="video/mp4" />
                    </video>

                    {/* Fixed gradient — stronger at bottom for legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(15,23,42,0.88)] via-[rgba(15,23,42,0.18)] to-transparent pointer-events-none" />

                    {/* Counter badge — top left */}
                    <div className="absolute top-3 left-3 z-10 pointer-events-none">
                      <span className="inline-flex items-center px-2.5 py-1 bg-white/90 backdrop-blur-md text-[#0f172a] text-[9px] tracking-[0.18em] uppercase font-medium">
                        {String(index + 1).padStart(2, "0")} /{" "}
                        {String(slides.length).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Mute toggle — top right */}
                    <div className="absolute top-3 right-3 z-20">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleMute(video.id);
                        }}
                        className="w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-md text-[#0f172a] hover:bg-white transition-colors duration-200"
                        aria-label={
                          isMuted[video.id] === false ? "Mute" : "Unmute"
                        }
                      >
                        {isMuted[video.id] === false ? (
                          <Volume2 className="w-3.5 h-3.5" strokeWidth={2} />
                        ) : (
                          <VolumeX className="w-3.5 h-3.5" strokeWidth={2} />
                        )}
                      </button>
                    </div>

                    {/* ── Permanent bottom info bar ── */}
                    <div className="absolute inset-x-0 bottom-0 z-10 p-10 md:p-5">
                      <Link href={detailHref} className="block no-underline">
                        {/* Category */}
                        <p className="text-white/65 text-[9px] tracking-[0.25em] uppercase mb-1">
                          {video.category}
                        </p>

                        {/* Product name */}
                        <h3
                          className="text-white mb-3 leading-tight"
                          style={{
                            fontFamily: "Playfair Display, serif",
                            fontSize: "clamp(14px, 1.6vw, 19px)",
                            fontWeight: 600,
                          }}
                        >
                          {video.productName}
                        </h3>

                        {/* Price + CTA */}
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className="text-white font-light"
                            style={{
                              fontFamily: "Playfair Display, serif",
                              fontSize: "clamp(15px, 1.8vw, 19px)",
                              fontWeight: 600,
                            }}
                          >
                            {formatPrice(video.priceInr)}
                          </span>

                          <span className="inline-flex items-center gap-1.5 bg-white text-[#0f172a] text-[9px] tracking-[0.18em] uppercase font-semibold px-3 py-2 hover:bg-[#7da8c7] hover:text-white transition-colors duration-200 shrink-0">
                            View Product
                            <ArrowRight className="w-3 h-3" strokeWidth={2} />
                          </span>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* ── Mobile arrows ── */}
        {slides.length > 1 && (
          <div className="flex md:hidden items-center justify-center gap-3 mt-6">
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`w-11 h-11 border flex items-center justify-center transition-all duration-200 ${
                currentIndex === 0
                  ? "border-[#e2e8f0] text-[#cbd5e1] cursor-not-allowed"
                  : "border-[#0f172a] text-[#0f172a]"
              }`}
              aria-label="Previous"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={handleNext}
              disabled={currentIndex >= maxIndex}
              className={`w-11 h-11 border flex items-center justify-center transition-all duration-200 ${
                currentIndex >= maxIndex
                  ? "border-[#e2e8f0] text-[#cbd5e1] cursor-not-allowed"
                  : "border-[#0f172a] text-[#0f172a]"
              }`}
              aria-label="Next"
            >
              <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
            </motion.button>
          </div>
        )}

        {/* ── Dot indicators ── */}
        <div className="flex items-center justify-center gap-1.5 mt-5">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentIndex(Math.min(index, maxIndex))}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-8 bg-[#7da8c7]"
                  : "w-1.5 bg-[#e2e8f0] hover:bg-[#cbd5e1]"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default ProductVideosSection;
