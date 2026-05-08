"use client";

import { store } from "@/app/store/store";
import { SessionProvider } from "next-auth/react";
import { Provider } from "react-redux";
import { Toaster } from "sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Provider store={store}>
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
