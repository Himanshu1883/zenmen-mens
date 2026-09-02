import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Visit ZENmen at E-39, Lajpat Nagar II, New Delhi, or write to us about a bespoke suit, sherwani, or appointment.",
  alternates: { canonical: "/contact" },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
