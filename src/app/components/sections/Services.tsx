"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState } from "react";

/* ─── Font Import ─────────────────────────────────────────── */
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@200;300;400&display=swap');`;

/* ─── Types ─────────────────────────────────────────────────── */
interface Service {
  number: string;
  name: string;
  description: string;
  price: string;
  image: string;
  tag: string;
  accent: string;
}

/* ─── Data ──────────────────────────────────────────────────── */
const services: Service[] = [
  {
    number: "01",
    name: "Bespoke Suits",
    description:
      "Full canvas construction, over 30 measurements, and multiple fittings ensure a suit that is uniquely yours — from single to double-breasted.",
    price: "Starting from ₹18,000",
    image: "/black_tuxedo.jpeg",
    tag: "Signature",
    accent: "#C8A96E",
  },
  {
    number: "02",
    name: "Custom Shirts",
    description:
      "Egyptian cotton, Italian poplin, or Oxford weaves — crafted with your preferred collar, cuffs, and fit for every occasion.",
    price: "Starting from ₹2,500",
    image: "/red_shirt.jpeg",
    tag: "Essential",
    accent: "#a8c4d4",
  },
  {
    number: "03",
    name: "Tailored Trousers",
    description:
      "Slim, regular, or wide leg — crafted with precision pleating and hand-stitched hems to complement every suit or shirt.",
    price: "Starting from ₹4,500",
    image:
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=900&q=85&fit=crop",
    tag: "Classic",
    accent: "#b8a898",
  },
  {
    number: "04",
    name: "Alterations",
    description:
      "Transform off-the-rack into perfectly fitted. Our skilled tailors handle everything from hemming to full jacket reconstruction.",
    price: "Starting from ₹500",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=85&fit=crop",
    tag: "Precision",
    accent: "#c4b090",
  },
  {
    number: "05",
    name: "Wedding Collection",
    description:
      "From sherwani-inspired suits to classic three-piece ensembles — make your special day unforgettable with a garment crafted just for you.",
    price: "Starting from ₹25,000",
    image:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900&q=85&fit=crop",
    tag: "Exclusive",
    accent: "#d4b896",
  },
  {
    number: "06",
    name: "Corporate Wardrobe",
    description:
      "Dress codes curated, bulk orders accommodated, and consistent quality guaranteed for businesses who mean business.",
    price: "Custom Pricing",
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&q=85&fit=crop",
    tag: "Premium",
    accent: "#9ab0c0",
  },
];

/* ─── 3-D Magnetic Tilt Hook ────────────────────────────────── */
function useMagneticTilt(strength = 7) {
  const ref = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 180, damping: 22 });
  const y = useSpring(rawY, { stiffness: 180, damping: 22 });
  const rotateY = useTransform(x, [-1, 1], [-strength, strength]);
  const rotateX = useTransform(y, [-1, 1], [strength, -strength]);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    rawX.set(((e.clientX - r.left) / r.width - 0.5) * 2);
    rawY.set(((e.clientY - r.top) / r.height - 0.5) * 2);
  };
  const onLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return { ref, rotateX, rotateY, onMove, onLeave };
}

/* ─── Gold shimmer bar ──────────────────────────────────────── */
function GoldShimmer({ accent }: { accent: string }) {
  return (
    <svg
      viewBox="0 0 180 1"
      style={{ width: "100%", height: "1px", display: "block" }}
    >
      <line
        x1="0"
        y1="0.5"
        x2="180"
        y2="0.5"
        stroke={`url(#gs-${accent.replace("#", "")})`}
        strokeWidth="1"
      />
      <defs>
        <linearGradient
          id={`gs-${accent.replace("#", "")}`}
          x1="0"
          y1="0"
          x2="1"
          y2="0"
        >
          <stop offset="0%" stopColor={accent} stopOpacity="0" />
          <stop offset="50%" stopColor={accent} stopOpacity="1" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─── Service Card ──────────────────────────────────────────── */
function ServiceCard({ service, index }: { service: Service; index: number }) {
  const [hovered, setHovered] = useState(false);
  const { ref, rotateX, rotateY, onMove, onLeave } = useMagneticTilt(5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 55 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.9,
        delay: index * 0.09,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{ perspective: "1200px" }}
    >
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
          onLeave();
        }}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          aspectRatio: "3/4",
          position: "relative",
          overflow: "hidden",
          cursor: "pointer",
        }}
      >
        {/* outer glow ring */}
        <motion.div
          animate={{
            boxShadow: hovered
              ? `0 0 0 1px ${service.accent}80, 0 32px 72px -16px ${service.accent}35`
              : "0 0 0 1px rgba(255,255,255,0.05)",
          }}
          transition={{ duration: 0.5 }}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 20,
            pointerEvents: "none",
          }}
        />

        {/* ── image + gradients ── */}
        <div style={{ position: "absolute", inset: 0 }}>
          <motion.img
            src={service.image}
            alt={service.name}
            animate={{ scale: hovered ? 1.12 : 1.0 }}
            transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
          {/* persistent gradient */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(165deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.50) 50%, rgba(0,0,0,0.96) 100%)",
            }}
          />
          {/* hover color tint */}
          <motion.div
            animate={{ opacity: hovered ? 0.22 : 0 }}
            transition={{ duration: 0.6 }}
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(ellipse at 50% 90%, ${service.accent} 0%, transparent 65%)`,
            }}
          />
        </div>

        {/* ── top bar ── */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            padding: "20px",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: "10px",
              letterSpacing: "4px",
              color: "rgba(255,255,255,0.25)",
              fontWeight: 200,
            }}
          >
            {service.number}
          </span>
          <motion.span
            animate={{
              borderColor: hovered
                ? `${service.accent}BB`
                : "rgba(255,255,255,0.12)",
              color: hovered ? service.accent : "rgba(255,255,255,0.40)",
            }}
            transition={{ duration: 0.4 }}
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: "8px",
              letterSpacing: "3px",
              padding: "4px 10px",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(10px)",
              background: "rgba(0,0,0,0.35)",
              textTransform: "uppercase",
            }}
          >
            {service.tag}
          </motion.span>
        </div>

        {/* ── bottom content ── */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            padding: "24px",
          }}
        >
          {/* gold shimmer line */}
          <motion.div
            animate={{ opacity: hovered ? 1 : 0, scaleX: hovered ? 1 : 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "left", marginBottom: "14px" }}
          >
            <GoldShimmer accent={service.accent} />
          </motion.div>

          {/* title */}
          <motion.h3
            animate={{ color: hovered ? service.accent : "#F5F0E8" }}
            transition={{ duration: 0.35 }}
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(16px, 1.8vw, 21px)",
              fontWeight: 400,
              lineHeight: 1.2,
              margin: 0,
              letterSpacing: "0.01em",
            }}
          >
            {service.name}
          </motion.h3>

          {/* description */}
          <motion.div
            animate={{ height: hovered ? "auto" : 0, opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "11.5px",
                color: "rgba(210,205,195,0.75)",
                lineHeight: 1.75,
                marginTop: "10px",
                fontWeight: 300,
              }}
            >
              {service.description}
            </p>
          </motion.div>

          {/* price + cta */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "16px",
            }}
          >
            <span
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "9px",
                letterSpacing: "2px",
                color: service.accent,
                textTransform: "uppercase",
                fontWeight: 300,
              }}
            >
              {service.price}
            </span>
            <motion.span
              animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : 8 }}
              transition={{ duration: 0.3 }}
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "9px",
                letterSpacing: "2px",
                color: service.accent,
                textTransform: "uppercase",
                fontWeight: 300,
              }}
            >
              Enquire →
            </motion.span>
          </div>
        </div>

        {/* left accent sliver */}
        <motion.div
          animate={{ scaleY: hovered ? 1 : 0, opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "1.5px",
            transformOrigin: "bottom",
            zIndex: 20,
            background: `linear-gradient(to top, ${service.accent}, transparent)`,
          }}
        />
      </motion.div>
    </motion.div>
  );
}

/* ─── Hero Cinematic Panel ──────────────────────────────────── */
function HeroPanel({ service }: { service: Service }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        minHeight: "540px",
      }}
    >
      {/* image */}
      <motion.img
        src={service.image}
        alt={service.name}
        animate={{ scale: hovered ? 1.05 : 1.0 }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center 30%",
        }}
      />
      {/* side gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(105deg, rgba(8,7,5,0.97) 0%, rgba(8,7,5,0.75) 35%, rgba(8,7,5,0.20) 65%, rgba(8,7,5,0.0) 100%)",
        }}
      />
      {/* bottom fade */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(8,7,5,1) 0%, transparent 38%)",
        }}
      />

      {/* content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "clamp(32px, 5vw, 60px)",
          maxWidth: "660px",
          zIndex: 2,
        }}
      >
        {/* eyebrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginBottom: "20px",
          }}
        >
          <span
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: "8px",
              letterSpacing: "4px",
              color: service.accent,
              textTransform: "uppercase",
              fontWeight: 300,
            }}
          >
            {service.number}
          </span>
          <span
            style={{
              display: "block",
              width: "36px",
              height: "1px",
              background: `linear-gradient(to right, ${service.accent}, transparent)`,
            }}
          />
          <span
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: "8px",
              letterSpacing: "3px",
              color: "rgba(255,255,255,0.28)",
              textTransform: "uppercase",
              fontWeight: 300,
            }}
          >
            {service.tag}
          </span>
        </div>

        <h3
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(32px, 4.5vw, 58px)",
            fontWeight: 300,
            color: "#F5F0E8",
            lineHeight: 1.05,
            letterSpacing: "-0.01em",
            marginBottom: "18px",
          }}
        >
          {service.name}
        </h3>

        <p
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: "13px",
            color: "rgba(205,200,190,0.70)",
            lineHeight: 1.8,
            maxWidth: "420px",
            fontWeight: 300,
            marginBottom: "28px",
          }}
        >
          {service.description}
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          <span
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: "10px",
              letterSpacing: "2px",
              color: service.accent,
              textTransform: "uppercase",
              fontWeight: 300,
            }}
          >
            {service.price}
          </span>
          <motion.button
            animate={{
              opacity: hovered ? 1 : 0.5,
              x: hovered ? 0 : -8,
              borderColor: hovered
                ? "rgba(255,255,255,0.40)"
                : "rgba(255,255,255,0.18)",
            }}
            transition={{ duration: 0.4 }}
            style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: "9px",
              letterSpacing: "3px",
              color: "#F5F0E8",
              background: "none",
              border: "1px solid rgba(255,255,255,0.18)",
              padding: "11px 26px",
              cursor: "pointer",
              textTransform: "uppercase",
              fontWeight: 300,
            }}
          >
            Book a Fitting →
          </motion.button>
        </div>
      </div>

      {/* top-right badge */}
      <div
        style={{ position: "absolute", top: "28px", right: "28px", zIndex: 10 }}
      >
        <span
          style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: "8px",
            letterSpacing: "3px",
            padding: "6px 14px",
            border: `1px solid ${service.accent}70`,
            color: service.accent,
            backdropFilter: "blur(10px)",
            background: "rgba(0,0,0,0.40)",
            textTransform: "uppercase",
            fontWeight: 300,
          }}
        >
          {service.tag}
        </span>
      </div>

      {/* bottom accent line */}
      <motion.div
        animate={{ scaleX: hovered ? 1 : 0.15, opacity: hovered ? 1 : 0.25 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "1px",
          transformOrigin: "left",
          background: `linear-gradient(to right, ${service.accent}, transparent 55%)`,
        }}
      />
    </motion.div>
  );
}

/* ─── Section ───────────────────────────────────────────────── */
export default function Services() {
  const heroService = services[4]; // Wedding — most cinematic
  const gridServices = services.filter((_, i) => i !== 4);

  return (
    <>
      <style>{FONTS}</style>

      <section
        id="services"
        style={{
          position: "relative",
          background: "#050A18",
          overflow: "hidden",
        }}
      >
        {/* ambient radial glows */}
        <div
          style={{
            pointerEvents: "none",
            position: "absolute",
            inset: 0,
            background: `
              radial-gradient(ellipse 55% 45% at 15% 55%, rgba(200,169,110,0.045) 0%, transparent 60%),
              radial-gradient(ellipse 35% 35% at 85% 15%, rgba(200,169,110,0.028) 0%, transparent 55%)
            `,
          }}
        />

        {/* subtle dot grid */}
        <div
          style={{
            pointerEvents: "none",
            position: "absolute",
            inset: 0,
            opacity: 0.022,
            backgroundImage:
              "radial-gradient(circle, #C8A96E 1px, transparent 1px)",
            backgroundSize: "52px 52px",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: "1400px",
            margin: "0 auto",
            // padding: "clamp(64px, 8vw, 120px) clamp(20px, 5vw, 72px)",
          }}
        >
          {/* ── Header ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "40px",
              marginBottom: "80px",
              alignItems: "flex-end",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  marginBottom: "24px",
                }}
              >
                <span
                  style={{
                    display: "block",
                    width: "28px",
                    height: "1px",
                    background: "#C8A96E",
                  }}
                />
                <span
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontSize: "9px",
                    letterSpacing: "5px",
                    color: "#C8A96E",
                    textTransform: "uppercase",
                    fontWeight: 300,
                  }}
                >
                  What We Offer
                </span>
              </div>

              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: "clamp(48px, 6.5vw, 88px)",
                  fontWeight: 300,
                  color: "#F5F0E8",
                  lineHeight: 0.95,
                  letterSpacing: "-0.02em",
                  margin: 0,
                }}
              >
                Tailoring
                <br />
                <em
                  style={{
                    fontStyle: "italic",
                    color: "#C8A96E",
                  }}
                >
                  Redefined
                </em>
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.9,
                delay: 0.15,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <p
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "14px",
                  color: "white",
                  lineHeight: 1.9,
                  fontWeight: 300,
                  maxWidth: "360px",
                  marginBottom: "28px",
                }}
              >
                From consultation to final fitting, we deliver perfection
                tailored exclusively for you. Each garment a testament to the
                craft.
              </p>
              <a
                href="#contact"
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "9px",
                  letterSpacing: "3.5px",
                  color: "#C8A96E",
                  textTransform: "uppercase",
                  fontWeight: 300,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "12px",
                  textDecoration: "none",
                  paddingBottom: "4px",
                  borderBottom: "1px solid rgba(200,169,110,0.32)",
                }}
              >
                Book a Private Consultation
                <span style={{ fontSize: "11px" }}>→</span>
              </a>
            </motion.div>
          </div>

          {/* ── Hero Cinematic ── */}
          <div style={{ marginBottom: "4px" }}>
            <HeroPanel service={heroService} />
          </div>

          {/* ── 5 regular cards ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(min(100%, 270px), 1fr))",
              gap: "4px",
            }}
          >
            {gridServices.map((s, i) => (
              <ServiceCard key={s.number} service={s} index={i} />
            ))}
          </div>

          {/* ── Footer rule ── */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            style={{
              marginTop: "72px",
              display: "flex",
              alignItems: "center",
              gap: "28px",
            }}
          >
            <span
              style={{
                flex: 1,
                display: "block",
                height: "1px",
                background:
                  "linear-gradient(to right, transparent, rgba(200,169,110,0.22))",
              }}
            />
            <span
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "8px",
                letterSpacing: "4px",
                color: "white",
                textTransform: "uppercase",
                fontWeight: 300,
                whiteSpace: "nowrap",
              }}
            >
              Handcrafted in India · Est. 2003
            </span>
            <span
              style={{
                flex: 1,
                display: "block",
                height: "1px",
                background:
                  "linear-gradient(to left, transparent, rgba(200,169,110,0.22))",
              }}
            />
          </motion.div>
        </div>
      </section>
    </>
  );
}
