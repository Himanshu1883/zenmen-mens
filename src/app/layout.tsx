import JsonLd, {
  organizationJsonLd,
  websiteJsonLd,
} from "@/app/components/seo/JsonLd";
import Navbar from "@/app/components/layout/Navbar";
import MobileBottomNav from "@/app/components/layout/MobileBottomNav";
import { cn } from "@/lib/utils";
import {
  SITE_DESCRIPTION,
  SITE_LOGO_PATH,
  SITE_NAME,
  SITE_TAGLINE,
  absoluteUrl,
  siteUrl,
} from "@/lib/site";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import RootLayoutClient from "./RootLayoutClient";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const baseUrl = siteUrl();
const logoUrl = absoluteUrl(SITE_LOGO_PATH);
const whatsappNumber = "919650753273";
const whatsappMessage =
  "Hi ZENmen, I'd like to book an appointment for bespoke tailoring.";
const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
  whatsappMessage,
)}`;

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  applicationName: SITE_NAME,
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "ZENmen",
    "bespoke tailoring New Delhi",
    "custom suits Delhi",
    "sherwani",
    "Indo-Western",
    "jodhpuri",
    "bandhgala",
    "kurta",
    "wedding tuxedo",
    "Lajpat Nagar tailor",
  ],
  authors: [{ name: SITE_NAME, url: baseUrl }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "fashion",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: SITE_LOGO_PATH, type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: SITE_LOGO_PATH, type: "image/png" }],
    shortcut: SITE_LOGO_PATH,
  },
  openGraph: {
    siteName: `${SITE_NAME} Bespoke Tailoring`,
    type: "website",
    locale: "en_IN",
    url: baseUrl,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN" className={cn(inter.variable)}>
      <body>
        <JsonLd
          data={{
            "@graph": [
              organizationJsonLd(baseUrl, logoUrl),
              websiteJsonLd(baseUrl),
            ],
          }}
        />
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
