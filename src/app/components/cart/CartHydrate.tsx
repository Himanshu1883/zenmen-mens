"use client";

import { loadCartFromStorage, saveCartToStorage } from "@/lib/cart-storage";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCartHydrated, setCartItems } from "@/store/slices/cartSlice";
import { useEffect, useRef } from "react";

/** Restores cart from localStorage and keeps it in sync across reloads / auth redirects. */
export default function CartHydrate() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.cart.items);
  const hydrated = useAppSelector((s) => s.cart.hydrated);
  const skipNextSave = useRef(true);

  useEffect(() => {
    const stored = loadCartFromStorage();
    if (stored.length > 0) {
      dispatch(setCartItems(stored));
    }
    dispatch(setCartHydrated(true));
  }, [dispatch]);

  useEffect(() => {
    if (!hydrated) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    saveCartToStorage(items);
  }, [items, hydrated]);

  return null;
}
