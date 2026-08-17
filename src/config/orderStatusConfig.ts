export type OrderStatus =
  | "created"
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

export const ORDER_STATUSES: OrderStatus[] = [
  "created",
  "pending_payment",
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancellation_requested",
  "cancelled",
  "failed",
];

const STATUS_TRANSITIONS: Record<string, OrderStatus[]> = {
  confirmed: ["shipped", "processing"],
  processing: ["shipped"],
  shipped: ["out_for_delivery", "delivered"],
  out_for_delivery: ["delivered"],
};

export function canTransitionStatus(
  from: string,
  to: OrderStatus,
): boolean {
  const normalized = from === "pending" ? "confirmed" : from;
  const locked = [
    "delivered",
    "cancelled",
    "failed",
    "cancellation_requested",
    "pending_payment",
    "created",
  ];
  if (locked.includes(normalized)) return false;
  const allowed = STATUS_TRANSITIONS[normalized];
  return allowed?.includes(to) ?? false;
}

export const STATUS_NOTIFY_TYPES: Record<
  string,
  | "order_shipped"
  | "order_out_for_delivery"
  | "order_delivered"
> = {
  shipped: "order_shipped",
  out_for_delivery: "order_out_for_delivery",
  delivered: "order_delivered",
};
