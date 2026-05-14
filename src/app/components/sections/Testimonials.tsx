import TestimonialCard from "@/app/components/ui/TestimonialCard";
import { testimonials } from "@/app/data/testimonials";

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="relative border-t border-[#e2e8f0] bg-[#f1f5f9] py-16 md:py-24"
      aria-labelledby="testimonials-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(125,168,199,0.08),transparent_55%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl text-center md:mx-0 md:max-w-none md:text-left">
          <div className="flex flex-col items-center gap-3 md:flex-row md:items-center">
            <span className="hidden h-px w-10 bg-gradient-to-r from-[#7da8c7] to-transparent md:block" />
            <p className="font-[family-name:var(--font-montserrat)] text-[10px] font-semibold uppercase tracking-[0.32em] text-[#7da8c7]">
              Client stories
            </p>
          </div>
          <h2
            id="testimonials-heading"
            className="mt-4 font-[family-name:var(--font-playfair)] text-[2.1rem] font-medium leading-[1.12] tracking-tight text-[#0f172a] sm:text-4xl md:text-[2.75rem]"
          >
            Words from our <em className="not-italic text-[#7da8c7]">gentlemen</em>
          </h2>
          <p className="mx-auto mt-4 max-w-lg font-[family-name:var(--font-cormorant)] text-base italic leading-relaxed text-[#64748b] md:mx-0">
            Bespoke clients on fit, fabric, and the ZENmen experience.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {testimonials.map((t) => (
            <TestimonialCard key={t.id} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
