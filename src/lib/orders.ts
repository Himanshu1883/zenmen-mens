import { COD_FEE_INR, type CartLineInput } from "@/lib/validations/checkout.schema";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import mongoose from "mongoose";

export type ResolvedOrderItem = {
  productId: string;
  title: string;
  slug: string;
  price: number;
  qty: number;
  selectedColor?: string;
  selectedSize?: string;
  imageUrl: string;
};

export function generateOrderNumber(): string {
  const part = Date.now().toString(36).toUpperCase().slice(-6);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `ZEN-${part}${rand}`;
}

export async function resolveCartItems(
  rawItems: CartLineInput[],
): Promise<ResolvedOrderItem[]> {
  await connectDB();
  const resolved: ResolvedOrderItem[] = [];

  for (const raw of rawItems) {
    if (!mongoose.Types.ObjectId.isValid(raw._id)) {
      throw new Error(`Invalid product: ${raw.title}`);
    }

    const product = await Product.findById(raw._id).lean();
    if (!product) {
      throw new Error(`Product not found: ${raw.title}`);
    }
    if (product.isAvailable === false) {
      throw new Error(`${product.title} is currently unavailable`);
    }

    const qty = Math.min(10, Math.max(1, Math.floor(raw.qty)));
    const primary =
      product.images?.find((img: { isPrimary?: boolean }) => img.isPrimary) ??
      product.images?.[0];

    resolved.push({
      productId: String(product._id),
      title: product.title,
      slug: product.slug,
      price: product.price,
      qty,
      selectedColor: raw.selectedColor,
      selectedSize: raw.selectedSize,
      imageUrl: primary?.url ?? raw.image?.url ?? "",
    });
  }

  return resolved;
}

export function calcOrderTotals(
  items: ResolvedOrderItem[],
  paymentMethod: "cod" | "online",
) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const codFee = paymentMethod === "cod" ? COD_FEE_INR : 0;
  const total = subtotal + codFee;
  return { subtotal, codFee, total };
}

export function amountToPaise(totalInr: number): number {
  return Math.round(totalInr * 100);
}
