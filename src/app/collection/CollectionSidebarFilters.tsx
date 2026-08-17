"use client";

import Link from "next/link";
import { useState } from "react";

type FilterSection =
  | "availability"
  | "price"
  | "brand"
  | "color"
  | "size"
  | "category";

export type CollectionFilterState = {
  selectedAvailability: string;
  selectedCategory: string;
  selectedColor: string;
  selectedSize: string;
  selectedPrice: string;
  selectedBrand: string;
  search: string;
};

type Props = {
  categories: string[];
  colors: string[];
  sizes: string[];
  priceRanges: string[];
  brands: string[];
  taxonomyTitle?: string;
  filters: CollectionFilterState;
  onChange: (patch: Partial<CollectionFilterState>) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
};

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      className={`shrink-0 text-[#94a3b8] transition-transform ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path
        d="M2.5 4.5L6 8l3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Section({
  id,
  title,
  open,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-[#e8edf2]">
      <button
        type="button"
        id={`filter-${id}`}
        aria-expanded={open}
        aria-controls={`filter-panel-${id}`}
        onClick={onToggle}
        className="flex w-full items-center justify-between py-4 text-left text-[15px] font-normal text-[#0f172a] hover:text-[#475569] transition-colors"
      >
        {title}
        <Chevron open={open} />
      </button>
      {open ? (
        <div
          id={`filter-panel-${id}`}
          role="region"
          aria-labelledby={`filter-${id}`}
          className="pb-4"
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

function OptionBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full py-1.5 text-left text-[13px] transition-colors ${
        active ? "text-[#0f172a] font-medium" : "text-[#64748b] hover:text-[#0f172a]"
      }`}
    >
      {children}
    </button>
  );
}

const AVAILABILITY = ["All", "In stock", "Out of stock"];

export default function CollectionSidebarFilters({
  categories,
  colors,
  sizes,
  priceRanges,
  brands,
  taxonomyTitle = "Category",
  filters,
  onChange,
  onReset,
  hasActiveFilters,
}: Props) {
  const [open, setOpen] = useState<Record<FilterSection, boolean>>({
    availability: true,
    price: false,
    brand: false,
    color: false,
    size: false,
    category: true,
  });

  const toggle = (key: FilterSection) =>
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <aside className="hidden lg:block w-full max-w-[260px] shrink-0">
      <div className="sticky top-[96px] max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
        <div className="mb-6">
          <input
            type="search"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            className="w-full border border-[#e2e8f0] bg-white px-3 py-2.5 text-sm text-[#0f172a] outline-none placeholder:text-[#94a3b8] focus:border-[#7da8c7]"
          />
        </div>

        <nav aria-label="Collection filters">
          <Section
            id="availability"
            title="Availability"
            open={open.availability}
            onToggle={() => toggle("availability")}
          >
            {AVAILABILITY.map((opt) => (
              <OptionBtn
                key={opt}
                active={filters.selectedAvailability === opt}
                onClick={() => onChange({ selectedAvailability: opt })}
              >
                {opt}
              </OptionBtn>
            ))}
          </Section>

          <Section
            id="price"
            title="Price"
            open={open.price}
            onToggle={() => toggle("price")}
          >
            {priceRanges.map((range) => (
              <OptionBtn
                key={range}
                active={filters.selectedPrice === range}
                onClick={() => onChange({ selectedPrice: range })}
              >
                {range}
              </OptionBtn>
            ))}
          </Section>

          {brands.length > 1 ? (
            <Section
              id="brand"
              title="Brand"
              open={open.brand}
              onToggle={() => toggle("brand")}
            >
              {brands.map((b) => (
                <OptionBtn
                  key={b}
                  active={filters.selectedBrand === b}
                  onClick={() => onChange({ selectedBrand: b })}
                >
                  {b}
                </OptionBtn>
              ))}
            </Section>
          ) : null}

          <Section
            id="color"
            title="Color"
            open={open.color}
            onToggle={() => toggle("color")}
          >
            <div className="space-y-1">
              {colors.map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => onChange({ selectedColor: col })}
                  className="flex w-full items-center gap-2.5 py-1.5 text-left"
                >
                  <span
                    className={`h-3.5 w-3.5 shrink-0 border ${
                      filters.selectedColor === col
                        ? "border-[#0f172a] ring-1 ring-[#0f172a]"
                        : "border-[#cbd5e1]"
                    }`}
                    style={{
                      background:
                        col === "All" ? "#fff" : colorToSwatch(col),
                    }}
                  />
                  <span
                    className={`text-[13px] ${
                      filters.selectedColor === col
                        ? "text-[#0f172a] font-medium"
                        : "text-[#64748b]"
                    }`}
                  >
                    {col}
                  </span>
                </button>
              ))}
            </div>
          </Section>

          <Section
            id="size"
            title="Size"
            open={open.size}
            onToggle={() => toggle("size")}
          >
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onChange({ selectedSize: size })}
                  className={`min-w-[2.5rem] border px-2 py-1.5 text-[12px] transition-colors ${
                    filters.selectedSize === size
                      ? "border-[#0f172a] bg-[#0f172a] text-white"
                      : "border-[#e2e8f0] text-[#64748b] hover:border-[#94a3b8]"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </Section>

          {categories.length > 1 ? (
            <Section
              id="category"
              title={taxonomyTitle}
              open={open.category}
              onToggle={() => toggle("category")}
            >
              {categories.map((cat) => (
                <OptionBtn
                  key={cat}
                  active={filters.selectedCategory === cat}
                  onClick={() => onChange({ selectedCategory: cat })}
                >
                  {cat}
                </OptionBtn>
              ))}
            </Section>
          ) : null}
        </nav>

        {hasActiveFilters ? (
          <button
            type="button"
            onClick={onReset}
            className="mt-4 text-[11px] uppercase tracking-[0.14em] text-[#64748b] hover:text-[#0f172a]"
          >
            Clear all filters
          </button>
        ) : null}

        <Link
          href="/collection?category=Suit"
          className="mt-10 block overflow-hidden no-underline group"
        >
          <div className="relative aspect-[3/4] bg-[#e2e8f0]">
            <img
              src="/zenmen_blackcoat.jpeg"
              alt="Jackets and tailoring"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/85 via-[#0f172a]/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="font-heading text-[1.65rem] leading-tight text-white">
                Jackets &amp;
                <br />
                Trousers
              </p>
              <span className="mt-3 inline-block text-[10px] font-medium uppercase tracking-[0.22em] text-white/90 underline-offset-4 group-hover:underline">
                See all products
              </span>
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
}

function colorToSwatch(name: string): string {
  const n = name.toLowerCase();
  const map: Record<string, string> = {
    black: "#1a1a1a",
    white: "#f8fafc",
    navy: "#1e3a5f",
    blue: "#3b6ea8",
    grey: "#94a3b8",
    gray: "#94a3b8",
    brown: "#6b4423",
    beige: "#d4c4a8",
    cream: "#f5f0e6",
    green: "#3d5c4a",
    red: "#9b2c2c",
    maroon: "#6b1d1d",
    gold: "#c9a227",
    silver: "#c0c0c0",
    purple: "#5b4b8a",
    pink: "#d4a5a5",
    tan: "#c4a882",
    olive: "#556b2f",
  };
  for (const [key, hex] of Object.entries(map)) {
    if (n.includes(key)) return hex;
  }
  return "#cbd5e1";
}
