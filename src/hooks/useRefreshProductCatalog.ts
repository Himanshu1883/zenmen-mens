"use client";

import { patchRecentlyViewedProduct } from "@/lib/recently-viewed";
import { useAppDispatch } from "@/store/hooks";
import { syncCartProductUpdate } from "@/store/slices/cartSlice";
import {
  fetchProducts,
  removeProduct,
  upsertProduct,
} from "@/store/slices/productSlice";
import type { Product } from "@/types/product";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

function normalizeProduct(raw: unknown): Product | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  if (!row._id && !row.slug) return null;
  return {
    ...(row as Product),
    _id: String(row._id ?? ""),
    slug: String(row.slug ?? ""),
  };
}

type RefreshOptions = {
  product?: unknown;
  previousSlug?: string;
  removedProductId?: string;
};

/**
 * After admin create/edit/delete, push changes everywhere:
 * Redux catalog, cart line items, recently viewed, and RSC cache.
 */
export function useRefreshProductCatalog() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  return useCallback(
    async (options: RefreshOptions = {}) => {
      const product = normalizeProduct(options.product);

      if (options.removedProductId) {
        dispatch(removeProduct(options.removedProductId));
      } else if (product) {
        dispatch(upsertProduct(product));
        dispatch(
          syncCartProductUpdate({
            _id: product._id,
            title: product.title,
            slug: product.slug,
            price: product.price,
          }),
        );
        patchRecentlyViewedProduct(product);
      }

      await dispatch(fetchProducts());
      router.refresh();
    },
    [dispatch, router],
  );
}
