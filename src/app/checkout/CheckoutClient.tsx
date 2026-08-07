"use client";

import { useDisplayPrice } from "@/hooks/useDisplayPrice";
import { resolveAccountContact } from "@/lib/auth-contact";
import { COD_FEE_INR } from "@/lib/validations/checkout.schema";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearCart } from "@/store/slices/cartSlice";
import type { ShippingInput } from "@/lib/validations/checkout.schema";
import {
  ArrowLeft,
  Banknote,
  CreditCard,
  Loader2,
  Lock,
  MapPin,
  Package,
  ShieldCheck,
} from "lucide-react";
import { loadCartFromStorage, saveCartToStorage } from "@/lib/cart-storage";
import { setCartItems } from "@/store/slices/cartSlice";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import CheckoutAuthForm from "./CheckoutAuthForm";

type PaymentMethod = "cod" | "online";

const EMPTY_SHIPPING: ShippingInput = {
  fullName: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
};

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutClient() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: session, status } = useSession();
  const { format: displayPrice } = useDisplayPrice();
  const items = useAppSelector((s) => s.cart.items);
  const cartHydrated = useAppSelector((s) => s.cart.hydrated);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("online");
  const [shipping, setShipping] = useState<ShippingInput>(EMPTY_SHIPPING);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [defaultsLoaded, setDefaultsLoaded] = useState(false);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.qty, 0),
    [items],
  );
  const codFee = paymentMethod === "cod" ? COD_FEE_INR : 0;
  const total = subtotal + codFee;

  // Prefill from last successful order + profile (reorder UX)
  useEffect(() => {
    if (status !== "authenticated" || !session?.user || defaultsLoaded) return;

    let cancelled = false;

    async function loadDefaults() {
      try {
        const res = await fetch("/api/checkout/defaults", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          success?: boolean;
          shipping?: ShippingInput & { source?: string };
        };
        if (cancelled || !data.success || !data.shipping) return;

        const d = data.shipping;
        setShipping((prev) => ({
          fullName: prev.fullName || d.fullName || "",
          email: prev.email || d.email || "",
          phone: prev.phone || d.phone || "",
          addressLine1: prev.addressLine1 || d.addressLine1 || "",
          addressLine2: prev.addressLine2 || d.addressLine2 || "",
          city: prev.city || d.city || "",
          state: prev.state || d.state || "",
          pincode: prev.pincode || d.pincode || "",
          country: prev.country || d.country || "India",
        }));
      } catch {
        // Fall back to session contact only
        if (cancelled || !session?.user) return;
        const contact = resolveAccountContact({
          email: session.user.email,
          phone: session.user.phone,
        });
        setShipping((s) => ({
          ...s,
          email: s.email || contact.publicEmail || "",
          phone: s.phone || contact.phone || "",
          fullName: s.fullName || session.user?.name || "",
        }));
      } finally {
        if (!cancelled) setDefaultsLoaded(true);
      }
    }

    void loadDefaults();
    return () => {
      cancelled = true;
    };
  }, [status, session, defaultsLoaded]);

  useEffect(() => {
    if (!cartHydrated || items.length > 0) return;
    const stored = loadCartFromStorage();
    if (stored.length > 0) {
      dispatch(setCartItems(stored));
    }
  }, [cartHydrated, items.length, dispatch]);

  useEffect(() => {
    if (cartHydrated && items.length > 0) {
      saveCartToStorage(items);
    }
  }, [items, cartHydrated]);

  const updateShipping = useCallback(
    (field: keyof ShippingInput, value: string) => {
      setShipping((s) => ({ ...s, [field]: value }));
      setFieldErrors((e) => {
        const next = { ...e };
        delete next[field];
        return next;
      });
    },
    [],
  );

  const cartPayload = useMemo(
    () =>
      items.map((i) => ({
        _id: i._id,
        title: i.title,
        slug: i.slug,
        price: i.price,
        qty: i.qty,
        selectedColor: i.selectedColor,
        selectedSize: i.selectedSize,
        image: { url: i.image?.url },
      })),
    [items],
  );

  async function handleCodSubmit() {
    setSubmitting(true);
    setFieldErrors({});
    try {
      const res = await fetch("/api/orders/cod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartPayload,
          shipping,
          notes: notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not place order");
        return;
      }
      dispatch(clearCart());
      router.push(
        `/checkout/success?orderNumber=${encodeURIComponent(data.orderNumber)}&method=cod`,
      );
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleOnlineSubmit() {
    setSubmitting(true);
    setFieldErrors({});
    try {
      const scriptOk = await loadRazorpayScript();
      if (!scriptOk || !window.Razorpay) {
        toast.error("Payment gateway failed to load. Refresh and try again.");
        setSubmitting(false);
        return;
      }

      const createRes = await fetch("/api/orders/razorpay/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartPayload,
          shipping,
          notes: notes || undefined,
        }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) {
        toast.error(createData.error ?? "Could not start payment");
        setSubmitting(false);
        return;
      }

      const {
        orderId,
        orderNumber,
        razorpayOrderId,
        amount,
        currency,
        keyId,
      } = createData;

      const rzp = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        name: "ZENmen",
        description: `Order ${orderNumber}`,
        order_id: razorpayOrderId,
        prefill: {
          name: shipping.fullName,
          email: shipping.email,
          contact: shipping.phone,
        },
        notes: { orderNumber },
        theme: { color: "#0f172a" },
        handler: async (response) => {
          try {
            const verifyRes = await fetch("/api/orders/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              toast.error(verifyData.error ?? "Payment verification failed");
              return;
            }
            dispatch(clearCart());
            router.push(
              `/checkout/success?orderNumber=${encodeURIComponent(verifyData.orderNumber)}&method=online`,
            );
          } catch {
            toast.error("Payment verification failed. Contact support with your payment ID.");
          }
        },
        modal: {
          ondismiss: () => setSubmitting(false),
        },
      });

      rzp.on("payment.failed", (res) => {
        toast.error(res.error?.description ?? "Payment failed");
        setSubmitting(false);
      });

      rzp.open();
    } catch {
      toast.error("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    if (paymentMethod === "cod") {
      void handleCodSubmit();
    } else {
      void handleOnlineSubmit();
    }
  }

  if (status === "loading" || !cartHydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#f8fafc]">
        <Loader2 className="h-8 w-8 animate-spin text-[#7da8c7]" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    const guestItems =
      items.length > 0 ? items : loadCartFromStorage();
    const guestSubtotal = guestItems.reduce(
      (sum, i) => sum + i.price * i.qty,
      0,
    );

    return (
      <div className="min-h-screen bg-[#f8fafc] px-6 py-12 md:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <Lock className="mx-auto mb-4 h-10 w-10 text-[#7da8c7]" />
            <h1 className="font-heading text-3xl text-[#0f172a] md:text-4xl">
              Sign in to checkout
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm text-[#64748b]">
              Create an account or sign in to complete your order. Items in your
              bag stay saved on this device.
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start">
            <CheckoutAuthForm cartItems={guestItems} />

            <aside className="rounded-sm border border-[#e2e8f0] bg-white p-6 shadow-sm">
              <h2 className="font-heading text-xl text-[#0f172a]">
                Your bag
              </h2>
              <p className="mt-1 text-sm text-[#64748b]">
                {guestItems.length === 0
                  ? "No items yet"
                  : `${guestItems.length} item${guestItems.length === 1 ? "" : "s"}`}
              </p>
              <ul className="mt-6 max-h-[320px] space-y-4 overflow-y-auto">
                {guestItems.map((item) => (
                  <li
                    key={`${item._id}-${item.selectedColor}-${item.selectedSize}`}
                    className="flex gap-3 border-b border-[#f1f5f9] pb-4 last:border-0"
                  >
                    {item.image?.url ? (
                      <img
                        src={item.image.url}
                        alt={item.title}
                        className="h-16 w-14 shrink-0 rounded-sm border border-[#e2e8f0] object-cover"
                      />
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#0f172a]">
                        {item.title}
                      </p>
                      <p className="text-xs text-[#94a3b8]">
                        Qty {item.qty}
                        {item.selectedSize ? ` · ${item.selectedSize}` : ""}
                      </p>
                      <p className="mt-1 text-sm text-[#0f172a]">
                        {displayPrice(item.price * item.qty)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              {guestItems.length > 0 ? (
                <p className="mt-6 border-t border-[#e2e8f0] pt-4 text-right font-heading text-2xl text-[#0f172a]">
                  {displayPrice(guestSubtotal)}
                </p>
              ) : (
                <Link
                  href="/collection"
                  className="mt-6 inline-flex w-full items-center justify-center border border-[#7da8c7] bg-[#7da8c7] py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f172a] no-underline hover:bg-[#0f172a] hover:text-white"
                >
                  Shop collection
                </Link>
              )}
            </aside>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <Package className="mx-auto mb-6 h-10 w-10 text-[#7da8c7]" />
        <h1 className="font-heading text-3xl text-[#0f172a]">
          Your cart is empty
        </h1>
        <Link
          href="/collection"
          className="mt-8 inline-flex bg-[#0f172a] px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.2em] text-white no-underline hover:bg-[#7da8c7]"
        >
          Browse collection
        </Link>
      </div>
    );
  }

  const inputClass =
    "w-full border border-[#e2e8f0] bg-white px-4 py-3 font-['Jost'] text-sm text-[#0f172a] outline-none transition-shadow focus:border-[#7da8c7] focus:ring-2 focus:ring-[#7da8c7]/20";
  const labelClass =
    "mb-1.5 block font-['Jost'] text-[10px] font-medium uppercase tracking-[0.18em] text-[#64748b]";

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-16">
      <div className="border-b border-[#e2e8f0] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 md:px-10">
          <Link
            href="/collection"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-[#64748b] no-underline hover:text-[#0f172a]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to shop
          </Link>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#7da8c7]">
            <ShieldCheck className="h-4 w-4" />
            Secure checkout
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto grid max-w-6xl gap-10 px-6 py-10 md:px-10 lg:grid-cols-[1fr_380px]"
      >
        <div className="space-y-8">
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[0.3em] text-[#7da8c7]">
              Checkout
            </p>
            <h1 className="font-heading text-3xl font-semibold text-[#0f172a] md:text-4xl">
              Complete your order
            </h1>
            <p className="mt-2 text-sm text-[#64748b]">
              Signed in as{" "}
              {resolveAccountContact({
                email: session?.user?.email,
                phone: session?.user?.phone,
              }).displayContact}
            </p>
            {defaultsLoaded &&
            (shipping.addressLine1 || shipping.phone || shipping.email) ? (
              <p className="mt-1 text-xs text-[#94a3b8]">
                Delivery details prefilled from your profile
                {shipping.addressLine1 ? " / last order" : ""}.
              </p>
            ) : null}
          </div>

          <section className="rounded-sm border border-[#e2e8f0] bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-6 flex items-center gap-2 font-heading text-xl text-[#0f172a]">
              <MapPin className="h-5 w-5 text-[#7da8c7]" />
              Delivery details
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass}>Full name *</label>
                <input
                  className={inputClass}
                  value={shipping.fullName}
                  onChange={(e) => updateShipping("fullName", e.target.value)}
                  required
                  autoComplete="name"
                />
                {fieldErrors.fullName && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.fullName}</p>
                )}
              </div>
              <div>
                <label className={labelClass}>Email *</label>
                <input
                  type="email"
                  className={inputClass}
                  value={shipping.email}
                  onChange={(e) => updateShipping("email", e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label className={labelClass}>Mobile (10 digits) *</label>
                <input
                  type="tel"
                  className={inputClass}
                  value={shipping.phone}
                  onChange={(e) =>
                    updateShipping("phone", e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  required
                  placeholder="9876543210"
                  autoComplete="tel"
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Address line 1 *</label>
                <input
                  className={inputClass}
                  value={shipping.addressLine1}
                  onChange={(e) => updateShipping("addressLine1", e.target.value)}
                  required
                  autoComplete="street-address"
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Address line 2</label>
                <input
                  className={inputClass}
                  value={shipping.addressLine2 ?? ""}
                  onChange={(e) => updateShipping("addressLine2", e.target.value)}
                  autoComplete="address-line2"
                />
              </div>
              <div>
                <label className={labelClass}>City *</label>
                <input
                  className={inputClass}
                  value={shipping.city}
                  onChange={(e) => updateShipping("city", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>State *</label>
                <input
                  className={inputClass}
                  value={shipping.state}
                  onChange={(e) => updateShipping("state", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>PIN code *</label>
                <input
                  className={inputClass}
                  value={shipping.pincode}
                  onChange={(e) =>
                    updateShipping("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  required
                  placeholder="110024"
                />
              </div>
              <div>
                <label className={labelClass}>Country</label>
                <input
                  className={inputClass}
                  value={shipping.country}
                  onChange={(e) => updateShipping("country", e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Order notes (optional)</label>
                <textarea
                  className={`${inputClass} min-h-[88px] resize-y`}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Occasion, fitting preferences, delivery instructions…"
                />
              </div>
            </div>
          </section>

          <section className="rounded-sm border border-[#e2e8f0] bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-6 font-heading text-xl text-[#0f172a]">
              Payment method
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("online")}
                className={`flex flex-col items-start gap-2 rounded-sm border p-5 text-left transition-all ${
                  paymentMethod === "online"
                    ? "border-[#7da8c7] bg-[#f0f6fb] ring-1 ring-[#7da8c7]"
                    : "border-[#e2e8f0] bg-white hover:border-[#cbd5e1]"
                }`}
              >
                <CreditCard className="h-5 w-5 text-[#7da8c7]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#0f172a]">
                  Pay online
                </span>
                <span className="text-xs text-[#64748b]">
                  UPI, cards, netbanking via Razorpay (test mode)
                </span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("cod")}
                className={`flex flex-col items-start gap-2 rounded-sm border p-5 text-left transition-all ${
                  paymentMethod === "cod"
                    ? "border-[#7da8c7] bg-[#f0f6fb] ring-1 ring-[#7da8c7]"
                    : "border-[#e2e8f0] bg-white hover:border-[#cbd5e1]"
                }`}
              >
                <Banknote className="h-5 w-5 text-[#7da8c7]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#0f172a]">
                  Cash on delivery
                </span>
                <span className="text-xs text-[#64748b]">
                  +{displayPrice(COD_FEE_INR)} COD handling fee
                </span>
              </button>
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-sm border border-[#e2e8f0] bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-heading text-xl text-[#0f172a]">
              Order summary
            </h2>
            <ul className="mb-4 max-h-[280px] space-y-4 overflow-y-auto border-b border-[#e2e8f0] pb-4">
              {items.map((item) => (
                <li
                  key={`${item._id}-${item.selectedColor}-${item.selectedSize}`}
                  className="flex gap-3"
                >
                  <img
                    src={item.image?.url ?? "/new.jpg"}
                    alt=""
                    className="h-16 w-14 shrink-0 object-cover object-top"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#0f172a]">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-[#64748b]">
                      {[item.selectedColor, item.selectedSize]
                        .filter(Boolean)
                        .join(" · ")}{" "}
                      × {item.qty}
                    </p>
                    <p className="text-sm tabular-nums text-[#0f172a]">
                      {displayPrice(item.price * item.qty)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between text-[#64748b]">
                <dt>Subtotal</dt>
                <dd className="tabular-nums text-[#0f172a]">
                  {displayPrice(subtotal)}
                </dd>
              </div>
              {paymentMethod === "cod" && (
                <div className="flex justify-between text-[#64748b]">
                  <dt>COD fee</dt>
                  <dd className="tabular-nums text-[#0f172a]">
                    {displayPrice(codFee)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between border-t border-[#e2e8f0] pt-3 text-base font-medium text-[#0f172a]">
                <dt>Total</dt>
                <dd className="tabular-nums">{displayPrice(total)}</dd>
              </div>
            </dl>
            <button
              type="submit"
              disabled={submitting}
              className="mt-6 flex w-full items-center justify-center gap-2 bg-[#0f172a] py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#7da8c7] hover:text-[#0f172a] disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing…
                </>
              ) : paymentMethod === "cod" ? (
                "Place COD order"
              ) : (
                "Pay securely online"
              )}
            </button>
            <p className="mt-4 text-center text-[10px] leading-relaxed text-[#94a3b8]">
              By placing this order you agree to our tailoring timeline and
              return policy. Atelier will confirm fitting details after payment.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
