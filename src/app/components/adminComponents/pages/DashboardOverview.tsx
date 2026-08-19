"use client";

import {
  Activity,
  ArrowUpRight,
  Calendar,
  DollarSign,
  Loader2,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatInr, formatOrderStatusLabel } from "@/lib/order-display";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type RecentRow = {
  id: string;
  client: string;
  item: string;
  status: string;
  value: number | string;
  time: string;
};

type StatsPayload = {
  success?: boolean;
  counts?: {
    totalOrders: number;
    inFulfillment: number;
    totalRevenue: number;
    cancellationRequested: number;
    users?: number;
    products?: number;
    todayOrders?: number;
    revenueOrders?: number;
  };
  weeklyData?: { day: string; orders: number; revenue: number }[];
  revenueData?: { id: string; month: string; revenue: number; orders: number }[];
  recentOrders?: {
    id: string;
    client: string;
    item: string;
    status: string;
    value: number;
    time: string;
  }[];
  health?: { metric: string; value: number }[];
  generatedAt?: string;
};

export default function DashboardOverview() {
  const [revenueData, setRevenueData] = useState<
    { id: string; month: string; revenue: number; orders: number }[]
  >([]);
  const [weeklyData, setWeeklyData] = useState<
    { day: string; orders: number; revenue: number }[]
  >([]);
  const [recentOrders, setRecentOrders] = useState<RecentRow[]>([]);
  const [health, setHealth] = useState<{ metric: string; value: number }[]>([]);
  const [counts, setCounts] = useState({
    totalOrders: 0,
    inFulfillment: 0,
    totalRevenue: 0,
    cancellationRequested: 0,
    users: 0,
    products: 0,
    todayOrders: 0,
    revenueOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/admin/stats", { cache: "no-store", credentials: "same-origin" })
      .then((r) => r.json())
      .then((data: StatsPayload) => {
        if (cancelled || !data.success) return;
        if (data.revenueData) setRevenueData(data.revenueData);
        if (data.weeklyData) setWeeklyData(data.weeklyData);
        if (data.health) setHealth(data.health);
        if (data.generatedAt) setGeneratedAt(new Date(data.generatedAt));
        if (data.recentOrders) {
          setRecentOrders(
            data.recentOrders.map((o) => ({
              ...o,
              time: new Date(o.time).toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
              }),
            })),
          );
        } else {
          setRecentOrders([]);
        }
        if (data.counts) {
          setCounts({
            totalOrders: data.counts.totalOrders ?? 0,
            inFulfillment: data.counts.inFulfillment ?? 0,
            totalRevenue: data.counts.totalRevenue ?? 0,
            cancellationRequested: data.counts.cancellationRequested ?? 0,
            users: data.counts.users ?? 0,
            products: data.counts.products ?? 0,
            todayOrders: data.counts.todayOrders ?? 0,
            revenueOrders: data.counts.revenueOrders ?? 0,
          });
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const avgOrder =
    counts.revenueOrders > 0
      ? Math.round(counts.totalRevenue / counts.revenueOrders)
      : 0;

  const weekOrders = weeklyData.reduce((s, d) => s + d.orders, 0);
  const todayLabel = (generatedAt ?? new Date()).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (loading) {
    return (
      <div className="mt-16 flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#7da8c7]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-16">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#0f172a] via-[#7da8c7] to-[#5a8faf] bg-clip-text text-transparent mb-2">
            ZENMEN Center
          </h1>
          <p className="text-[#64748b] text-base flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {todayLabel} • Live store data
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 hover:shadow-2xl group relative overflow-hidden text-white no-underline inline-flex"
            style={{
              background: "linear-gradient(135deg, #7da8c7 0%, #5a8faf 100%)",
            }}
          >
            <span className="relative flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              New product
            </span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div
          className="col-span-12 lg:col-span-8 row-span-2 rounded-3xl p-8 border relative overflow-hidden group"
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            borderColor: "rgba(125, 168, 199, 0.2)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#7da8c7]/10 to-transparent blur-3xl pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-[#64748b] text-sm mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Revenue Performance
                </p>
                <h2 className="text-5xl font-bold text-[#0f172a] mb-2">
                  {formatInr(counts.totalRevenue)}
                </h2>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                    <span className="text-green-400 text-sm font-semibold flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {counts.totalOrders} confirmed/paid orders
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7da8c7]/10 border border-[#7da8c7]/30 mb-2">
                  <div className="w-2 h-2 rounded-full bg-[#7da8c7] animate-pulse"></div>
                  <span className="text-[#7da8c7] text-sm font-medium">Live</span>
                </div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={280}>
              <AreaChart id="main-revenue-chart" data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradientNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7da8c7" stopOpacity={0.4} />
                    <stop offset="50%" stopColor="#7da8c7" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#7da8c7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(226,232,240,0.9)"
                  vertical={false}
                />
                <XAxis dataKey="month" stroke="#6B7280" style={{ fontSize: "13px", fontWeight: 500 }} />
                <YAxis stroke="#6B7280" style={{ fontSize: "13px", fontWeight: 500 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    color: "#0f172a",
                    boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
                    padding: "12px 16px",
                  }}
                  formatter={(value) => formatInr(Number(value ?? 0))}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#7da8c7"
                  strokeWidth={3}
                  fill="url(#revenueGradientNew)"
                  dot={{ fill: "#7da8c7", strokeWidth: 2, r: 6, strokeOpacity: 0.3, stroke: "#7da8c7" }}
                  activeDot={{ r: 8, fill: "#7da8c7", stroke: "#0f172a", strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div
            className="rounded-2xl p-6 border relative overflow-hidden group hover:scale-[1.02] transition-all"
            style={{
              background:
                "linear-gradient(135deg, rgba(125, 168, 199, 0.15) 0%, rgba(90, 143, 175, 0.08) 100%)",
              borderColor: "rgba(125, 168, 199, 0.3)",
            }}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(125, 168, 199, 0.3) 0%, rgba(125, 168, 199, 0.1) 100%)",
                  }}
                >
                  <ShoppingCart className="w-6 h-6 text-[#7da8c7]" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-[#64748b] text-sm mb-1">Orders (7 days)</p>
              <p className="text-4xl font-bold text-[#0f172a] mb-1">{weekOrders}</p>
              <p className="text-green-400 text-sm font-medium">
                {counts.todayOrders} today · {counts.inFulfillment} in fulfillment
              </p>
            </div>
          </div>

          <div
            className="rounded-2xl p-6 border relative overflow-hidden group hover:scale-[1.02] transition-all"
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #f0f6fb 100%)",
              borderColor: "rgba(125, 168, 199, 0.15)",
            }}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(232, 213, 168, 0.2) 0%, rgba(232, 213, 168, 0.05) 100%)",
                  }}
                >
                  <Users className="w-6 h-6 text-[#9fbdd5]" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-[#64748b] text-sm mb-1">Customers</p>
              <p className="text-4xl font-bold text-[#0f172a] mb-1">{counts.users}</p>
              <p className="text-green-400 text-sm font-medium">
                {counts.cancellationRequested} cancel requests need review
              </p>
            </div>
          </div>

          <div
            className="rounded-2xl p-6 border relative overflow-hidden group hover:scale-[1.02] transition-all"
            style={{
              background:
                "linear-gradient(135deg, rgba(90, 143, 175, 0.15) 0%, rgba(90, 143, 175, 0.05) 100%)",
              borderColor: "rgba(90, 143, 175, 0.3)",
            }}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(90, 143, 175, 0.3) 0%, rgba(90, 143, 175, 0.1) 100%)",
                  }}
                >
                  <DollarSign className="w-6 h-6 text-[#5a8faf]" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-[#64748b] text-sm mb-1">Avg Order Value</p>
              <p className="text-4xl font-bold text-[#0f172a] mb-1">
                {avgOrder > 0 ? formatInr(avgOrder) : "—"}
              </p>
              <p className="text-green-400 text-sm font-medium">
                {counts.products} products in catalog
              </p>
            </div>
          </div>
        </div>

        <div
          className="col-span-12 lg:col-span-7 rounded-2xl p-6 border"
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f0f6fb 100%)",
            borderColor: "rgba(125, 168, 199, 0.15)",
          }}
        >
          <div className="mb-6">
            <h3 className="text-xl font-bold text-[#0f172a] mb-1">Weekly Performance</h3>
            <p className="text-[#64748b] text-sm">Orders by day (last 7 days)</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart id="weekly-performance-chart" data={weeklyData}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7da8c7" stopOpacity={1} />
                  <stop offset="100%" stopColor="#5a8faf" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(226,232,240,0.9)" vertical={false} />
              <XAxis dataKey="day" stroke="#6B7280" style={{ fontSize: "12px" }} />
              <YAxis stroke="#6B7280" style={{ fontSize: "12px" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  color: "#0f172a",
                }}
              />
              <Bar dataKey="orders" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div
          className="col-span-12 lg:col-span-5 rounded-2xl p-6 border relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            borderColor: "rgba(125, 168, 199, 0.2)",
          }}
        >
          <div className="relative z-10">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[#0f172a] mb-1">Business Health</h3>
              <p className="text-[#64748b] text-sm">Live rates from orders and catalog</p>
            </div>
            {health.length === 0 ? (
              <p className="text-sm text-[#64748b] py-16 text-center">No metrics yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart id="business-health-radar" data={health}>
                  <PolarGrid stroke="rgba(125, 168, 199, 0.2)" />
                  <PolarAngleAxis dataKey="metric" stroke="#64748b" style={{ fontSize: "12px" }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#6B7280" style={{ fontSize: "11px" }} />
                  <Radar
                    dataKey="value"
                    stroke="#7da8c7"
                    fill="#7da8c7"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      color: "#0f172a",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div
          className="col-span-12 rounded-2xl p-6 border"
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f0f6fb 100%)",
            borderColor: "rgba(125, 168, 199, 0.15)",
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-[#0f172a] mb-1">Recent Orders</h3>
              <p className="text-[#64748b] text-sm">Latest checkout activity</p>
            </div>
            <Link
              href="/admin/orders"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-[#7da8c7]/10 inline-block"
              style={{
                border: "1px solid rgba(125, 168, 199, 0.3)",
                color: "#7da8c7",
              }}
            >
              View All Orders
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentOrders.length === 0 ? (
              <p className="text-[#64748b] text-sm col-span-full p-4">
                No orders yet — they will show here after checkout.
              </p>
            ) : null}
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="p-5 rounded-xl border transition-all hover:scale-[1.02] hover:border-[#7da8c7]/40 group"
                style={{
                  background: "linear-gradient(135deg, #f0f6fb 0%, #ffffff 100%)",
                  borderColor: "rgba(125, 168, 199, 0.15)",
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(125, 168, 199, 0.2) 0%, rgba(125, 168, 199, 0.05) 100%)",
                    }}
                  >
                    <span className="text-lg font-bold text-[#7da8c7]">
                      {(order.client || "?").charAt(0)}
                    </span>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: "rgba(125, 168, 199, 0.15)", color: "#0f172a" }}
                  >
                    {formatOrderStatusLabel(String(order.status))}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="font-mono text-xs text-[#7da8c7]">{order.id}</p>
                  <p className="font-semibold text-[#0f172a] text-base">{order.client}</p>
                  <p className="text-sm text-[#64748b]">{order.item}</p>
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5">
                    <span className="text-xl font-bold text-[#0f172a]">
                      {typeof order.value === "number" ? formatInr(order.value) : order.value}
                    </span>
                    <span className="text-xs text-[#94a3b8]">{order.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
