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
        gradient
          ? "border-[#7da8c7]/30 bg-gradient-to-br from-[#f0f6fb] to-white"
          : "border-[#e2e8f0] bg-white"
      } shadow-sm ${
        hover
          ? "hover:border-[#7da8c7]/50 hover:shadow-md hover:shadow-[#7da8c7]/10 hover:scale-[1.01]"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
