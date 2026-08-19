"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  productCategoryMatchTokens,
  resolveCategoryParentId,
} from "@/lib/categories";
import type { Category } from "@/types/category";
import { History, Minus, Plus, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { GlassCard } from "../dashboard/GlassCard";

type StockFilter = "" | "in" | "low" | "out";
type Availability = "in" | "low" | "out";

type InventoryProduct = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  subCategory: string;
  stock: number;
  isAvailable: boolean;
  availability: Availability;
  updatedAt: string | null;
  image: { url: string; alt: string };
};

type InventoryLog = {
  _id: string;
  delta: number;
  previousStock: number;
  resultingStock: number;
  reason: string;
  orderId: string | null;
  note: string;
  createdAt: string | null;
};

type CategoryGroup = {
  parent: Category;
  children: Category[];
};

const selectClass =
  "h-9 rounded-lg border border-[#e2e8f0] bg-white px-3 text-sm text-[#0f172a] outline-none focus:border-[#7da8c7]";
const inputClass =
  "h-9 w-full rounded-lg border border-[#e2e8f0] bg-white px-3 pl-9 text-sm text-[#0f172a] outline-none placeholder:text-[#94a3b8] focus:border-[#7da8c7]";
const compactInputClass =
  "h-8 w-20 rounded-lg border border-[#e2e8f0] bg-white px-2 text-center text-sm text-[#0f172a] outline-none focus:border-[#7da8c7]";

const REASON_LABEL: Record<string, string> = {
  order_sold: "Sold (order)",
  order_cancel_restock: "Restock (cancel)",
  manual_set: "Manual set",
  manual_adjust: "Manual adjust",
};

function statusLabel(status: Availability) {
  if (status === "in") return "In stock";
  if (status === "low") return "Low stock";
  return "Out of stock";
}

function statusBadgeClass(status: Availability) {
  if (status === "in") {
    return "border-green-500/50 text-green-600 bg-green-500/10";
  }
  if (status === "low") {
    return "border-yellow-500/50 text-yellow-600 bg-yellow-500/10";
  }
  return "border-red-500/50 text-red-600 bg-red-500/10";
}

function rowHighlight(status: Availability) {
  if (status === "out") return "bg-red-50/70";
  if (status === "low") return "bg-amber-50/70";
  return "";
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border ${
        active
          ? "bg-[#7da8c7] text-white border-transparent"
          : "text-[#64748b] border-[#e2e8f0] hover:border-[#7da8c7]/50"
      }`}
    >
      {children}
    </button>
  );
}

function buildCategoryGroups(categories: Category[]): CategoryGroup[] {
  const slugToId = new Map(categories.map((c) => [c.slug, c._id]));
  const parentList = categories
    .filter((c) => !resolveCategoryParentId(c, slugToId))
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

  const childMap = new Map<string, Category[]>();
  for (const cat of categories) {
    const parentId = resolveCategoryParentId(cat, slugToId);
    if (!parentId) continue;
    const list = childMap.get(parentId) ?? [];
    list.push(cat);
    childMap.set(parentId, list);
  }
  for (const [key, list] of childMap) {
    childMap.set(
      key,
      [...list].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)),
    );
  }

  const groups: CategoryGroup[] = [];
  const listed = new Set<string>();

  for (const parent of parentList) {
    const children = childMap.get(parent._id) ?? [];
    groups.push({ parent, children });
    listed.add(parent._id);
    for (const child of children) listed.add(child._id);
  }

  const orphans = categories
    .filter((c) => !listed.has(c._id))
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  for (const orphan of orphans) {
    groups.push({ parent: orphan, children: [] });
  }

  return groups;
}

function formatWhen(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Inventory() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [categoryDocs, setCategoryDocs] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [threshold, setThreshold] = useState(5);
  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    totalUnits: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [draftStock, setDraftStock] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [logsById, setLogsById] = useState<Record<string, InventoryLog[]>>({});
  const [logsLoading, setLogsLoading] = useState<string | null>(null);

  const limit = 20;

  const groups = useMemo(
    () => buildCategoryGroups(categoryDocs),
    [categoryDocs],
  );

  const selectedGroup = useMemo(
    () =>
      groups.find(
        (g) =>
          g.parent._id === selectedCategoryId ||
          g.children.some((c) => c._id === selectedCategoryId),
      ) ?? null,
    [groups, selectedCategoryId],
  );

  const categoryTokens = useMemo(() => {
    if (!selectedCategoryId || !selectedGroup) return [];
    if (selectedGroup.parent._id === selectedCategoryId) {
      return productCategoryMatchTokens([
        selectedGroup.parent,
        ...selectedGroup.children,
      ]);
    }
    const child = selectedGroup.children.find(
      (c) => c._id === selectedCategoryId,
    );
    return child ? productCategoryMatchTokens([child]) : [];
  }, [selectedCategoryId, selectedGroup]);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/categories");
        if (!res.ok) {
          toast.error("Failed to load collections");
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setCategoryDocs(
            Array.isArray(data.categories) ? (data.categories as Category[]) : [],
          );
        }
      } catch {
        if (!cancelled) toast.error("Failed to load collections");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));
        if (categoryTokens.length > 0) {
          params.set("categories", categoryTokens.join(","));
        }
        if (search) params.set("q", search);
        if (stockFilter) params.set("stock", stockFilter);

        const res = await fetch(`/api/admin/inventory?${params.toString()}`);
        if (!res.ok) {
          toast.error("Failed to load inventory");
          return;
        }
        const data = await res.json();
        const list = Array.isArray(data.products)
          ? (data.products as InventoryProduct[])
          : [];
        setProducts(list);
        setPages(data.pages ?? 1);
        setTotal(data.total ?? 0);
        if (typeof data.lowStockThreshold === "number") {
          setThreshold(data.lowStockThreshold);
        }
        if (data.stats) {
          setStats({
            total: data.stats.total ?? 0,
            inStock: data.stats.inStock ?? 0,
            lowStock: data.stats.lowStock ?? 0,
            outOfStock: data.stats.outOfStock ?? 0,
            totalUnits: data.stats.totalUnits ?? 0,
          });
        }
        setDraftStock((prev) => {
          const next = { ...prev };
          for (const p of list) {
            if (savingId === p._id && next[p._id] !== undefined) continue;
            next[p._id] = String(p.stock);
          }
          return next;
        });
      } catch {
        toast.error("Failed to load inventory");
      } finally {
        setLoading(false);
      }
    };

    void fetchInventory();
  }, [page, categoryTokens, search, stockFilter, refreshKey]);

  const reloadList = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const applyProduct = useCallback((product: InventoryProduct) => {
    setProducts((rows) =>
      rows.map((row) => (row._id === product._id ? product : row)),
    );
    setDraftStock((prev) => ({ ...prev, [product._id]: String(product.stock) }));
  }, []);

  const patchStock = async (
    product: InventoryProduct,
    body: { mode: "set" | "adjust"; stock?: number; delta?: number },
  ) => {
    setSavingId(product._id);
    try {
      const res = await fetch(`/api/admin/inventory/${product._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...body,
          note: notes[product._id]?.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.message === "string" ? data.message : "Update failed",
        );
      }
      if (data.product) {
        applyProduct(data.product as InventoryProduct);
      }
      if (data.unchanged) {
        toast.message("Stock unchanged");
      } else {
        toast.success("Stock updated");
      }
      setNotes((prev) => ({ ...prev, [product._id]: "" }));
      if (expandedId === product._id) {
        setLogsById((prev) => {
          const copy = { ...prev };
          delete copy[product._id];
          return copy;
        });
        void loadLogs(product._id);
      }
      reloadList();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
      setDraftStock((prev) => ({
        ...prev,
        [product._id]: String(product.stock),
      }));
    } finally {
      setSavingId(null);
    }
  };

  const loadLogs = async (id: string) => {
    setLogsLoading(id);
    try {
      const res = await fetch(`/api/admin/inventory/${id}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.message === "string" ? data.message : "Failed to load log",
        );
      }
      setLogsById((prev) => ({
        ...prev,
        [id]: Array.isArray(data.logs) ? (data.logs as InventoryLog[]) : [],
      }));
      if (data.product) applyProduct(data.product as InventoryProduct);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load log");
    } finally {
      setLogsLoading(null);
    }
  };

  const toggleLogs = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!logsById[id]) void loadLogs(id);
  };

  const hasFilters =
    Boolean(selectedCategoryId) ||
    Boolean(searchInput.trim()) ||
    Boolean(stockFilter);

  const clearFilters = () => {
    setSelectedCategoryId(null);
    setSearchInput("");
    setSearch("");
    setStockFilter("");
    setPage(1);
  };

  return (
    <div className="space-y-6 mt-16">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[#0f172a] mb-2">
          Inventory
        </h1>
        <p className="text-[#64748b]">
          Live stock from Mongo. Sold orders reduce stock; cancelled orders
          restock. Delivery does not deduct again.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <GlassCard className="p-4">
          <p className="text-[#64748b] text-sm mb-1">Products</p>
          <p className="text-2xl font-semibold text-[#0f172a]">{stats.total}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-[#64748b] text-sm mb-1">In stock</p>
          <p className="text-2xl font-semibold text-green-600">{stats.inStock}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-[#64748b] text-sm mb-1">Low (≤{threshold})</p>
          <p className="text-2xl font-semibold text-yellow-600">
            {stats.lowStock}
          </p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-[#64748b] text-sm mb-1">Out of stock</p>
          <p className="text-2xl font-semibold text-red-600">
            {stats.outOfStock}
          </p>
        </GlassCard>
        <GlassCard className="p-4 col-span-2 md:col-span-1">
          <p className="text-[#64748b] text-sm mb-1">Units on hand</p>
          <p className="text-2xl font-semibold text-[#0f172a]">
            {stats.totalUnits.toLocaleString("en-IN")}
          </p>
        </GlassCard>
      </div>

      <GlassCard className="p-4 space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
            <input
              className={inputClass}
              placeholder="Search title or slug"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Search inventory"
            />
          </div>
          <select
            className={selectClass}
            value={stockFilter}
            onChange={(e) => {
              setStockFilter(e.target.value as StockFilter);
              setPage(1);
            }}
            aria-label="Stock status"
          >
            <option value="">All stock</option>
            <option value="in">In stock</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
          {hasFilters ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="border-[#e2e8f0] text-[#64748b]"
              onClick={clearFilters}
            >
              <X className="mr-1 h-4 w-4" />
              Clear
            </Button>
          ) : null}
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[#94a3b8] mb-2">
            Collection
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <FilterChip
              active={!selectedCategoryId}
              onClick={() => {
                setSelectedCategoryId(null);
                setPage(1);
              }}
            >
              All
            </FilterChip>
            {groups.map((group) => {
              const inGroup =
                selectedCategoryId === group.parent._id ||
                group.children.some((c) => c._id === selectedCategoryId);
              return (
                <FilterChip
                  key={group.parent._id}
                  active={inGroup}
                  onClick={() => {
                    setSelectedCategoryId(group.parent._id);
                    setPage(1);
                  }}
                >
                  {group.parent.name}
                </FilterChip>
              );
            })}
          </div>
          {selectedGroup && selectedGroup.children.length > 0 ? (
            <div className="mt-3 flex items-center gap-2 flex-wrap pl-1">
              <FilterChip
                active={selectedCategoryId === selectedGroup.parent._id}
                onClick={() => {
                  setSelectedCategoryId(selectedGroup.parent._id);
                  setPage(1);
                }}
              >
                All in {selectedGroup.parent.name}
              </FilterChip>
              {selectedGroup.children.map((child) => (
                <FilterChip
                  key={child._id}
                  active={selectedCategoryId === child._id}
                  onClick={() => {
                    setSelectedCategoryId(child._id);
                    setPage(1);
                  }}
                >
                  {child.name}
                </FilterChip>
              ))}
            </div>
          ) : null}
        </div>

        <p className="text-sm text-[#64748b]">
          {hasFilters
            ? `${total.toLocaleString("en-IN")} matching`
            : `${total.toLocaleString("en-IN")} products`}
        </p>
      </GlassCard>

      {loading && products.length === 0 ? (
        <p className="text-center text-[#64748b] py-12 animate-pulse">
          Loading inventory…
        </p>
      ) : products.length === 0 ? (
        <p className="text-center text-[#64748b] py-12">
          {hasFilters
            ? "No products match these filters."
            : "No products in inventory yet."}
        </p>
      ) : (
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead>
                <tr className="border-b border-[#e2e8f0] bg-[#f8fafc] text-xs uppercase tracking-wide text-[#94a3b8]">
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Collection</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Adjust</th>
                  <th className="px-4 py-3 font-medium">Log</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const saving = savingId === product._id;
                  const expanded = expandedId === product._id;
                  return (
                    <Fragment key={product._id}>
                    <tr
                      className={`border-b border-[#e2e8f0] ${rowHighlight(product.availability)}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#f1f5f9]">
                            <Image
                              src={product.image.url}
                              alt={product.image.alt}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/collection/${encodeURIComponent(product.slug)}`}
                              target="_blank"
                              className="block truncate font-medium text-[#0f172a] hover:text-[#5a8faf]"
                            >
                              {product.title}
                            </Link>
                            <p className="truncate text-xs text-[#94a3b8]">
                              {product.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#64748b]">
                        {[product.category, product.subCategory]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={statusBadgeClass(product.availability)}
                        >
                          {statusLabel(product.availability)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-lg font-semibold text-[#0f172a]">
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 border-[#e2e8f0]"
                              disabled={saving || product.stock <= 0}
                              onClick={() =>
                                void patchStock(product, {
                                  mode: "adjust",
                                  delta: -1,
                                })
                              }
                              aria-label={`Decrease ${product.title} stock`}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <input
                              className={compactInputClass}
                              inputMode="numeric"
                              value={draftStock[product._id] ?? String(product.stock)}
                              onChange={(e) =>
                                setDraftStock((prev) => ({
                                  ...prev,
                                  [product._id]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key !== "Enter") return;
                                const n = Number(draftStock[product._id]);
                                if (!Number.isInteger(n) || n < 0) {
                                  toast.error("Enter a whole number of 0 or more");
                                  return;
                                }
                                void patchStock(product, {
                                  mode: "set",
                                  stock: n,
                                });
                              }}
                              aria-label={`${product.title} stock quantity`}
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 border-[#e2e8f0]"
                              disabled={saving}
                              onClick={() =>
                                void patchStock(product, {
                                  mode: "adjust",
                                  delta: 1,
                                })
                              }
                              aria-label={`Increase ${product.title} stock`}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              className="h-8 bg-[#7da8c7] hover:bg-[#5a8faf] text-white"
                              disabled={saving}
                              onClick={() => {
                                const n = Number(draftStock[product._id]);
                                if (!Number.isInteger(n) || n < 0) {
                                  toast.error("Enter a whole number of 0 or more");
                                  return;
                                }
                                void patchStock(product, {
                                  mode: "set",
                                  stock: n,
                                });
                              }}
                            >
                              Set
                            </Button>
                          </div>
                          <input
                            className="h-8 w-full max-w-xs rounded-lg border border-[#e2e8f0] bg-white px-2 text-xs text-[#0f172a] outline-none placeholder:text-[#94a3b8] focus:border-[#7da8c7]"
                            placeholder="Reason / note (optional)"
                            value={notes[product._id] ?? ""}
                            onChange={(e) =>
                              setNotes((prev) => ({
                                ...prev,
                                [product._id]: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-8 text-[#64748b] hover:text-[#7da8c7]"
                          onClick={() => toggleLogs(product._id)}
                        >
                          <History className="mr-1 h-4 w-4" />
                          {expanded ? "Hide" : "History"}
                        </Button>
                      </td>
                    </tr>
                    {expanded ? (
                      <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                        <td colSpan={6} className="px-4 py-4">
                          <p className="mb-2 text-sm font-medium text-[#0f172a]">
                            Movement log
                          </p>
                          {logsLoading === product._id && !logsById[product._id] ? (
                            <p className="text-sm text-[#64748b]">Loading…</p>
                          ) : (logsById[product._id] ?? []).length === 0 ? (
                            <p className="text-sm text-[#64748b]">
                              No movements recorded yet for this product.
                            </p>
                          ) : (
                            <ul className="space-y-2">
                              {(logsById[product._id] ?? []).map((log) => (
                                <li
                                  key={log._id}
                                  className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm"
                                >
                                  <span className="text-[#94a3b8] tabular-nums">
                                    {formatWhen(log.createdAt)}
                                  </span>
                                  <span
                                    className={
                                      log.delta > 0
                                        ? "font-medium text-green-600"
                                        : "font-medium text-red-600"
                                    }
                                  >
                                    {log.delta > 0 ? `+${log.delta}` : log.delta}
                                  </span>
                                  <span className="text-[#64748b]">
                                    {log.previousStock} → {log.resultingStock}
                                  </span>
                                  <span className="text-[#0f172a]">
                                    {REASON_LABEL[log.reason] ?? log.reason}
                                  </span>
                                  {log.note ? (
                                    <span className="text-[#94a3b8]">
                                      {log.note}
                                    </span>
                                  ) : null}
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                      </tr>
                    ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            size="sm"
            variant="outline"
            className="border-[#e2e8f0] text-[#64748b]"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <span className="text-sm text-[#64748b]">
            Page {page} of {pages}
          </span>
          <Button
            size="sm"
            variant="outline"
            className="border-[#e2e8f0] text-[#64748b]"
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page >= pages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
