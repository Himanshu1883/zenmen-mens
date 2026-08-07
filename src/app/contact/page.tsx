// src/app/contact/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface FormData {
  name: string;
  email: string;
  phone: string;
  occasion: string;
  message: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

type SubmitStatus = "idle" | "loading" | "success" | "error";

// ── Intersection helper ───────────────────────────────────────────────────────
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ── Fade style helper ─────────────────────────────────────────────────────────
function fade(
  visible: boolean,
  delay = 0,
  dir: "up" | "left" | "right" | "none" = "up",
): React.CSSProperties {
  return {
    opacity: visible ? 1 : 0,
    transform: visible
      ? "none"
      : dir === "up"
        ? "translateY(32px)"
        : dir === "left"
          ? "translateX(-32px)"
          : dir === "right"
            ? "translateX(32px)"
            : "none",
    transition: `opacity 0.85s ease ${delay}s, transform 0.85s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
  };
}

// ── Validate ──────────────────────────────────────────────────────────────────
function validate(data: FormData): FormErrors {
  const errs: FormErrors = {};
  if (!data.name.trim() || data.name.trim().length < 2)
    errs.name = "Please enter your name";
  if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errs.email = "Please enter a valid email";
  if (data.phone && !/^[+\d\s\-()]{7,20}$/.test(data.phone))
    errs.phone = "Please enter a valid phone number";
  if (!data.message.trim() || data.message.trim().length < 10)
    errs.message = "Message must be at least 10 characters";
  return errs;
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ContactPage() {
  // Intersection refs
  const { ref: bannerSectionRef, visible: bannerVisible } = useInView(0.05);

  const { ref: infoSectionRef, visible: infoVisible } = useInView(0.1);

  const { ref: formSectionRef, visible: formVisible } = useInView(0.1);

  const { ref: mapSectionRef, visible: mapVisible } = useInView(0.1);

  const { ref: channelsSectionRef, visible: channelsVisible } = useInView(0.1);

  // Marquee
  const [marqueeX, setMarqueeX] = useState(0);
  const rafRef = useRef<number>(0);
  useEffect(() => {
    let x = 0;
    const tick = () => {
      x = (x - 0.45) % 700;
      setMarqueeX(x);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    occasion: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [focusedField, setFocused] = useState<string | null>(null);

  function handleChange(field: keyof FormData, value: string) {
    const next = { ...formData, [field]: value };
    setFormData(next);
    if (touched[field]) {
      setErrors(validate(next));
    }
  }

  function handleBlur(field: keyof FormData) {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate(formData));
    setFocused(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const allTouched: Record<string, boolean> = {
      name: true,
      email: true,
      phone: true,
      message: true,
    };
    setTouched(allTouched);
    const errs = validate(formData);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        occasion: "",
        message: "",
      });
      setTouched({});
      setErrors({});
    } catch {
      setStatus("error");
    }
  }

  // Input style helper
  function inputStyle(field: keyof FormData): React.CSSProperties {
    const hasError = touched[field] && errors[field];
    const isFocused = focusedField === field;
    return {
      width: "100%",
      background: "#ffffff",
      border: `1px solid ${hasError ? "rgba(224,82,82,0.55)" : isFocused ? "#7da8c7" : "#e2e8f0"}`,
      color: "#0f172a",
      fontFamily: "'Jost', sans-serif",
      fontSize: 13,
      fontWeight: 300,
      letterSpacing: "0.04em",
      padding: "14px 16px",
      outline: "none",
      transition: "border-color 0.25s, box-shadow 0.25s",
      boxShadow: isFocused ? "0 0 0 3px rgba(125,168,199,0.2)" : "none",
      borderRadius: 2,
      appearance: "none" as const,
      WebkitAppearance: "none" as const,
    };
  }

  const MARQUEE_WORDS = [
    "Visit Us",
    "·",
    "Private Consultation",
    "·",
    "Book a Fitting",
    "·",
    "Lajpat Nagar",
    "·",
    "New Delhi",
    "·",
    "WhatsApp",
    "·",
    "ZENmen Atelier",
    "·",
  ];

  const CHANNELS = [
    {
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
      label: "Visit Atelier",
      value: "E-39, Lajpat Nagar II",
      sub: "New Delhi – 110024",
      href: "https://www.google.com/maps?q=28.5701803,77.2405599&z=17&output=embed",
      cta: "Get Directions →",
    },
    {
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        >
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 15v1.92z" />
        </svg>
      ),
      label: "Call Us",
      value: "+91 96507 53273",
      sub: "Mon – Sat, 11AM – 8PM",
      href: "tel:+919650753273",
      cta: "Call Now →",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
      label: "WhatsApp",
      value: "Message Instantly",
      sub: "Fastest response",
      href: "https://wa.me/919650753273?text=Hi%20ZENmen%2C%20I'd%20like%20to%20book%20a%20consultation.",
      cta: "Open WhatsApp →",
    },
    {
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      ),
      label: "Instagram",
      value: "@_zenmen",
      sub: "53K+ Community",
      href: "https://www.instagram.com/_zenmen/",
      cta: "Follow Us →",
    },
  ];

  const DETAILS = [
    { label: "Studio Hours", value: "Mon – Sat, 11AM – 8PM" },
    { label: "Consultation", value: "Walk-ins & Appointments" },
    { label: "Turnaround", value: "10 – 21 Days, Rush Available" },
    { label: "Specialty", value: "Bespoke Groomwear & Suiting" },
    { label: "Delivery", value: "Pan-India & Worldwide" },
    { label: "Starting Price", value: "₹2,500 Onwards" },
  ];

  const OCCASIONS = [
    "",
    "Wedding / Groomwear",
    "Sherwani",
    "Bespoke Suit",
    "Custom Shirt",
    "Tailored Trousers",
    "Indo-Western",
    "Corporate Wardrobe",
    "Alterations",
    "Other",
  ];

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: rgba(125,168,199,.45); border-radius: 2px; }

        .cgr { height: 1px; width: 100%; background: linear-gradient(to right, transparent, #e2e8f0 40%, #e2e8f0 60%, transparent); }

        .ch-card {
          border: 1px solid #e2e8f0;
          background: #ffffff;
          padding: 28px 24px;
          display: flex; flex-direction: column; gap: 14px;
          transition: all .35s; position: relative; overflow: hidden; cursor: default;
          text-decoration: none;
          box-shadow: 0 1px 3px rgba(15,23,42,.04);
        }
        .ch-card::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(125,168,199,.12), transparent 70%);
          opacity: 0; transition: opacity .35s;
        }
        .ch-card:hover { border-color: #7da8c7; transform: translateY(-4px); box-shadow: 0 8px 24px rgba(15,23,42,.08); }
        .ch-card:hover::before { opacity: 1; }
        .ch-icon { color: #7da8c7; flex-shrink: 0; }
        .ch-cta {
          font-family: 'Jost', sans-serif; font-size: 10px; letter-spacing: .25em;
          text-transform: uppercase; color: #64748b; margin-top: auto;
          transition: color .3s; display: inline-flex; align-items: center; gap: 6px;
        }
        .ch-card:hover .ch-cta { color: #7da8c7; }

        .dc {
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          padding: 18px 16px;
          border-radius: 2px;
        }

        .c-input::placeholder, .c-textarea::placeholder { color: #94a3b8; }
        .c-select { appearance: none; -webkit-appearance: none; cursor: pointer; }
        .c-select option { background: #ffffff; color: #0f172a; }
        .c-textarea { resize: vertical; min-height: 120px; }

        .c-submit {
          width: 100%;
          background: #0f172a; color: #ffffff;
          border: none; cursor: pointer;
          font-family: 'Jost', sans-serif; font-size: 10px; font-weight: 500;
          letter-spacing: .35em; text-transform: uppercase;
          padding: 16px 20px;
          transition: background .25s, transform .2s;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          border-radius: 2px;
        }
        .c-submit:hover:not(:disabled) { background: #7da8c7; color: #0f172a; transform: translateY(-1px); }
        .c-submit:disabled { opacity: .65; cursor: not-allowed; }

        .wa-btn {
          display: inline-flex; align-items: center; gap: 10px;
          background: #25D366; color: #fff;
          font-family: 'Jost', sans-serif; font-size: 10px; font-weight: 500;
          letter-spacing: .3em; text-transform: uppercase;
          padding: 14px 28px; text-decoration: none;
          transition: background .25s;
          border-radius: 2px;
        }
        .wa-btn:hover { background: #1fb559; }

        .map-wrap { position: relative; width: 100%; height: 420px; overflow: hidden; border: 1px solid #e2e8f0; border-radius: 4px; background: #f8fafc; }
        .map-wrap iframe { width: 100%; height: 100%; border: none; }
        .map-overlay-badge {
          position: absolute; top: 16px; left: 16px; z-index: 10;
          background: rgba(255,255,255,.95); border: 1px solid #e2e8f0;
          padding: 12px 16px; backdrop-filter: blur(10px);
          box-shadow: 0 4px 12px rgba(15,23,42,.08);
          border-radius: 2px;
        }

        .err { font-family: 'Jost', sans-serif; font-size: 10px; color: rgba(224,82,82,.9); letter-spacing: .03em; margin-top: 4px; display: block; }

        @media (max-width: 1024px) {
          .c-two-col { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .c-four-col { grid-template-columns: 1fr 1fr !important; }
          .c-detail-grid { grid-template-columns: 1fr 1fr !important; }
          .map-wrap { height: 300px; }
        }
        @media (max-width: 480px) {
          .c-four-col { grid-template-columns: 1fr !important; }
          .c-detail-grid { grid-template-columns: 1fr !important; }
          .map-wrap { height: 260px; }
          .c-banner-title { font-size: clamp(2.8rem, 14vw, 5rem) !important; }
        }
      `}</style>

      {/* ═══════════════════════════════════════════
          01 — BANNER
      ═══════════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          minHeight: "80vh",
          background: "#fafbfc",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        {/* BG image with warm vignette */}
        <div style={{ position: "absolute", inset: 0 }}>
          <img
            src="/zenmen_suit.png"
            alt="ZENmen Atelier"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center 25%",
              opacity: 0.35,
              filter: "saturate(0.9) contrast(1.02)",
            }}
          />
          {/* Rich gradient — lighter at top so text is clearly readable */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(248,250,252,0.55) 0%, rgba(248,250,252,0.4) 30%, rgba(248,250,252,0.75) 70%, #fafbfc 100%)",
            }}
          />
          {/* Gold glow top-left */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 60% 50% at 10% 0%, rgba(125,168,199,0.12), transparent 55%)",
            }}
          />
          {/* Gold glow bottom-right */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 50% 40% at 90% 100%, rgba(125,168,199,0.08), transparent 55%)",
            }}
          />
        </div>

        {/* Vertical side text */}
        <div
          style={{
            position: "absolute",
            left: 20,
            top: "50%",
            transform: "translateY(-50%) rotate(-90deg)",
            fontFamily: "'Jost', sans-serif",
            fontSize: 8,
            letterSpacing: "0.42em",
            textTransform: "uppercase",
            color: "rgba(125,168,199,0.4)",
            whiteSpace: "nowrap",
            zIndex: 10,
          }}
        >
          Private Consultation · Lajpat Nagar · New Delhi
        </div>

        {/* Watermark */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            right: "-2vw",
            bottom: "-1vw",
            fontFamily: "var(--heading-font-family)",
            fontSize: "clamp(6rem,18vw,15rem)",
            fontWeight: 700,
            color: "transparent",
            WebkitTextStroke: "0.5px rgba(125,168,199,0.05)",
            lineHeight: 1,
            userSelect: "none",
            zIndex: 1,
            pointerEvents: "none",
          }}
        >
          ZEN
        </div>

        {/* Banner content */}
        <div
          ref={bannerSectionRef}
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: 1280,
            margin: "0 auto",
            padding: "120px clamp(24px,6vw,80px) 80px",
            width: "100%",
          }}
        >
          <div style={{ ...fade(bannerVisible, 0) }}>
            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: 10,
                letterSpacing: "0.45em",
                textTransform: "uppercase",
                color: "#7da8c7",
                marginBottom: 24,
              }}
            >
              Get in Touch
            </p>
          </div>

          <h1
            className="c-banner-title"
            style={{
              fontFamily: "var(--heading-font-family)",
              fontSize: "clamp(3.2rem,8.5vw,7.5rem)",
              fontWeight: 300,
              lineHeight: 0.93,
              letterSpacing: "-0.02em",
              color: "#0f172a",
              marginBottom: 32,
              ...fade(bannerVisible, 0.1),
            }}
          >
            Begin Your
            <br />
            <span style={{ fontStyle: "italic", color: "#7da8c7" }}>
              Bespoke
            </span>
            <br />
            Journey.
          </h1>

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 48,
              flexWrap: "wrap",
              ...fade(bannerVisible, 0.28),
            }}
          >
            <p
              style={{
                fontFamily: "var(--heading-font-family)",
                fontSize: "clamp(1rem,1.4vw,1.15rem)",
                fontStyle: "italic",
                fontWeight: 300,
                color: "rgba(100,116,139,0.75)",
                lineHeight: 1.8,
                maxWidth: 480,
                margin: 0,
              }}
            >
              Visit our Lajpat Nagar atelier for a one-on-one styling
              consultation with our master craftsmen — or reach us instantly on
              WhatsApp.
            </p>
          </div>

          {/* Banner detail strip */}
          <div
            style={{
              marginTop: 52,
              display: "flex",
              flexWrap: "wrap",
              gap: 0,
              borderTop: ".5px solid rgba(125,168,199,0.15)",
              paddingTop: 28,
              ...fade(bannerVisible, 0.42),
            }}
          >
            {[
              { k: "Address", v: "E-39, Lajpat Nagar II, New Delhi" },
              { k: "Hours", v: "Mon – Sat · 11AM – 8PM" },
              { k: "Phone", v: "+91 96507 53273" },
              { k: "WhatsApp", v: "Same number, instant reply" },
            ].map((item, i) => (
              <div
                key={item.k}
                style={{
                  padding: "0 32px 0 0",
                  marginRight: 32,
                  borderRight:
                    i < 3 ? ".5px solid rgba(125,168,199,0.12)" : "none",
                  marginBottom: 16,
                }}
              >
                <p
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: 9,
                    letterSpacing: "0.32em",
                    textTransform: "uppercase",
                    color: "rgba(125,168,199,0.55)",
                    marginBottom: 5,
                  }}
                >
                  {item.k}
                </p>
                <p
                  style={{
                    fontFamily: "var(--heading-font-family)",
                    fontSize: "1rem",
                    fontWeight: 400,
                    color: "#0f172a",
                    letterSpacing: "0.02em",
                  }}
                >
                  {item.v}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          MARQUEE
      ═══════════════════════════════════════════ */}
      <div
        style={{
          background: "#7da8c7",
          overflow: "hidden",
          padding: "12px 0",
          whiteSpace: "nowrap",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            gap: 28,
            transform: `translateX(${marqueeX}px)`,
            willChange: "transform",
          }}
        >
          {[
            ...MARQUEE_WORDS,
            ...MARQUEE_WORDS,
            ...MARQUEE_WORDS,
            ...MARQUEE_WORDS,
          ].map((w, i) => (
            <span
              key={i}
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: "#ffffff",
              }}
            >
              {w}
            </span>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          02 — INFO + FORM
      ═══════════════════════════════════════════ */}
      <section style={{ background: "#fafbfc", padding: "100px 0" }}>
        <div
          className="c-two-col"
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 clamp(24px,6vw,80px)",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 60,
            alignItems: "start",
          }}
        >
          {/* ── Left: Info ── */}
          <div ref={infoSectionRef} style={{ ...fade(infoVisible, 0, "left") }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 28,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 1,
                  background:
                    "linear-gradient(to right, rgba(125,168,199,.6), transparent)",
                }}
              />
              <p
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: 10,
                  letterSpacing: "0.42em",
                  textTransform: "uppercase",
                  color: "#7da8c7",
                }}
              >
                Atelier Details
              </p>
            </div>

            <h2
              style={{
                fontFamily: "var(--heading-font-family)",
                fontSize: "clamp(1.9rem,3.5vw,2.8rem)",
                fontWeight: 300,
                color: "#0f172a",
                lineHeight: 1.08,
                marginBottom: 18,
              }}
            >
              Visit Our{" "}
              <span style={{ fontStyle: "italic", color: "#7da8c7" }}>
                Atelier
              </span>
            </h2>

            <p
              style={{
                fontFamily: "var(--heading-font-family)",
                fontSize: "1.05rem",
                fontWeight: 300,
                lineHeight: 1.9,
                color: "rgba(100,116,139,0.85)",
                marginBottom: 36,
              }}
            >
              Experience a one-on-one styling consultation with our master
              craftsmen. From sherwani and suiting to shirts and formalwear,
              every detail is tailored to your personality and occasion.
            </p>

            {/* Detail grid */}
            <div
              className="c-detail-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginBottom: 36,
              }}
            >
              {DETAILS.map((d) => (
                <div key={d.label} className="dc">
                  <p
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: 9,
                      letterSpacing: "0.28em",
                      textTransform: "uppercase",
                      color: "rgba(125,168,199,0.7)",
                      marginBottom: 7,
                    }}
                  >
                    {d.label}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--heading-font-family)",
                      fontSize: "1.05rem",
                      fontWeight: 400,
                      color: "#0f172a",
                      lineHeight: 1.35,
                    }}
                  >
                    {d.value}
                  </p>
                </div>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <div style={{ marginBottom: 36 }}>
              <a
                href="https://wa.me/919650753273?text=Hi%20ZENmen%2C%20I'd%20like%20to%20book%20a%20consultation."
                target="_blank"
                rel="noopener noreferrer"
                className="wa-btn"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Book on WhatsApp
              </a>
            </div>

            {/* Tags */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[
                "Bespoke Suits",
                "Sherwanis",
                "Custom Shirts",
                "Indo-Western",
                "Groomwear",
                "Alterations",
              ].map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: 9,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "rgba(125,168,199,.6)",
                    border: ".5px solid rgba(125,168,199,.18)",
                    padding: "5px 12px",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* ── Right: Form ── */}
          <div
            ref={formSectionRef}
            style={{ ...fade(formVisible, 0.15, "right") }}
          >
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                padding: "clamp(24px,4vw,40px)",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 4px 24px rgba(15,23,42,0.06)",
                borderRadius: 4,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background:
                    "linear-gradient(to right, transparent, #7da8c7 40%, #7da8c7 60%, transparent)",
                  opacity: 0.85,
                }}
              />

              <div style={{ marginBottom: 28 }}>
                <p
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: 10,
                    letterSpacing: "0.42em",
                    textTransform: "uppercase",
                    color: "#7da8c7",
                    marginBottom: 10,
                  }}
                >
                  Reserve Your Fitting
                </p>
                <h3
                  style={{
                    fontFamily: "var(--heading-font-family)",
                    fontSize: "clamp(1.6rem,3vw,2.1rem)",
                    fontWeight: 300,
                    color: "#0f172a",
                    lineHeight: 1.1,
                  }}
                >
                  Tell Us About{" "}
                  <span style={{ fontStyle: "italic", color: "#7da8c7" }}>
                    Your Vision
                  </span>
                </h3>
                <p
                  style={{
                    fontFamily: "var(--heading-font-family)",
                    fontSize: ".95rem",
                    fontStyle: "italic",
                    color: "rgba(100,116,139,.6)",
                    marginTop: 8,
                    lineHeight: 1.6,
                  }}
                >
                  Share your occasion, timeline, and preferred style — we'll
                  handle the rest.
                </p>
              </div>

              {/* Success state */}
              {status === "success" && (
                <div
                  style={{
                    background: "rgba(76,174,114,0.1)",
                    border: ".5px solid rgba(76,174,114,0.4)",
                    padding: "20px 24px",
                    marginBottom: 24,
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--heading-font-family)",
                      fontSize: "1.2rem",
                      fontWeight: 300,
                      color: "#4cae72",
                      marginBottom: 6,
                    }}
                  >
                    Message Received
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--heading-font-family)",
                      fontSize: ".95rem",
                      color: "rgba(100,116,139,.7)",
                      fontStyle: "italic",
                    }}
                  >
                    We'll be in touch within 24 hours. For urgent enquiries,
                    WhatsApp us directly.
                  </p>
                </div>
              )}

              {/* Error state */}
              {status === "error" && (
                <div
                  style={{
                    background: "rgba(224,82,82,0.1)",
                    border: ".5px solid rgba(224,82,82,0.35)",
                    padding: "14px 18px",
                    marginBottom: 20,
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: 12,
                      color: "rgba(224,82,82,.9)",
                    }}
                  >
                    Something went wrong. Please try WhatsApp for immediate
                    assistance.
                  </p>
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                noValidate
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {/* Name */}
                <div>
                  <label
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: 9,
                      letterSpacing: "0.3em",
                      textTransform: "uppercase",
                      color: "rgba(125,168,199,.6)",
                      display: "block",
                      marginBottom: 7,
                    }}
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    onBlur={() => handleBlur("name")}
                    onFocus={() => setFocused("name")}
                    placeholder="Your full name"
                    className="c-input"
                    style={inputStyle("name")}
                    autoComplete="name"
                  />
                  {touched.name && errors.name && (
                    <span className="err">{errors.name}</span>
                  )}
                </div>

                {/* Email + Phone row */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: 9,
                        letterSpacing: "0.3em",
                        textTransform: "uppercase",
                        color: "rgba(125,168,199,.6)",
                        display: "block",
                        marginBottom: 7,
                      }}
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                      onFocus={() => setFocused("email")}
                      placeholder="your@email.com"
                      className="c-input"
                      style={inputStyle("email")}
                      autoComplete="email"
                    />
                    {touched.email && errors.email && (
                      <span className="err">{errors.email}</span>
                    )}
                  </div>
                  <div>
                    <label
                      style={{
                        fontFamily: "'Jost', sans-serif",
                        fontSize: 9,
                        letterSpacing: "0.3em",
                        textTransform: "uppercase",
                        color: "rgba(125,168,199,.6)",
                        display: "block",
                        marginBottom: 7,
                      }}
                    >
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      onBlur={() => handleBlur("phone")}
                      onFocus={() => setFocused("phone")}
                      placeholder="+91 XXXXX XXXXX"
                      className="c-input"
                      style={inputStyle("phone")}
                      autoComplete="tel"
                    />
                    {touched.phone && errors.phone && (
                      <span className="err">{errors.phone}</span>
                    )}
                  </div>
                </div>

                {/* Occasion select */}
                <div>
                  <label
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: 9,
                      letterSpacing: "0.3em",
                      textTransform: "uppercase",
                      color: "rgba(125,168,199,.6)",
                      display: "block",
                      marginBottom: 7,
                    }}
                  >
                    Occasion
                  </label>
                  <div style={{ position: "relative" }}>
                    <select
                      value={formData.occasion}
                      onChange={(e) => handleChange("occasion", e.target.value)}
                      onFocus={() => setFocused("occasion")}
                      onBlur={() => setFocused(null)}
                      className="c-select"
                      style={{
                        ...inputStyle("occasion"),
                        paddingRight: 40,
                        color: formData.occasion
                          ? "#0f172a"
                          : "#94a3b8",
                      }}
                    >
                      {OCCASIONS.map((o) => (
                        <option key={o} value={o} style={{ color: "#0f172a" }}>
                          {o || "Select occasion (optional)"}
                        </option>
                      ))}
                    </select>
                    {/* Chevron */}
                    <div
                      style={{
                        position: "absolute",
                        right: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                        color: "rgba(125,168,199,.5)",
                      }}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <polyline points="2 4 6 8 10 4" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: 9,
                      letterSpacing: "0.3em",
                      textTransform: "uppercase",
                      color: "rgba(125,168,199,.6)",
                      display: "block",
                      marginBottom: 7,
                    }}
                  >
                    Message *
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    onBlur={() => handleBlur("message")}
                    onFocus={() => setFocused("message")}
                    placeholder="Tell us your occasion, timeline, preferred style, and any specific requirements…"
                    className="c-input c-textarea"
                    style={{
                      ...inputStyle("message"),
                      resize: "vertical",
                      minHeight: 120,
                    }}
                  />
                  {touched.message && errors.message && (
                    <span className="err">{errors.message}</span>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="c-submit"
                  disabled={status === "loading"}
                  style={{ marginTop: 4 }}
                >
                  {status === "loading" ? (
                    <>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{ animation: "spin 1s linear infinite" }}
                      >
                        <path d="M21 12a9 9 0 11-6.219-8.56" />
                      </svg>
                      Sending…
                    </>
                  ) : (
                    "Send Enquiry →"
                  )}
                </button>

                <p
                  style={{
                    fontFamily: "var(--heading-font-family)",
                    fontSize: ".85rem",
                    fontStyle: "italic",
                    color: "rgba(125,168,199,.4)",
                    textAlign: "center",
                    lineHeight: 1.6,
                  }}
                >
                  We respond within 24 hours. For immediate assistance, message
                  us on WhatsApp.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      <div className="cgr" />

      {/* ═══════════════════════════════════════════
          03 — CHANNELS
      ═══════════════════════════════════════════ */}
      <section
        ref={channelsSectionRef}
        style={{ background: "#f8fafc", padding: "80px 0" }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 clamp(24px,6vw,80px)",
          }}
        >
          <div style={{ marginBottom: 48, ...fade(channelsVisible, 0) }}>
            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: 10,
                letterSpacing: "0.42em",
                textTransform: "uppercase",
                color: "#7da8c7",
                marginBottom: 14,
              }}
            >
              Reach Us
            </p>
            <h2
              style={{
                fontFamily: "var(--heading-font-family)",
                fontSize: "clamp(1.8rem,3vw,2.6rem)",
                fontWeight: 300,
                color: "#0f172a",
                lineHeight: 1.1,
              }}
            >
              Every Way to{" "}
              <span style={{ fontStyle: "italic", color: "#7da8c7" }}>
                Connect
              </span>
            </h2>
          </div>
          <div
            className="c-four-col"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 14,
            }}
          >
            {CHANNELS.map((ch, i) => (
              <a
                key={ch.label}
                href={ch.href}
                target="_blank"
                rel="noopener noreferrer"
                className="ch-card"
                style={{ ...fade(channelsVisible, i * 0.09) }}
              >
                <div className="ch-icon">{ch.icon}</div>
                <div>
                  <p
                    style={{
                      fontFamily: "'Jost', sans-serif",
                      fontSize: 9,
                      letterSpacing: "0.3em",
                      textTransform: "uppercase",
                      color: "rgba(125,168,199,.55)",
                      marginBottom: 6,
                    }}
                  >
                    {ch.label}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--heading-font-family)",
                      fontSize: "1.1rem",
                      fontWeight: 300,
                      color: "#0f172a",
                      lineHeight: 1.3,
                    }}
                  >
                    {ch.value}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--heading-font-family)",
                      fontSize: ".9rem",
                      color: "rgba(100,116,139,.55)",
                      marginTop: 4,
                      fontStyle: "italic",
                    }}
                  >
                    {ch.sub}
                  </p>
                </div>
                <span className="ch-cta">{ch.cta}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <div className="cgr" />

      {/* ═══════════════════════════════════════════
          04 — MAP
      ═══════════════════════════════════════════ */}
      <section
        ref={mapSectionRef}
        style={{ background: "#fafbfc", padding: "80px 0 0" }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 clamp(24px,6vw,80px)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 20,
              marginBottom: 32,
              ...fade(mapVisible, 0),
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: 10,
                  letterSpacing: "0.42em",
                  textTransform: "uppercase",
                  color: "#7da8c7",
                  marginBottom: 12,
                }}
              >
                Find Us
              </p>
              <h2
                style={{
                  fontFamily: "var(--heading-font-family)",
                  fontSize: "clamp(1.8rem,3vw,2.6rem)",
                  fontWeight: 300,
                  color: "#0f172a",
                  lineHeight: 1.1,
                }}
              >
                Our{" "}
                <span style={{ fontStyle: "italic", color: "#7da8c7" }}>
                  Atelier
                </span>
              </h2>
            </div>
            <a
              href="https://maps.google.com/?q=E-39+Lajpat+Nagar+2+New+Delhi"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                fontFamily: "'Jost', sans-serif",
                fontSize: 10,
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: "#0f172a",
                border: "1px solid #e2e8f0",
                padding: "12px 24px",
                textDecoration: "none",
                transition: "all .3s",
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#0f172a";
                (e.currentTarget as HTMLElement).style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "transparent";
                (e.currentTarget as HTMLElement).style.color = "#0f172a";
              }}
            >
              Get Directions →
            </a>
          </div>

          {/* Map */}
          <div style={{ ...fade(mapVisible, 0.1) }}>
            <div className="map-wrap">
              <iframe
                title="ZENmen Atelier Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.2244975565!2d77.23456!3d28.56789!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce26d3b4e42f5%3A0x8f0a5e82e1a8b7c3!2sLajpat%20Nagar%20II%2C%20New%20Delhi%2C%20Delhi%20110024!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              {/* Badge overlay */}
              <div className="map-overlay-badge">
                <p
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: 9,
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                    color: "rgba(125,168,199,.7)",
                    marginBottom: 5,
                  }}
                >
                  ZENmen Atelier
                </p>
                <p
                  style={{
                    fontFamily: "var(--heading-font-family)",
                    fontSize: "1.05rem",
                    fontWeight: 300,
                    color: "#0f172a",
                    lineHeight: 1.4,
                  }}
                >
                  E-39, Lajpat Nagar II
                </p>
                <p
                  style={{
                    fontFamily: "var(--heading-font-family)",
                    fontSize: ".9rem",
                    fontStyle: "italic",
                    color: "rgba(100,116,139,.6)",
                    marginTop: 2,
                  }}
                >
                  New Delhi – 110024
                </p>
              </div>
            </div>
          </div>

          {/* Below map info strip */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 0,
              padding: "28px 0",
              borderTop: "1px solid #e2e8f0",
              marginTop: 0,
              ...fade(mapVisible, 0.2),
            }}
          >
            {[
              { icon: "🕐", label: "Mon – Sat · 11AM – 8PM" },
              { icon: "📍", label: "E-39, Lajpat Nagar II, New Delhi" },
              {
                icon: "🚇",
                label: "Nearest Metro: Lajpat Nagar (Violet Line)",
              },
              { icon: "🅿️", label: "Parking available nearby" },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  paddingRight: 32,
                  marginRight: 32,
                  borderRight:
                    i < 3 ? ".5px solid rgba(125,168,199,.1)" : "none",
                  marginBottom: 12,
                }}
              >
                <span style={{ fontSize: 14 }}>{item.icon}</span>
                <p
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: 11,
                    letterSpacing: "0.08em",
                    color: "rgba(100,116,139,.65)",
                  }}
                >
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          05 — FINAL CTA STRIP
      ═══════════════════════════════════════════ */}
      <section
        style={{
          background: "#f8fafc",
          padding: "80px clamp(24px,6vw,80px)",
          borderTop: "1px solid #e2e8f0",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <p
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: 10,
              letterSpacing: "0.42em",
              textTransform: "uppercase",
              color: "#7da8c7",
              marginBottom: 18,
            }}
          >
            Start Today
          </p>
          <h2
            style={{
              fontFamily: "var(--heading-font-family)",
              fontSize: "clamp(2rem,4.5vw,3.2rem)",
              fontWeight: 300,
              lineHeight: 1.05,
              color: "#0f172a",
              marginBottom: 18,
            }}
          >
            Your Garment Awaits.
            <br />
            <span style={{ fontStyle: "italic", color: "#7da8c7" }}>
              Let's Begin.
            </span>
          </h2>
          <p
            style={{
              fontFamily: "var(--heading-font-family)",
              fontSize: "1.05rem",
              fontStyle: "italic",
              fontWeight: 300,
              color: "rgba(100,116,139,.65)",
              lineHeight: 1.8,
              marginBottom: 40,
            }}
          >
            Walk in or book your appointment. Every great garment begins with a
            single conversation.
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <a
              href="https://wa.me/919650753273?text=Hi%20ZENmen%2C%20I'd%20like%20to%20book%20a%20consultation."
              target="_blank"
              rel="noopener noreferrer"
              className="wa-btn"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp Us
            </a>
            <a
              href="tel:+919650753273"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                fontFamily: "'Jost', sans-serif",
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: "#0f172a",
                border: "1px solid #e2e8f0",
                padding: "14px 28px",
                textDecoration: "none",
                transition: "all .3s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#0f172a";
                (e.currentTarget as HTMLElement).style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "transparent";
                (e.currentTarget as HTMLElement).style.color = "#0f172a";
              }}
            >
              Call +91 96507 53273
            </a>
          </div>
        </div>
      </section>

      {/* Spin keyframe for loading spinner */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
