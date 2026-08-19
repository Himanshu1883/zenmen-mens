import Link from "next/link";
import type { ReactNode } from "react";

export type LegalSection = {
  title: string;
  body: ReactNode;
};

export default function LegalDocument({
  title,
  description,
  updated,
  sections,
}: {
  title: string;
  description: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <article className="border-t border-[#e2e8f0] bg-[#f8fafc]">
      <div className="mx-auto max-w-[760px] px-4 py-20 sm:px-8 md:px-12 md:py-28 lg:px-0">
        <div className="mb-10 flex items-center gap-4">
          <div className="h-px flex-1 bg-[#e2e8f0]" />
          <p className="text-[9px] uppercase tracking-[0.4em] text-[#94a3b8]">
            ZENmen · New Delhi
          </p>
          <div className="h-px flex-1 bg-[#e2e8f0]" />
        </div>

        <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-[#7da8c7]">
          Legal
        </p>
        <h1
          className="text-[#0f172a]"
          style={{
            fontFamily: "var(--heading-font-family)",
            fontSize: "clamp(32px, 5vw, 52px)",
            fontWeight: 400,
            lineHeight: 1.15,
          }}
        >
          {title}
        </h1>
        <p className="mt-5 max-w-[56ch] text-[15px] leading-relaxed text-[#64748b]">
          {description}
        </p>
        <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-[#94a3b8]">
          Last updated {updated}
        </p>

        <div className="mt-14 space-y-12">
          {sections.map((section) => (
            <section key={section.title}>
              <h2
                className="mb-4 text-[#0f172a]"
                style={{
                  fontFamily: "var(--heading-font-family)",
                  fontSize: "1.35rem",
                  fontWeight: 400,
                }}
              >
                {section.title}
              </h2>
              <div className="space-y-4 text-[14px] leading-[1.85] text-[#475569]">
                {section.body}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-16 border-t border-[#e2e8f0] pt-8 text-[13px] leading-relaxed text-[#64748b]">
          Questions? Visit{" "}
          <Link
            href="/contact"
            className="text-[#7da8c7] underline-offset-2 hover:underline"
          >
            Contact
          </Link>
          ,{" "}
          <Link
            href="/appointment"
            className="text-[#7da8c7] underline-offset-2 hover:underline"
          >
            book an appointment
          </Link>
          , or write on WhatsApp at{" "}
          <a
            href="https://wa.me/919650753273?text=Hi%20ZENmen%2C%20I%20have%20a%20question."
            className="text-[#7da8c7] underline-offset-2 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            +91 96507 53273
          </a>
          .
        </p>
      </div>
    </article>
  );
}
