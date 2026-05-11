// src/app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center text-[#f7f2e8] px-6">
      <p className="text-[10px] tracking-[4px] uppercase text-[#c8a96e] mb-4">
        404
      </p>
      <h1 className="font-['Cormorant_Garamond'] text-5xl font-light mb-4">
        Page Not Found
      </h1>
      <p className="text-sm text-[rgba(247,242,232,0.5)] mb-8">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="px-8 py-3 border border-[#c8a96e] text-[#c8a96e] text-[10px] tracking-[3px] uppercase hover:bg-[#c8a96e] hover:text-[#0a0e1a] transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}
