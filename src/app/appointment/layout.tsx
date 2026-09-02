import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book an appointment",
  description:
    "Book an in-store or virtual appointment with ZENmen for bespoke tailoring in New Delhi.",
  alternates: { canonical: "/appointment" },
};

export default function AppointmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
