"use client";

import { useDisplayPrice } from "@/hooks/useDisplayPrice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  removeItem,
  setCartOpen,
  updateQty,
} from "@/store/slices/cartSlice";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";

function cartLineKey(item: {
  _id: string;
  selectedColor?: string;
  selectedSize?: string;
}) {
  return `${item._id}|${item.selectedColor ?? ""}|${item.selectedSize ?? ""}`;
}

export default function CartDrawer() {
  const dispatch = useAppDispatch();
  const { format: displayPrice } = useDisplayPrice();
  const items = useAppSelector((s) => s.cart.items);
  const open = useAppSelector((s) => s.cart.open);
  const panelId = useId();
  const [layerMounted, setLayerMounted] = useState(false);
  const [layerVisible, setLayerVisible] = useState(false);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const subtotalInr = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  useEffect(() => {
    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
    if (open) {
      setLayerMounted(true);
      const id = requestAnimationFrame(() =>
        requestAnimationFrame(() => setLayerVisible(true)),
      );
      return () => cancelAnimationFrame(id);
    }
    setLayerVisible(false);
    exitTimerRef.current = setTimeout(() => {
      setLayerMounted(false);
      exitTimerRef.current = null;
    }, 200);
    return () => {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open || !layerMounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, layerMounted]);

  const close = useCallback(() => {
    dispatch(setCartOpen(false));
  }, [dispatch]);

  useEffect(() => {
    if (!open || !layerMounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, layerMounted, close]);

  if (!layerMounted) return null;

  return (
    <div className="fixed inset-0 z-[103] isolate" aria-hidden={!layerVisible}>
      <button
        type="button"
        aria-label="Close cart"
        className="absolute inset-0 border-0 bg-[#070b14]/45 p-0 transition-opacity ease-out"
        style={{
          opacity: layerVisible ? 1 : 0,
          transitionDuration: "160ms",
        }}
        onClick={close}
      />
      <aside
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        className="pointer-events-auto absolute right-0 top-0 flex h-full max-h-[100dvh] w-full max-w-[420px] flex-col border-l border-[#1b2232]/10 bg-[#fafaf9] shadow-[-16px_0_48px_-12px_rgba(15,23,42,0.18)]"
        style={{
          transform: layerVisible ? "translate3d(0,0,0)" : "translate3d(100%,0,0)",
          transitionProperty: "transform",
          transitionDuration: "220ms",
          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#b8956c]/45 to-transparent" />

        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-[#1b2232]/10 bg-gradient-to-b from-white to-transparent px-6 pb-4 pt-5">
          <div>
            <p
              id="cart-drawer-title"
              className="m-0 font-[family-name:var(--font-montserrat)] text-[10px] font-medium tracking-[0.28em] text-[#7da8c7] uppercase"
            >
              Your selection
            </p>
            <p className="m-0 mt-1.5 font-[family-name:var(--font-playfair)] text-[1.5rem] font-normal tracking-tight text-[#0f172a]">
              Your cart
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="rounded-full border border-transparent bg-white/90 p-2 text-[#64748b] shadow-sm transition-colors hover:border-[#1b2232]/10 hover:text-[#0f172a] cursor-pointer"
            aria-label="Close cart"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#1b2232]/10 bg-white text-[#7da8c7] shadow-sm">
                <ShoppingBag className="h-7 w-7" strokeWidth={1.25} />
              </div>
              <p className="m-0 font-[family-name:var(--font-playfair)] text-xl text-[#0f172a]">
                Your cart is empty
              </p>
              <p className="m-0 mt-2 max-w-[260px] font-[family-name:var(--font-montserrat)] text-[13px] font-light leading-relaxed text-[#64748b]">
                Explore bespoke pieces in our collection and add what speaks to
                you.
              </p>
              <Link
                href="/collection"
                onClick={close}
                className="mt-8 inline-flex border border-[#0f172a] bg-[#0f172a] px-8 py-3 font-[family-name:var(--font-montserrat)] text-[11px] font-medium tracking-[0.2em] text-white uppercase no-underline transition-colors hover:border-[#7da8c7] hover:bg-[#7da8c7]"
              >
                Browse collection
              </Link>
            </div>
          ) : (
            <ul className="m-0 list-none space-y-4 p-0">
              {items.map((item) => {
                const key = cartLineKey(item);
                return (
                  <li
                    key={key}
                    className="overflow-hidden rounded-sm border border-[#1b2232]/10 bg-white shadow-sm"
                  >
                    <div className="flex gap-3 p-3 sm:gap-4 sm:p-4">
                      <Link
                        href={`/collection/${encodeURIComponent(item.slug)}`}
                        onClick={close}
                        className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-sm border border-[#e2e8f0] bg-[#f8fafc] no-underline"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image?.url ?? "/logo_zenmen.png"}
                          alt={item.image?.alt ?? item.title}
                          className="h-full w-full object-cover"
                        />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/collection/${encodeURIComponent(item.slug)}`}
                          onClick={close}
                          className="font-[family-name:var(--font-montserrat)] text-[14px] font-medium leading-snug text-[#0f172a] no-underline hover:text-[#7da8c7]"
                        >
                          {item.title}
                        </Link>
                        <p className="m-0 mt-1 font-[family-name:var(--font-montserrat)] text-[11px] font-light tracking-wide text-[#64748b]">
                          {[item.selectedColor, item.selectedSize]
                            .filter(Boolean)
                            .join(" · ") || "Standard"}
                        </p>
                        <p className="m-0 mt-2 font-[family-name:var(--font-montserrat)] text-[13px] text-[#0f172a]">
                          {displayPrice(item.price)}
                          <span className="text-[#94a3b8]"> × </span>
                          <span className="tabular-nums">{item.qty}</span>
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <div className="inline-flex items-center border border-[#1b2232]/12 bg-[#f8fafc]">
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              className="flex h-8 w-8 items-center justify-center border-0 bg-transparent text-[#0f172a] transition-colors hover:bg-[#e2e8f0] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                              disabled={item.qty <= 1}
                              onClick={() =>
                                dispatch(
                                  updateQty({
                                    _id: item._id,
                                    selectedColor: item.selectedColor,
                                    selectedSize: item.selectedSize,
                                    qty: item.qty - 1,
                                  }),
                                )
                              }
                            >
                              <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
                            </button>
                            <span className="min-w-[2rem] text-center font-[family-name:var(--font-montserrat)] text-[12px] tabular-nums text-[#0f172a]">
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              aria-label="Increase quantity"
                              className="flex h-8 w-8 items-center justify-center border-0 bg-transparent text-[#0f172a] transition-colors hover:bg-[#e2e8f0] cursor-pointer"
                              onClick={() =>
                                dispatch(
                                  updateQty({
                                    _id: item._id,
                                    selectedColor: item.selectedColor,
                                    selectedSize: item.selectedSize,
                                    qty: item.qty + 1,
                                  }),
                                )
                              }
                            >
                              <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
                            </button>
                          </div>
                          <button
                            type="button"
                            aria-label={`Remove ${item.title} from cart`}
                            className="inline-flex items-center gap-1.5 border-0 bg-transparent px-2 py-1 font-[family-name:var(--font-montserrat)] text-[10px] font-medium tracking-[0.15em] text-[#94a3b8] uppercase transition-colors hover:text-[#b45309] cursor-pointer"
                            onClick={() =>
                              dispatch(
                                removeItem({
                                  _id: item._id,
                                  selectedColor: item.selectedColor,
                                  selectedSize: item.selectedSize,
                                }),
                              )
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="shrink-0 border-t border-[#1b2232]/10 bg-white/95 px-6 py-5">
            <div className="mb-4 flex items-end justify-between gap-4">
              <span className="font-[family-name:var(--font-montserrat)] text-[10px] font-medium tracking-[0.22em] text-[#64748b] uppercase">
                Subtotal
              </span>
              <span className="font-[family-name:var(--font-playfair)] text-2xl font-normal text-[#0f172a] tabular-nums">
                {displayPrice(subtotalInr)}
              </span>
            </div>
            <p className="m-0 mb-4 font-[family-name:var(--font-montserrat)] text-[11px] font-light leading-relaxed text-[#64748b]">
              Shipping and final tailoring details are confirmed with our
              atelier after order.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/collection"
                onClick={close}
                className="flex flex-1 items-center justify-center border border-[#1b2232]/15 bg-white py-3.5 text-center font-[family-name:var(--font-montserrat)] text-[10px] font-medium tracking-[0.2em] text-[#0f172a] uppercase no-underline transition-colors hover:border-[#7da8c7] hover:bg-[#7da8c7]/5"
              >
                Continue shopping
              </Link>
              <Link
                href="/checkout"
                onClick={close}
                className="flex flex-1 items-center justify-center border-0 bg-[#0f172a] py-3.5 text-center font-[family-name:var(--font-montserrat)] text-[10px] font-medium tracking-[0.2em] text-white uppercase no-underline transition-colors hover:bg-[#7da8c7]"
              >
                Checkout
              </Link>
            </div>
          </footer>
        )}
      </aside>
    </div>
  );
}
