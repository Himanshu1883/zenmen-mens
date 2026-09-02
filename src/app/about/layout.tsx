import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "The ZENmen atelier in New Delhi — founded in 2021 for modern Indian men who want world-class bespoke tailoring.",
  alternates: { canonical: "/about" },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
