import SuccessClient from "./SuccessClient";
import { Suspense } from "react";

export const metadata = {
  title: "Order confirmed | ZENmen",
};

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center bg-[#f8fafc]">
          <p className="text-sm text-[#64748b]">Loading…</p>
        </div>
      }
    >
      <SuccessClient />
    </Suspense>
  );
}
