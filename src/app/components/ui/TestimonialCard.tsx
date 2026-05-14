export type TestimonialCardData = {
  id?: number;
  text: string;
  initials: string;
  author: string;
  title: string;
};

export default function TestimonialCard({ t }: { t: TestimonialCardData }) {
  return (
    <article className="group flex h-full flex-col rounded-md border border-[#e2e8f0] bg-white p-7 shadow-[0_1px_0_rgba(15,23,42,0.04)] transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-[#7da8c7]/40 hover:shadow-[0_20px_48px_-24px_rgba(125,168,199,0.22)] sm:p-8">
      <span
        className="font-[family-name:var(--font-playfair)] text-[3.5rem] font-light leading-none text-[#7da8c7]/25 transition-colors group-hover:text-[#7da8c7]/35"
        aria-hidden
      >
        &ldquo;
      </span>

      <p className="mt-1 flex-1 font-[family-name:var(--font-cormorant)] text-[1.05rem] font-normal italic leading-[1.75] text-[#334155] sm:text-lg">
        {t.text}
      </p>

      <div className="mt-8 flex items-center gap-4 border-t border-[#f1f5f9] pt-6">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#dbe4ef] bg-[#f0f6fb] font-[family-name:var(--font-montserrat)] text-[11px] font-semibold tracking-wide text-[#7da8c7]"
          aria-hidden
        >
          {t.initials}
        </div>
        <div className="min-w-0">
          <p className="truncate font-[family-name:var(--font-montserrat)] text-[0.8125rem] font-medium text-[#0f172a]">
            {t.author}
          </p>
          <p className="mt-0.5 font-[family-name:var(--font-montserrat)] text-[10px] font-medium uppercase tracking-[0.16em] text-[#64748b]">
            {t.title}
          </p>
        </div>
      </div>
    </article>
  );
}
