"use client";
import { useFadeUp } from "@/app/hooks/useFadeUp";
import { CSSProperties, ReactNode } from "react";

interface Props {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}

export default function FadeUp({
  children,
  delay = 0,
  className = "",
  style,
}: Props) {
  const { ref, visible } = useFadeUp();
  return (
    <div
      ref={ref as any}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
