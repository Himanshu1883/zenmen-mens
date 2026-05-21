"use client";

import {
  getRecentlyViewed,
  type RecentlyViewedItem,
} from "@/lib/recently-viewed";
import { useAppSelector } from "@/store/hooks";
import type { Product } from "@/types/product";
import { useCallback, useEffect, useMemo, useState } from "react";
import ProductRecoSlider from "./ProductRecoSlider";

type Props = {
  excludeProductId: string;
};

function itemToProduct(
  item: RecentlyViewedItem,
  catalog: Product[],
): Product | null {
  const full = catalog.find((p) => p._id === item._id || p.slug === item.slug);
  if (full) return full;

  if (!item.imageUrl) return null;

  return {
    _id: item._id,
    title: item.title,
    slug: item.slug,
    price: item.price,
    category: item.category,
    images: [{ url: item.imageUrl, alt: item.title, isPrimary: true }],
    isAvailable: true,
  };
}

export default function RecentlyViewedCarousel({ excludeProductId }: Props) {
  const catalog = useAppSelector((s) => s.products.products);
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);
  const [ready, setReady] = useState(false);

  const load = useCallback(() => {
    setItems(
      getRecentlyViewed().filter((item) => item._id !== excludeProductId),
    );
    setReady(true);
  }, [excludeProductId]);

  useEffect(() => {
    load();
    const onUpdate = () => load();
    window.addEventListener("zenmen:recently-viewed", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("zenmen:recently-viewed", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [load]);

  const products = useMemo(
    () =>
      items
        .map((item) => itemToProduct(item, catalog))
        .filter((p): p is Product => p != null),
    [items, catalog],
  );

  if (!ready || products.length === 0) return null;

  return (
    <ProductRecoSlider
      title="You Recently Viewed"
      ariaLabel="You recently viewed"
      products={products}
    />
  );
}
