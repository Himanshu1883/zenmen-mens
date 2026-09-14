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
  const _id = row._id != null ? String(row._id) : "";
  const slug = row.slug != null ? String(row.slug) : "";
  if (!_id && !slug) return null;
  if (typeof row.title !== "string") return null;
  if (typeof row.price !== "number") return null;
  if (!Array.isArray(row.images)) return null;

  const product = row as unknown as Product;
  return {
    ...product,
    _id: _id || product._id,
    slug: slug || product.slug,
    title: row.title,
    price: row.price,
    images: row.images as Product["images"],
    isAvailable:
      typeof row.isAvailable === "boolean" ? row.isAvailable : product.isAvailable,
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
