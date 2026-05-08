import DashboardLayout from "@/app/components/adminComponents/dashboard/Layout";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
