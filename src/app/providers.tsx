"use client";

import { store } from "@/store/store";
import { SessionProvider } from "next-auth/react";
import { Provider } from "react-redux";
import { useEffect } from "react";
import { Toaster } from "sonner";
import "sonner/dist/styles.css";
import {
  CURRENCY_STORAGE_KEY,
  isCurrencyCode,
} from "@/lib/currency";
import { useAppDispatch } from "@/store/hooks";
import { setCurrency } from "@/store/slices/currencySlice";

function CurrencyHydrate() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (raw && isCurrencyCode(raw)) {
        dispatch(setCurrency(raw));
      }
    } catch {
      /* ignore */
    }
  }, [dispatch]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Provider store={store}>
        <CurrencyHydrate />
        {children}
        <Toaster
          position="bottom-right"
          richColors
          toastOptions={{
            style: {
              background: "#0f1628",
              color: "#f7f2e8",
              border: "1px solid rgba(200,169,110,0.35)",
            },
          }}
        />
      </Provider>
    </SessionProvider>
  );
}
