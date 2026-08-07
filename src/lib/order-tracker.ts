import {
  formatOrderDateTime,
  type OrderStatusDisplay,
} from "@/lib/order-display";

export type StatusHistoryEntry = {
  status: string;
  changedAt: string;
  note?: string;
};

export type TrackerStep = {
  id: string;
  label: string;
  /** Statuses that mean this step is reached */
  reachedBy: string[];
  description: string;
};

/** Amazon / Flipkart style fulfillment rail */
export const FULFILLMENT_STEPS: TrackerStep[] = [
  {
    id: "ordered",
    label: "Ordered",
    reachedBy: [
      "pending_payment",
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "out_for_delivery",
      "delivered",
    ],
    description: "We received your order",
  },
  {
    id: "confirmed",
    label: "Confirmed",
    reachedBy: [
      "confirmed",
      "processing",
      "shipped",
      "out_for_delivery",
      "delivered",
    ],
    description: "Payment verified · order confirmed",
  },
  {
    id: "processing",
    label: "Packed",
    reachedBy: ["processing", "shipped", "out_for_delivery", "delivered"],
    description: "Being prepared in our atelier",
  },
  {
    id: "shipped",
    label: "Shipped",
    reachedBy: ["shipped", "out_for_delivery", "delivered"],
    description: "On the way to your city",
  },
  {
    id: "out_for_delivery",
    label: "Out for delivery",
    reachedBy: ["out_for_delivery", "delivered"],
    description: "Courier is delivering today",
  },
  {
    id: "delivered",
    label: "Delivered",
    reachedBy: ["delivered"],
    description: "Order completed",
  },
];

const TERMINAL_BAD: Set<string> = new Set([
  "cancelled",
  "failed",
  "cancellation_requested",
]);

export function isTerminalBadStatus(status: string) {
  return TERMINAL_BAD.has(status);
}

export function currentStepIndex(orderStatus: string): number {
  if (isTerminalBadStatus(orderStatus)) return -1;
  let idx = 0;
  FULFILLMENT_STEPS.forEach((step, i) => {
    if (step.reachedBy.includes(orderStatus)) idx = i;
  });
  return idx;
}

function historyTimeForStatuses(
  history: StatusHistoryEntry[],
  statuses: string[],
): string | null {
  const set = new Set(statuses);
  let latest: string | null = null;
  for (const h of history) {
    if (set.has(h.status) && h.changedAt) {
      if (!latest || new Date(h.changedAt) > new Date(latest)) {
        latest = h.changedAt;
      }
    }
  }
  return latest;
}

export type ResolvedTrackerStep = TrackerStep & {
  state: "complete" | "current" | "upcoming" | "cancelled";
  at: string | null;
  atLabel: string;
};

export function buildOrderTracker(input: {
  orderStatus: string;
  createdAt: string;
  statusHistory?: StatusHistoryEntry[];
}): {
  variant: "progress" | "cancelled" | "failed" | "cancel_requested";
  headline: string;
  steps: ResolvedTrackerStep[];
} {
  const status = input.orderStatus as OrderStatusDisplay;
  const history = input.statusHistory ?? [];

  if (status === "cancellation_requested") {
    return {
      variant: "cancel_requested",
      headline: "Cancellation requested — under review",
      steps: [],
    };
  }
  if (status === "cancelled") {
    const at =
      historyTimeForStatuses(history, ["cancelled"]) ?? input.createdAt;
    return {
      variant: "cancelled",
      headline: `Cancelled · ${formatOrderDateTime(at)}`,
      steps: [],
    };
  }
  if (status === "failed") {
    return {
      variant: "failed",
      headline: "Order failed",
      steps: [],
    };
  }

  const current = currentStepIndex(status);
  const steps: ResolvedTrackerStep[] = FULFILLMENT_STEPS.map((step, i) => {
    let at: string | null = null;
    if (step.id === "ordered") {
      at = input.createdAt;
    } else {
      at = historyTimeForStatuses(history, [step.id]);
      // Fallback: if we've reached this step but history missing, use latest prior
      if (!at && i <= current) {
        at = historyTimeForStatuses(history, step.reachedBy) ?? null;
      }
    }

    let state: ResolvedTrackerStep["state"] = "upcoming";
    if (i < current) state = "complete";
    else if (i === current) state = "current";

    return {
      ...step,
      state,
      at,
      atLabel: at ? formatOrderDateTime(at) : i <= current ? "—" : "Pending",
    };
  });

  const currentStep = steps[current];
  return {
    variant: "progress",
    headline: currentStep
      ? `${currentStep.label} · ${currentStep.description}`
      : "Order in progress",
    steps,
  };
}

export function paymentBadgeMeta(paymentStatus: string): {
  label: string;
  tone: "paid" | "pending" | "failed" | "refunded";
} {
  const s = paymentStatus.toLowerCase();
  if (s === "paid") return { label: "Paid", tone: "paid" };
  if (s === "failed") return { label: "Payment failed", tone: "failed" };
  if (s === "refunded" || s === "partially_refunded") {
    return { label: "Refunded", tone: "refunded" };
  }
  return { label: "Payment pending", tone: "pending" };
}
