"use client";

import { ZenIcon } from "@/components/icons";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

const POPULAR = [
  "Bespoke suit",
  "Sherwani",
  "Kurta",
  "Indo-Western",
  "Formal shirt",
  "Wedding wear",
];

function primaryImage(p: Product) {
  const imgs = p.images ?? [];
  const primary = imgs.find((i) => i.isPrimary);
  return primary?.url ?? imgs[0]?.url ?? null;
}

function matchesQuery(p: Product, needle: string) {
  if (!needle) return false;
  const n = needle.toLowerCase();
  if (p.title.toLowerCase().includes(n)) return true;
  if (p.category?.toLowerCase().includes(n)) return true;
  if (p.subCategory?.toLowerCase().includes(n)) return true;
  if (p.tagline?.toLowerCase().includes(n)) return true;
  if (p.colors?.some((c) => c.toLowerCase().includes(n))) return true;
  return false;
}

function sortNewest(a: Product, b: Product) {
  const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
  const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
  return tb - ta;
}

type SearchOverlayProps = {
  open: boolean;
  onClose: () => void;
};

export default function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const { products, loading, loaded } = useAppSelector((s) => s.products);

  useEffect(() => {
    if (open && !loaded && !loading) {
      dispatch(fetchProducts());
    }
  }, [open, loaded, loading, dispatch]);

  useEffect(() => {
    if (!open) return;
    const t = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const newArrivals = useMemo(() => {
    const list = [...products];
    list.sort(sortNewest);
    return list.slice(0, 8);
  }, [products]);

  const trimmed = query.trim();
  const results = useMemo(() => {
    if (!trimmed) return [];
    return products.filter((p) => matchesQuery(p, trimmed)).slice(0, 8);
  }, [products, trimmed]);

  const goToCollectionSearch = useCallback(
    (q: string) => {
      const v = q.trim();
      if (!v) {
        router.push("/collection");
      } else {
        router.push(`/collection?q=${encodeURIComponent(v)}`);
      }
      dispatch(setCartOpen(false));
      onClose();
    },
    [router, dispatch, onClose],
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    goToCollectionSearch(trimmed);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[105] isolate overflow-y-auto bg-[#fdfaf5] font-[family-name:var(--font-montserrat)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0f172a]/[0.03] to-transparent" />

      <button
        type="button"
        onClick={onClose}
        className="pointer-events-auto absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[#0f172a]/10 bg-white/90 text-[#0f172a] shadow-sm transition-colors hover:border-[#7da8c7]/40 hover:text-[#7da8c7] sm:right-8 sm:top-6"
        aria-label="Close search"
      >
        <ZenIcon name="times" className="h-5 w-5" />
      </button>

      <Link
        href="/"
        onClick={onClose}
        className="pointer-events-auto absolute left-1/2 top-4 z-10 flex -translate-x-1/2 items-center gap-2 select-none no-underline sm:top-6 sm:gap-2.5"
      >
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[#1b2232] sm:h-11 sm:w-11">
          <img
            src="/logo_zenmen.png"
            alt="ZENmen logo"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-col">
          <p className="m-0 whitespace-nowrap text-[22px] leading-[0.92] text-[#0f172a] sm:text-[26px]">
            ZENMEN
          </p>
          <p className="m-0 mt-0.5 whitespace-nowrap text-[8px] uppercase tracking-[0.2em] text-[#7da8c7] sm:text-[9px] sm:tracking-[0.28em]">
            Bespoke Tailoring
          </p>
        </div>
      </Link>

      <div className="relative mx-auto w-full max-w-3xl px-4 pb-20 pt-[5.5rem] sm:px-6 sm:pt-28 lg:max-w-4xl lg:px-8">
        <p id={titleId} className="sr-only">
          Search products and categories
        </p>

        <form onSubmit={onSubmit} className="pointer-events-auto">
          <div className="relative overflow-hidden rounded-lg border border-[#e8e0d6] bg-white shadow-[0_12px_40px_-20px_rgba(15,23,42,0.18)]">
            <ZenIcon
              name="search"
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7da8c7]"
              aria-hidden
            />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, categories, keywords…"
              autoComplete="off"
              className="w-full border-0 bg-transparent py-4 pl-12 pr-4 text-[15px] font-light text-[#0f172a] placeholder:text-[#94a3b8] outline-none focus:ring-0 sm:py-[1.125rem] sm:text-base"
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#64748b] underline-offset-4 hover:text-[#0f172a] hover:underline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-sm border border-[#0f172a]/15 bg-[#0f172a] px-5 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#1e293b]"
            >
              Search
            </button>
          </div>
        </form>

        {trimmed ? (
          <section className="pointer-events-auto mt-12">
            <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#0f172a]">
              Results
            </h2>
            {loading && !loaded ? (
              <p className="text-sm font-light text-[#64748b]">Loading…</p>
            ) : results.length === 0 ? (
              <p className="text-sm font-light text-[#64748b]">
                No matches for &ldquo;{trimmed}&rdquo;. Try another keyword or
                browse the collection.
              </p>
            ) : (
              <ul className="divide-y divide-[#e8e0d6] rounded-lg border border-[#e8e0d6] bg-white">
                {results.map((p) => {
                  const href = `/collection/${encodeURIComponent(p.slug)}`;
                  const img = primaryImage(p);
                  const color = p.colors?.[0];
                  return (
                    <li key={p._id}>
                      <Link
                        href={href}
                        onClick={onClose}
                        className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-[#f8fafc]"
                      >
                        <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded border border-[#e8e0d6] bg-[#f1f5f9]">
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element -- remote product URLs vary by host
                            <img
                              src={img}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-[#0f172a]">
                            {p.title}
                          </p>
                          <p className="truncate text-xs font-light text-[#64748b]">
                            {[p.category, color].filter(Boolean).join(" · ")}
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
            <button
              type="button"
              onClick={() => goToCollectionSearch(trimmed)}
              className="mt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7da8c7] underline-offset-4 hover:underline"
            >
              View all in collection
            </button>
          </section>
        ) : null}

        <section className="pointer-events-auto mt-14">
          <h2 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#0f172a]">
            Popular searches
          </h2>
          <div className="flex flex-wrap gap-x-5 gap-y-2.5">
            {POPULAR.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setQuery(term);
                  goToCollectionSearch(term);
                }}
                className="group inline-flex items-center gap-1.5 border-0 bg-transparent p-0 text-left text-[13px] font-light text-[#0f172a] transition-colors hover:text-[#7da8c7]"
              >
                <ZenIcon
                  name="search"
                  className="h-3.5 w-3.5 shrink-0 text-[#7da8c7] opacity-80 group-hover:opacity-100"
                  aria-hidden
                />
                <span>{term}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="pointer-events-auto mt-14">
          <h2 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#0f172a]">
            New arrivals
          </h2>
          {loading && !loaded ? (
            <p className="text-sm font-light text-[#64748b]">Loading…</p>
          ) : newArrivals.length === 0 ? (
            <p className="text-sm font-light text-[#64748b]">
              Pieces will appear here once listed.
            </p>
          ) : (
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 sm:gap-4 lg:-mx-8 lg:px-8">
              {newArrivals.map((p) => {
                const img = primaryImage(p);
                const color = p.colors?.[0];
                const label = color ? `${p.title} — ${color}` : p.title;
                return (
                  <Link
                    key={p._id}
                    href={`/collection/${encodeURIComponent(p.slug)}`}
                    onClick={onClose}
                    className="group w-[7.5rem] shrink-0 sm:w-[8.5rem]"
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md border border-[#e8e0d6] bg-[#f1f5f9] shadow-sm transition-shadow group-hover:shadow-md">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element -- remote product URLs vary by host
                        <img
                          src={img}
                          alt={p.title}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : null}
                    </div>
                    <p className="mt-2 line-clamp-2 text-center text-[10px] font-light leading-snug text-[#0f172a] sm:text-[11px]">
                      {label}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
