"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const STATS = [
  { value: "53K+", label: "Instagram Community" },
  { value: "2021", label: "Year Founded" },
  { value: "100%", label: "Custom Tailored" },
  { value: "∞", label: "Worldwide Delivery" },
];

const PHILOSOPHY_LINES = [
  "Tailored for the Modern Man.",
  "Rooted in Craft. Refined in Detail.",
  "Where Tradition Meets Couture.",
];

export default function FounderSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [activePhil, setActivePhil] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const id = setInterval(
      () => setActivePhil((p) => (p + 1) % PHILOSOPHY_LINES.length),
      3200,
    );
    return () => clearInterval(id);
  }, []);

  const fadeUp = (delay = 0, extra = {}): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(20px)",
    transition: `opacity 0.8s ease ${delay}s, transform 0.8s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
    ...extra,
  });

  return (
    <>
      <style>{`
        @keyframes philFade {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lineGrow {
          from { width: 0; }
          to   { width: 64px; }
        }
        .founder-cta-primary:hover { background: #d4ba82 !important; }
        .founder-cta-secondary:hover { color: #c8a96e !important; }
      `}</style>

      <section
        ref={sectionRef}
        style={{
          position: "relative",
          width: "100%",
          background: "#030813",
          padding: "96px 0 80px",
          overflow: "hidden",
        }}
      >
        {/* ── Ambient glows ── */}
        <div
          style={{
            pointerEvents: "none",
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 65% 55% at 18% 52%, rgba(200,169,110,0.10) 0%, transparent 65%)",
          }}
        />
        <div
          style={{
            pointerEvents: "none",
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 38% 38% at 88% 18%, rgba(200,169,110,0.06) 0%, transparent 60%)",
          }}
        />

        {/* ── Top / bottom rules ── */}
        <div
          style={{
            pointerEvents: "none",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background:
              "linear-gradient(to right, transparent, rgba(200,169,110,0.28) 50%, transparent)",
          }}
        />
        <div
          style={{
            pointerEvents: "none",
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "1px",
            background:
              "linear-gradient(to right, transparent, rgba(200,169,110,0.28) 50%, transparent)",
          }}
        />

        {/* ── Ghost watermark ── */}
        <div
          aria-hidden
          style={{
            pointerEvents: "none",
            userSelect: "none",
            position: "absolute",
            right: "-4vw",
            top: "50%",
            transform: "translateY(-50%)",
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(6rem, 18vw, 16rem)",
            fontWeight: 300,
            letterSpacing: "-0.04em",
            color: "transparent",
            WebkitTextStroke: "0.5px rgba(200,169,110,0.065)",
            lineHeight: 1,
            whiteSpace: "nowrap",
            zIndex: 0,
          }}
        >
          ZENMEN
        </div>

        {/* ── Content wrapper ── */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 clamp(24px, 5vw, 72px)",
          }}
        >
          {/* ── Eyebrow ── */}
          <div
            style={{
              ...fadeUp(0),
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <span
              style={{
                display: "block",
                height: "1px",
                width: "32px",
                background:
                  "linear-gradient(to right, transparent, rgba(200,169,110,0.7))",
              }}
            />
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "10px",
                fontWeight: 300,
                letterSpacing: "0.44em",
                textTransform: "uppercase",
                color: "#c8a96e",
                margin: 0,
              }}
            >
              The Visionary Behind
            </p>
          </div>

          {/* ── Main two-column grid ── */}
          <div
            style={{
              marginTop: "48px",
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "56px",
            }}
            className="founder-grid"
          >
            {/* ── LEFT column ── */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "40px" }}
            >
              {/* Heading */}
              <div style={fadeUp(0.1)}>
                <h2
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
                    fontWeight: 300,
                    lineHeight: 1.06,
                    letterSpacing: "-0.02em",
                    color: "#f7f2e8",
                    margin: 0,
                  }}
                >
                  The Man Who
                  <br />
                  <span
                    style={{
                      fontStyle: "italic",
                      color: "transparent",
                      WebkitTextStroke: "1px #c8a96e",
                    }}
                  >
                    Redefined
                  </span>
                  <br />
                  Men's Couture
                </h2>

                {/* Animated accent line + location */}
                <div
                  style={{
                    marginTop: "28px",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    ...fadeUp(0.25),
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      height: "1px",
                      width: visible ? "64px" : "0px",
                      background:
                        "linear-gradient(to right, #c8a96e, transparent)",
                      transition: "width 1s cubic-bezier(0.22,1,0.36,1) 0.4s",
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "12px",
                      letterSpacing: "0.34em",
                      textTransform: "uppercase",
                      color: "rgba(200,169,110,0.9)",
                    }}
                  >
                    Est. Lajpat Nagar, Delhi
                  </span>
                </div>
              </div>

              {/* Bio */}
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.05rem",
                  fontWeight: 300,
                  lineHeight: 1.9,
                  color: "#c5bfb0",
                  margin: 0,
                  maxWidth: "520px",
                  ...fadeUp(0.3),
                }}
              >
                Born from a deep reverence for Indian craft and a relentless
                desire to push menswear beyond convention,{" "}
                <strong style={{ fontWeight: 500, color: "#f0ead8" }}>
                  ZENMEN
                </strong>{" "}
                was forged in the heart of Delhi's Lajpat Nagar — not in a
                boardroom, but at a workbench. Every stitch carries the weight
                of obsessive precision; every silhouette, a statement that the
                modern Indian man deserves couture that is both rooted and
                fearless.
              </p>

              {/* Rotating philosophy */}
              <div style={{ ...fadeUp(0.42), overflow: "hidden" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      flexShrink: 0,
                      width: "11px",
                      height: "11px",
                      marginTop: "4px",
                      border: "0.8px solid rgba(200,169,110,0.5)",
                      transform: "rotate(45deg)",
                    }}
                  />
                  <p
                    key={activePhil}
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "1rem",
                      fontStyle: "italic",
                      fontWeight: 300,
                      letterSpacing: "0.01em",
                      color: "#c8a96e",
                      margin: 0,
                      animation: "philFade 0.6s ease both",
                    }}
                  >
                    {PHILOSOPHY_LINES[activePhil]}
                  </p>
                </div>
              </div>

              {/* ── Stats ── */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "28px 24px",
                  ...fadeUp(0.52),
                }}
                className="founder-stats"
              >
                {STATS.map((s) => (
                  <div key={s.label}>
                    <span
                      style={{
                        display: "block",
                        height: "1px",
                        width: "24px",
                        marginBottom: "10px",
                        background:
                          "linear-gradient(to right, #c8a96e, transparent)",
                      }}
                    />
                    <p
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "1.6rem",
                        fontWeight: 300,
                        letterSpacing: "-0.01em",
                        color: "#f7f2e8",
                        margin: 0,
                      }}
                    >
                      {s.value}
                    </p>
                    <p
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "9px",
                        letterSpacing: "0.3em",
                        textTransform: "uppercase",
                        color: "rgba(200,169,110,0.9)",
                        margin: "6px 0 0",
                      }}
                    >
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* ── CTAs ── */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: "24px",
                  ...fadeUp(0.62),
                }}
              >
                <a
                  href="https://www.instagram.com/_zenmen/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="founder-cta-primary"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "14px 28px",
                    background: "#c8a96e",
                    borderRadius: "1px",
                    textDecoration: "none",
                    transition: "background 0.3s ease",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "11px",
                      fontWeight: 600,
                      letterSpacing: "0.32em",
                      textTransform: "uppercase",
                      color: "#030813",
                    }}
                  >
                    Follow Our Journey
                  </span>
                  <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
                    <path
                      d="M0 4h11M8 1.5l3 2.5-3 2.5"
                      stroke="#030813"
                      strokeWidth="0.9"
                    />
                  </svg>
                </a>

                <a
                  href="https://wa.me/919650753273"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="founder-cta-secondary"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    textDecoration: "none",
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "11px",
                    letterSpacing: "0.32em",
                    textTransform: "uppercase",
                    color: "rgba(200,169,110,0.5)",
                    transition: "color 0.3s ease",
                  }}
                >
                  Book a Consultation
                  <svg width="16" height="1" viewBox="0 0 16 1">
                    <line
                      x1="0"
                      y1="0.5"
                      x2="16"
                      y2="0.5"
                      stroke="currentColor"
                      strokeWidth="0.8"
                    />
                  </svg>
                </a>
              </div>
            </div>

            {/* ── RIGHT: Portrait card ── */}
            <div
              style={{
                position: "relative",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateX(0)" : "translateX(32px)",
                transition:
                  "opacity 0.9s ease 0.18s, transform 0.9s cubic-bezier(0.22,1,0.36,1) 0.18s",
              }}
              className="founder-portrait-col"
            >
              {/* Offset decorative border */}
              <div
                style={{
                  position: "absolute",
                  top: "-10px",
                  right: "-10px",
                  bottom: "10px",
                  left: "10px",
                  border: "0.5px solid rgba(200,169,110,0.18)",
                  borderRadius: "2px",
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />

              {/* Card */}
              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  borderRadius: "2px",
                  overflow: "hidden",
                  aspectRatio: "3/4",
                  background:
                    "linear-gradient(160deg, #0d1322 0%, #060810 100%)",
                  boxShadow:
                    "0 32px 80px rgba(0,0,0,0.65), 0 0 0 0.5px rgba(200,169,110,0.2)",
                }}
              >
                {/* ─ Placeholder ─ Replace with Next.js <Image> ─ */}
                <Image
                  src="/zenmen_founder_hero.jpeg" // ← your image path in /public
                  alt="Founder of ZENMEN"
                  fill
                  style={{ objectFit: "cover", objectPosition: "center top" }}
                  priority
                />

                {/* Top vignette */}
                <div
                  style={{
                    pointerEvents: "none",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "120px",
                    background:
                      "linear-gradient(to bottom, rgba(3,8,19,0.55), transparent)",
                  }}
                />

                {/* Bottom info panel */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: "56px 24px 24px",
                    background:
                      "linear-gradient(to top, rgba(3,8,19,0.97) 55%, transparent 100%)",
                  }}
                >
                  {/* Name */}
                  <p
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "1.5rem",
                      fontWeight: 300,
                      letterSpacing: "0.005em",
                      color: "#f8f4ec",
                      margin: 0,
                    }}
                  >
                    [Anurag]
                  </p>

                  {/* Title */}
                  <div
                    style={{
                      marginTop: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <span
                      style={{
                        display: "block",
                        height: "1px",
                        width: "20px",
                        background: "rgba(200,169,110,0.45)",
                      }}
                    />
                    <p
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "10px",
                        letterSpacing: "0.3em",
                        textTransform: "uppercase",
                        color: "rgba(200,169,110,0.7)",
                        margin: 0,
                      }}
                    >
                      Founder & Creative Director
                    </p>
                  </div>

                  {/* Quote */}
                  <blockquote
                    style={{
                      marginTop: "20px",
                      marginBottom: 0,
                      paddingLeft: "14px",
                      borderLeft: "0.8px solid rgba(200,169,110,0.28)",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "0.95rem",
                        fontStyle: "italic",
                        fontWeight: 300,
                        lineHeight: 1.7,
                        color: "#c5bfb0",
                        margin: 0,
                      }}
                    >
                      "Elegance isn't about being noticed — it's about being
                      remembered."
                    </p>
                  </blockquote>

                  {/* Address chip */}
                  <div
                    style={{
                      marginTop: "20px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "6px 12px",
                      border: "0.5px solid rgba(200,169,110,0.22)",
                      background: "rgba(200,169,110,0.04)",
                      borderRadius: "1px",
                    }}
                  >
                    <svg width="8" height="10" viewBox="0 0 8 10" fill="none">
                      <circle
                        cx="4"
                        cy="3.5"
                        r="2"
                        stroke="#c8a96e"
                        strokeWidth="0.8"
                      />
                      <path
                        d="M4 5.5C2.5 7 1 8.2 1 9h6c0-.8-1.5-2-3-3.5z"
                        stroke="#c8a96e"
                        strokeWidth="0.8"
                      />
                    </svg>
                    <p
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "11px",
                        letterSpacing: "0.28em",
                        textTransform: "uppercase",
                        color: "rgba(200,169,110,0.9)",
                        margin: 0,
                      }}
                    >
                      E-39, Lajpat Nagar II, New Delhi
                    </p>
                  </div>
                </div>

                {/* Corner brackets */}
                <span
                  style={{
                    pointerEvents: "none",
                    position: "absolute",
                    left: 12,
                    top: 12,
                    width: 16,
                    height: 16,
                    borderLeft: "0.8px solid rgba(200,169,110,0.5)",
                    borderTop: "0.8px solid rgba(200,169,110,0.5)",
                  }}
                />
                <span
                  style={{
                    pointerEvents: "none",
                    position: "absolute",
                    right: 12,
                    top: 12,
                    width: 16,
                    height: 16,
                    borderRight: "0.8px solid rgba(200,169,110,0.5)",
                    borderTop: "0.8px solid rgba(200,169,110,0.5)",
                  }}
                />
              </div>

              {/* Instagram floating badge */}
              <a
                href="https://www.instagram.com/_zenmen/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  position: "absolute",
                  right: "-18px",
                  top: "32px",
                  zIndex: 20,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                  padding: "12px 10px",
                  background: "rgba(3,8,19,0.92)",
                  border: "0.5px solid rgba(200,169,110,0.28)",
                  borderRadius: "2px",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 8px 28px rgba(0,0,0,0.45)",
                  textDecoration: "none",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect
                    x="2"
                    y="2"
                    width="20"
                    height="20"
                    rx="5"
                    stroke="#c8a96e"
                    strokeWidth="1.2"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="5"
                    stroke="#c8a96e"
                    strokeWidth="1.2"
                  />
                  <circle cx="17.5" cy="6.5" r="1" fill="#c8a96e" />
                </svg>
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "8px",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "rgba(200,169,110,0.7)",
                    margin: 0,
                  }}
                >
                  53K
                </p>
              </a>
            </div>
          </div>

          {/* ── Craft tags strip ── */}
          <div
            style={{
              marginTop: "72px",
              paddingTop: "28px",
              borderTop: "0.5px solid rgba(200,169,110,0.1)",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "0",
              rowGap: "12px",
              ...fadeUp(0.72),
            }}
          >
            {[
              "Ethnic Couture",
              "Bespoke Tailoring",
              "Indo-Western",
              "Custom Fits",
              "Groomwear",
              "Designer Sherwani",
              "Jodhpuri Suits",
            ].map((tag, i) => (
              <span
                key={tag}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0",
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "10px",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "rgba(200,169,110,0.9)",
                  whiteSpace: "nowrap",
                }}
              >
                {i > 0 && (
                  <span
                    style={{
                      display: "inline-block",
                      width: "3px",
                      height: "3px",
                      borderRadius: "50%",
                      background: "rgba(200,169,110,0.9)",
                      margin: "0 20px",
                      verticalAlign: "middle",
                      flexShrink: 0,
                    }}
                  />
                )}
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* ── Responsive layout styles ── */}
        <style>{`
          @media (min-width: 1024px) {
            .founder-grid {
              grid-template-columns: 1fr 420px !important;
              gap: 80px !important;
            }
            .founder-portrait-col {
              display: block !important;
            }
          }
          @media (min-width: 1280px) {
            .founder-grid {
              grid-template-columns: 1fr 460px !important;
            }
          }
          @media (min-width: 640px) {
            .founder-stats {
              grid-template-columns: repeat(4, 1fr) !important;
            }
          }
          @media (max-width: 1023px) {
            .founder-portrait-col {
              max-width: 400px;
              margin: 0 auto;
              width: 100%;
            }
          }
          @keyframes philFade {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .founder-cta-primary { transition: background 0.3s ease !important; }
          .founder-cta-primary:hover { background: #d4ba82 !important; }
          .founder-cta-secondary { transition: color 0.3s ease !important; }
          .founder-cta-secondary:hover { color: #c8a96e !important; }
        `}</style>
      </section>
    </>
  );
}
