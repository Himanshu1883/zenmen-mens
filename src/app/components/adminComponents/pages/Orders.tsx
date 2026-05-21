import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Package, Truck } from "lucide-react";
import { GlassCard } from "../dashboard/GlassCard";

interface Order {
  id: string;
  customer: string;
  product: string;
  date: string;
  amount: number;
  status: "Pending" | "Processing" | "Completed" | "Cancelled";
}

const mockOrders: Order[] = [
  {
    id: "#ORD-2026-0892",
    customer: "Emma Watson",
    product: "Bespoke Three-Piece Suit",
    date: "Apr 5, 2026",
    amount: 3500,
    status: "Processing",
  },
  {
    id: "#ORD-2026-0891",
    customer: "James Anderson",
    product: "Evening Gown Collection",
    date: "Apr 4, 2026",
    amount: 4200,
    status: "Completed",
  },
  {
    id: "#ORD-2026-0890",
    customer: "Sarah Mitchell",
    product: "Custom Tailored Blazer",
    date: "Apr 3, 2026",
    amount: 1800,
    status: "Processing",
  },
  {
    id: "#ORD-2026-0889",
    customer: "Michael Chen",
    product: "Silk Wedding Dress",
    date: "Apr 2, 2026",
    amount: 5500,
    status: "Pending",
  },
  {
    id: "#ORD-2026-0888",
    customer: "Olivia Brown",
    product: "Premium Accessories Set",
    date: "Apr 1, 2026",
    amount: 650,
    status: "Completed",
  },
  {
    id: "#ORD-2026-0887",
    customer: "David Wilson",
    product: "Summer Linen Suit",
    date: "Mar 30, 2026",
    amount: 2800,
    status: "Cancelled",
  },
];

export default function Orders() {
  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "Pending":
        return "border-yellow-500/50 text-yellow-400 bg-yellow-500/20";
      case "Processing":
        return "border-blue-500/50 text-blue-400 bg-blue-500/20";
      case "Completed":
        return "border-green-500/50 text-green-400 bg-green-500/20";
      case "Cancelled":
        return "border-red-500/50 text-red-400 bg-red-500/20";
    }
  };

  return (
    <div className="space-y-6 mt-16">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-[#0f172a] mb-2">Orders</h1>
          <p className="text-[#64748b]">
            Manage customer orders and fulfillment
          </p>
        </div>
        <Button variant="outline" className="border-[#e2e8f0] text-[#64748b]">
          Export Orders
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <GlassCard className="p-4">
          <p className="text-[#64748b] text-sm mb-1">Total Orders</p>
          <p className="text-2xl font-semibold text-[#0f172a]">892</p>
          <p className="text-xs text-green-400 mt-1">+23.1% vs last month</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-[#64748b] text-sm mb-1">Pending</p>
          <p className="text-2xl font-semibold text-yellow-400">34</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-[#64748b] text-sm mb-1">Processing</p>
          <p className="text-2xl font-semibold text-blue-400">127</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-[#64748b] text-sm mb-1">Completed</p>
          <p className="text-2xl font-semibold text-green-400">731</p>
        </GlassCard>
      </div>

      {/* Orders Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e2e8f0]">
                <th className="text-left p-4 text-sm font-medium text-[#64748b]">
                  Order ID
                </th>
                <th className="text-left p-4 text-sm font-medium text-[#64748b]">
                  Customer
                </th>
                <th className="text-left p-4 text-sm font-medium text-[#64748b]">
                  Product
                </th>
                <th className="text-left p-4 text-sm font-medium text-[#64748b]">
                  Date
                </th>
                <th className="text-left p-4 text-sm font-medium text-[#64748b]">
                  Amount
                </th>
                <th className="text-left p-4 text-sm font-medium text-[#64748b]">
                  Status
                </th>
                <th className="text-left p-4 text-sm font-medium text-[#64748b]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {mockOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-white/5 hover:bg-[#f1f5f9] transition-colors"
                >
                  <td className="p-4">
                    <p className="text-[#7da8c7] text-sm font-mono">
                      {order.id}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="text-[#0f172a] text-sm">{order.customer}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#64748b]" />
                      <p className="text-[#64748b] text-sm">{order.product}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-[#64748b] text-sm">{order.date}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-[#0f172a] text-sm font-semibold">
                      ${order.amount.toLocaleString()}
                    </p>
                  </td>
                  <td className="p-4">
                    <Badge
                      variant="outline"
                      className={getStatusColor(order.status)}
                    >
                      {order.status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-[#64748b] hover:text-[#7da8c7] hover:bg-[#f1f5f9]"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {order.status !== "Completed" &&
                        order.status !== "Cancelled" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-[#64748b] hover:text-blue-400 hover:bg-[#f1f5f9]"
                          >
                            <Truck className="w-4 h-4" />
                          </Button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-[#e2e8f0]">
          <p className="text-sm text-[#64748b]">Showing 1-6 of 892 orders</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-[#e2e8f0] text-[#64748b]"
              disabled
            >
              Previous
            </Button>
            <Button
              size="sm"
              className="bg-[#7da8c7] hover:bg-[#5a8faf] text-white"
            >
              Next
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Recent Activity */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-[#0f172a] mb-4">
          Recent Order Activity
        </h3>
        <div className="space-y-4">
          {[
            {
              action: "Order placed",
              order: "#ORD-2026-0892",
              time: "5 minutes ago",
              icon: Package,
            },
            {
              action: "Order shipped",
              order: "#ORD-2026-0891",
              time: "1 hour ago",
              icon: Truck,
            },
            {
              action: "Order delivered",
              order: "#ORD-2026-0890",
              time: "3 hours ago",
              icon: Package,
            },
            {
              action: "Payment received",
              order: "#ORD-2026-0889",
              time: "5 hours ago",
              icon: Package,
            },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-[#f1f5f9] transition-colors"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(244, 167, 157, 0.2) 0%, rgba(244, 167, 157, 0.05) 100%)",
                }}
              >
                <activity.icon className="w-5 h-5 text-[#7da8c7]" />
              </div>
              <div className="flex-1">
                <p className="text-[#0f172a] text-sm">{activity.action}</p>
                <p className="text-[#64748b] text-xs">{activity.order}</p>
              </div>
              <span className="text-xs text-[#94a3b8]">{activity.time}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
