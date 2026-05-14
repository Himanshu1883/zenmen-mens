"use client";

/**
 * MobileFilterBar — ZENmen Collection
 *
 * Drop this component into collection/page.tsx and replace the existing
 * desktop filter block with <MobileFilterBar ... />.
 *
 * USAGE (inside CollectionPage):
 *
 *   import MobileFilterBar from "@/components/MobileFilterBar";
 *
 *   <MobileFilterBar
 *     categories={categories}
 *     colors={colors}
 *     sizes={sizes}
 *     priceRanges={priceRanges}
 *     selectedCategory={selectedCategory}
 *     selectedColor={selectedColor}
 *     selectedSize={selectedSize}
 *     selectedPrice={selectedPrice}
 *     sortBy={sortBy}
 *     search={search}
 *     resultCount={sortedProducts.length}
 *     totalCount={products.length}
 *     onCategoryChange={setSelectedCategory}
 *     onColorChange={setSelectedColor}
 *     onSizeChange={setSelectedSize}
 *     onPriceChange={setSelectedPrice}
 *     onSortChange={setSortBy}
 *     onSearchChange={setSearch}
 *     onReset={() => {
 *       setSearch("");
 *       setSelectedCategory("All");
 *       setSelectedColor("All");
 *       setSelectedSize("All");
 *       setSelectedPrice("All");
 *     }}
 *   />
 */

import { useEffect, useRef, useState } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

interface MobileFilterBarProps {
  categories: string[];
  colors: string[];
  sizes: string[];
  priceRanges: string[];
  selectedCategory: string;
  selectedColor: string;
  selectedSize: string;
  selectedPrice: string;
  sortBy: string;
  search: string;
  resultCount: number;
  totalCount: number;
  onCategoryChange: (v: string) => void;
  onColorChange: (v: string) => void;
  onSizeChange: (v: string) => void;
  onPriceChange: (v: string) => void;
  onSortChange: (v: string) => void;
  onSearchChange: (v: string) => void;
  onReset: () => void;
}

type FilterPanel = "category" | "price" | "color" | "size" | "sort" | null;

// ── Component ────────────────────────────────────────────────────────────────

export default function MobileFilterBar({
  categories,
  colors,
  sizes,
  priceRanges,
  selectedCategory,
  selectedColor,
  selectedSize,
  selectedPrice,
  sortBy,
  search,
  resultCount,
  totalCount,
  onCategoryChange,
  onColorChange,
  onSizeChange,
  onPriceChange,
  onSortChange,
  onSearchChange,
  onReset,
}: MobileFilterBarProps) {
  const [activePanel, setActivePanel] = useState<FilterPanel>(null);
  const [visible, setVisible] = useState(true);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const lastScrollY = useRef(0);

  // ── Hide bar when footer is in view ────────────────────────────────────────
  useEffect(() => {
    const footer = document.querySelector("footer") as HTMLElement | null;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0.05 },
    );

    if (footer) observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  // ── Close panel on outside tap ─────────────────────────────────────────────
  useEffect(() => {
    if (!activePanel) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-filter-root]")) setActivePanel(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [activePanel]);

  const hasActiveFilters =
    selectedCategory !== "All" ||
    selectedColor !== "All" ||
    selectedSize !== "All" ||
    selectedPrice !== "All" ||
    search.trim() !== "";

  const toggle = (panel: FilterPanel) =>
    setActivePanel((prev) => (prev === panel ? null : panel));

  // ── Active label helpers ───────────────────────────────────────────────────
  const label = (selected: string, fallback: string) =>
    selected !== "All" ? selected : fallback;

  const isActive = (panel: FilterPanel) => activePanel === panel;

  const sortLabels: Record<string, string> = {
    featured: "Sort",
    price_low_high: "Price ↑",
    price_high_low: "Price ↓",
    name_az: "A → Z",
    name_za: "Z → A",
  };

  return (
    <>
      {/* ── Desktop sticky filter bar (top) ─────────────────────────────── */}
      <div className="hidden md:block sticky top-[80px] z-30 bg-[#f8fafc]/95 backdrop-blur border-b border-[#e2e8f0]">
        <div className="px-12 lg:px-20">
          {/* Row 1 — filter tabs + sort */}
          <div className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-8">
              {(
                [
                  { key: "category", label: "Category" },
                  { key: "price", label: "Price" },
                  { key: "color", label: "Color" },
                  { key: "size", label: "Size" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => toggle(tab.key)}
                  className={`inline-flex items-center gap-1 py-1 text-[15px] transition ${
                    isActive(tab.key)
                      ? "text-[#0f172a] border-b border-[#0f172a]"
                      : "text-[#64748b] hover:text-[#0f172a]"
                  }`}
                >
                  {tab.label}
                  <span className="text-[11px] leading-none text-[#94a3b8]">
                    {isActive(tab.key) ? "⌃" : "⌄"}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 text-[14px] text-[#64748b]">
              <span>
                {resultCount} / {totalCount}
              </span>
              <span className="text-[#cbd5e1]">|</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => onSortChange(e.target.value)}
                  className="appearance-none bg-transparent border-0 px-0 pr-4 py-1 text-[#0f172a] outline-none text-[13px] cursor-pointer"
                >
                  <option value="featured">Sort</option>
                  <option value="price_low_high">Price: Low to High</option>
                  <option value="price_high_low">Price: High to Low</option>
                  <option value="name_az">Name: A-Z</option>
                  <option value="name_za">Name: Z-A</option>
                </select>
                <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[10px] text-[#94a3b8]">
                  ⌄
                </span>
              </div>
            </div>
          </div>

          {/* Row 2 — search */}
          <div className="py-2">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full border-b border-[#d6e1ec] bg-transparent px-0 py-2 text-sm text-[#0f172a] outline-none placeholder:text-[#8ca0b6] focus:border-[#7da8c7]"
            />
          </div>

          {/* Filter panel */}
          {activePanel && (
            <div data-filter-root className="border-t border-[#e7edf5] py-4">
              <DesktopFilterPanel
                panel={activePanel}
                categories={categories}
                colors={colors}
                sizes={sizes}
                priceRanges={priceRanges}
                selectedCategory={selectedCategory}
                selectedColor={selectedColor}
                selectedSize={selectedSize}
                selectedPrice={selectedPrice}
                onCategoryChange={onCategoryChange}
                onColorChange={onColorChange}
                onSizeChange={onSizeChange}
                onPriceChange={onPriceChange}
              />
            </div>
          )}

          {/* Reset */}
          {hasActiveFilters && (
            <div className="border-t border-[#e7edf5] py-2">
              <button
                onClick={onReset}
                className="text-[11px] tracking-[0.08em] uppercase text-[#64748b] hover:text-[#0f172a] transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile search bar (top, always visible) ──────────────────────── */}
      <div className="md:hidden px-4 py-3 bg-[#f8fafc] border-b border-[#e2e8f0]">
        <div className="flex items-center gap-2 border border-[#d6e1ec] bg-white px-3 py-2 rounded-sm">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8ca0b6"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#0f172a] outline-none placeholder:text-[#8ca0b6]"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="text-[#94a3b8] text-xs hover:text-[#0f172a]"
            >
              ✕
            </button>
          )}
        </div>

        {/* Result count */}
        <p className="mt-2 text-[10px] tracking-[2px] uppercase text-[#94a3b8]">
          Showing {resultCount} of {totalCount} products
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="ml-3 text-[#7da8c7] hover:text-[#0f172a] transition-colors"
            >
              Reset
            </button>
          )}
        </p>
      </div>

      {/* ── Mobile bottom filter bar ──────────────────────────────────────── */}
      <div
        data-filter-root
        className={`md:hidden fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Expanded panel (slides up above the bar) */}
        {activePanel && (
          <div className="bg-white border-t border-[#e2e8f0] shadow-[0_-8px_32px_rgba(15,23,42,0.12)] max-h-[60vh] overflow-y-auto">
            <MobileFilterPanel
              panel={activePanel}
              categories={categories}
              colors={colors}
              sizes={sizes}
              priceRanges={priceRanges}
              selectedCategory={selectedCategory}
              selectedColor={selectedColor}
              selectedSize={selectedSize}
              selectedPrice={selectedPrice}
              sortBy={sortBy}
              onCategoryChange={(v) => {
                onCategoryChange(v);
                setActivePanel(null);
              }}
              onColorChange={(v) => {
                onColorChange(v);
                setActivePanel(null);
              }}
              onSizeChange={(v) => {
                onSizeChange(v);
                setActivePanel(null);
              }}
              onPriceChange={(v) => {
                onPriceChange(v);
                setActivePanel(null);
              }}
              onSortChange={(v) => {
                onSortChange(v);
                setActivePanel(null);
              }}
              onClose={() => setActivePanel(null)}
            />
          </div>
        )}

        {/* The sticky bar itself */}
        <div className="bg-white border-t border-[#e2e8f0] shadow-[0_-2px_16px_rgba(15,23,42,0.08)]">
          <div className="flex items-stretch">
            {[
              {
                key: "category" as FilterPanel,
                icon: (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                ),
                label: label(selectedCategory, "Category"),
                active: selectedCategory !== "All",
              },
              {
                key: "color" as FilterPanel,
                icon: (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path
                      d="M12 3a9 9 0 0 1 0 18"
                      fill="currentColor"
                      fillOpacity="0.15"
                    />
                  </svg>
                ),
                label: label(selectedColor, "Color"),
                active: selectedColor !== "All",
              },
              {
                key: "size" as FilterPanel,
                icon: (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M4 7h16M4 12h10M4 17h6" strokeLinecap="round" />
                  </svg>
                ),
                label: label(selectedSize, "Size"),
                active: selectedSize !== "All",
              },
              {
                key: "price" as FilterPanel,
                icon: (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
                      strokeLinecap="round"
                    />
                  </svg>
                ),
                label: label(selectedPrice, "Price"),
                active: selectedPrice !== "All",
              },
              {
                key: "sort" as FilterPanel,
                icon: (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M4 6h16M4 12h10M4 18h5" strokeLinecap="round" />
                  </svg>
                ),
                label: sortBy !== "featured" ? sortLabels[sortBy] : "Sort",
                active: sortBy !== "featured",
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => toggle(tab.key)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-1 text-center transition-colors ${
                  isActive(tab.key)
                    ? "bg-[#f0f6fb] text-[#7da8c7]"
                    : tab.active
                      ? "text-[#7da8c7]"
                      : "text-[#94a3b8]"
                }`}
              >
                <span
                  className={
                    tab.active || isActive(tab.key)
                      ? "text-[#7da8c7]"
                      : "text-[#94a3b8]"
                  }
                >
                  {tab.icon}
                </span>
                <span
                  className={`text-[9px] tracking-[0.1em] uppercase leading-none truncate max-w-[56px] ${
                    tab.active || isActive(tab.key)
                      ? "text-[#7da8c7] font-medium"
                      : "text-[#94a3b8]"
                  }`}
                >
                  {tab.label}
                </span>
                {tab.active && (
                  <span className="w-1 h-1 rounded-full bg-[#7da8c7]" />
                )}
              </button>
            ))}
          </div>
          {/* iPhone safe area spacer */}
          <div
            className="h-safe-area-inset-bottom"
            style={{ height: "env(safe-area-inset-bottom, 0px)" }}
          />
        </div>
      </div>

      {/* ── Spacer so content isn't hidden behind mobile bar ─────────────── */}
      <div className="md:hidden h-[72px]" />
    </>
  );
}

// ── Desktop filter panel content ─────────────────────────────────────────────

function DesktopFilterPanel({
  panel,
  categories,
  colors,
  sizes,
  priceRanges,
  selectedCategory,
  selectedColor,
  selectedSize,
  selectedPrice,
  onCategoryChange,
  onColorChange,
  onSizeChange,
  onPriceChange,
}: {
  panel: FilterPanel;
  categories: string[];
  colors: string[];
  sizes: string[];
  priceRanges: string[];
  selectedCategory: string;
  selectedColor: string;
  selectedSize: string;
  selectedPrice: string;
  onCategoryChange: (v: string) => void;
  onColorChange: (v: string) => void;
  onSizeChange: (v: string) => void;
  onPriceChange: (v: string) => void;
}) {
  const btn = (active: boolean) =>
    `px-0 py-1 text-[13px] tracking-[0.04em] transition-colors ${
      active ? "text-[#0f172a]" : "text-[#64748b] hover:text-[#0f172a]"
    }`;

  return (
    <>
      {panel === "category" && (
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={btn(selectedCategory === cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}
      {panel === "price" && (
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {priceRanges.map((range) => (
            <button
              key={range}
              onClick={() => onPriceChange(range)}
              className={btn(selectedPrice === range)}
            >
              {range}
            </button>
          ))}
        </div>
      )}
      {panel === "size" && (
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => onSizeChange(size)}
              className={btn(selectedSize === size)}
            >
              {size}
            </button>
          ))}
        </div>
      )}
      {panel === "color" && (
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 md:grid-cols-4 lg:grid-cols-6">
          {colors.map((col) => (
            <button
              key={col}
              onClick={() => onColorChange(col)}
              className="flex items-center gap-2 py-1 text-left"
            >
              <span
                className={`h-3 w-3 rounded-full border flex-shrink-0 ${
                  selectedColor === col
                    ? "border-[#7da8c7] bg-[#7da8c7]"
                    : "border-[#cbd5e1] bg-white"
                }`}
              />
              <span
                className={`text-[11px] tracking-[0.06em] truncate ${
                  selectedColor === col ? "text-[#0f172a]" : "text-[#64748b]"
                }`}
              >
                {col}
              </span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}

// ── Mobile filter panel content ───────────────────────────────────────────────

function MobileFilterPanel({
  panel,
  categories,
  colors,
  sizes,
  priceRanges,
  selectedCategory,
  selectedColor,
  selectedSize,
  selectedPrice,
  sortBy,
  onCategoryChange,
  onColorChange,
  onSizeChange,
  onPriceChange,
  onSortChange,
  onClose,
}: {
  panel: FilterPanel;
  categories: string[];
  colors: string[];
  sizes: string[];
  priceRanges: string[];
  selectedCategory: string;
  selectedColor: string;
  selectedSize: string;
  selectedPrice: string;
  sortBy: string;
  onCategoryChange: (v: string) => void;
  onColorChange: (v: string) => void;
  onSizeChange: (v: string) => void;
  onPriceChange: (v: string) => void;
  onSortChange: (v: string) => void;
  onClose: () => void;
}) {
  const TITLES: Record<string, string> = {
    category: "Category",
    color: "Color",
    size: "Size",
    price: "Price Range",
    sort: "Sort By",
  };

  const SORT_OPTIONS = [
    { value: "featured", label: "Featured" },
    { value: "price_low_high", label: "Price: Low to High" },
    { value: "price_high_low", label: "Price: High to Low" },
    { value: "name_az", label: "Name: A → Z" },
    { value: "name_za", label: "Name: Z → A" },
  ];

  return (
    <div>
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#f1f5f9]">
        <p className="text-[10px] tracking-[0.3em] uppercase text-[#7da8c7]">
          {panel ? TITLES[panel] : ""}
        </p>
        <button
          onClick={onClose}
          className="text-[#94a3b8] hover:text-[#0f172a] text-lg leading-none"
        >
          ✕
        </button>
      </div>

      {/* Panel content */}
      <div className="px-5 py-4">
        {panel === "category" && (
          <div className="flex flex-col gap-1">
            {categories.map((cat) => (
              <MobileOption
                key={cat}
                label={cat}
                active={selectedCategory === cat}
                onClick={() => onCategoryChange(cat)}
              />
            ))}
          </div>
        )}

        {panel === "price" && (
          <div className="flex flex-col gap-1">
            {priceRanges.map((range) => (
              <MobileOption
                key={range}
                label={range}
                active={selectedPrice === range}
                onClick={() => onPriceChange(range)}
              />
            ))}
          </div>
        )}

        {panel === "size" && (
          <div className="grid grid-cols-3 gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => onSizeChange(size)}
                className={`py-3 text-center text-[12px] tracking-[0.08em] border transition-colors ${
                  selectedSize === size
                    ? "border-[#7da8c7] bg-[#f0f6fb] text-[#0f172a]"
                    : "border-[#e2e8f0] text-[#64748b] hover:border-[#7da8c7]"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}

        {panel === "color" && (
          <div className="grid grid-cols-2 gap-2">
            {colors.map((col) => (
              <button
                key={col}
                onClick={() => onColorChange(col)}
                className={`flex items-center gap-3 px-3 py-2.5 border transition-colors text-left ${
                  selectedColor === col
                    ? "border-[#7da8c7] bg-[#f0f6fb]"
                    : "border-[#f1f5f9] bg-[#f8fafc] hover:border-[#7da8c7]"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex-shrink-0 border-2 ${
                    selectedColor === col
                      ? "border-[#7da8c7] bg-[#7da8c7]"
                      : "border-[#e2e8f0] bg-white"
                  }`}
                />
                <span
                  className={`text-[11px] tracking-[0.06em] truncate ${
                    selectedColor === col ? "text-[#0f172a]" : "text-[#64748b]"
                  }`}
                >
                  {col}
                </span>
              </button>
            ))}
          </div>
        )}

        {panel === "sort" && (
          <div className="flex flex-col gap-1">
            {SORT_OPTIONS.map((opt) => (
              <MobileOption
                key={opt.value}
                label={opt.label}
                active={sortBy === opt.value}
                onClick={() => onSortChange(opt.value)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Shared mobile option row ──────────────────────────────────────────────────

function MobileOption({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between px-3 py-3 rounded-sm text-left transition-colors ${
        active
          ? "bg-[#f0f6fb] text-[#0f172a]"
          : "text-[#64748b] hover:text-[#0f172a] hover:bg-[#f8fafc]"
      }`}
    >
      <span className="text-[13px] tracking-[0.04em]">{label}</span>
      {active && (
        <span className="text-[#7da8c7] text-xs">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              d="m5 12 5 5L20 7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </button>
  );
}
