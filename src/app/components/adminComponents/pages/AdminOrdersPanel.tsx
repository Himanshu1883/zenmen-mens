"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ORDER_STATUSES } from "@/config/orderStatusConfig";
import {
  ADMIN_NEXT_STATUSES,
  adminStatusBadgeClass,
  formatInr,
  formatOrderDateTime,
  formatOrderStatusLabel,
  type SerializedOrder,
} from "@/lib/order-display";
import {
  Loader2,
  Mail,
  Package,
  RefreshCw,
  Search,
  Truck,
  X,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const selectClass =
  "h-9 rounded-lg border border-[#e2e8f0] bg-white px-3 text-sm text-[#0f172a] outline-none focus:border-[#7da8c7]";
const inputClass =
  "h-9 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 text-sm text-[#0f172a] outline-none placeholder:text-[#94a3b8] focus:border-[#7da8c7]";

const CANCEL_LABELS: Record<string, string> = {
  changed_mind: "Changed my mind",
  ordered_by_mistake: "Ordered by mistake",
  delivery_too_slow: "Delivery too slow",
  found_better_price: "Found a better price",
  other: "Other",
};

export default function AdminOrdersPanel() {
  const [orders, setOrders] = useState<SerializedOrder[]>([]);
  const [counts, setCounts] = useState({
    total: 0,
    pending: 0,
    active: 0,
    delivered: 0,
    cancelled: 0,
    cancellationRequested: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<SerializedOrder | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 50;

  const hasFilters =
    Boolean(statusFilter) ||
    Boolean(paymentFilter) ||
    Boolean(searchInput.trim()) ||
    Boolean(fromDate) ||
    Boolean(toDate);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      params.set("page", String(page));
      if (statusFilter) params.set("status", statusFilter);
      if (paymentFilter) params.set("paymentMethod", paymentFilter);
      if (search) params.set("q", search);
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message ?? "Failed to load orders");
      }
      setOrders(data.orders ?? []);
      setTotal(data.total ?? 0);
      setPages(data.pages ?? 1);
      if (data.counts) setCounts(data.counts);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, paymentFilter, search, fromDate, toDate]);

  const clearFilters = () => {
    setStatusFilter("");
    setPaymentFilter("");
    setSearchInput("");
    setSearch("");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  async function patchStatus(orderId: string, orderStatus: string) {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message ?? "Update failed");
      setToast(`Status updated to ${formatOrderStatusLabel(orderStatus)}`);
      await load();
      if (selected?.id === orderId && data.order) {
        setSelected(serializeFromApi(data.order));
      }
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Update failed");
    } finally {
      setActionLoading(false);
    }
  }

  function serializeFromApi(o: Record<string, unknown>): SerializedOrder {
    return {
      id: String(o._id ?? o.id),
      orderNumber: String(o.orderNumber),
      userEmail: String(o.userEmail),
      customerName: String(
        (o.shipping as { fullName?: string })?.fullName ?? "Customer",
      ),
      items: (o.items as SerializedOrder["items"]) ?? [],
      itemSummary: "",
      subtotal: Number(o.subtotal),
      codFee: Number(o.codFee ?? 0),
      total: Number(o.total),
      paymentMethod: o.paymentMethod as "cod" | "online",
      paymentStatus: String(o.paymentStatus),
      status: String(o.status),
      orderStatus: String(o.orderStatus ?? o.status),
      createdAt: String(o.createdAt),
      shipping: o.shipping as SerializedOrder["shipping"],
      statusHistory:
        (o.statusHistory as SerializedOrder["statusHistory"]) ?? [],
      cancellation: o.cancellation as SerializedOrder["cancellation"],
    };
  }

  async function adminCancel(orderId: string) {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "admin", note: "Cancelled by admin" }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message ?? "Cancel failed");
      setToast("Order cancelled");
      setSelected(null);
      await load();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Cancel failed");
    } finally {
      setActionLoading(false);
    }
  }

  async function approveCancel(orderId: string) {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/cancel/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNote: "Approved" }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message ?? "Approve failed");
      setToast("Cancellation approved");
      setSelected(null);
      await load();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Approve failed");
    } finally {
      setActionLoading(false);
    }
  }

  async function rejectCancel(orderId: string) {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/cancel/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNote: "Rejected" }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message ?? "Reject failed");
      setToast("Cancellation rejected");
      setSelected(null);
      await load();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Reject failed");
    } finally {
      setActionLoading(false);
    }
  }

  async function resendConfirmation(orderId: string) {
    setActionLoading(true);
    try {
      const res = await fetch(
        `/api/admin/orders/${orderId}/resend-confirmation`,
        { method: "POST" },
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.message ?? "Resend failed");
      setToast(data.sent ? "Confirmation email sent" : "Email not sent (check Resend config)");
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Resend failed");
    } finally {
      setActionLoading(false);
    }
  }

  const nextStatuses = selected
    ? ADMIN_NEXT_STATUSES[selected.orderStatus] ?? []
    : [];

  return (
    <div className="space-y-6 mt-16">
      {toast ? (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-[#e2e8f0] bg-white px-4 py-3 text-sm text-[#0f172a] shadow-lg">
          {toast}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-[#0f172a] mb-2">Orders</h1>
          <p className="text-[#64748b]">
            Live orders from checkout — fulfillment, cancel, and email
          </p>
        </div>
        <Button
          variant="outline"
          className="border-[#e2e8f0] text-[#64748b]"
          onClick={() => void load()}
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total orders" value={String(counts.total)} />
        <StatCard label="Pending payment" value={String(counts.pending)} accent="text-yellow-600" />
        <StatCard label="In fulfillment" value={String(counts.active)} accent="text-blue-600" />
        <StatCard label="Cancel requests" value={String(counts.cancellationRequested)} accent="text-orange-600" />
      </div>

      <div className="rounded-xl border border-[#e2e8f0] bg-white p-4 space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
            <input
              className={`${inputClass} pl-9`}
              placeholder="Order ID, name, email, or phone"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Search orders"
            />
          </div>
          <select
            className={selectClass}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Order status"
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((st) => (
              <option key={st} value={st}>
                {formatOrderStatusLabel(st)}
              </option>
            ))}
          </select>
          <select
            className={selectClass}
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Payment method"
          >
            <option value="">All payments</option>
            <option value="cod">COD</option>
            <option value="online">Razorpay</option>
          </select>
          <input
            type="date"
            className={selectClass}
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setPage(1);
            }}
            aria-label="From date"
          />
          <input
            type="date"
            className={selectClass}
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setPage(1);
            }}
            aria-label="To date"
          />
          {hasFilters ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="border-[#e2e8f0] text-[#64748b]"
              onClick={clearFilters}
            >
              <X className="mr-1 h-4 w-4" />
              Clear
            </Button>
          ) : null}
        </div>
        <p className="text-sm text-[#64748b]">
          {hasFilters
            ? `${total.toLocaleString("en-IN")} matching`
            : `${total.toLocaleString("en-IN")} orders`}
        </p>
      </div>

      {error ? (
        <p className="text-red-600 text-sm">{error}</p>
      ) : null}

      <div className="rounded-xl border border-[#e2e8f0] bg-white overflow-hidden">
        {loading && orders.length === 0 ? (
          <div className="flex items-center justify-center gap-2 p-12 text-[#64748b]">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading orders…
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-[#64748b]">
            <Package className="mx-auto mb-3 h-10 w-10 text-[#94a3b8]" />
            <p className="font-medium text-[#0f172a]">
              {hasFilters ? "No orders match these filters" : "No orders yet"}
            </p>
            <p className="text-sm mt-1">
              {hasFilters
                ? "Try a different status, payment method, date, or search."
                : "Orders appear here when customers checkout on the storefront."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                  {["Order", "Customer", "Items", "Date", "Total", "Status", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left p-4 text-xs font-semibold uppercase tracking-wide text-[#64748b]"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-[#f1f5f9] hover:bg-[#f8fafc]/80"
                  >
                    <td className="p-4 font-mono text-sm text-[#7da8c7]">
                      {order.orderNumber}
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-[#0f172a]">{order.customerName}</p>
                      <p className="text-xs text-[#94a3b8]">{order.userEmail}</p>
                    </td>
                    <td className="p-4 text-sm text-[#64748b] max-w-[200px] truncate">
                      {order.itemSummary}
                    </td>
                    <td className="p-4 text-sm text-[#64748b]">
                      {formatOrderDateTime(order.createdAt)}
                    </td>
                    <td className="p-4 text-sm font-semibold text-[#0f172a]">
                      {formatInr(order.total)}
                    </td>
                    <td className="p-4">
                      <Badge
                        variant="outline"
                        className={adminStatusBadgeClass(order.orderStatus)}
                      >
                        {formatOrderStatusLabel(order.orderStatus)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#e2e8f0]"
                        onClick={() => setSelected(order)}
                      >
                        Manage
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pages > 1 ? (
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-[#e2e8f0] text-[#64748b]"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
          >
            Previous
          </Button>
          <span className="text-sm text-[#64748b]">
            Page {page} of {pages}
          </span>
          <Button
            size="sm"
            variant="outline"
            className="border-[#e2e8f0] text-[#64748b]"
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page >= pages || loading}
          >
            Next
          </Button>
        </div>
      ) : null}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle>{selected.orderNumber}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={adminStatusBadgeClass(selected.orderStatus)}>
                    {formatOrderStatusLabel(selected.orderStatus)}
                  </Badge>
                  <Badge variant="outline">{selected.paymentMethod.toUpperCase()}</Badge>
                  <Badge variant="outline">{selected.paymentStatus}</Badge>
                </div>

                <div>
                  <p className="text-xs uppercase text-[#94a3b8] mb-1">Ship to</p>
                  <p className="text-[#0f172a]">{selected.shipping.fullName}</p>
                  <p className="text-[#64748b]">
                    {selected.shipping.addressLine1}, {selected.shipping.city}{" "}
                    {selected.shipping.pincode}
                  </p>
                  <p className="text-[#64748b]">{selected.shipping.phone}</p>
                </div>

                <ul className="space-y-2 border-t border-[#e2e8f0] pt-3">
                  {selected.items.map((item, i) => (
                    <li key={i} className="flex justify-between gap-2">
                      <span className="text-[#0f172a]">
                        {item.title} × {item.qty}
                      </span>
                      <span>{formatInr(item.price * item.qty)}</span>
                    </li>
                  ))}
                </ul>

                <p className="font-semibold text-[#0f172a]">
                  Total {formatInr(selected.total)}
                </p>

                {selected.orderStatus === "cancellation_requested" ? (
                  <div className="rounded-lg bg-orange-50 border border-orange-200 p-3 space-y-2">
                    <p className="font-medium text-orange-900">Cancellation requested</p>
                    {selected.cancellation?.reason ? (
                      <p className="text-orange-800 text-xs">
                        Reason: {CANCEL_LABELS[selected.cancellation.reason] ?? selected.cancellation.reason}
                      </p>
                    ) : null}
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        className="bg-[#7da8c7] text-white"
                        disabled={actionLoading}
                        onClick={() => void approveCancel(selected.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={actionLoading}
                        onClick={() => void rejectCancel(selected.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ) : null}

                {nextStatuses.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs uppercase text-[#94a3b8]">Update fulfillment</p>
                    <div className="flex flex-wrap gap-2">
                      {nextStatuses.map((st) => (
                        <Button
                          key={st}
                          size="sm"
                          variant="outline"
                          disabled={actionLoading}
                          onClick={() => void patchStatus(selected.id, st)}
                        >
                          <Truck className="mr-1 h-3.5 w-3.5" />
                          {formatOrderStatusLabel(st)}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-2 pt-2 border-t border-[#e2e8f0]">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={actionLoading}
                    onClick={() => void resendConfirmation(selected.id)}
                  >
                    <Mail className="mr-1 h-3.5 w-3.5" />
                    Resend email
                  </Button>
                  {!["cancelled", "delivered", "failed"].includes(
                    selected.orderStatus,
                  ) && selected.orderStatus !== "cancellation_requested" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200"
                      disabled={actionLoading}
                      onClick={() => void adminCancel(selected.id)}
                    >
                      <XCircle className="mr-1 h-3.5 w-3.5" />
                      Cancel order
                    </Button>
                  ) : null}
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent = "text-[#0f172a]",
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white p-4">
      <p className="text-[#64748b] text-sm mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${accent}`}>{value}</p>
    </div>
  );
}
