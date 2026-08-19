// src/app/admin/layout.tsx
import { authOptions } from "@/lib/auth";
import DashboardLayout from "@/app/components/adminComponents/dashboard/Layout";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

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
