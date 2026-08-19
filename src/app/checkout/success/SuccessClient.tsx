"use client";

import {
  completedOrderSuccessHref,
  readLastCompletedOrder,
  saveLastCompletedOrder,
} from "@/lib/checkout-complete";
import { CheckCircle2, PartyPopper, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function SuccessClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber") ?? "";
  const method = searchParams.get("method") ?? "online";

  const isCod = method === "cod";

  useEffect(() => {
    if (orderNumber) {
      saveLastCompletedOrder(orderNumber, method);
      return;
    }
    const last = readLastCompletedOrder();
    if (last?.orderNumber) {
      router.replace(completedOrderSuccessHref(last));
      return;
    }
    router.replace("/profile");
  }, [orderNumber, method, router]);

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      const params = new URLSearchParams(window.location.search);
      const current = params.get("orderNumber");
      const last = readLastCompletedOrder();
      if (current) {
        window.history.replaceState(null, "", window.location.href);
        return;
      }
      window.location.replace(
        last?.orderNumber ? completedOrderSuccessHref(last) : "/profile",
      );
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  if (!orderNumber) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#f8fafc]">
        <p className="text-sm text-[#64748b]">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] px-6 py-20">
      <div className="mx-auto max-w-xl text-center">
        <div className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-[#f0f6fb]">
          <CheckCircle2 className="h-14 w-14 text-[#7da8c7]" strokeWidth={1.25} />
          <PartyPopper
            className="absolute -right-1 -top-1 h-8 w-8 text-[#0f172a] opacity-80"
            aria-hidden
          />
        </div>

        <p className="mb-3 text-[11px] uppercase tracking-[0.35em] text-[#7da8c7]">
          Hurray!
        </p>
        <h1 className="font-heading text-4xl font-semibold leading-tight text-[#0f172a] md:text-5xl">
          Your order is confirmed
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#64748b]">
          {isCod
            ? "Thank you for choosing cash on delivery. Our atelier will call you to confirm delivery and fitting."
            : "Payment received successfully. Our team will reach out shortly with tailoring and delivery details."}
        </p>

        <div className="mx-auto mt-10 inline-block rounded-sm border border-[#e2e8f0] bg-white px-8 py-5 shadow-sm">
          <p className="text-[10px] uppercase tracking-[0.22em] text-[#64748b]">
            Order ID
          </p>
          <p className="mt-2 font-heading text-2xl tracking-wide text-[#0f172a]">
            {orderNumber}
          </p>
        </div>

        <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/collection"
            className="inline-flex min-w-[200px] items-center justify-center gap-2 bg-[#0f172a] px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white no-underline transition-colors hover:bg-[#7da8c7] hover:text-[#0f172a]"
          >
            <ShoppingBag className="h-4 w-4" />
            Continue shopping
          </Link>
          <Link
            href="/appointment"
            className="inline-flex min-w-[200px] items-center justify-center border border-[#e2e8f0] bg-white px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0f172a] no-underline transition-colors hover:border-[#7da8c7]"
          >
            Book a fitting
          </Link>
        </div>

        <Link
          href="/profile"
          className="mt-6 inline-block text-[11px] uppercase tracking-[0.15em] text-[#7da8c7] no-underline hover:text-[#0f172a]"
        >
          View your profile
        </Link>
      </div>
    </div>
  );
}
