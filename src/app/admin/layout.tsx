// src/app/admin/layout.tsx
import { authOptions } from "@/lib/auth";
import DashboardLayout from "@/app/components/adminComponents/dashboard/Layout";
import { getServerSession } from "next-auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  const role = (session.user as { role?: string })?.role;
  if (role !== "admin") {
    redirect("/");
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
