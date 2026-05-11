"use client";

import { Service } from "@/types/";
import { motion } from "framer-motion";

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true }}
      className="group relative border border-[#2a2a2a] bg-[#0f0f0f] p-6 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:border-[#C8A96E]/60"
    >
      {/* Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-[#C8A96E]/10 to-transparent"></div>

      {/* Number */}
      <span className="text-[10px] tracking-[4px] text-[#C8A96E] mb-4 block">
        {service.number}
      </span>

      {/* Title */}
      <h3 className="text-[18px] font-semibold text-white mb-3 group-hover:text-[#C8A96E] transition">
        {service.name}
      </h3>

      {/* Description */}
      <p className="text-[13px] text-[#888880] leading-relaxed mb-5">
        {service.description}
      </p>

      {/* Price */}
      <span className="text-[11px] tracking-[2px] text-[#C8A96E] uppercase">
        {service.price}
      </span>

      {/* Bottom Line Animation */}
      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#C8A96E] transition-all duration-500 group-hover:w-full"></div>
    </motion.div>
  );
}
