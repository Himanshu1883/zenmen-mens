"use client";

import { Banknote, Check, Lock, ShieldCheck, Truck } from "lucide-react";
import type { ReactNode } from "react";
import RazorpayLogo from "./RazorpayLogo";

export type CheckoutPaymentMethod = "online" | "cod";

type Props = {
  value: CheckoutPaymentMethod;
  onChange: (next: CheckoutPaymentMethod) => void;
  codFeeLabel: string;
};

function RadioMark({ selected }: { selected: boolean }) {
  return (
    <span
      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
        selected
          ? "border-[#0f172a] bg-[#0f172a]"
          : "border-[#cbd5e1] bg-white"
      }`}
      aria-hidden
    >
      {selected ? <Check className="h-3 w-3 text-white" strokeWidth={3} /> : null}
    </span>
  );
}

function MethodChip({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <span
      className="inline-flex h-8 min-w-[52px] items-center justify-center gap-1 border border-[#e2e8f0] bg-white px-2"
      title={label}
    >
      {children}
      <span className="sr-only">{label}</span>
    </span>
  );
}

function UpiMark() {
  return (
    <span className="font-['Jost'] text-[11px] font-bold tracking-[0.04em]">
      <span className="text-[#f97316]">U</span>
      <span className="text-[#16a34a]">P</span>
      <span className="text-[#2563eb]">I</span>
    </span>
  );
}

function VisaMark() {
  return (
    <span
      className="font-['Jost'] text-[12px] font-extrabold italic tracking-tight text-[#1a1f71]"
      style={{ fontStyle: "italic" }}
    >
      VISA
    </span>
  );
}

function MastercardMark() {
  return (
    <span className="relative inline-block h-4 w-[26px]" aria-hidden>
      <span className="absolute left-0 top-0 h-4 w-4 rounded-full bg-[#eb001b]" />
      <span className="absolute left-[10px] top-0 h-4 w-4 rounded-full bg-[#f79e1b] mix-blend-multiply" />
    </span>
  );
}

function RupayMark() {
  return (
    <span className="font-['Jost'] text-[10px] font-bold tracking-wide text-[#0b5cab]">
      RuPay
    </span>
  );
}

export default function PaymentMethodPicker({
  value,
  onChange,
  codFeeLabel,
}: Props) {
  const online = value === "online";
  const cod = value === "cod";

  return (
    <section className="rounded-sm border border-[#e2e8f0] bg-white p-6 shadow-sm md:p-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl text-[#0f172a]">Payment</h2>
          <p className="mt-1 text-sm text-[#64748b]">
            Choose how you want to pay for this order
          </p>
        </div>
        <span className="hidden items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-[#7da8c7] sm:inline-flex">
          <Lock className="h-3.5 w-3.5" />
          Encrypted
        </span>
      </div>

      <div role="radiogroup" aria-label="Payment method" className="space-y-3">
        <button
          type="button"
          role="radio"
          aria-checked={online}
          onClick={() => onChange("online")}
          className={`w-full rounded-sm border p-4 text-left transition-all sm:p-5 ${
            online
              ? "border-[#0f172a] bg-[#f8fafc] shadow-[inset_3px_0_0_0_#0f172a]"
              : "border-[#e2e8f0] bg-white hover:border-[#cbd5e1]"
          }`}
        >
          <div className="flex items-start gap-3">
            <RadioMark selected={online} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-['Jost'] text-sm font-semibold text-[#0f172a]">
                  Pay online
                </span>
                <span className="bg-[#0f172a] px-1.5 py-0.5 font-['Jost'] text-[9px] font-semibold uppercase tracking-[0.14em] text-white">
                  Recommended
                </span>
              </div>
              <p className="mt-1 text-[13px] leading-snug text-[#475569]">
                Instant confirmation · UPI, cards, netbanking &amp; wallets
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <MethodChip label="UPI">
                  <UpiMark />
                </MethodChip>
                <MethodChip label="Visa">
                  <VisaMark />
                </MethodChip>
                <MethodChip label="Mastercard">
                  <MastercardMark />
                </MethodChip>
                <MethodChip label="RuPay">
                  <RupayMark />
                </MethodChip>
                <MethodChip label="Netbanking">
                  <span className="font-['Jost'] text-[10px] font-semibold tracking-wide text-[#334155]">
                    NB
                  </span>
                </MethodChip>
                <MethodChip label="Wallets">
                  <span className="font-['Jost'] text-[10px] font-semibold tracking-wide text-[#334155]">
                    Wallet
                  </span>
                </MethodChip>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[#e2e8f0] pt-3">
                <RazorpayLogo className="h-6 w-[108px]" />
                <span className="text-[11px] text-[#94a3b8]">
                  GPay · PhonePe · Paytm · BHIM · Credit &amp; debit cards
                </span>
              </div>
              {online ? (
                <p className="mt-3 text-[12px] leading-relaxed text-[#64748b]">
                  You stay on ZENmen. Razorpay opens a secure popup — pay and
                  your order is confirmed immediately.
                </p>
              ) : null}
            </div>
          </div>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={cod}
          onClick={() => onChange("cod")}
          className={`w-full rounded-sm border p-4 text-left transition-all sm:p-5 ${
            cod
              ? "border-[#0f172a] bg-[#f8fafc] shadow-[inset_3px_0_0_0_#0f172a]"
              : "border-[#e2e8f0] bg-white hover:border-[#cbd5e1]"
          }`}
        >
          <div className="flex items-start gap-3">
            <RadioMark selected={cod} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Banknote className="h-4 w-4 text-[#7da8c7]" />
                  <span className="font-['Jost'] text-sm font-semibold text-[#0f172a]">
                    Cash on delivery
                  </span>
                </div>
                <span className="border border-[#e2e8f0] bg-white px-1.5 py-0.5 font-['Jost'] text-[10px] font-medium text-[#64748b]">
                  +{codFeeLabel} fee
                </span>
              </div>
              <p className="mt-1 text-[13px] leading-snug text-[#475569]">
                Pay cash when your order is delivered
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-[12px] text-[#64748b]">
                <span className="inline-flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-[#7da8c7]" />
                  Pay the courier
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#7da8c7]" />
                  Inspect on arrival
                </span>
              </div>
              {cod ? (
                <p className="mt-3 text-[12px] leading-relaxed text-[#64748b]">
                  A {codFeeLabel} handling fee is added to your total. Please
                  keep exact change ready.
                </p>
              ) : null}
            </div>
          </div>
        </button>
      </div>

      <p className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-[#94a3b8]">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#7da8c7]" />
        Payments are processed by Razorpay, an RBI-authorised payment
        aggregator. Card and UPI details never touch ZENmen servers.
      </p>
    </section>
  );
}
