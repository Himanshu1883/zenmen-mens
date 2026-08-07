export const CANCEL_USER_WINDOW_MINUTES = Number(
  process.env.CANCEL_USER_WINDOW_MINUTES ?? 30,
);

export const CANCEL_REASONS = [
  "changed_mind",
  "ordered_by_mistake",
  "delivery_too_slow",
  "found_better_price",
  "other",
] as const;

export type CancelReason = (typeof CANCEL_REASONS)[number];

export const USER_INSTANT_CANCEL_STATUSES = ["created", "confirmed", "pending"] as const;
export const USER_REQUEST_CANCEL_STATUSES = ["created", "confirmed", "pending"] as const;
export const ADMIN_CANCEL_STATUSES = [
  "created",
  "confirmed",
  "pending",
  "cancellation_requested",
] as const;
export const NON_CANCELLABLE = [
  "cancelled",
  "delivered",
  "failed",
  "pending_payment",
] as const;
export const SHIPPED_BLOCK = ["shipped", "out_for_delivery"] as const;
