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

const revenueData = [
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

const weeklyData = [
  { day: "Mon", orders: 12, revenue: 8400 },
  { day: "Tue", orders: 19, revenue: 12200 },
  { day: "Wed", orders: 15, revenue: 9800 },
  { day: "Thu", orders: 22, revenue: 14500 },
  { day: "Fri", orders: 18, revenue: 11900 },
  { day: "Sat", orders: 25, revenue: 16800 },
  { day: "Sun", orders: 8, revenue: 5200 },
];

const recentOrders = [
  {
    id: "#ZEN-2847",
    client: "Marcus Chen",
    item: "3-Piece Suit",
    status: "Fitting",
    value: "$3,200",
    time: "2h ago",
  },
  {
    id: "#ZEN-2846",
    client: "David Park",
    item: "Dress Shirt",
    status: "Completed",
    value: "$480",
    time: "5h ago",
  },
  {
    id: "#ZEN-2845",
    client: "James Wilson",
    item: "Blazer",
    status: "In Production",
    value: "$1,850",
    time: "1d ago",
  },
];

export default function DashboardOverview() {
  return (
    <div className="space-y-6 mt-16">
      {/* Premium Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-[#E8D5A8] to-[#C8A96E] bg-clip-text text-transparent mb-2">
            ZENmen Command Center
          </h1>
          <p className="text-gray-400 text-base flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Friday, May 8, 2026 • Real-time Analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 hover:shadow-2xl group relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #C8A96E 0%, #A68F5E 100%)",
              color: "#050a18",
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
              "linear-gradient(135deg, rgba(22, 32, 53, 0.8) 0%, rgba(10, 18, 32, 0.6) 100%)",
            borderColor: "rgba(200, 169, 110, 0.2)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#C8A96E]/10 to-transparent blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#8B6E3A]/10 to-transparent blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Revenue Performance
                </p>
                <h2 className="text-5xl font-bold text-white mb-2">$328,450</h2>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                    <span className="text-green-400 text-sm font-semibold flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      +24.5% vs last period
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C8A96E]/10 border border-[#C8A96E]/30 mb-2">
                  <div className="w-2 h-2 rounded-full bg-[#C8A96E] animate-pulse"></div>
                  <span className="text-[#C8A96E] text-sm font-medium">
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
                    <stop offset="0%" stopColor="#C8A96E" stopOpacity={0.4} />
                    <stop offset="50%" stopColor="#C8A96E" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#C8A96E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  key="main-grid"
                  strokeDasharray="3 3"
                  stroke="rgba(200,169,110,0.08)"
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
                    backgroundColor: "rgba(10, 18, 32, 0.98)",
                    border: "1px solid rgba(200, 169, 110, 0.3)",
                    borderRadius: "16px",
                    color: "#FAF8F4",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                    padding: "12px 16px",
                  }}
                />
                <Area
                  key="revenue-area-new"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#C8A96E"
                  strokeWidth={3}
                  fill="url(#revenueGradientNew)"
                  dot={{
                    fill: "#C8A96E",
                    strokeWidth: 2,
                    r: 6,
                    strokeOpacity: 0.3,
                    stroke: "#C8A96E",
                  }}
                  activeDot={{
                    r: 8,
                    fill: "#C8A96E",
                    stroke: "#050a18",
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
                "linear-gradient(135deg, rgba(200, 169, 110, 0.15) 0%, rgba(139, 110, 58, 0.08) 100%)",
              borderColor: "rgba(200, 169, 110, 0.3)",
            }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C8A96E] opacity-10 blur-2xl rounded-full group-hover:opacity-20 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(200, 169, 110, 0.3) 0%, rgba(200, 169, 110, 0.1) 100%)",
                  }}
                >
                  <ShoppingCart className="w-6 h-6 text-[#C8A96E]" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-gray-400 text-sm mb-1">Today's Orders</p>
              <p className="text-4xl font-bold text-white mb-1">47</p>
              <p className="text-green-400 text-sm font-medium">
                +18% from yesterday
              </p>
            </div>
          </div>

          {/* Active Clients */}
          <div
            className="rounded-2xl p-6 border relative overflow-hidden group hover:scale-[1.02] transition-all"
            style={{
              background:
                "linear-gradient(135deg, rgba(8, 17, 34, 0.8) 0%, rgba(10, 18, 32, 0.6) 100%)",
              borderColor: "rgba(200, 169, 110, 0.15)",
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
                  <Users className="w-6 h-6 text-[#E8D5A8]" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-gray-400 text-sm mb-1">Active Clients</p>
              <p className="text-4xl font-bold text-white mb-1">1,284</p>
              <p className="text-green-400 text-sm font-medium">
                +127 this month
              </p>
            </div>
          </div>

          {/* Avg Order Value */}
          <div
            className="rounded-2xl p-6 border relative overflow-hidden group hover:scale-[1.02] transition-all"
            style={{
              background:
                "linear-gradient(135deg, rgba(139, 110, 58, 0.15) 0%, rgba(139, 110, 58, 0.05) 100%)",
              borderColor: "rgba(139, 110, 58, 0.3)",
            }}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(139, 110, 58, 0.3) 0%, rgba(139, 110, 58, 0.1) 100%)",
                  }}
                >
                  <DollarSign className="w-6 h-6 text-[#8B6E3A]" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-gray-400 text-sm mb-1">Avg Order Value</p>
              <p className="text-4xl font-bold text-white mb-1">$2,847</p>
              <p className="text-green-400 text-sm font-medium">
                +12.3% growth
              </p>
            </div>
          </div>
        </div>

        {/* Weekly Performance */}
        <div
          className="col-span-12 lg:col-span-7 rounded-2xl p-6 border"
          style={{
            background:
              "linear-gradient(135deg, rgba(8, 17, 34, 0.8) 0%, rgba(10, 18, 32, 0.6) 100%)",
            borderColor: "rgba(200, 169, 110, 0.15)",
          }}
        >
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-1">
              Weekly Performance
            </h3>
            <p className="text-gray-400 text-sm">Orders and revenue by day</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart id="weekly-performance-chart" data={weeklyData}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C8A96E" stopOpacity={1} />
                  <stop offset="100%" stopColor="#8B6E3A" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid
                key="weekly-grid"
                strokeDasharray="3 3"
                stroke="rgba(200,169,110,0.08)"
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
                  backgroundColor: "rgba(10, 18, 32, 0.98)",
                  border: "1px solid rgba(200, 169, 110, 0.3)",
                  borderRadius: "12px",
                  color: "#FAF8F4",
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
              "linear-gradient(135deg, rgba(22, 32, 53, 0.8) 0%, rgba(10, 18, 32, 0.6) 100%)",
            borderColor: "rgba(200, 169, 110, 0.2)",
          }}
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#C8A96E]/10 blur-3xl"></div>
          <div className="relative z-10">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-1">
                Business Health
              </h3>
              <p className="text-gray-400 text-sm">
                Key performance indicators
              </p>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart id="business-health-radar" data={performanceData}>
                <PolarGrid key="radar-grid" stroke="rgba(200, 169, 110, 0.2)" />
                <PolarAngleAxis
                  key="radar-angle"
                  dataKey="metric"
                  stroke="#9AA5B8"
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
                  stroke="#C8A96E"
                  fill="#C8A96E"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip
                  key="radar-tooltip"
                  contentStyle={{
                    backgroundColor: "rgba(10, 18, 32, 0.98)",
                    border: "1px solid rgba(200, 169, 110, 0.3)",
                    borderRadius: "12px",
                    color: "#FAF8F4",
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
              "linear-gradient(135deg, rgba(8, 17, 34, 0.8) 0%, rgba(10, 18, 32, 0.6) 100%)",
            borderColor: "rgba(200, 169, 110, 0.15)",
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">
                Recent Commissions
              </h3>
              <p className="text-gray-400 text-sm">Latest high-value orders</p>
            </div>
            <button
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-[#C8A96E]/10"
              style={{
                border: "1px solid rgba(200, 169, 110, 0.3)",
                color: "#C8A96E",
              }}
            >
              View All Orders
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="p-5 rounded-xl border transition-all hover:scale-[1.02] hover:border-[#C8A96E]/40 group cursor-pointer"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(22, 32, 53, 0.4) 0%, rgba(10, 18, 32, 0.3) 100%)",
                  borderColor: "rgba(200, 169, 110, 0.15)",
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(200, 169, 110, 0.2) 0%, rgba(200, 169, 110, 0.05) 100%)",
                    }}
                  >
                    <span className="text-lg font-bold text-[#C8A96E]">
                      {order.client.charAt(0)}
                    </span>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background:
                        order.status === "Completed"
                          ? "rgba(34, 197, 94, 0.15)"
                          : order.status === "Fitting"
                            ? "rgba(200, 169, 110, 0.15)"
                            : "rgba(59, 130, 246, 0.15)",
                      color:
                        order.status === "Completed"
                          ? "#22c55e"
                          : order.status === "Fitting"
                            ? "#C8A96E"
                            : "#3b82f6",
                    }}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="font-mono text-xs text-[#C8A96E]">{order.id}</p>
                  <p className="font-semibold text-white text-base">
                    {order.client}
                  </p>
                  <p className="text-sm text-gray-400">{order.item}</p>
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5">
                    <span className="text-xl font-bold text-white">
                      {order.value}
                    </span>
                    <span className="text-xs text-gray-500">{order.time}</span>
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
