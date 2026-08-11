"use client";

import CategoryFormModal from "@/app/components/adminComponents/CategoryFormModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { categoryCollectionHref, DEFAULT_CHILD_PARENT_SLUGS } from "@/lib/categories";
import type { Category } from "@/types/category";
import { Edit, ExternalLink, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { GlassCard } from "../dashboard/GlassCard";

type ModalState =
  | { mode: "create" }
  | { mode: "edit"; category: Category }
  | null;

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [modal, setModal] = useState<ModalState>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const reloadList = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/categories");
        if (!res.ok) {
          toast.error("Failed to load categories");
          return;
        }
        const data = await res.json();
        setCategories(Array.isArray(data.categories) ? data.categories : []);
      } catch {
        toast.error("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [refreshKey]);

  const handleDelete = async (category: Category) => {
    if (
      !confirm(
        `Delete "${category.name}"? It will be removed from the megamenu immediately.`,
      )
    ) {
      return;
    }

    try {
      setDeletingId(category._id);
      const res = await fetch(`/api/admin/categories/${category._id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.message === "string" ? data.message : "Delete failed",
        );
      }
      toast.success("Category deleted");
      reloadList();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const navVisible = categories.filter((c) => c.isActive && c.showInNav);
  const slugToCategory = useMemo(
    () => new Map(categories.map((c) => [c.slug, c])),
    [categories],
  );

  const tableRows = useMemo(() => {
    const resolveParentId = (cat: Category): string | null => {
      if (cat.parentId) return cat.parentId;
      const parentSlug = DEFAULT_CHILD_PARENT_SLUGS[cat.slug];
      if (!parentSlug) return null;
      return slugToCategory.get(parentSlug)?._id ?? null;
    };

    const parents = categories
      .filter((c) => !resolveParentId(c))
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
    const rows: Category[] = [];

    for (const parent of parents) {
      rows.push(parent);
      categories
        .filter((c) => resolveParentId(c) === parent._id)
        .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
        .forEach((child) => rows.push(child));
    }

    const listed = new Set(rows.map((c) => c._id));
    categories
      .filter((c) => !listed.has(c._id))
      .forEach((orphan) => rows.push(orphan));

    return rows;
  }, [categories, slugToCategory]);

  return (
    <div className="space-y-6 mt-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-[#0f172a] mb-2">
            Categories & Collections
          </h1>
          <p className="text-[#64748b]">
            Manage megamenu links and collection filters
          </p>
        </div>
        <Button
          className="bg-[#7da8c7] hover:bg-[#5a8faf] text-white"
          onClick={() => setModal({ mode: "create" })}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <GlassCard className="p-4">
          <p className="text-[#64748b] text-sm mb-1">Total</p>
          <p className="text-2xl font-semibold text-[#0f172a]">
            {categories.length}
          </p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-[#64748b] text-sm mb-1">In navbar</p>
          <p className="text-2xl font-semibold text-[#0f172a]">
            {navVisible.length}
          </p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-[#64748b] text-sm mb-1">Featured</p>
          <p className="text-2xl font-semibold text-[#0f172a]">
            {categories.filter((c) => c.featured).length}
          </p>
        </GlassCard>
      </div>

      <GlassCard className="overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#64748b] animate-pulse">
            Loading categories…
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-[#64748b] mb-4">No categories yet.</p>
            <Button onClick={() => setModal({ mode: "create" })}>
              <Plus className="w-4 h-4 mr-2" />
              Create your first category
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e8edf2] text-left text-[#64748b]">
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Parent</th>
                  <th className="px-4 py-3 font-medium">Filter</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((category) => (
                  <tr
                    key={category._id}
                    className="border-b border-[#f1f5f9] hover:bg-[#f8fafc]/80"
                  >
                    <td className="px-4 py-3 text-[#64748b]">
                      {category.order}
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className={`font-medium text-[#0f172a] ${category.parentId ? "pl-4 border-l-2 border-[#7da8c7]/40" : ""}`}
                      >
                        {category.name}
                      </div>
                      <div
                        className={`text-xs text-[#94a3b8] ${category.parentId ? "pl-4" : ""}`}
                      >
                        {category.slug}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#64748b]">
                      {category.parentName ??
                        (category.parentId
                          ? "—"
                          : DEFAULT_CHILD_PARENT_SLUGS[category.slug]
                            ? slugToCategory.get(
                                DEFAULT_CHILD_PARENT_SLUGS[category.slug]!,
                              )?.name
                            : "—") ??
                        "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="mr-2">
                        {category.filterType === "category" ? "category" : "search"}
                      </Badge>
                      <span className="text-[#64748b]">{category.filterValue}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {category.featured ? (
                          <Badge className="bg-[#7da8c7]/15 text-[#5a8faf] border-0">
                            Featured
                          </Badge>
                        ) : null}
                        {category.showInNav && category.isActive ? (
                          <Badge className="bg-green-500/10 text-green-700 border-0">
                            Nav
                          </Badge>
                        ) : null}
                        {!category.isActive ? (
                          <Badge variant="outline" className="text-[#94a3b8]">
                            Inactive
                          </Badge>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={categoryCollectionHref(
                            category.filterType,
                            category.filterValue,
                          )}
                          target="_blank"
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]"
                          title="View collection"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setModal({ mode: "edit", category })}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(category)}
                          disabled={deletingId === category._id}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {modal ? (
        <CategoryFormModal
          mode={modal.mode}
          category={modal.mode === "edit" ? modal.category : undefined}
          onClose={() => setModal(null)}
          onSaved={reloadList}
        />
      ) : null}
    </div>
  );
}
