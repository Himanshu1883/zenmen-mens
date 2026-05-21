import type { AppDispatch } from "@/store/store";
import { addItem } from "@/store/slices/cartSlice";
import type { Product } from "@/types/product";
import { toast } from "sonner";

export function quickAddProductToCart(
  product: Product,
  dispatch: AppDispatch,
): void {
  if (product.isAvailable === false) {
    toast.error(`${product.title} is currently unavailable`);
    return;
  }

  const image =
    product.images?.find((img) => img.isPrimary) ?? product.images?.[0];

  dispatch(
    addItem({
      _id: product._id,
      title: product.title,
      slug: product.slug,
      price: product.price,
      image: image ?? { url: "", alt: product.title },
      selectedColor: product.colors?.[0],
      selectedSize: product.sizes?.[0],
      qty: 1,
    }),
  );

  toast.success(`${product.title} added to bag`);
}
