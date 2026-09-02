import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stories",
  description:
    "Client stories and testimonials from ZENmen bespoke tailoring in New Delhi.",
  alternates: { canonical: "/stories" },
};

export default function StoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
