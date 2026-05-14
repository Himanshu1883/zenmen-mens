"use client";

import { processSteps } from "@/app/data/process";

export default function Process() {
  return (
    <section
      id="process"
      className="relative border-t border-[#e2e8f0] bg-[#f8fafc] py-16 md:py-24"
      aria-labelledby="process-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_20%_0%,rgba(125,168,199,0.09),transparent_50%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#7da8c7]" />
            <p className="font-[family-name:var(--font-montserrat)] text-[10px] font-semibold uppercase tracking-[0.32em] text-[#7da8c7]">
              How it works
            </p>
          </div>
          <h2
            id="process-heading"
            className="mt-4 font-[family-name:var(--font-playfair)] text-[2.1rem] font-medium leading-[1.1] tracking-tight text-[#0f172a] sm:text-4xl md:text-[2.85rem]"
          >
            The ZENmen <em className="not-italic text-[#7da8c7]">experience</em>
          </h2>
          <p className="mt-4 font-[family-name:var(--font-cormorant)] text-[1.05rem] italic leading-relaxed text-[#64748b] sm:text-lg">
            Four deliberate steps. Zero noise — from first conversation to final
            delivery.
          </p>
        </div>

        {/* Horizontal track: scroll on small screens, grid on lg */}
        <div className="relative mt-12 md:mt-16">
          {/* Connector line — behind step badges, desktop only */}
          <div
            className="pointer-events-none absolute left-[6%] right-[6%] top-[27px] z-0 hidden h-[2px] rounded-full bg-gradient-to-r from-[#e2e8f0] via-[#7da8c7]/35 to-[#e2e8f0] lg:block"
            aria-hidden
          />

          <div
            className="relative z-10 flex max-md:gap-4 max-md:overflow-x-auto max-md:overflow-y-visible max-md:pb-2 max-md:pt-1 max-md:[-ms-overflow-style:none] max-md:[scrollbar-width:none] max-md:snap-x max-md:snap-mandatory max-md:scroll-pl-1 max-md:[&::-webkit-scrollbar]:hidden md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:pb-0 md:pt-0 lg:grid-cols-4 lg:gap-0"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {processSteps.map((step, index) => (
              <article
                key={step.id}
                className="flex max-md:w-[min(92vw,340px)] max-md:shrink-0 max-md:snap-start flex-col rounded-md border border-[#e2e8f0] bg-white p-6 shadow-[0_1px_0_rgba(15,23,42,0.04)] transition-[border-color,box-shadow,transform,background-color] duration-300 max-md:hover:-translate-y-0.5 max-md:hover:border-[#7da8c7]/40 max-md:hover:shadow-[0_16px_40px_-20px_rgba(125,168,199,0.2)] md:min-w-0 md:hover:border-[#7da8c7]/35 md:hover:shadow-[0_12px_32px_-18px_rgba(125,168,199,0.15)] lg:rounded-none lg:border-0 lg:border-r lg:border-[#e2e8f0] lg:bg-transparent lg:p-8 lg:shadow-none lg:last:border-r-0 lg:hover:bg-[#fafafa]/90 lg:hover:shadow-none"
              >
                <div className="relative z-10 mx-auto flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-[#7da8c7] bg-[#f8fafc] font-[family-name:var(--font-playfair)] text-lg font-medium text-[#0f172a] md:mx-0 lg:bg-white">
                  {step.num}
                </div>

                <span className="mt-4 block text-center font-[family-name:var(--font-montserrat)] text-[9px] font-semibold uppercase tracking-[0.26em] text-[#7da8c7] md:text-left">
                  Step {index + 1}
                </span>

                <h3 className="mt-2 text-center font-[family-name:var(--font-playfair)] text-xl font-medium leading-snug text-[#0f172a] sm:text-2xl md:text-left">
                  {step.title}
                </h3>

                <p className="mt-3 text-center font-[family-name:var(--font-montserrat)] text-[13px] font-light leading-[1.75] text-[#475569] md:text-left">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>

        {/* Mobile / tablet hint */}
        <p className="mt-3 text-center font-[family-name:var(--font-montserrat)] text-[10px] font-medium uppercase tracking-[0.2em] text-[#94a3b8] max-md:block md:hidden">
          Swipe for all steps
        </p>
      </div>
    </section>
  );
}
