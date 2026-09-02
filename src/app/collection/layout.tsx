import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Shop ZENmen collections: suits, shirts, Indo-Western, Jodhpuri, sherwanis, kurtas and accessories. Bespoke menswear from New Delhi.",
};

export default function CollectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
