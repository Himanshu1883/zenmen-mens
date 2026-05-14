"use client";

import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useEffect, useRef } from "react";

const reels = [
  {
    id: "5399",
    src: "/reels/img_5399.mp4",
    title: "ZENMEN Studio 01",
    href: "https://www.instagram.com/_zenmen/",
  },
  {
    id: "5400",
    src: "/reels/img_5400.mp4",
    title: "ZENMEN Studio 02",
    href: "https://www.instagram.com/_zenmen/",
  },
  {
    id: "5401",
    src: "/reels/img_5401.mp4",
    title: "ZENMEN Studio 03",
    href: "https://www.instagram.com/_zenmen/",
  },
  {
    id: "5402",
    src: "/reels/img_5402.mp4",
    title: "ZENMEN Studio 04",
    href: "https://www.instagram.com/_zenmen/",
  },
  {
    id: "5403",
    src: "/reels/img_5403.mp4",
    title: "ZENMEN Studio 05",
    href: "https://www.instagram.com/_zenmen/",
  },
  {
    id: "5404",
    src: "/reels/img_5404.mov",
    title: "ZENMEN Studio 06",
    href: "https://www.instagram.com/_zenmen/",
  },
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
    <section
      className="relative w-full overflow-hidden bg-[#f8fafc] py-16 md:py-24"
      aria-labelledby="reels-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_80%_-10%,rgba(125,168,199,0.14),transparent_60%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_0%_100%,rgba(125,168,199,0.08),transparent_55%)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#7da8c7]/35 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#e2e8f0] to-transparent" />

      <div className="relative z-10 mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#7da8c7]" />
              <p className="font-[family-name:var(--font-montserrat)] text-[10px] font-semibold uppercase tracking-[0.32em] text-[#7da8c7]">
                Instagram Reels
              </p>
            </div>
            <h2
              id="reels-heading"
              className="mt-4 font-[family-name:var(--font-playfair)] text-[2.15rem] font-medium leading-[1.1] tracking-tight text-[#0f172a] md:text-5xl lg:text-[3.15rem]"
            >
              Behind{" "}
              <em className="not-italic text-[#7da8c7]">the</em> craft
            </h2>
            <p className="mt-3 max-w-md font-[family-name:var(--font-cormorant)] text-base italic leading-relaxed text-[#64748b]">
              Short films from the atelier — fittings, fabrics, and the people
              who make every piece.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <p className="hidden font-[family-name:var(--font-montserrat)] text-[10px] font-semibold uppercase tracking-[0.28em] text-[#94a3b8] sm:block">
              {String(reels.length).padStart(2, "0")} films
            </p>
            <a
              href="https://www.instagram.com/_zenmen/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-sm border border-[#e2e8f0] bg-white px-4 py-2.5 font-[family-name:var(--font-montserrat)] text-[9px] font-semibold uppercase tracking-[0.22em] text-[#0f172a] shadow-sm transition-colors hover:border-[#7da8c7] hover:text-[#7da8c7]"
            >
              @_zenmen
              <ExternalLink className="h-3.5 w-3.5 text-[#7da8c7]" aria-hidden />
            </a>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-10">
        <button
          type="button"
          onClick={() => slideTrack("left")}
          className="absolute left-2 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#e2e8f0] bg-white/95 text-[#0f172a] shadow-md backdrop-blur-sm transition-colors hover:border-[#7da8c7] hover:text-[#7da8c7] sm:hidden"
          aria-label="Scroll reels left"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
        </button>
        <button
          type="button"
          onClick={() => slideTrack("right")}
          className="absolute right-2 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#e2e8f0] bg-white/95 text-[#0f172a] shadow-md backdrop-blur-sm transition-colors hover:border-[#7da8c7] hover:text-[#7da8c7] sm:hidden"
          aria-label="Scroll reels right"
        >
          <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
        </button>

        <div
          className="pointer-events-none absolute left-0 top-0 z-20 h-full w-10 bg-gradient-to-r from-[#f8fafc] to-transparent sm:w-14"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute right-0 top-0 z-20 h-full w-16 bg-gradient-to-l from-[#f8fafc] via-[#f8fafc]/80 to-transparent sm:w-24 md:w-32"
          aria-hidden
        />

        <div
          ref={trackRef}
          className="reels-scroll w-full overflow-x-auto overflow-y-visible pb-6"
          style={{
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
            scrollSnapType: "x proximity",
          }}
        >
          <div className="flex w-max gap-4 px-5 pr-20 sm:gap-5 sm:px-8 md:pr-28 lg:px-12">
            {reels.map((reel, index) => (
              <a
                key={reel.id}
                href={reel.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block w-[72vw] max-w-[300px] flex-shrink-0 scroll-m-4 sm:w-[280px] md:w-[300px]"
                style={{ scrollSnapAlign: "start" }}
              >
                <article className="overflow-hidden rounded-md border border-[#e2e8f0] bg-white shadow-[0_12px_40px_-20px_rgba(15,23,42,0.12)] transition-[box-shadow,border-color,transform] duration-300 hover:-translate-y-1 hover:border-[#7da8c7]/45 hover:shadow-[0_24px_56px_-28px_rgba(125,168,199,0.35)]">
                  <div className="relative aspect-[9/16] min-h-[min(70vh,560px)] max-h-[72vh] bg-[#f1f5f9]">
                    <video
                      ref={(node) => {
                        videoRefs.current[index] = node;
                      }}
                      src={reel.src}
                      className="absolute inset-0 h-full w-full object-cover"
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="metadata"
                      controls
                    />
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/25 to-transparent opacity-80" />
                  </div>

                  <div className="border-t border-[#f1f5f9] bg-[#fafafa] px-4 py-3.5">
                    <p className="mb-1.5 font-[family-name:var(--font-montserrat)] text-[9px] font-semibold uppercase tracking-[0.28em] text-[#94a3b8]">
                      {String(index + 1).padStart(2, "0")}
                      <span className="mx-1.5 text-[#cbd5e1]">/</span>
                      {String(reels.length).padStart(2, "0")}
                    </p>
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 flex-1 truncate font-[family-name:var(--font-playfair)] text-[1.05rem] font-medium leading-snug text-[#0f172a] group-hover:text-[#7da8c7]">
                        {reel.title}
                      </p>
                      <span className="flex-shrink-0 rounded-sm border border-[#dbe4ef] bg-white px-2 py-1 font-[family-name:var(--font-montserrat)] text-[7px] font-bold uppercase tracking-[0.24em] text-[#7da8c7]">
                        Reel
                      </span>
                    </div>
                  </div>
                </article>
              </a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .reels-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}
