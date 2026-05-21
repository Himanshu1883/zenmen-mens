"use client";

import { usePathname } from "next/navigation";
import AiChatWidget from "@/app/components/chat/AiChatWidget";
import Footer from "@/app/components/layout/Footer";

type Props = {
  whatsappLink: string;
};

export default function RootLayoutClient({ whatsappLink }: Props) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");

  if (isAdminPage) {
    return null;
  }

  return (
    <>
      <Footer />
      <AiChatWidget />
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Book appointment on WhatsApp"
        className="fixed bottom-18 right-6 z-[90] hidden h-14 w-14 items-center justify-center rounded-full border border-[#1fa855] bg-[#25D366] text-white shadow-[0_14px_30px_-12px_rgba(37,211,102,0.75)] transition-transform duration-200 hover:scale-105 active:scale-95 md:inline-flex"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-7 w-7"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M20.52 3.48A11.85 11.85 0 0 0 12.06 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.16 1.6 5.98L0 24l6.3-1.65a11.86 11.86 0 0 0 5.76 1.47h.01c6.56 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.17-3.45-8.44Zm-8.46 18.33h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.74.98 1-3.64-.24-.37a9.9 9.9 0 0 1-1.53-5.29c0-5.46 4.44-9.9 9.91-9.9 2.64 0 5.12 1.03 6.98 2.89a9.82 9.82 0 0 1 2.92 7.01c0 5.46-4.44 9.9-9.9 9.9Zm5.43-7.42c-.3-.15-1.78-.88-2.06-.98-.27-.1-.47-.15-.67.15-.2.3-.77.98-.95 1.18-.17.2-.35.23-.65.08-.3-.15-1.27-.47-2.42-1.49-.89-.79-1.5-1.76-1.68-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.67-1.62-.92-2.23-.24-.58-.48-.5-.67-.51l-.57-.01c-.2 0-.52.08-.8.38-.27.3-1.05 1.03-1.05 2.5 0 1.48 1.08 2.9 1.23 3.1.15.2 2.12 3.24 5.14 4.54.72.31 1.29.49 1.73.63.73.23 1.4.2 1.92.12.59-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.17-1.43-.08-.13-.28-.2-.58-.35Z" />
        </svg>
      </a>
    </>
  );
}
