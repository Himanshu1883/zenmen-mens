// src/app/error.tsx
"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col items-center justify-center text-[#f7f2e8] px-6">
      <p className="text-[10px] tracking-[4px] uppercase text-[#c8a96e] mb-4">
        Error
      </p>
      <h2 className="font-heading text-4xl font-light mb-4">
        Something went wrong
      </h2>
      <p className="text-sm text-[rgba(247,242,232,0.5)] mb-8 text-center max-w-md">
        An unexpected error occurred. Our team has been notified.
      </p>
      <button
        onClick={reset}
        className="px-8 py-3 border border-[#c8a96e] text-[#c8a96e] text-[10px] tracking-[3px] uppercase hover:bg-[#c8a96e] hover:text-[#0a0e1a] transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
