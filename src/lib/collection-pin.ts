import { escapeRegex } from "@/lib/utils";
import Product from "@/models/Product";
import type { Types } from "mongoose";

/** Pin this product first in its collection; clear other pins in the same collection. */
export async function applyCollectionPin(opts: {
  productId?: string | Types.ObjectId;
  category: string;
  pin: boolean;
}): Promise<{ pinToCollection: boolean; collectionPinAt: Date | null }> {
  if (!opts.pin) {
    return { pinToCollection: false, collectionPinAt: null };
  }

  const category = opts.category.trim();
  if (category) {
    const exact = new RegExp(`^${escapeRegex(category)}$`, "i");
    const filter: Record<string, unknown> = {
      pinToCollection: true,
      $or: [{ category: exact }, { subCategory: exact }],
    };
    if (opts.productId) {
      filter._id = { $ne: opts.productId };
    }
    await Product.updateMany(filter, {
      $set: { pinToCollection: false, collectionPinAt: null },
    });
  }

  return { pinToCollection: true, collectionPinAt: new Date() };
}
