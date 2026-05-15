"use client";

import { motion } from "framer-motion";
import { ArrowRight, Calendar, Clock, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const BookAppointmentSection = () => {
  const pathname = usePathname();
  /** Remount motion blocks when returning via browser back (bfcache) or route change */
  const [motionKey, setMotionKey] = useState(0);

  useEffect(() => {
    setMotionKey((k) => k + 1);
  }, [pathname]);

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setMotionKey((k) => k + 1);
      }
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return (
    <section className="relative overflow-hidden py-32">
      <motion.div
        key={`contact-bg-${motionKey}`}
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <img
          src="/store_1.jpeg"
          alt="ZENmen Store"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
      </motion.div>

      <motion.div
        key={`contact-content-${motionKey}`}
        className="relative z-10 mx-auto max-w-5xl px-6 text-center md:px-8"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.12, delayChildren: 0.05 },
          },
        }}
      >
        <motion.div variants={fadeUp} transition={{ duration: 0.55, ease: "easeOut" }}>
          <p className="mb-6 text-[11px] uppercase tracking-[0.3em] text-[#7da8c7]">
            Visit Our Atelier
          </p>
          <h2
            className="mb-6 text-white"
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: "clamp(40px, 6vw, 72px)",
              fontWeight: 600,
              lineHeight: 1.2,
              textShadow: "0 4px 20px rgba(0,0,0,0.5)",
            }}
          >
            Schedule An Appointment
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-[15px] leading-relaxed text-white/90">
            Experience personalized styling and bespoke tailoring with our expert
            consultants. Book your exclusive appointment for a premium shopping
            experience.
          </p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mb-16"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/appointment"
              className="inline-flex items-center gap-3 rounded-sm bg-white px-12 py-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0f172a] no-underline shadow-2xl transition-all duration-300 hover:border-[#7da8c7] hover:bg-[#7da8c7] hover:text-white"
            >
              <Calendar className="h-5 w-5" strokeWidth={1.5} />
              <span>Book Now</span>
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3 md:gap-12"
        >
          <div className="flex flex-col items-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
              <Clock className="h-5 w-5 text-white" strokeWidth={1.5} />
            </div>
            <h3 className="mb-2 text-[13px] font-medium uppercase tracking-[0.15em] text-white">
              Store Hours
            </h3>
            <p className="text-[12px] leading-relaxed text-white/80">
              Mon - Sat: 10 AM - 8 PM
              <br />
              Sunday: 11 AM - 6 PM
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
              <MapPin className="h-5 w-5 text-white" strokeWidth={1.5} />
            </div>
            <h3 className="mb-2 text-[13px] font-medium uppercase tracking-[0.15em] text-white">
              Visit Us
            </h3>
            <p className="text-[12px] leading-relaxed text-white/80">
              E-39, Lajpat Nagar II
              <br />
              New Delhi – 110024
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
              <Phone className="h-5 w-5 text-white" strokeWidth={1.5} />
            </div>
            <h3 className="mb-2 text-[13px] font-medium uppercase tracking-[0.15em] text-white">
              Contact
            </h3>
            <p className="text-[12px] leading-relaxed text-white/80">
              +91 96507 53273
              <br />
              appointments@zenmen.com
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mt-12 border-t border-white/20 pt-12"
        >
          <p className="mx-auto max-w-3xl text-[11px] leading-relaxed tracking-wide text-white/70">
            Walk-ins are welcome based on availability. For guaranteed service and
            personalized attention, we recommend scheduling an appointment in
            advance.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default BookAppointmentSection;
