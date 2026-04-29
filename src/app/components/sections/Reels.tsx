"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";

const reels = [
  { id: "5399", src: "/reels/img_5399.mp4", title: "ZENMEN Studio 01" },
  { id: "5400", src: "/reels/img_5400.mp4", title: "ZENMEN Studio 02" },
  { id: "5401", src: "/reels/img_5401.mp4", title: "ZENMEN Studio 03" },
  { id: "5402", src: "/reels/img_5402.mp4", title: "ZENMEN Studio 04" },
  { id: "5403", src: "/reels/img_5403.mp4", title: "ZENMEN Studio 05" },
  { id: "5404", src: "/reels/img_5404.mov", title: "ZENMEN Studio 06" },
];

export default function Reels() {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const videos = videoRefs.current.filter(Boolean) as HTMLVideoElement[];
    if (videos.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            void video.play().catch(() => undefined);
            return;
          }
          video.pause();
        });
      },
      { threshold: 0.65 },
    );

    videos.forEach((video) => observer.observe(video));
    return () => observer.disconnect();
  }, []);

  const slideTrack = (direction: "left" | "right") => {
    const track = trackRef.current;
    if (!track) return;
    const step = Math.max(280, Math.floor(track.clientWidth * 0.82));
    track.scrollBy({
      left: direction === "right" ? step : -step,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative w-full bg-[#030813] py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_50%_at_75%_-5%,rgba(200,169,110,0.1),transparent_65%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_5%_105%,rgba(200,169,110,0.05),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c8a96e30] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#c8a96e30] to-transparent" />

      <div className="relative z-10 px-6 sm:px-10 lg:px-16">
        <div className="flex items-center gap-4">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#c8a96e88]" />
          <p className="font-['Cormorant_Garamond'] text-[10px] font-light uppercase tracking-[0.42em] text-[#c8a96e]">
            Instagram Reels
          </p>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <h2 className="font-['Playfair_Display'] text-[2.5rem] font-light leading-[1.08] text-[#f7f2e8] md:text-5xl lg:text-[3.4rem]">
            Behind <span className="italic" style={{ color: "transparent", WebkitTextStroke: "1px #c8a96e" }}>The</span> Craft
          </h2>
          <p className="hidden font-['Cormorant_Garamond'] text-[10px] uppercase tracking-[0.3em] text-[#c8a96e33] md:block">
            {String(reels.length).padStart(2, "0")} Episodes
          </p>
        </div>
      </div>

      <div className="relative mt-10">
        <button
          type="button"
          onClick={() => slideTrack("left")}
          className="absolute left-2 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#c8a96e66] bg-black/65 text-[#f8f4ec] backdrop-blur sm:hidden"
          aria-label="Slide reels left"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          type="button"
          onClick={() => slideTrack("right")}
          className="absolute right-2 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#c8a96e66] bg-black/65 text-[#f8f4ec] backdrop-blur sm:hidden"
          aria-label="Slide reels right"
        >
          <ChevronRight size={20} />
        </button>

        <div className="pointer-events-none absolute left-0 top-0 z-20 h-full w-8" style={{ background: "linear-gradient(to right, #030813, transparent)" }} />
        <div className="pointer-events-none absolute right-0 top-0 z-20 h-full w-20 md:w-28" style={{ background: "linear-gradient(to left, #030813 30%, rgba(3,8,19,0.6) 65%, transparent 100%)" }} />

        <div
          ref={trackRef}
          className="w-full overflow-x-auto overflow-y-visible pb-8"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch", scrollSnapType: "x proximity" }}
        >
          <div className="flex w-max gap-4 px-6 pr-28 sm:gap-5 sm:px-10 md:pr-36 lg:px-16">
            {reels.map((reel, index) => (
              <article key={reel.id} className="relative flex-shrink-0" style={{ scrollSnapAlign: "start" }}>
                <div className="relative overflow-hidden" style={{ borderRadius: "2px", boxShadow: "0 20px 56px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(200,169,110,0.15)" }}>
                  <video
                    ref={(node) => {
                      videoRefs.current[index] = node;
                    }}
                    src={reel.src}
                    className="block h-[70vh] min-h-[420px] w-[72vw] max-w-[340px] object-cover md:w-[300px]"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    controls
                  />

                  <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/55 to-transparent" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/95 via-black/55 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-4">
                    <p className="mb-2 font-['Cormorant_Garamond'] text-[9px] uppercase tracking-[0.36em] text-[#c8a96e66]">
                      {String(index + 1).padStart(2, "0")}
                      <span className="mx-1.5 opacity-50">/</span>
                      {String(reels.length).padStart(2, "0")}
                    </p>
                    <div className="flex items-end justify-between gap-3">
                      <p className="truncate font-['Playfair_Display'] text-[1.1rem] font-light leading-snug text-[#f8f4ec]">{reel.title}</p>
                      <span className="flex-shrink-0 border border-[rgba(200,169,110,0.32)] bg-[rgba(200,169,110,0.04)] px-[9px] py-[4px] font-['Cormorant_Garamond'] text-[8px] uppercase tracking-[0.26em] text-[#c8a96eaa]">
                        Reel
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <style>{`.overflow-x-auto::-webkit-scrollbar{display:none;}`}</style>
    </section>
  );
}
