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

const INFO_ITEMS = [
  {
    icon: Clock,
    title: "Store Hours",
    lines: ["Mon - Sat: 10 AM - 8 PM", "Sunday: 11 AM - 6 PM"],
  },
  {
    icon: MapPin,
    title: "Visit Us",
    lines: ["E-39, Lajpat Nagar II", "New Delhi – 110024"],
  },
  {
    icon: Phone,
    title: "Contact",
    lines: ["+91 96507 53273", "appointments@zenmen.com"],
  },
] as const;

const BookAppointmentSection = () => {
  const pathname = usePathname();
  const [motionKey, setMotionKey] = useState(0);

  useEffect(() => {
    setMotionKey((k) => k + 1);
  }, [pathname]);

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setMotionKey((k) => k + 1);
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return (
    <section
      id="contact"
      className="bg-[#fafbfc] px-6 py-20 md:px-8 md:py-28 lg:px-16 lg:py-32"
    >
      <motion.div
        key={`contact-${motionKey}`}
        className="mx-auto max-w-[1200px]"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.1, delayChildren: 0.05 },
          },
        }}
      >
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-10 text-center md:mb-14"
        >
          <p className="mb-4 text-[11px] uppercase tracking-[0.3em] text-[#7da8c7]">
            Visit Our Atelier
          </p>
          <h2
            className="text-[#0f172a]"
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: "clamp(32px, 5vw, 56px)",
              fontWeight: 600,
              lineHeight: 1.15,
            }}
          >
            Schedule An Appointment
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-[#64748b]">
            Experience personalized styling and bespoke tailoring with our expert
            consultants. Book your exclusive appointment for a premium shopping
            experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2 lg:gap-10">
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="relative min-h-[280px] overflow-hidden rounded-sm border border-[#e2e8f0] bg-white shadow-sm sm:min-h-[360px] lg:min-h-full"
          >
            <img
              src="/store_1.jpeg"
              alt="ZENmen atelier"
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/25 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 border-t border-white/20 bg-white/90 px-5 py-4 backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#7da8c7]">
                ZENmen · Lajpat Nagar
              </p>
              <p className="mt-1 text-[13px] font-medium text-[#0f172a]">
                E-39, Lajpat Nagar II, New Delhi
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="flex flex-col justify-center rounded-sm border border-[#e2e8f0] bg-white p-8 shadow-sm md:p-10"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/appointment"
                className="mb-10 inline-flex w-full items-center justify-center gap-3 rounded-sm bg-[#0f172a] px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white no-underline transition-colors duration-300 hover:bg-[#7da8c7] hover:text-[#0f172a] sm:w-auto"
              >
                <Calendar className="h-5 w-5" strokeWidth={1.5} />
                <span>Book Now</span>
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
              {INFO_ITEMS.map(({ icon: Icon, title, lines }) => (
                <div key={title} className="text-center sm:text-left">
                  <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-[#e2e8f0] bg-[#f8fafc] sm:mx-0">
                    <Icon className="h-5 w-5 text-[#7da8c7]" strokeWidth={1.5} />
                  </div>
                  <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-[0.15em] text-[#0f172a]">
                    {title}
                  </h3>
                  <p className="text-[12px] leading-relaxed text-[#64748b]">
                    {lines[0]}
                    <br />
                    {lines[1]}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-10 border-t border-[#e2e8f0] pt-8 text-center text-[11px] leading-relaxed tracking-wide text-[#94a3b8] sm:text-left">
              Walk-ins are welcome based on availability. For guaranteed service and
              personalized attention, we recommend scheduling an appointment in
              advance.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default BookAppointmentSection;
