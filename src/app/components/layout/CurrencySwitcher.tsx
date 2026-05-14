"use client";

import {
  CURRENCY_OPTIONS,
  CURRENCY_STORAGE_KEY,
  type CurrencyCode,
} from "@/lib/currency";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCurrency } from "@/store/slices/currencySlice";
import { IndianRupee } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type CurrencySwitcherProps = {
  /** Icon + dropdown (navbar) */
  mode?: "dropdown" | "inline";
  /** Called after a currency is chosen (e.g. close mobile drawer) */
  onSelect?: () => void;
};

export default function CurrencySwitcher({
  mode = "dropdown",
  onSelect,
}: CurrencySwitcherProps) {
  const dispatch = useAppDispatch();
  const active = useAppSelector((s) => s.currency.code);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || mode !== "dropdown") return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, mode]);

  const pick = (code: CurrencyCode) => {
    dispatch(setCurrency(code));
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, code);
    } catch {
      /* ignore */
    }
    setOpen(false);
    onSelect?.();
  };

  if (mode === "inline") {
    return (
      <div className="space-y-2">
        <p className="m-0 px-4 text-[10px] tracking-[0.22em] text-[#6b7280] uppercase">
          Currency
        </p>
        <div className="flex flex-wrap gap-2 px-4 pb-2">
          {CURRENCY_OPTIONS.map(({ code, label }) => (
            <button
              key={code}
              type="button"
              onClick={() => pick(code)}
              className={`rounded-sm border px-3 py-2 font-[family-name:var(--font-montserrat)] text-[10px] tracking-[0.12em] uppercase transition-colors cursor-pointer ${
                active === code
                  ? "border-[#7da8c7] bg-[#7da8c7]/10 text-[#0f172a]"
                  : "border-[#e2e8f0] bg-white text-[#64748b] hover:border-[#7da8c7]/50"
              }`}
            >
              {code}
            </button>
          ))}
        </div>
        <p className="m-0 px-4 pb-2 text-[9px] leading-snug text-[#94a3b8]">
          {CURRENCY_OPTIONS.find((o) => o.code === active)?.label}
        </p>
      </div>
    );
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change currency"
        onClick={() => setOpen((v) => !v)}
        className="bg-transparent border-0 text-[#0f172a] hover:text-[#7da8c7] transition-all duration-300 p-2 rounded-full hover:bg-[#f8fafc] cursor-pointer"
      >
        <IndianRupee className="w-5 h-5" strokeWidth={1.5} />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full z-[102] mt-2 min-w-[200px] rounded-sm border border-[#e2e8f0] bg-white py-1 shadow-lg"
          role="listbox"
          aria-label="Currency"
        >
          {CURRENCY_OPTIONS.map(({ code, label }) => (
            <button
              key={code}
              type="button"
              role="option"
              aria-selected={active === code}
              onClick={() => pick(code)}
              className={`flex w-full items-center justify-between border-0 bg-transparent px-4 py-2.5 text-left font-[family-name:var(--font-montserrat)] text-[11px] tracking-wide transition-colors cursor-pointer ${
                active === code
                  ? "bg-[#f8fafc] text-[#0f172a]"
                  : "text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a]"
              }`}
            >
              <span>{label}</span>
              <span className="text-[10px] tracking-[0.15em] text-[#94a3b8]">
                {code}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
