import { getPublicEmail } from "@/lib/auth-contact";

export type OrderStatusDisplay =
  | "pending_payment"
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancellation_requested"
  | "cancelled"
  | "failed";

export function displayOrderStatus(
  orderStatus?: string | null,
  status?: string | null,
): OrderStatusDisplay {
  const raw = orderStatus ?? status ?? "pending";
  return raw as OrderStatusDisplay;
}

export function formatOrderStatusLabel(status: string): string {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatInr(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatOrderDate(value?: Date | string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatOrderDateTime(value?: Date | string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export type SerializedOrderItem = {
  productId: string;
  title: string;
  slug: string;
  price: number;
  qty: number;
  selectedColor?: string;
  selectedSize?: string;
  imageUrl?: string;
};

export type SerializedStatusHistory = {
  status: string;
  changedAt: string;
  note?: string;
};

export type SerializedOrder = {
  id: string;
  orderNumber: string;
  userEmail: string;
  customerName: string;
  items: SerializedOrderItem[];
  itemSummary: string;
  subtotal: number;
  codFee: number;
  total: number;
  paymentMethod: "cod" | "online";
  paymentStatus: string;
  status: string;
  orderStatus: string;
  createdAt: string;
  shipping: {
    fullName: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country?: string;
  };
  statusHistory: SerializedStatusHistory[];
  cancellation?: {
    status?: string;
    reason?: string;
    note?: string;
    refundStatus?: string;
  };
};

export function serializeOrder(doc: Record<string, unknown>): SerializedOrder {
  const items = (doc.items as SerializedOrderItem[]) ?? [];
  const shipping = doc.shipping as SerializedOrder["shipping"];
  const first = items[0];
  const extra = items.length > 1 ? ` +${items.length - 1} more` : "";

  const rawEmail = String(doc.userEmail ?? shipping?.email ?? "");
  const publicEmail =
    getPublicEmail(rawEmail) ?? getPublicEmail(shipping?.email) ?? "";

  const historyRaw =
    (doc.statusHistory as Array<Record<string, unknown>>) ?? [];
  const statusHistory: SerializedStatusHistory[] = historyRaw
    .filter((h) => h && h.status)
    .map((h) => ({
      status: String(h.status),
      changedAt: h.changedAt
        ? new Date(h.changedAt as string | Date).toISOString()
        : new Date().toISOString(),
      note: h.note ? String(h.note).slice(0, 200) : undefined,
    }));

  const safeShipping = shipping
    ? {
        ...shipping,
        email: getPublicEmail(shipping.email) ?? shipping.email ?? "",
      }
    : shipping;

  const cancellation = doc.cancellation as
    | {
        status?: string;
        reason?: string;
        note?: string;
        refundStatus?: string;
      }
    | undefined;

  return {
    id: String(doc._id),
    orderNumber: String(doc.orderNumber ?? ""),
    userEmail: publicEmail,
    customerName: shipping?.fullName ?? "Customer",
    items,
    itemSummary: first ? `${first.title}${extra}` : "—",
    subtotal: Number(doc.subtotal ?? 0),
    codFee: Number(doc.codFee ?? 0),
    total: Number(doc.total ?? 0),
    paymentMethod: (doc.paymentMethod as "cod" | "online") ?? "online",
    paymentStatus: String(doc.paymentStatus ?? "pending"),
    status: String(doc.status ?? "pending"),
    orderStatus: String(doc.orderStatus ?? doc.status ?? "pending"),
    createdAt: doc.createdAt
      ? new Date(doc.createdAt as string | Date).toISOString()
      : new Date().toISOString(),
    shipping: safeShipping,
    statusHistory,
    cancellation: cancellation
      ? {
          status: cancellation.status,
          reason: cancellation.reason,
          note: cancellation.note,
          refundStatus: cancellation.refundStatus,
        }
      : undefined,
  };
}

export function adminStatusBadgeClass(status: string): string {
  if (status === "delivered") {
    return "border-green-500/50 text-green-700 bg-green-500/15";
  }
  if (status === "cancelled" || status === "failed") {
    return "border-red-500/50 text-red-700 bg-red-500/15";
  }
  if (
    status === "shipped" ||
    status === "out_for_delivery" ||
    status === "processing"
  ) {
    return "border-blue-500/50 text-blue-700 bg-blue-500/15";
  }
  if (status === "cancellation_requested") {
    return "border-orange-500/50 text-orange-700 bg-orange-500/15";
  }
  if (status === "pending_payment" || status === "pending") {
    return "border-yellow-500/50 text-yellow-700 bg-yellow-500/15";
  }
  return "border-[#7da8c7]/50 text-[#0f172a] bg-[#7da8c7]/15";
}

export const ADMIN_NEXT_STATUSES: Record<string, string[]> = {
  confirmed: ["shipped", "processing"],
  processing: ["shipped"],
  pending: ["shipped"],
  shipped: ["out_for_delivery", "delivered"],
  out_for_delivery: ["delivered"],
};
