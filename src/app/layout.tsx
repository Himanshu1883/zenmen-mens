import Footer from "@/app/components/layout/Footer";
import Navbar from "@/app/components/layout/Navbar";
// import Cursor from "@/app/components/ui/Cursor";
import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat, Geist } from "next/font/google";
import "./globals.css";

import Providers from "./providers";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ZENmen — Bespoke Tailoring",
  description:
    "Crafted for the Modern Gentleman. Bespoke suits, shirts and trousers from New Delhi.",
  keywords: ["bespoke tailoring", "custom suits", "Delhi tailor", "ZENmen"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn(cormorant.variable, montserrat.variable, "font-sans", geist.variable)}>
      <body>
        <Providers>
          {" "}
          {/* 🔥 THIS WAS MISSING */}
          {/* <Cursor /> */}
          <Navbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
