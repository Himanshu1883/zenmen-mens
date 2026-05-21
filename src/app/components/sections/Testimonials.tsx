"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const testimonials = [
  {
    id: 1,
    name: "Manish Rao",
    rating: 5,
    review:
      "My shopping experience at Zenmen was exceptional. The staff was knowledgeable, the checkout process was smooth, and the fitting and quality exceeded expectations.",
  },
  {
    id: 2,
    name: "Aarshi Narula",
    rating: 5,
    review:
      "The suit fitting, fabric quality, and craftsmanship were outstanding. Zenmen made the entire experience memorable and premium.",
  },
  {
    id: 3,
    name: "Avi Gehlot",
    rating: 5,
    review:
      "Great store for men's garments with excellent quality products, cooperative staff, and designer suits.",
  },
  {
    id: 4,
    name: "Shyam Somvanshi",
    rating: 5,
    review:
      "Wonderful customer service and very polite staff. They patiently helped with every option without any pressure.",
  },
  {
    id: 5,
    name: "Akash Rawat",
    rating: 5,
    review:
      "Amazing and cooperative staff. The suit fitting was absolutely perfect.",
  },
  {
    id: 6,
    name: "Abhishek Goel",
    rating: 5,
    review:
      "Best place in Lajpat Nagar for custom tailored outfits with excellent fitting and a wide variety of fabrics.",
  },
  {
    id: 7,
    name: "Bhupendra Kumar",
    rating: 5,
    review:
      "The collection and fitting were excellent. Staff was very supportive and cooperative throughout.",
  },
  {
    id: 8,
    name: "PRAVER DHIMAN",
    rating: 5,
    review: "Amazing staff and excellent fitting experience.",
  },
  {
    id: 9,
    name: "Ayush Sabbarwal",
    rating: 5,
    review:
      "Nice collection of Indo-western designer suits and sherwanis with great custom fitting at good prices.",
  },
  {
    id: 10,
    name: "Varsha Nagar",
    rating: 5,
    review:
      "Very happy with the fabric quality and fitting. Excellent craftsmanship and overall experience.",
  },
  {
    id: 11,
    name: "Rohit Chauhan",
    rating: 5,
    review:
      "Excellent collection of ethnic and formal wear with very supportive staff.",
  },
  {
    id: 12,
    name: "Somya Jha",
    rating: 5,
    review:
      "Best fittings and pricing. One of the best custom tailoring experiences.",
  },
  {
    id: 13,
    name: "Nishant Rajput",
    rating: 5,
    review:
      "Best quality fabric and fitting. Much better experience compared to other tailoring shops.",
  },
];

function StarIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="#7da8c7"
      aria-hidden="true"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function Initial({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0f172a] ring-1 ring-[#7da8c7]/30">
      <span className="font-[family-name:var(--font-montserrat)] text-[11px] font-semibold tracking-wider text-[#7da8c7]">
        {initials}
      </span>
    </div>
  );
}

function Card({ t }: { t: (typeof testimonials)[0] }) {
  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    setClamped(el.scrollHeight > el.clientHeight + 2);
  }, []);

  return (
    <div className="flex h-[220px] w-[320px] shrink-0 flex-col justify-between rounded-[2px] border border-[#e2e8f0] bg-white p-6 shadow-[0_1px_4px_rgba(15,23,42,0.06)] transition-[border-color,box-shadow] duration-200 hover:border-[#7da8c7]/40 hover:shadow-[0_4px_20px_rgba(125,168,199,0.12)] sm:w-[360px]">
      {/* Stars */}
      <div className="flex gap-0.5">
        {Array.from({ length: t.rating }).map((_, i) => (
          <StarIcon key={i} />
        ))}
      </div>

      {/* Review text */}
      <div className="mt-3 flex-1 overflow-hidden">
        <p
          ref={textRef}
          className={`font-[family-name:var(--font-cormorant)] text-[15px] italic leading-relaxed text-[#475569] ${
            !expanded ? "line-clamp-3" : ""
          }`}
        >
          "{t.review}"
        </p>
        {clamped && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="mt-1 font-[family-name:var(--font-montserrat)] text-[10px] font-medium uppercase tracking-widest text-[#7da8c7] hover:text-[#0f172a]"
          >
            {expanded ? "Less" : "More…"}
          </button>
        )}
      </div>

      {/* Author */}
      <div className="mt-4 flex items-center gap-3 border-t border-[#f1f5f9] pt-4">
        <Initial name={t.name} />
        <div>
          <p className="font-[family-name:var(--font-montserrat)] text-[12px] font-medium text-[#0f172a]">
            {t.name}
          </p>
          <p className="mt-0.5 font-[family-name:var(--font-montserrat)] text-[9px] uppercase tracking-[0.22em] text-[#94a3b8]">
            Google review
          </p>
        </div>
        {/* Google G */}
        <div className="ml-auto">
          <svg width="14" height="14" viewBox="0 0 48 48" aria-hidden>
            <path
              fill="#EA4335"
              d="M24 9.5c3.5 0 6.6 1.2 9.1 3.5l6.8-6.8C35.8 2.2 30.3 0 24 0 14.7 0 6.7 5.4 2.8 13.3l7.9 6.1C12.5 13.2 17.8 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.9 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h13c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.5-4.1 7.1-10.2 7.1-17.1z"
            />
            <path
              fill="#FBBC05"
              d="M10.7 28.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6L2.8 13.3C1 17 0 21.4 0 24c0 2.6 1 7 2.8 10.7l7.9-6.1z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.5 0 12-2.1 16-5.8l-7.6-5.9c-2.1 1.4-4.8 2.2-8.4 2.2-6.2 0-11.5-4.1-13.3-9.9l-7.9 6.1C6.7 42.6 14.7 48 24 48z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

const SPEED = 0.5; // px per frame at 60fps
const doubled = [...testimonials, ...testimonials];

export default function Testimonials() {
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const pausedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const halfWidthRef = useRef(0);

  // Measure half-width after mount
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const track = trackRef.current;
      if (!track) return;
      const cards = Array.from(track.children) as HTMLElement[];
      let w = 0;
      const half = testimonials.length;
      for (let i = 0; i < half && i < cards.length; i++) {
        w += cards[i].offsetWidth + 20; // 20 = gap-5
      }
      halfWidthRef.current = w;
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    function animate(ts: number) {
      if (lastTsRef.current !== null && !pausedRef.current) {
        const delta = ts - lastTsRef.current;
        offsetRef.current += SPEED * (delta / 16.67);
        const half = halfWidthRef.current;
        if (half > 0 && offsetRef.current >= half) offsetRef.current -= half;
        if (trackRef.current) {
          trackRef.current.style.transform = `translateX(-${offsetRef.current}px)`;
        }
      }
      lastTsRef.current = ts;
      rafRef.current = requestAnimationFrame(animate);
    }
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, []);

  const pause = useCallback(() => {
    pausedRef.current = true;
  }, []);
  const resume = useCallback(() => {
    pausedRef.current = false;
    lastTsRef.current = null; // reset delta to avoid jump
  }, []);

  return (
    <section
      id="testimonials"
      className="relative border-t border-[#e2e8f0] bg-[#f1f5f9] py-16 md:py-24"
      aria-labelledby="testimonials-heading"
    >
      {/* Radial glow */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(125,168,199,0.08),transparent_55%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center md:mx-0 md:max-w-none md:text-left">
          <div className="flex flex-col items-center gap-3 md:flex-row md:items-center">
            <span className="hidden h-px w-10 bg-gradient-to-r from-[#7da8c7] to-transparent md:block" />
            <p className="font-[family-name:var(--font-montserrat)] text-[10px] font-semibold uppercase tracking-[0.32em] text-[#7da8c7]">
              Client stories
            </p>
          </div>
          <h2
            id="testimonials-heading"
            className="mt-4 font-[family-name:var(--font-playfair)] text-[2.1rem] font-medium leading-[1.12] tracking-tight text-[#0f172a] sm:text-4xl md:text-[2.75rem]"
          >
            Words from our{" "}
            <em className="not-italic text-[#7da8c7]">gentlemen</em>
          </h2>
          <p className="mx-auto mt-4 max-w-lg font-[family-name:var(--font-cormorant)] text-base italic leading-relaxed text-black md:mx-0">
            Bespoke clients on fit, fabric, and the ZENMEN experience.
          </p>
        </div>

        {/* Stats row */}
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 md:gap-x-12">
          {[
            { n: "5.0", label: "Rating" },
            { n: "13+", label: "Reviews" },
            { n: "100%", label: "Satisfaction" },
          ].map((s) => (
            <div key={s.label} className="flex items-baseline gap-2">
              <span className="font-[family-name:var(--font-playfair)] text-2xl font-medium text-[#0f172a]">
                {s.n}
              </span>
              <span className="font-[family-name:var(--font-montserrat)] text-[9px] uppercase tracking-[0.24em] text-[#94a3b8]">
                {s.label}
              </span>
            </div>
          ))}
          <div className="hidden h-px flex-1 bg-[#e2e8f0] md:block" />
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon key={i} />
            ))}
            <span className="ml-1 font-[family-name:var(--font-montserrat)] text-[10px] font-medium text-black">
              Google verified
            </span>
          </div>
        </div>
      </div>

      {/* Marquee — full bleed */}
      <div
        className="relative mt-10 overflow-hidden"
        onMouseEnter={pause}
        onMouseLeave={resume}
        onTouchStart={pause}
        onTouchEnd={resume}
      >
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#f1f5f9] to-transparent sm:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#f1f5f9] to-transparent sm:w-24" />

        <div
          ref={trackRef}
          className="flex gap-5 py-3"
          style={{ width: "max-content", willChange: "transform" }}
        >
          {doubled.map((t, i) => (
            <Card key={`${t.id}-${i}`} t={t} />
          ))}
        </div>
      </div>

      {/* Bottom note */}
      <div className="relative z-10 mx-auto mt-8 max-w-[1200px] px-5 sm:px-8 lg:px-10">
        <p className="font-[family-name:var(--font-montserrat)] text-[9px] font-light uppercase tracking-[0.24em] text-[#94a3b8] md:text-left text-center">
          ZENMEN · Lajpat Nagar · Bespoke tailoring
        </p>
      </div>
    </section>
  );
}
