"use client";

import { formatInr } from "@/lib/order-display";
import {
  Loader2,
  MousePointer,
  Package,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#7da8c7", "#9fbdd5", "#64748b", "#94a3b8", "#cbd5e1", "#5a8faf"];

type AnalyticsPayload = {
  success?: boolean;
  kpis?: {
    totalUsers: number;
    usersThisMonth: number;
    userDeltaPct: number | null;
    totalOrders: number;
    ordersThisMonth: number;
    orderDeltaPct: number | null;
    catalogProducts: number;
    inStockPct: number;
    avgOrderValue: number;
    aovDeltaPct: number | null;
    revenueThisMonth: number;
    confirmedThisMonth: number;
  };
  userGrowth?: { id: string; month: string; users: number; newUsers: number }[];
  monthlyOrders?: { id: string; month: string; orders: number; revenue: number }[];
  statusUsage?: { id: string; section: string; views: number }[];
  paymentSplit?: { id: string; name: string; value: number; revenue: number }[];
  collectionMix?: { id: string; name: string; value: number; stock: number }[];
  summary?: {
    topCollection: { name: string; units: number; revenue: number } | null;
    topProduct: { name: string; units: number; collection: string } | null;
    avgOrderValue: number;
  };
};

function deltaLabel(pct: number | null | undefined) {
  if (pct == null) return "—";
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct}%`;
}

function deltaPositive(pct: number | null | undefined) {
  return (pct ?? 0) >= 0;
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/admin/analytics", {
      cache: "no-store",
      credentials: "same-origin",
    })
      .then((r) => r.json())
      .then((json: AnalyticsPayload) => {
        if (!cancelled && json.success) setData(json);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="mt-16 flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#7da8c7]" />
      </div>
    );
  }

  const kpis = data?.kpis;
  const userGrowth = data?.userGrowth ?? [];
  const monthlyOrders = data?.monthlyOrders ?? [];
  const statusUsage = data?.statusUsage ?? [];
  const paymentSplit = data?.paymentSplit ?? [];
  const collectionMix = data?.collectionMix ?? [];
  const summary = data?.summary;

  return (
    <div className="space-y-6 mt-16">
      <div className="mb-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#0f172a] via-[#7da8c7] to-[#5a8faf] bg-clip-text text-transparent mb-2">
          Business Intelligence
        </h1>
        <p className="text-[#64748b] text-base">
          Live customers, catalog, and order performance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <KpiCard
          icon={<Users className="w-6 h-6 text-[#7da8c7]" />}
          label="Customers"
          value={String(kpis?.totalUsers ?? 0)}
          hint={`${kpis?.usersThisMonth ?? 0} new this month`}
          delta={deltaLabel(kpis?.userDeltaPct)}
          positive={deltaPositive(kpis?.userDeltaPct)}
          bar={Math.min(100, (kpis?.usersThisMonth ?? 0) * 8)}
          accent
        />
        <KpiCard
          icon={<Package className="w-6 h-6 text-[#9fbdd5]" />}
          label="Catalog"
          value={String(kpis?.catalogProducts ?? 0)}
          hint="Active product records"
          delta={`${kpis?.inStockPct ?? 0}% in stock`}
          positive
          bar={kpis?.inStockPct ?? 0}
        />
        <KpiCard
          icon={<MousePointer className="w-6 h-6 text-[#5a8faf]" />}
          label="Orders this month"
          value={String(kpis?.ordersThisMonth ?? 0)}
          hint={`${kpis?.totalOrders ?? 0} all-time`}
          delta={deltaLabel(kpis?.orderDeltaPct)}
          positive={deltaPositive(kpis?.orderDeltaPct)}
          bar={Math.min(100, (kpis?.ordersThisMonth ?? 0) * 6)}
        />
        <KpiCard
          icon={<Zap className="w-6 h-6 text-[#7da8c7]" />}
          label="Confirmed this month"
          value={String(kpis?.confirmedThisMonth ?? 0)}
          hint={formatInr(kpis?.revenueThisMonth ?? 0)}
          delta={formatInr(kpis?.avgOrderValue ?? 0) + " AOV"}
          positive
          bar={Math.min(100, (kpis?.confirmedThisMonth ?? 0) * 8)}
        />
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div
          className="col-span-12 lg:col-span-8 rounded-2xl p-7 border relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            borderColor: "rgba(125, 168, 199, 0.2)",
          }}
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-[#0f172a] mb-1">
                  Audience Growth
                </h3>
                <p className="text-sm text-[#64748b]">Cumulative registered customers</p>
              </div>
              <div className="px-4 py-2 rounded-xl bg-[#7da8c7]/10 border border-[#7da8c7]/30">
                <span className="text-[#7da8c7] text-sm font-semibold">6 Months</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart id="user-growth-area-chart" data={userGrowth}>
                <defs>
                  <linearGradient id="userGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7da8c7" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#7da8c7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(226,232,240,0.9)" vertical={false} />
                <XAxis dataKey="month" stroke="#6B7280" style={{ fontSize: "13px", fontWeight: 500 }} />
                <YAxis stroke="#6B7280" style={{ fontSize: "13px", fontWeight: 500 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    color: "#0f172a",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#7da8c7"
                  strokeWidth={3}
                  fill="url(#userGrowthGradient)"
                  dot={{ fill: "#7da8c7", strokeWidth: 2, r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div
          className="col-span-12 lg:col-span-4 rounded-2xl p-6 border"
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f0f6fb 100%)",
            borderColor: "rgba(125, 168, 199, 0.15)",
          }}
        >
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#0f172a] mb-1">Order status</h3>
            <p className="text-sm text-[#64748b]">Live fulfillment mix</p>
          </div>
          {statusUsage.length === 0 ? (
            <p className="text-sm text-[#64748b] py-20 text-center">No orders yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart id="section-traffic-bar-chart" data={statusUsage} layout="horizontal">
                <defs>
                  <linearGradient id="barGradientSection" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#7da8c7" stopOpacity={1} />
                    <stop offset="100%" stopColor="#5a8faf" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(226,232,240,0.9)" horizontal={false} />
                <XAxis type="number" stroke="#6B7280" style={{ fontSize: "11px" }} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="section"
                  stroke="#6B7280"
                  style={{ fontSize: "11px" }}
                  width={90}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    color: "#0f172a",
                  }}
                />
                <Bar dataKey="views" fill="url(#barGradientSection)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="rounded-2xl p-6 border relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(125, 168, 199, 0.1) 0%, rgba(90, 143, 175, 0.05) 100%)",
            borderColor: "rgba(125, 168, 199, 0.25)",
          }}
        >
          <div className="relative z-10">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-[#0f172a] mb-1 flex items-center gap-2">
                <Target className="w-5 h-5 text-[#7da8c7]" />
                Monthly orders & revenue
              </h3>
              <p className="text-sm text-[#64748b]">All checkouts in the last 6 months</p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart id="category-performance-chart" data={monthlyOrders}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(226,232,240,0.9)" vertical={false} />
                <XAxis dataKey="month" stroke="#6B7280" style={{ fontSize: "12px" }} />
                <YAxis yAxisId="left" stroke="#6B7280" style={{ fontSize: "12px" }} allowDecimals={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#6B7280" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    color: "#0f172a",
                  }}
                  formatter={(value, name) =>
                    name === "revenue" ? formatInr(Number(value ?? 0)) : Number(value ?? 0)
                  }
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="orders"
                  stroke="#7da8c7"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#7da8c7" }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#5a8faf"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#5a8faf" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div
          className="rounded-2xl p-6 border"
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f0f6fb 100%)",
            borderColor: "rgba(125, 168, 199, 0.15)",
          }}
        >
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#0f172a] mb-1">
              Catalog by collection
            </h3>
            <p className="text-sm text-[#64748b]">Product.category (parent collection)</p>
          </div>
          {collectionMix.length === 0 ? (
            <p className="text-sm text-[#64748b] py-20 text-center">No products yet.</p>
          ) : (
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart id="content-updates-pie-chart">
                  <Pie
                    data={collectionMix}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => {
                      const displayPercent = percent ?? 0;
                      return `${name || "Unknown"} ${(displayPercent * 100).toFixed(0)}%`;
                    }}
                    outerRadius={110}
                    innerRadius={60}
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {collectionMix.map((entry, index) => (
                      <Cell key={`cell-${entry.id}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      color: "#0f172a",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {paymentSplit.length > 0 ? (
        <div
          className="rounded-2xl p-6 border"
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            borderColor: "rgba(125, 168, 199, 0.2)",
          }}
        >
          <h3 className="text-lg font-bold text-[#0f172a] mb-4">Payment mix</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {paymentSplit.map((p) => (
              <div key={p.id} className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4">
                <p className="text-sm text-[#64748b]">{p.name}</p>
                <p className="text-2xl font-bold text-[#0f172a] mt-1">{p.value} orders</p>
                <p className="text-sm text-[#7da8c7] mt-1">{formatInr(p.revenue)}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div
        className="rounded-2xl p-8 border relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          borderColor: "rgba(125, 168, 199, 0.2)",
        }}
      >
        <div className="relative z-10">
          <h3 className="text-2xl font-bold text-[#0f172a] mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#7da8c7]" />
            Executive Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="absolute -left-4 top-0 w-1 h-full rounded-full bg-gradient-to-b from-[#7da8c7] to-transparent"></div>
              <p className="text-[#64748b] text-sm mb-3 font-medium">Top collection (sold)</p>
              <p className="text-[#0f172a] text-2xl font-bold mb-2">
                {summary?.topCollection?.name ?? "—"}
              </p>
              <p className="text-[#7da8c7] text-base font-semibold">
                {summary?.topCollection
                  ? `${summary.topCollection.units} units · ${formatInr(summary.topCollection.revenue)}`
                  : "No sales yet"}
              </p>
            </div>
            <div className="relative">
              <div className="absolute -left-4 top-0 w-1 h-full rounded-full bg-gradient-to-b from-[#9fbdd5] to-transparent"></div>
              <p className="text-[#64748b] text-sm mb-3 font-medium">Best selling product</p>
              <p className="text-[#0f172a] text-2xl font-bold mb-2">
                {summary?.topProduct?.name ?? "—"}
              </p>
              <p className="text-[#9fbdd5] text-base font-semibold">
                {summary?.topProduct
                  ? `${summary.topProduct.units} units · ${summary.topProduct.collection}`
                  : "No line items yet"}
              </p>
            </div>
            <div className="relative">
              <div className="absolute -left-4 top-0 w-1 h-full rounded-full bg-gradient-to-b from-[#5a8faf] to-transparent"></div>
              <p className="text-[#64748b] text-sm mb-3 font-medium">Average transaction</p>
              <p className="text-[#0f172a] text-2xl font-bold mb-2">
                {summary?.avgOrderValue ? formatInr(summary.avgOrderValue) : "—"}
              </p>
              <p className="text-[#5a8faf] text-base font-semibold">
                Per confirmed / paid order
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  hint,
  delta,
  positive,
  bar,
  accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  delta: string;
  positive: boolean;
  bar: number;
  accent?: boolean;
}) {
  return (
    <div
      className="relative rounded-2xl p-6 border overflow-hidden group hover:scale-[1.02] transition-all"
      style={{
        background: accent
          ? "linear-gradient(135deg, rgba(125, 168, 199, 0.12) 0%, rgba(90, 143, 175, 0.06) 100%)"
          : "linear-gradient(135deg, #ffffff 0%, #f0f6fb 100%)",
        borderColor: accent ? "rgba(125, 168, 199, 0.25)" : "rgba(125, 168, 199, 0.15)",
      }}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(125, 168, 199, 0.25) 0%, rgba(125, 168, 199, 0.08) 100%)",
            }}
          >
            {icon}
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-green-500/15 border border-green-500/20">
            <span className={`text-xs font-bold ${positive ? "text-green-400" : "text-amber-500"}`}>
              {delta}
            </span>
          </div>
        </div>
        <p className="text-[#64748b] text-sm mb-1.5 font-medium">{label}</p>
        <p className="text-3xl font-bold text-[#0f172a] mb-1">{value}</p>
        <p className="text-xs text-[#94a3b8] mb-2">{hint}</p>
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex-1 h-1.5 rounded-full bg-[#f8fafc]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#7da8c7] to-[#5a8faf]"
              style={{ width: `${Math.max(4, Math.min(100, bar))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
