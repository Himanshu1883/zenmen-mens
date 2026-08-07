import type { Product } from "@/types/product";

export type DeliveryLeadUnit = "days" | "weeks" | "months";

export type DeliveryLeadFields = {
  deliveryLeadValue?: number;
  deliveryLeadUnit?: DeliveryLeadUnit;
  showDeliveryLead?: boolean;
};

function unitWord(unit: DeliveryLeadUnit, value: number): string {
  if (unit === "days") return value === 1 ? "day" : "days";
  if (unit === "weeks") return value === 1 ? "week" : "weeks";
  return value === 1 ? "month" : "months";
}

export function getDeliveryBadgeLabel(
  product: DeliveryLeadFields,
): string | null {
  if (product.showDeliveryLead === false) return null;
  const value = product.deliveryLeadValue;
  if (value == null || value <= 0 || Number.isNaN(value)) return null;
  const unit = product.deliveryLeadUnit ?? "days";
  return `Ready in ${value} ${unitWord(unit, value)}`;
}

export function getDeliverySummaryLine(product: DeliveryLeadFields): string | null {
  const badge = getDeliveryBadgeLabel(product);
  if (!badge) return null;
  return `${badge}. Timelines may vary for bespoke work — our team confirms on WhatsApp.`;
}

export function parseDeliveryLeadValue(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  if (Number.isNaN(n) || n < 0) return undefined;
  return Math.floor(n);
}
