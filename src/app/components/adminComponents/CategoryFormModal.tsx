"use client";

import type { Category, CategoryFilterType } from "@/types/category";
import { Package, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
  mode: "create" | "edit";
  category?: Category;
  onClose: () => void;
  onSaved: () => void;
};

type FormState = {
  name: string;
  slug: string;
  filterType: CategoryFilterType;
  filterValue: string;
  featured: boolean;
  isActive: boolean;
  showInNav: boolean;
  order: number;
  imageUrl: string;
  description: string;
  parentId: string;
};

type CategoryProduct = {
  _id: string;
  title: string;
  slug: string;
  price: number;
  category: string;
  subCategory: string;
  stock: number;
  isAvailable: boolean;
  assigned: boolean;
  imageUrl: string;
};

function emptyForm(): FormState {
  return {
    name: "",
    slug: "",
    filterType: "search",
    filterValue: "",
    featured: false,
    isActive: true,
    showInNav: true,
    order: 0,
    imageUrl: "",
    description: "",
    parentId: "",
  };
}

function categoryToForm(category: Category): FormState {
  return {
    name: category.name,
    slug: category.slug,
    filterType: category.filterType,
    filterValue: category.filterValue,
    featured: category.featured,
    isActive: category.isActive,
    showInNav: category.showInNav,
    order: category.order,
    imageUrl: category.imageUrl ?? "",
    description: category.description ?? "",
    parentId: category.parentId ?? "",
  };
}

function Field({
  label,
  children,
  full,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
  hint?: string;
}) {
  return (
    <div className={`zm-field ${full ? "full" : ""}`}>
      <label className="zm-label">{label}</label>
      {children}
      {hint ? <p className="zm-hint">{hint}</p> : null}
    </div>
  );
}

function formatInr(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function CategoryFormModal({
  mode,
  category,
  onClose,
  onSaved,
}: Props) {
  const isCreate = mode === "create";
  const [form, setForm] = useState<FormState>(() =>
    isCreate ? emptyForm() : categoryToForm(category!),
  );
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<CategoryProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [parentOptions, setParentOptions] = useState<Category[]>([]);
  const [updatingSlug, setUpdatingSlug] = useState<string | null>(null);

  const patch = useCallback((next: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...next }));
  }, []);

  const loadProducts = useCallback(async () => {
    if (isCreate || !category?._id) return;
    setProductsLoading(true);
    try {
      const res = await fetch(
        `/api/admin/categories/${category._id}/products`,
      );
      if (!res.ok) throw new Error("Could not load products");
      const data = await res.json();
      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch {
      toast.error("Failed to load category products");
    } finally {
      setProductsLoading(false);
    }
  }, [isCreate, category?._id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !updatingSlug) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, updatingSlug]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/categories");
        if (!res.ok) return;
        const data = await res.json();
        const all = Array.isArray(data.categories)
          ? (data.categories as Category[])
          : [];
        const names = all.map((c) => c.name).filter(Boolean);
        const parents = all.filter(
          (c) =>
            !c.parentId &&
            c._id !== category?._id &&
            (isCreate || c._id !== category?._id),
        );
        if (!cancelled) {
          setCategoryOptions(names);
          setParentOptions(parents);
        }
      } catch {
        /* optional */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [category?._id, isCreate]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleProductCategoryChange = async (
    product: CategoryProduct,
    nextCategory: string,
  ) => {
    if (nextCategory === product.category) return;

    setUpdatingSlug(product.slug);
    try {
      const res = await fetch(
        `/api/admin/products/${encodeURIComponent(product.slug)}/category`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: nextCategory }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.message === "string"
            ? data.message
            : "Could not update product",
        );
      }

      toast.success(`"${product.title}" moved to ${nextCategory}`);
      await loadProducts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setUpdatingSlug(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!form.filterValue.trim()) {
      toast.error("Filter value is required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        filterType: form.filterType,
        filterValue: form.filterValue.trim(),
        featured: form.featured,
        isActive: form.isActive,
        showInNav: form.showInNav,
        order: form.order,
        imageUrl: form.imageUrl.trim(),
        description: form.description.trim(),
        parentId: form.parentId.trim() || null,
      };

      const url = isCreate
        ? "/api/admin/categories"
        : `/api/admin/categories/${category!._id}`;
      const res = await fetch(url, {
        method: isCreate ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          typeof data.message === "string" ? data.message : "Save failed",
        );
      }

      toast.success(isCreate ? "Category created" : "Category updated");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const assignedCount = products.filter((p) => p.assigned).length;

  return (
    <>
      <style>{`
        @keyframes zm-modal-in {
          from { opacity: 0; transform: translateY(16px) scale(0.99); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .zm-overlay {
          position: fixed; inset: 0; z-index: 999;
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(6px);
          overflow-y: auto;
          padding: 24px 16px;
          display: flex; align-items: flex-start; justify-content: center;
        }
        .zm-modal {
          width: 100%; max-width: 860px;
          background: #fff; border: 1px solid #e2e8f0;
          display: flex; flex-direction: column;
          animation: zm-modal-in 0.32s cubic-bezier(0.22,1,0.36,1) both;
          max-height: 92vh;
        }
        .zm-modal-header, .zm-modal-footer {
          flex-shrink: 0;
          padding: 24px 32px;
          border-color: #e2e8f0;
        }
        .zm-modal-header { border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
        .zm-modal-footer { border-top: 1px solid #e2e8f0; display: flex; gap: 12px; background: #f8fafc; }
        .zm-modal-body { overflow-y: auto; flex: 1; padding: 28px 32px; display: flex; flex-direction: column; gap: 22px; }
        .zm-eyebrow { font-size: 9px; letter-spacing: 0.38em; text-transform: uppercase; color: #7da8c7; margin: 0 0 4px; }
        .zm-modal-title { font-family: var(--heading-font-family); font-size: 1.5rem; font-weight: var(--heading-font-weight); color: #0f172a; margin: 0; }
        .zm-close-btn { width: 36px; height: 36px; border: 1px solid #e2e8f0; background: transparent; cursor: pointer; color: #64748b; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .zm-close-btn:hover { border-color: #7da8c7; color: #0f172a; }
        .zm-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .zm-field { display: flex; flex-direction: column; gap: 6px; }
        .zm-field.full { grid-column: 1 / -1; }
        .zm-label { font-size: 9px; letter-spacing: 0.28em; text-transform: uppercase; color: #64748b; }
        .zm-input, .zm-textarea, .zm-select {
          background: #f8fafc; border: 1px solid #e2e8f0; color: #0f172a;
          font-size: 0.82rem; padding: 10px 12px; width: 100%; box-sizing: border-box; outline: none;
        }
        .zm-input:focus, .zm-textarea:focus, .zm-select:focus { border-color: #7da8c7; background: #f0f6fb; }
        .zm-textarea { resize: vertical; min-height: 72px; line-height: 1.6; }
        .zm-hint { font-size: 10px; color: #94a3b8; margin-top: 2px; line-height: 1.4; }
        .zm-check-row { display: flex; flex-wrap: wrap; gap: 12px; }
        .zm-check-item { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border: 1px solid #e2e8f0; background: #f8fafc; flex: 1; min-width: 180px; }
        .zm-check-box { width: 16px; height: 16px; accent-color: #7da8c7; }
        .zm-check-label { font-size: 0.78rem; color: #0f172a; }
        .zm-btn-cancel { background: transparent; border: 1px solid #e2e8f0; padding: 12px 18px; font-size: 0.72rem; letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer; color: #64748b; }
        .zm-btn-save { flex: 1; background: #7da8c7; border: 1px solid #7da8c7; color: #fff; padding: 12px 18px; font-size: 0.72rem; letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer; }
        .zm-btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
        .zm-slug { font-size: 11px; color: #94a3b8; word-break: break-all; margin-top: 4px; }
        .zm-section { border-top: 1px solid #e2e8f0; padding-top: 22px; display: flex; flex-direction: column; gap: 14px; }
        .zm-section-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .zm-section-title { font-size: 0.72rem; letter-spacing: 0.22em; text-transform: uppercase; color: #0f172a; margin: 0; }
        .zm-section-meta { font-size: 11px; color: #94a3b8; }
        .zm-product-list { display: flex; flex-direction: column; gap: 8px; max-height: 320px; overflow-y: auto; border: 1px solid #e2e8f0; background: #f8fafc; }
        .zm-product-row { display: grid; grid-template-columns: 52px 1fr 140px 180px; gap: 12px; align-items: center; padding: 10px 12px; background: #fff; border-bottom: 1px solid #f1f5f9; }
        .zm-product-row:last-child { border-bottom: 0; }
        .zm-product-thumb { width: 52px; height: 52px; border: 1px solid #e2e8f0; background: #f1f5f9; overflow: hidden; position: relative; }
        .zm-product-name { font-size: 0.82rem; color: #0f172a; margin: 0 0 2px; line-height: 1.3; }
        .zm-product-meta { font-size: 10px; color: #94a3b8; }
        .zm-product-price { font-size: 0.78rem; color: #0f172a; white-space: nowrap; }
        .zm-product-select { font-size: 0.75rem; padding: 8px 10px; }
        .zm-badge-soft { font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; padding: 2px 6px; border: 1px solid #7da8c7; color: #5a8faf; background: #f0f6fb; }
        .zm-badge-muted { font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; padding: 2px 6px; border: 1px solid #e2e8f0; color: #94a3b8; background: #f8fafc; }
        .zm-empty { padding: 28px 16px; text-align: center; color: #94a3b8; font-size: 0.82rem; }
        @media (max-width: 768px) {
          .zm-row { grid-template-columns: 1fr; }
          .zm-product-row { grid-template-columns: 44px 1fr; }
          .zm-product-price, .zm-product-select { grid-column: 2; }
        }
      `}</style>

      <div className="zm-overlay" onClick={onClose}>
        <div
          className="zm-modal"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="category-modal-title"
        >
          <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
            <div className="zm-modal-header">
              <div>
                <p className="zm-eyebrow">ZENmen — Admin</p>
                <h2 id="category-modal-title" className="zm-modal-title">
                  {isCreate ? "Add Category" : "Edit Category"}
                </h2>
                {!isCreate && form.slug ? (
                  <p className="zm-slug">Slug: {form.slug}</p>
                ) : null}
                <p className="zm-hint mt-2">
                  Controls megamenu links and collection filters
                </p>
              </div>
              <button
                type="button"
                className="zm-close-btn"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="zm-modal-body">
              <div className="zm-row">
                <Field label="Display name" full>
                  <input
                    className="zm-input"
                    value={form.name}
                    onChange={(e) => patch({ name: e.target.value })}
                    placeholder="e.g. Indo-Western"
                  />
                </Field>
                <Field
                  label="Slug (optional)"
                  hint="Auto-generated from name if left blank"
                >
                  <input
                    className="zm-input"
                    value={form.slug}
                    onChange={(e) => patch({ slug: e.target.value })}
                    placeholder="indo-western"
                  />
                </Field>
                <Field label="Sort order">
                  <input
                    type="number"
                    className="zm-input"
                    value={form.order}
                    onChange={(e) =>
                      patch({ order: Number(e.target.value) || 0 })
                    }
                  />
                </Field>
                <Field
                  label="Parent category"
                  hint="Leave empty for a top-level megamenu item. Pick a parent to show this as a sub-category (e.g. Designer Shirt under Shirt)."
                  full
                >
                  <select
                    className="zm-select"
                    value={form.parentId}
                    onChange={(e) => patch({ parentId: e.target.value })}
                  >
                    <option value="">None — top-level / parent</option>
                    {parentOptions.map((parent) => (
                      <option key={parent._id} value={parent._id}>
                        {parent.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field
                  label="Filter type"
                  hint="Search matches title/category text; Category matches product.category exactly"
                >
                  <select
                    className="zm-select"
                    value={form.filterType}
                    onChange={(e) =>
                      patch({
                        filterType: e.target.value as CategoryFilterType,
                      })
                    }
                  >
                    <option value="search">Search (?q=)</option>
                    <option value="category">Exact category (?category=)</option>
                  </select>
                </Field>
                <Field label="Filter value" full>
                  <input
                    className="zm-input"
                    value={form.filterValue}
                    onChange={(e) => patch({ filterValue: e.target.value })}
                    placeholder={
                      form.filterType === "category"
                        ? "e.g. Indo-Western"
                        : "e.g. indo-western"
                    }
                  />
                </Field>
                <Field label="Hero image URL (optional)" full>
                  <input
                    className="zm-input"
                    value={form.imageUrl}
                    onChange={(e) => patch({ imageUrl: e.target.value })}
                    placeholder="/zenmen_kurta.png"
                  />
                </Field>
                <Field label="Description (optional)" full>
                  <textarea
                    className="zm-textarea"
                    value={form.description}
                    onChange={(e) => patch({ description: e.target.value })}
                  />
                </Field>
              </div>

              <div className="zm-check-row">
                <label className="zm-check-item">
                  <input
                    type="checkbox"
                    className="zm-check-box"
                    checked={form.featured}
                    onChange={(e) => patch({ featured: e.target.checked })}
                  />
                  <span className="zm-check-label">Featured in megamenu</span>
                </label>
                <label className="zm-check-item">
                  <input
                    type="checkbox"
                    className="zm-check-box"
                    checked={form.showInNav}
                    onChange={(e) => patch({ showInNav: e.target.checked })}
                  />
                  <span className="zm-check-label">Show in navbar</span>
                </label>
                <label className="zm-check-item">
                  <input
                    type="checkbox"
                    className="zm-check-box"
                    checked={form.isActive}
                    onChange={(e) => patch({ isActive: e.target.checked })}
                  />
                  <span className="zm-check-label">Active</span>
                </label>
              </div>

              {!isCreate ? (
                <div className="zm-section">
                  <div className="zm-section-head">
                    <div>
                      <h3 className="zm-section-title">Products in this category</h3>
                      <p className="zm-section-meta">
                        {assignedCount} assigned
                        {products.length > assignedCount
                          ? ` · ${products.length - assignedCount} related by search`
                          : ""}
                      </p>
                    </div>
                    <Package className="w-4 h-4 text-[#7da8c7]" />
                  </div>

                  {productsLoading ? (
                    <div className="zm-empty animate-pulse">
                      Loading products…
                    </div>
                  ) : products.length === 0 ? (
                    <div className="zm-empty">
                      No products linked to this category yet.
                    </div>
                  ) : (
                    <div className="zm-product-list">
                      {products.map((product) => (
                        <div key={product._id} className="zm-product-row">
                          <div className="zm-product-thumb">
                            <Image
                              src={product.imageUrl || "/logo_zenmen.png"}
                              alt={product.title}
                              fill
                              className="object-cover"
                              sizes="52px"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="zm-product-name">{product.title}</p>
                            <p className="zm-product-meta">
                              {product.assigned ? (
                                <span className="zm-badge-soft mr-2">
                                  Assigned
                                </span>
                              ) : (
                                <span className="zm-badge-muted mr-2">
                                  Related
                                </span>
                              )}
                              Stock: {product.stock}
                              {!product.isAvailable ? " · Out of stock" : ""}
                            </p>
                          </div>
                          <div className="zm-product-price">
                            {formatInr(product.price)}
                          </div>
                          <select
                            className="zm-select zm-product-select"
                            value={product.category}
                            disabled={updatingSlug === product.slug}
                            onChange={(e) =>
                              handleProductCategoryChange(
                                product,
                                e.target.value,
                              )
                            }
                          >
                            {!categoryOptions.includes(product.category) ? (
                              <option value={product.category}>
                                {product.category || "Uncategorized"}
                              </option>
                            ) : null}
                            {categoryOptions.map((name) => (
                              <option key={name} value={name}>
                                {name}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <div className="zm-modal-footer">
              <button
                type="button"
                className="zm-btn-cancel"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="zm-btn-save"
                disabled={saving || Boolean(updatingSlug)}
              >
                {saving
                  ? "Saving…"
                  : isCreate
                    ? "Create Category"
                    : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
