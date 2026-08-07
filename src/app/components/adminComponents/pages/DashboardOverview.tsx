"use client";

import {
  Activity,
  ArrowUpRight,
  Calendar,
  DollarSign,
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

const MOCK_REVENUE_DATA = [
  { id: "rev-jan", month: "Jan", revenue: 45000, orders: 120 },
  { id: "rev-feb", month: "Feb", revenue: 52000, orders: 145 },
  { id: "rev-mar", month: "Mar", revenue: 48000, orders: 132 },
  { id: "rev-apr", month: "Apr", revenue: 61000, orders: 168 },
  { id: "rev-may", month: "May", revenue: 55000, orders: 152 },
  { id: "rev-jun", month: "Jun", revenue: 67000, orders: 189 },
];

const performanceData = [
  { metric: "Quality", value: 95 },
  { metric: "Speed", value: 87 },
  { metric: "Satisfaction", value: 92 },
  { metric: "Innovation", value: 88 },
  { metric: "Efficiency", value: 90 },
];

const MOCK_WEEKLY_DATA = [
  { day: "Mon", orders: 12, revenue: 8400 },
  { day: "Tue", orders: 19, revenue: 12200 },
  { day: "Wed", orders: 15, revenue: 9800 },
  { day: "Thu", orders: 22, revenue: 14500 },
  { day: "Fri", orders: 18, revenue: 11900 },
  { day: "Sat", orders: 25, revenue: 16800 },
  { day: "Sun", orders: 8, revenue: 5200 },
];

const MOCK_RECENT_ORDERS = [
  {
    id: "#ZEN-2847",
    client: "Marcus Chen",
    item: "3-Piece Suit",
    status: "Fitting",
    value: "₹3,200",
    time: "2h ago",
  },
  {
    id: "#ZEN-2846",
    client: "David Park",
    item: "Dress Shirt",
    status: "Completed",
    value: "₹480",
    time: "5h ago",
  },
  {
    id: "#ZEN-2845",
    client: "James Wilson",
    item: "Blazer",
    status: "In Production",
    value: "₹1,850",
    time: "1d ago",
  },
];

type RecentRow = {
  id: string;
  client: string;
  item: string;
  status: string;
  value: number | string;
  time: string;
};

export default function DashboardOverview() {
  const [revenueData, setRevenueData] = useState(MOCK_REVENUE_DATA);
  const [weeklyData, setWeeklyData] = useState(MOCK_WEEKLY_DATA);
  const [recentOrders, setRecentOrders] = useState<RecentRow[]>(MOCK_RECENT_ORDERS);
  const [counts, setCounts] = useState({
    totalOrders: 0,
    inFulfillment: 0,
    totalRevenue: 0,
    cancellationRequested: 0,
  });
  const [liveStats, setLiveStats] = useState(false);

  useEffect(() => {
    void fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) return;
        setLiveStats(Boolean(data.hasRealData));
        if (data.revenueData?.length) setRevenueData(data.revenueData);
        if (data.weeklyData?.length) setWeeklyData(data.weeklyData);
        if (data.recentOrders?.length) {
          setRecentOrders(
            data.recentOrders.map(
              (o: {
                id: string;
                client: string;
                item: string;
                status: string;
                value: number;
                time: string;
              }) => ({
                ...o,
                value: o.value,
                time: new Date(o.time).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                }),
              }),
            ),
          );
        } else if (data.hasRealData) {
          setRecentOrders([]);
        }
        if (data.counts) setCounts(data.counts);
      })
      .catch(() => undefined);
  }, []);

  const avgOrder =
    counts.totalOrders > 0
      ? Math.round(counts.totalRevenue / counts.totalOrders)
      : 0;

  const weekOrders = weeklyData.reduce((s, d) => s + d.orders, 0);

  return (
    <div className="space-y-6 mt-16">
      {/* Premium Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#0f172a] via-[#7da8c7] to-[#5a8faf] bg-clip-text text-transparent mb-2">
            ZENMEN Center
          </h1>
          <p className="text-[#64748b] text-base flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Friday, May 8, 2026 • {liveStats ? "Store orders" : "Sample + store"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 hover:shadow-2xl group relative overflow-hidden text-white"
            style={{
              background: "linear-gradient(135deg, #7da8c7 0%, #5a8faf 100%)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <span className="relative flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              New Commission
            </span>
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Main Revenue Card - Large */}
        <div
          className="col-span-12 lg:col-span-8 row-span-2 rounded-3xl p-8 border relative overflow-hidden group"
          style={{
            background:
              "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            borderColor: "rgba(125, 168, 199, 0.2)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#7da8c7]/10 to-transparent blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#5a8faf]/10 to-transparent blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-[#64748b] text-sm mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Revenue Performance
                </p>
                <h2 className="text-5xl font-bold text-[#0f172a] mb-2">
                  {formatInr(liveStats ? counts.totalRevenue : 328450)}
                </h2>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                    <span className="text-green-400 text-sm font-semibold flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {liveStats
                        ? `${counts.totalOrders} orders in database`
                        : "+24.5% vs last period"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7da8c7]/10 border border-[#7da8c7]/30 mb-2">
                  <div className="w-2 h-2 rounded-full bg-[#7da8c7] animate-pulse"></div>
                  <span className="text-[#7da8c7] text-sm font-medium">
                    Live
                  </span>
                </div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={280}>
              <AreaChart id="main-revenue-chart" data={revenueData}>
                <defs>
                  <linearGradient
                    id="revenueGradientNew"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#7da8c7" stopOpacity={0.4} />
                    <stop offset="50%" stopColor="#7da8c7" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#7da8c7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  key="main-grid"
                  strokeDasharray="3 3"
                  stroke="rgba(226,232,240,0.9)"
                  vertical={false}
                />
                <XAxis
                  key="main-xaxis"
                  dataKey="month"
                  stroke="#6B7280"
                  style={{ fontSize: "13px", fontWeight: 500 }}
                />
                <YAxis
                  key="main-yaxis"
                  stroke="#6B7280"
                  style={{ fontSize: "13px", fontWeight: 500 }}
                />
                <Tooltip
                  key="main-tooltip"
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    color: "#0f172a",
                    boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
                    padding: "12px 16px",
                  }}
                />
                <Area
                  key="revenue-area-new"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#7da8c7"
                  strokeWidth={3}
                  fill="url(#revenueGradientNew)"
                  dot={{
                    fill: "#7da8c7",
                    strokeWidth: 2,
                    r: 6,
                    strokeOpacity: 0.3,
                    stroke: "#7da8c7",
                  }}
                  activeDot={{
                    r: 8,
                    fill: "#7da8c7",
                    stroke: "#0f172a",
                    strokeWidth: 3,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Stats - Vertical Stack */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Today's Orders */}
          <div
            className="rounded-2xl p-6 border relative overflow-hidden group hover:scale-[1.02] transition-all"
            style={{
              background:
                "linear-gradient(135deg, rgba(125, 168, 199, 0.15) 0%, rgba(90, 143, 175, 0.08) 100%)",
              borderColor: "rgba(125, 168, 199, 0.3)",
            }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#7da8c7] opacity-10 blur-2xl rounded-full group-hover:opacity-20 transition-opacity"></div>
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
              <p className="text-4xl font-bold text-[#0f172a] mb-1">
                {liveStats ? weekOrders : 47}
              </p>
              <p className="text-green-400 text-sm font-medium">
                {liveStats
                  ? `${counts.inFulfillment} in fulfillment`
                  : "+18% from yesterday"}
              </p>
            </div>
          </div>

          {/* Active Clients */}
          <div
            className="rounded-2xl p-6 border relative overflow-hidden group hover:scale-[1.02] transition-all"
            style={{
              background:
                "linear-gradient(135deg, #ffffff 0%, #f0f6fb 100%)",
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
              <p className="text-[#64748b] text-sm mb-1">Cancel requests</p>
              <p className="text-4xl font-bold text-[#0f172a] mb-1">
                {liveStats ? counts.cancellationRequested : "—"}
              </p>
              <p className="text-green-400 text-sm font-medium">
                {liveStats ? "Needs admin review" : "+127 this month"}
              </p>
            </div>
          </div>

          {/* Avg Order Value */}
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
                {liveStats && avgOrder > 0 ? formatInr(avgOrder) : "₹2,847"}
              </p>
              <p className="text-green-400 text-sm font-medium">
                {liveStats ? "From paid/confirmed orders" : "+12.3% growth"}
              </p>
            </div>
          </div>
        </div>

        {/* Weekly Performance */}
        <div
          className="col-span-12 lg:col-span-7 rounded-2xl p-6 border"
          style={{
            background:
              "linear-gradient(135deg, #ffffff 0%, #f0f6fb 100%)",
            borderColor: "rgba(125, 168, 199, 0.15)",
          }}
        >
          <div className="mb-6">
            <h3 className="text-xl font-bold text-[#0f172a] mb-1">
              Weekly Performance
            </h3>
            <p className="text-[#64748b] text-sm">Orders and revenue by day</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart id="weekly-performance-chart" data={weeklyData}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7da8c7" stopOpacity={1} />
                  <stop offset="100%" stopColor="#5a8faf" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid
                key="weekly-grid"
                strokeDasharray="3 3"
                stroke="rgba(226,232,240,0.9)"
                vertical={false}
              />
              <XAxis
                key="weekly-xaxis"
                dataKey="day"
                stroke="#6B7280"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                key="weekly-yaxis"
                stroke="#6B7280"
                style={{ fontSize: "12px" }}
              />
              <Tooltip
                key="weekly-tooltip"
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  color: "#0f172a",
                }}
              />
              <Bar
                key="orders-bar"
                dataKey="orders"
                fill="url(#barGradient)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Radar */}
        <div
          className="col-span-12 lg:col-span-5 rounded-2xl p-6 border relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            borderColor: "rgba(125, 168, 199, 0.2)",
          }}
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#7da8c7]/10 blur-3xl"></div>
          <div className="relative z-10">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[#0f172a] mb-1">
                Business Health
              </h3>
              <p className="text-[#64748b] text-sm">
                Key performance indicators
              </p>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart id="business-health-radar" data={performanceData}>
                <PolarGrid key="radar-grid" stroke="rgba(125, 168, 199, 0.2)" />
                <PolarAngleAxis
                  key="radar-angle"
                  dataKey="metric"
                  stroke="#64748b"
                  style={{ fontSize: "12px" }}
                />
                <PolarRadiusAxis
                  key="radar-radius"
                  angle={90}
                  domain={[0, 100]}
                  stroke="#6B7280"
                  style={{ fontSize: "11px" }}
                />
                <Radar
                  key="performance-radar"
                  dataKey="value"
                  stroke="#7da8c7"
                  fill="#7da8c7"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip
                  key="radar-tooltip"
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    color: "#0f172a",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity - Full Width */}
        <div
          className="col-span-12 rounded-2xl p-6 border"
          style={{
            background:
              "linear-gradient(135deg, #ffffff 0%, #f0f6fb 100%)",
            borderColor: "rgba(125, 168, 199, 0.15)",
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-[#0f172a] mb-1">
                Recent Orders
              </h3>
              <p className="text-[#64748b] text-sm">
                {liveStats ? "Latest checkout activity" : "Sample commissions"}
              </p>
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
            {recentOrders.length === 0 && liveStats ? (
              <p className="text-[#64748b] text-sm col-span-full p-4">
                No orders yet — they will show here after checkout.
              </p>
            ) : null}
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="p-5 rounded-xl border transition-all hover:scale-[1.02] hover:border-[#7da8c7]/40 group cursor-pointer"
                style={{
                  background:
                    "linear-gradient(135deg, #f0f6fb 0%, #ffffff 100%)",
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
                      {order.client.charAt(0)}
                    </span>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: "rgba(125, 168, 199, 0.15)",
                      color: "#0f172a",
                    }}
                  >
                    {formatOrderStatusLabel(String(order.status))}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="font-mono text-xs text-[#7da8c7]">{order.id}</p>
                  <p className="font-semibold text-[#0f172a] text-base">
                    {order.client}
                  </p>
                  <p className="text-sm text-[#64748b]">{order.item}</p>
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5">
                    <span className="text-xl font-bold text-[#0f172a]">
                      {typeof order.value === "number"
                        ? formatInr(order.value)
                        : order.value}
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
