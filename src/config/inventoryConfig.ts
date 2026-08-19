/** Units at or below this (and above 0) count as low stock in admin inventory. */
export const LOW_STOCK_THRESHOLD = 5;

export const INVENTORY_REASONS = [
  "order_sold",
  "order_cancel_restock",
  "manual_set",
  "manual_adjust",
] as const;

export type InventoryReason = (typeof INVENTORY_REASONS)[number];
