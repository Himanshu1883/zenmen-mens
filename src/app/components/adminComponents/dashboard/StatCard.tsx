"use client";
import { ReactNode } from "react";
import { GlassCard } from "./GlassCard";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  changeType?: "increase" | "decrease";
  trend?: number[];
}

export function StatCard({ title, value, icon: Icon, change, changeType, trend }: StatCardProps) {
  return (
    <GlassCard hover className="p-6 relative overflow-hidden group">
      {/* Animated Background Gradient */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500"
        style={{
          background: "radial-gradient(circle at top right, rgba(200, 169, 110, 0.15) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div
            className="p-3.5 rounded-xl transition-all group-hover:scale-110 group-hover:rotate-3"
            style={{
              background: "linear-gradient(135deg, rgba(200, 169, 110, 0.2) 0%, rgba(200, 169, 110, 0.05) 100%)",
              boxShadow: "0 4px 12px rgba(200, 169, 110, 0.1)"
            }}
          >
            <Icon className="w-6 h-6" style={{ color: "#C8A96E" }} />
          </div>

          {change && (
            <div className="flex items-center gap-1.5">
              {changeType === "increase" ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              <span
                className={`text-sm font-semibold ${
                  changeType === "increase" ? "text-green-400" : "text-red-400"
                }`}
              >
                {change}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium" style={{ color: "#9AA5B8" }}>
            {title}
          </h3>
          <p className="text-3xl font-bold tracking-tight" style={{ color: "#FAF8F4" }}>
            {value}
          </p>
        </div>

        {/* Mini Trend Line */}
        {trend && (
          <div className="mt-4 h-12 flex items-end gap-1">
            {trend.map((height, i) => (
              <div
                key={i}
                className="flex-1 rounded-t transition-all group-hover:opacity-100 opacity-60"
                style={{
                  height: `${height}%`,
                  background: i === trend.length - 1
                    ? "linear-gradient(180deg, #C8A96E 0%, rgba(200, 169, 110, 0.3) 100%)"
                    : "linear-gradient(180deg, rgba(200, 169, 110, 0.4) 0%, rgba(200, 169, 110, 0.1) 100%)"
                }}
              ></div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Accent */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 transform origin-left transition-all group-hover:scale-x-100 scale-x-0"
        style={{
          background: "linear-gradient(90deg, #C8A96E 0%, #8B6E3A 50%, transparent 100%)",
        }}
      />
    </GlassCard>
  );
}
