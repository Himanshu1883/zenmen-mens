export const LAST_COMPLETED_ORDER_KEY = "zenmen_last_completed_order";

export type LastCompletedOrder = {
  orderNumber: string;
  method: string;
  at: number;
};

export function saveLastCompletedOrder(orderNumber: string, method: string) {
  if (typeof window === "undefined" || !orderNumber) return;
  try {
    const payload: LastCompletedOrder = {
      orderNumber,
      method,
      at: Date.now(),
    };
    sessionStorage.setItem(LAST_COMPLETED_ORDER_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota / private mode */
  }
}

export function readLastCompletedOrder(): LastCompletedOrder | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(LAST_COMPLETED_ORDER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LastCompletedOrder>;
    if (!parsed.orderNumber || typeof parsed.orderNumber !== "string") {
      return null;
    }
    return {
      orderNumber: parsed.orderNumber,
      method: typeof parsed.method === "string" ? parsed.method : "online",
      at: typeof parsed.at === "number" ? parsed.at : 0,
    };
  } catch {
    return null;
  }
}

export function completedOrderSuccessHref(order: LastCompletedOrder) {
  const params = new URLSearchParams({
    orderNumber: order.orderNumber,
    method: order.method || "online",
  });
  return `/checkout/success?${params.toString()}`;
}
