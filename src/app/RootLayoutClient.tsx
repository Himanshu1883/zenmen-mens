"use client";

import { usePathname } from "next/navigation";
import Footer from "@/app/components/layout/Footer";

export default function RootLayoutClient() {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");

  if (isAdminPage) {
    return null;
  }

  return <Footer />;
}
