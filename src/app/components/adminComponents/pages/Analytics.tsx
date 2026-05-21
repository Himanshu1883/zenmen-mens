"use client";

import {
  Eye,
  Image,
  MousePointer,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const userGrowthData = [
  { id: "ug-jan", month: "Jan", users: 856 },
  { id: "ug-feb", month: "Feb", users: 923 },
  { id: "ug-mar", month: "Mar", users: 1045 },
  { id: "ug-apr", month: "Apr", users: 1134 },
  { id: "ug-may", month: "May", users: 1198 },
  { id: "ug-jun", month: "Jun", users: 1284 },
];

const sectionUsageData = [
  { id: "su-home", section: "Home", views: 4823 },
  { id: "su-collections", section: "Collections", views: 3241 },
  { id: "su-about", section: "About", views: 2145 },
  { id: "su-custom", section: "Custom Design", views: 1876 },
  { id: "su-contact", section: "Contact", views: 1543 },
];

const imageUpdatesData = [
  { id: "iu-home", name: "Home Page", value: 35 },
  { id: "iu-collections", name: "Collections", value: 28 },
  { id: "iu-about", name: "About", value: 15 },
  { id: "iu-custom", name: "Custom", value: 12 },
  { id: "iu-others", name: "Others", value: 10 },
];

const productCategoryData = [
  { id: "pc-jan", month: "Jan", suits: 45, dresses: 38, accessories: 22 },
  { id: "pc-feb", month: "Feb", suits: 52, dresses: 45, accessories: 28 },
  { id: "pc-mar", month: "Mar", suits: 48, dresses: 41, accessories: 25 },
  { id: "pc-apr", month: "Apr", suits: 61, dresses: 52, accessories: 34 },
  { id: "pc-may", month: "May", suits: 55, dresses: 48, accessories: 31 },
  { id: "pc-jun", month: "Jun", suits: 67, dresses: 58, accessories: 38 },
];

const COLORS = ["#7da8c7", "#9fbdd5", "#64748b", "#94a3b8", "#cbd5e1"];

export default function Analytics() {
  return (
    <div className="space-y-6 mt-16">
      {/* Premium Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#0f172a] via-[#7da8c7] to-[#5a8faf] bg-clip-text text-transparent mb-2">
          Business Intelligence
        </h1>
        <p className="text-[#64748b] text-base">
          Deep insights into your luxury tailoring empire
        </p>
      </div>

      {/* Premium KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div
          className="relative rounded-2xl p-6 border overflow-hidden group hover:scale-[1.02] transition-all"
          style={{
            background:
              "linear-gradient(135deg, rgba(125, 168, 199, 0.12) 0%, rgba(90, 143, 175, 0.06) 100%)",
            borderColor: "rgba(125, 168, 199, 0.25)",
          }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#7da8c7] opacity-10 blur-2xl group-hover:opacity-20 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(125, 168, 199, 0.25) 0%, rgba(125, 168, 199, 0.08) 100%)",
                }}
              >
                <Users className="w-6 h-6 text-[#7da8c7]" />
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-green-500/15 border border-green-500/20">
                <span className="text-xs font-bold text-green-400">+12.5%</span>
              </div>
            </div>
            <p className="text-[#64748b] text-sm mb-1.5 font-medium">
              User Growth
            </p>
            <p className="text-3xl font-bold text-[#0f172a] mb-1">+428</p>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="flex-1 h-1.5 rounded-full bg-[#f8fafc]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#7da8c7] to-[#5a8faf]"
                  style={{ width: "68%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="relative rounded-2xl p-6 border overflow-hidden group hover:scale-[1.02] transition-all"
          style={{
            background:
              "linear-gradient(135deg, #ffffff 0%, #f0f6fb 100%)",
            borderColor: "rgba(125, 168, 199, 0.15)",
          }}
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(232, 213, 168, 0.2) 0%, rgba(232, 213, 168, 0.05) 100%)",
                }}
              >
                <Eye className="w-6 h-6 text-[#9fbdd5]" />
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-green-500/15 border border-green-500/20">
                <span className="text-xs font-bold text-green-400">+8.2%</span>
              </div>
            </div>
            <p className="text-[#64748b] text-sm mb-1.5 font-medium">
              Page Views
            </p>
            <p className="text-3xl font-bold text-[#0f172a] mb-1">13.2K</p>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="flex-1 h-1.5 rounded-full bg-[#f8fafc]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#9fbdd5] to-[#7da8c7]"
                  style={{ width: "82%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="relative rounded-2xl p-6 border overflow-hidden group hover:scale-[1.02] transition-all"
          style={{
            background:
              "linear-gradient(135deg, rgba(90, 143, 175, 0.12) 0%, rgba(90, 143, 175, 0.05) 100%)",
            borderColor: "rgba(90, 143, 175, 0.25)",
          }}
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(90, 143, 175, 0.25) 0%, rgba(90, 143, 175, 0.08) 100%)",
                }}
              >
                <MousePointer className="w-6 h-6 text-[#5a8faf]" />
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-green-500/15 border border-green-500/20">
                <span className="text-xs font-bold text-green-400">+15.3%</span>
              </div>
            </div>
            <p className="text-[#64748b] text-sm mb-1.5 font-medium">
              Engagement
            </p>
            <p className="text-3xl font-bold text-[#0f172a] mb-1">87.3%</p>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="flex-1 h-1.5 rounded-full bg-[#f8fafc]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#5a8faf] to-[#7da8c7]"
                  style={{ width: "87%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="relative rounded-2xl p-6 border overflow-hidden group hover:scale-[1.02] transition-all"
          style={{
            background:
              "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            borderColor: "rgba(125, 168, 199, 0.2)",
          }}
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#7da8c7]/10 blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(125, 168, 199, 0.25) 0%, rgba(125, 168, 199, 0.08) 100%)",
                }}
              >
                <Zap className="w-6 h-6 text-[#7da8c7]" />
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-green-500/15 border border-green-500/20">
                <span className="text-xs font-bold text-green-400">+23.1%</span>
              </div>
            </div>
            <p className="text-[#64748b] text-sm mb-1.5 font-medium">
              Conversions
            </p>
            <p className="text-3xl font-bold text-[#0f172a] mb-1">34</p>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="flex-1 h-1.5 rounded-full bg-[#f8fafc]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#7da8c7] to-[#5a8faf]"
                  style={{ width: "91%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Analytics Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* User Growth - Larger Card */}
        <div
          className="col-span-12 lg:col-span-8 rounded-2xl p-7 border relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            borderColor: "rgba(125, 168, 199, 0.2)",
          }}
        >
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#7da8c7]/10 blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-[#0f172a] mb-1">
                  Audience Growth Trajectory
                </h3>
                <p className="text-sm text-[#64748b]">
                  Monthly user acquisition trend
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-4 py-2 rounded-xl bg-[#7da8c7]/10 border border-[#7da8c7]/30">
                  <span className="text-[#7da8c7] text-sm font-semibold">
                    6 Months
                  </span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart id="user-growth-area-chart" data={userGrowthData}>
                <defs>
                  <linearGradient
                    id="userGrowthGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#7da8c7" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#7da8c7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  key="user-grid"
                  strokeDasharray="3 3"
                  stroke="rgba(226,232,240,0.9)"
                  vertical={false}
                />
                <XAxis
                  key="user-xaxis"
                  dataKey="month"
                  stroke="#6B7280"
                  style={{ fontSize: "13px", fontWeight: 500 }}
                />
                <YAxis
                  key="user-yaxis"
                  stroke="#6B7280"
                  style={{ fontSize: "13px", fontWeight: 500 }}
                />
                <Tooltip
                  key="user-tooltip"
                  contentStyle={{
                    backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", color: "#0f172a",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                  }}
                />
                <Area
                  key="users-area"
                  type="monotone"
                  dataKey="users"
                  stroke="#7da8c7"
                  strokeWidth={3}
                  fill="url(#userGrowthGradient)"
                  dot={{ fill: "#7da8c7", strokeWidth: 2, r: 5 }}
                  activeDot={{
                    r: 7,
                    fill: "#7da8c7",
                    stroke: "#0f172a",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section Usage - Compact */}
        <div
          className="col-span-12 lg:col-span-4 rounded-2xl p-6 border"
          style={{
            background:
              "linear-gradient(135deg, #ffffff 0%, #f0f6fb 100%)",
            borderColor: "rgba(125, 168, 199, 0.15)",
          }}
        >
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#0f172a] mb-1">
              Section Traffic
            </h3>
            <p className="text-sm text-[#64748b]">Page view distribution</p>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              id="section-traffic-bar-chart"
              data={sectionUsageData}
              layout="horizontal"
            >
              <defs>
                <linearGradient
                  id="barGradientSection"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop offset="0%" stopColor="#7da8c7" stopOpacity={1} />
                  <stop offset="100%" stopColor="#5a8faf" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid
                key="section-grid"
                strokeDasharray="3 3"
                stroke="rgba(226,232,240,0.9)"
                horizontal={false}
              />
              <XAxis
                key="section-xaxis"
                type="number"
                stroke="#6B7280"
                style={{ fontSize: "11px" }}
              />
              <YAxis
                key="section-yaxis"
                type="category"
                dataKey="section"
                stroke="#6B7280"
                style={{ fontSize: "11px" }}
                width={80}
              />
              <Tooltip
                key="section-tooltip"
                contentStyle={{
                  backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", color: "#0f172a",
                }}
              />
              <Bar
                key="views-bar-horizontal"
                dataKey="views"
                fill="url(#barGradientSection)"
                radius={[0, 8, 8, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Categories Performance */}
        <div
          className="rounded-2xl p-6 border relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(125, 168, 199, 0.1) 0%, rgba(90, 143, 175, 0.05) 100%)",
            borderColor: "rgba(125, 168, 199, 0.25)",
          }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#7da8c7]/10 blur-3xl"></div>
          <div className="relative z-10">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-[#0f172a] mb-1 flex items-center gap-2">
                <Target className="w-5 h-5 text-[#7da8c7]" />
                Category Performance
              </h3>
              <p className="text-sm text-[#64748b]">
                Sales trends by product line
              </p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart
                id="category-performance-chart"
                data={productCategoryData}
              >
                <defs>
                  <linearGradient
                    id="suitsGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#7da8c7" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#7da8c7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  key="category-grid"
                  strokeDasharray="3 3"
                  stroke="rgba(226,232,240,0.9)"
                  vertical={false}
                />
                <XAxis
                  key="category-xaxis"
                  dataKey="month"
                  stroke="#6B7280"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  key="category-yaxis"
                  stroke="#6B7280"
                  style={{ fontSize: "12px" }}
                />
                <Tooltip
                  key="category-tooltip"
                  contentStyle={{
                    backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", color: "#0f172a",
                  }}
                />
                <Legend
                  key="category-legend"
                  wrapperStyle={{ color: "#fff", paddingTop: "20px" }}
                />
                <Area
                  key="suits-area"
                  type="monotone"
                  dataKey="suits"
                  fill="url(#suitsGradient)"
                  stroke="#7da8c7"
                  strokeWidth={2}
                />
                <Line
                  key="dresses-line-new"
                  type="monotone"
                  dataKey="dresses"
                  stroke="#9fbdd5"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#9fbdd5" }}
                />
                <Line
                  key="accessories-line-new"
                  type="monotone"
                  dataKey="accessories"
                  stroke="#5a8faf"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#5a8faf" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Content Distribution */}
        <div
          className="rounded-2xl p-6 border"
          style={{
            background:
              "linear-gradient(135deg, #ffffff 0%, #f0f6fb 100%)",
            borderColor: "rgba(125, 168, 199, 0.15)",
          }}
        >
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#0f172a] mb-1 flex items-center gap-2">
              <Image className="w-5 h-5 text-[#7da8c7]" />
              Content Updates
            </h3>
            <p className="text-sm text-[#64748b]">Distribution by section</p>
          </div>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart id="content-updates-pie-chart">
                <Pie
                  key="image-updates-pie-new"
                  data={imageUpdatesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => {
                    const displayPercent = percent ?? 0;
                    return `${name || "Unknown"} ${(displayPercent * 100).toFixed(0)}%`;
                  }}
                  outerRadius={110}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={2}
                >
                  {imageUpdatesData.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.id}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  key="pie-tooltip"
                  contentStyle={{
                    backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", color: "#0f172a",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div
        className="rounded-2xl p-8 border relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          borderColor: "rgba(125, 168, 199, 0.2)",
        }}
      >
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#7da8c7]/10 to-transparent blur-3xl"></div>
        <div className="relative z-10">
          <h3 className="text-2xl font-bold text-[#0f172a] mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#7da8c7]" />
            Executive Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="absolute -left-4 top-0 w-1 h-full rounded-full bg-gradient-to-b from-[#7da8c7] to-transparent"></div>
              <p className="text-[#64748b] text-sm mb-3 font-medium">
                Top Performing Section
              </p>
              <p className="text-[#0f172a] text-2xl font-bold mb-2">Home Page</p>
              <p className="text-[#7da8c7] text-base font-semibold">
                4,823 views
              </p>
              <p className="text-green-400 text-sm mt-2">+28.5% increase</p>
            </div>
            <div className="relative">
              <div className="absolute -left-4 top-0 w-1 h-full rounded-full bg-gradient-to-b from-[#9fbdd5] to-transparent"></div>
              <p className="text-[#64748b] text-sm mb-3 font-medium">
                Best Selling Category
              </p>
              <p className="text-[#0f172a] text-2xl font-bold mb-2">
                Bespoke Suits
              </p>
              <p className="text-[#9fbdd5] text-base font-semibold">
                67 units sold
              </p>
              <p className="text-green-400 text-sm mt-2">+22.8% growth</p>
            </div>
            <div className="relative">
              <div className="absolute -left-4 top-0 w-1 h-full rounded-full bg-gradient-to-b from-[#5a8faf] to-transparent"></div>
              <p className="text-[#64748b] text-sm mb-3 font-medium">
                Average Transaction
              </p>
              <p className="text-[#0f172a] text-2xl font-bold mb-2">$2,847</p>
              <p className="text-[#5a8faf] text-base font-semibold">
                Per order
              </p>
              <p className="text-green-400 text-sm mt-2">
                +18.3% vs last month
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
