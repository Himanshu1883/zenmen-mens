"use client";

import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export function GlassCard({
  children,
  className = "",
  hover = false,
  gradient = false,
}: GlassCardProps) {
  return (
    <div
      className={`rounded-2xl border transition-all duration-300 ${
        hover
          ? "hover:border-[#C8A96E]/50 hover:shadow-2xl hover:shadow-[#C8A96E]/10 hover:scale-[1.015]"
          : ""
      } ${className}`}
      style={{
        background: gradient
          ? "linear-gradient(135deg, rgba(200, 169, 110, 0.12) 0%, rgba(139, 110, 58, 0.06) 100%)"
          : "linear-gradient(135deg, rgba(8, 17, 34, 0.7) 0%, rgba(10, 18, 32, 0.5) 100%)",
        backdropFilter: "blur(24px)",
        borderColor: gradient
          ? "rgba(200, 169, 110, 0.3)"
          : "rgba(200, 169, 110, 0.18)",
        boxShadow: hover
          ? "0 10px 40px 0 rgba(0, 0, 0, 0.4)"
          : "0 6px 20px 0 rgba(0, 0, 0, 0.25)",
      }}
    >
      {children}
    </div>
  );
}
