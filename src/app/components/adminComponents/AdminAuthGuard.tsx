"use client";

import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data, status, update } = useSession();
  const role = data?.user?.role;
  const allowed = status === "authenticated" && role === "admin";

  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && role !== "admin")) {
      router.replace("/");
    }
  }, [status, role, router]);

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      void update().then((session) => {
        const nextRole = session?.user?.role;
        if (!session || nextRole !== "admin") {
          window.location.replace("/");
        }
      });
    };

    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [update]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <Loader2 className="h-8 w-8 animate-spin text-[#7da8c7]" />
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <Loader2 className="h-8 w-8 animate-spin text-[#7da8c7]" />
      </div>
    );
  }

  return <>{children}</>;
}
