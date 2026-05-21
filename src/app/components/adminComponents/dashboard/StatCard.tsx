"use client";

import { GlassCard } from "./GlassCard";
import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  changeType?: "increase" | "decrease";
  trend?: number[];
}

export function StatCard({
  title,
  value,
  icon: Icon,
  change,
  changeType,
  trend,
}: StatCardProps) {
  return (
    <GlassCard hover className="p-6 relative overflow-hidden group">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 bg-gradient-to-br from-[#7da8c7]/10 to-transparent" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3.5 rounded-xl bg-[#f0f6fb] border border-[#e2e8f0] transition-all group-hover:scale-105 group-hover:border-[#7da8c7]/40">
            <Icon className="w-6 h-6 text-[#7da8c7]" />
          </div>

          {change && (
            <div className="flex items-center gap-1.5">
              {changeType === "increase" ? (
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span
                className={`text-sm font-semibold ${
                  changeType === "increase"
                    ? "text-emerald-600"
                    : "text-red-500"
                }`}
              >
                {change}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-[#64748b]">{title}</h3>
          <p className="text-3xl font-bold tracking-tight text-[#0f172a]">
            {value}
          </p>
        </div>

        {trend && (
          <div className="mt-4 h-12 flex items-end gap-1">
            {trend.map((height, i) => (
              <div
                key={i}
                className={`flex-1 rounded-t transition-all group-hover:opacity-100 opacity-70 ${
                  i === trend.length - 1
                    ? "bg-gradient-to-t from-[#7da8c7] to-[#7da8c7]/30"
                    : "bg-gradient-to-t from-[#7da8c7]/50 to-[#7da8c7]/15"
                }`}
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 transform origin-left transition-all group-hover:scale-x-100 scale-x-0 bg-gradient-to-r from-[#7da8c7] via-[#5a8faf] to-transparent" />
    </GlassCard>
  );
}
