// src/app/layout.tsx
import Navbar from "@/app/components/layout/Navbar";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Geist,
  Montserrat,
  Playfair_Display,
} from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import RootLayoutClient from "./RootLayoutClient";
import MobileBottomNav from "@/app/components/layout/MobileBottomNav";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

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

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const baseUrl = process.env.NEXTAUTH_URL ?? "https://zenmen.in";
const whatsappNumber = "919650753273";
const whatsappMessage =
  "Hi ZENmen, I'd like to book an appointment for bespoke tailoring.";
const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
  whatsappMessage,
)}`;

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "ZENmen — Bespoke Tailoring, New Delhi",
    template: "%s — ZENmen",
  },
  description:
    "Crafted for the Modern Gentleman. Bespoke suits, sherwanis, shirts and trousers from New Delhi.",
  keywords: [
    "bespoke tailoring",
    "custom suits",
    "Delhi tailor",
    "ZENmen",
    "sherwani",
    "kurta",
  ],
  openGraph: {
    siteName: "ZENmen Bespoke Tailoring",
    type: "website",
    locale: "en_IN",
    url: baseUrl,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ZENmen Bespoke Tailoring",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        cormorant.variable,
        montserrat.variable,
        geist.variable,
        playfair.variable,
      )}
    >
      <body>
        <Providers>
          <Navbar />
          <main>{children}</main>
          <MobileBottomNav />
          <RootLayoutClient whatsappLink={whatsappLink} />
        </Providers>
      </body>
    </html>
  );
}
