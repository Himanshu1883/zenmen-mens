import { LOW_STOCK_THRESHOLD } from "@/config/inventoryConfig";

export type StockAvailability = "in" | "low" | "out";

export function productStockAvailability(
  stock: number,
  isAvailable: boolean | undefined,
): StockAvailability {
  const qty = Math.max(0, Number(stock) || 0);
  if (isAvailable === false || qty <= 0) return "out";
  if (qty <= LOW_STOCK_THRESHOLD) return "low";
  return "in";
}

export function availabilityForStock(stock: number): boolean {
  return Math.max(0, Number(stock) || 0) > 0;
}

export function stockStatusMongoFilter(
  status: string,
): Record<string, unknown> | null {
  if (status === "in") {
    return {
      isAvailable: { $ne: false },
      stock: { $gt: LOW_STOCK_THRESHOLD },
    };
  }
  if (status === "low") {
    return {
      isAvailable: { $ne: false },
      stock: { $gte: 1, $lte: LOW_STOCK_THRESHOLD },
    };
  }
  if (status === "out") {
    return {
      $or: [{ isAvailable: false }, { stock: { $lte: 0 } }],
    };
  }
  return null;
}
