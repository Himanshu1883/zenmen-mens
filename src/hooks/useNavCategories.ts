"use client";

import {
  defaultNavGroupsFallback,
  flattenNavGroups,
} from "@/lib/categories";
import type { NavCategory, NavMenuGroup } from "@/types/category";
import { useEffect, useState } from "react";

export function useNavCategories() {
  const fallbackGroups = defaultNavGroupsFallback();
  const [groups, setGroups] = useState<NavMenuGroup[]>(fallbackGroups);
  const [categories, setCategories] = useState<NavCategory[]>(() =>
    flattenNavGroups(fallbackGroups),
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/categories?nav=1");
        if (!res.ok) return;
        const data = await res.json();
        const nextGroups = Array.isArray(data.groups)
          ? (data.groups as NavMenuGroup[])
          : [];
        if (!cancelled && nextGroups.length > 0) {
          setGroups(nextGroups);
          setCategories(flattenNavGroups(nextGroups));
        }
      } catch {
        /* keep fallback */
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { groups, categories, loaded };
}
