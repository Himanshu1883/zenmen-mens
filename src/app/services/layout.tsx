import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Bespoke tailoring services from ZENmen: suits, wedding wear, Indo-Western, and made-to-measure menswear in New Delhi.",
  alternates: { canonical: "/services" },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
