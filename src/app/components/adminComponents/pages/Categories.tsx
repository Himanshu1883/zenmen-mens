"use client";

import CategoryFormModal from "@/app/components/adminComponents/CategoryFormModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  categoryCollectionHref,
  DEFAULT_CHILD_PARENT_BY_NAME,
  DEFAULT_CHILD_PARENT_SLUGS,
} from "@/lib/categories";
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

type DisplayRow = {
  category: Category;
  depth: 0 | 1;
  parentName?: string;
  isGroupHeader: boolean;
  childCount: number;
};

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

  const resolveParentId = useCallback(
    (cat: Category): string | null => {
      if (cat.parentId) return cat.parentId;
      const parentSlug =
        DEFAULT_CHILD_PARENT_SLUGS[cat.slug] ??
        DEFAULT_CHILD_PARENT_BY_NAME[cat.name.toLowerCase().trim()];
      if (!parentSlug) return null;
      return slugToCategory.get(parentSlug)?._id ?? null;
    },
    [slugToCategory],
  );

  const displayRows = useMemo(() => {
    const parentList = categories
      .filter((c) => !resolveParentId(c))
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

    const childMap = new Map<string, Category[]>();
    for (const cat of categories) {
      const parentId = resolveParentId(cat);
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

    const rows: DisplayRow[] = [];
    const listedIds = new Set<string>();

    for (const parent of parentList) {
      const children = childMap.get(parent._id) ?? [];
      const hasChildren = children.length > 0;
      rows.push({
        category: parent,
        depth: 0,
        isGroupHeader: hasChildren,
        childCount: children.length,
      });
      listedIds.add(parent._id);

      for (const child of children) {
        rows.push({
          category: child,
          depth: 1,
          parentName: child.parentName ?? parent.name,
          isGroupHeader: false,
          childCount: 0,
        });
        listedIds.add(child._id);
      }
    }

    const orphans = categories
      .filter((c) => !listedIds.has(c._id))
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

    for (const orphan of orphans) {
      rows.push({
        category: orphan,
        depth: 0,
        isGroupHeader: false,
        childCount: 0,
      });
    }

    return rows;
  }, [categories, resolveParentId]);

  const renderActions = (category: Category) => (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={categoryCollectionHref(category.filterType, category.filterValue)}
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
  );

  const renderStatusBadges = (category: Category) => (
    <div className="flex flex-wrap gap-1">
      {category.featured ? (
        <Badge className="bg-[#7da8c7]/15 text-[#5a8faf] border-0">Featured</Badge>
      ) : null}
      {category.showInNav && category.isActive ? (
        <Badge className="bg-green-500/10 text-green-700 border-0">Nav</Badge>
      ) : null}
      {!category.isActive ? (
        <Badge variant="outline" className="text-[#94a3b8]">
          Inactive
        </Badge>
      ) : null}
    </div>
  );

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
                  <th className="px-4 py-3 font-medium w-16">#</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Filter</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayRows.map((row, index) => {
                  const { category, depth, isGroupHeader, childCount } = row;

                  return (
                    <tr
                      key={category._id}
                      className={`border-b border-[#f1f5f9] hover:bg-[#f8fafc]/80 ${
                        isGroupHeader ? "bg-[#f8fafc]" : ""
                      } ${depth === 1 ? "bg-[#f8fafc]/40" : ""}`}
                    >
                      <td className="px-4 py-3 text-[#64748b] tabular-nums">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3">
                        {depth === 1 ? (
                          <div className="pl-8 border-l-2 border-[#7da8c7]/40 ml-1.5">
                            <div className="font-medium text-[#0f172a]">
                              {category.name}
                            </div>
                            <div className="text-xs text-[#94a3b8]">
                              {category.slug}
                              {row.parentName ? ` · under ${row.parentName}` : ""}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div
                              className={`text-[#0f172a] flex items-center gap-2 ${
                                isGroupHeader ? "font-semibold" : "font-medium"
                              }`}
                            >
                              {category.name}
                              {isGroupHeader ? (
                                <span className="text-xs font-normal text-[#94a3b8]">
                                  ({childCount})
                                </span>
                              ) : null}
                            </div>
                            <div className="text-xs text-[#94a3b8]">
                              {category.slug}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="mr-2">
                          {category.filterType === "category"
                            ? "category"
                            : "search"}
                        </Badge>
                        <span className="text-[#64748b]">
                          {category.filterValue}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {renderStatusBadges(category)}
                      </td>
                      <td className="px-4 py-3">{renderActions(category)}</td>
                    </tr>
                  );
                })}
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
