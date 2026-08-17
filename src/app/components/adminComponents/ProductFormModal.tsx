"use client";

import {
  buildCollectionGroups,
  resolveProductCollectionFields,
  type CollectionGroup,
} from "@/lib/categories";
import {
  editFormToCreatePayload,
  editFormToUpdatePayload,
  emptyProductForm,
  filesToEditableImages,
  productToEditForm,
  type ProductEditForm,
} from "@/lib/product-edit-form";
import {
  BADGE_PRESETS,
  CARE_PRESETS,
  COLOR_PRESETS,
  DEFAULT_ACCORDION,
  DEFAULT_SPECS,
  DESCRIPTION_PLACEHOLDER,
  REQUIRED_FIELD_MESSAGE,
  SHIRT_SIZE_PRESETS,
  SIZE_PRESETS,
  SPEC_LABEL_PRESETS,
  TAGLINE_PLACEHOLDER,
  detailsPresetForCollection,
  toggleCsvValue,
} from "@/lib/product-form-presets";
import { normalizePrimaryFlags } from "@/lib/product-images";
import type { Category } from "@/types/category";
import type { Product } from "@/types/product";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type Props = {
  mode: "create" | "edit";
  product?: Product;
  onClose: () => void;
  onSaved: () => void;
  initialCategory?: string;
};

type FormErrors = Partial<Record<string, string>>;

function Field({
  id,
  label,
  hint,
  required,
  error,
  full,
  children,
}: {
  id?: string;
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      className={`zm-field ${full ? "full" : ""} ${error ? "has-error" : ""}`}
    >
      <div className="zm-label-row">
        <label className="zm-label">{label}</label>
        {required ? (
          <span className="zm-req">Required</span>
        ) : (
          <span className="zm-opt">Optional</span>
        )}
      </div>
      {hint ? <p className="zm-hint">{hint}</p> : null}
      {children}
      {error ? <p className="zm-error">{error}</p> : null}
    </div>
  );
}

function SectionHead({ title, lead }: { title: string; lead: string }) {
  return (
    <div className="zm-section">
      <h3 className="zm-section-title">{title}</h3>
      <p className="zm-section-lead">{lead}</p>
    </div>
  );
}

function Chips({
  options,
  onPick,
  active,
}: {
  options: string[];
  onPick: (value: string) => void;
  active?: (value: string) => boolean;
}) {
  return (
    <div className="zm-chips">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          className={`zm-chip ${active?.(opt) ? "is-on" : ""}`}
          onClick={() => onPick(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function ProductFormModal({
  mode,
  product,
  onClose,
  onSaved,
  initialCategory,
}: Props) {
  const isCreate = mode === "create";
  const [form, setForm] = useState<ProductEditForm>(() => {
    if (isCreate) {
      const base = emptyProductForm();
      if (initialCategory?.trim()) {
        base.category = initialCategory.trim();
      }
      return base;
    }
    return productToEditForm(product!);
  });
  const [collectionGroups, setCollectionGroups] = useState<CollectionGroup[]>(
    [],
  );
  const [loading, setLoading] = useState(!isCreate);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [originalSlug] = useState(product?.slug ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mappedCollectionsRef = useRef(false);
  const collectionGroupsRef = useRef(collectionGroups);
  collectionGroupsRef.current = collectionGroups;

  const selectedGroup = useMemo(
    () =>
      collectionGroups.find(
        (g) =>
          g.parent.name.toLowerCase() === form.category.trim().toLowerCase(),
      ) ?? null,
    [collectionGroups, form.category],
  );
  const childCategories = selectedGroup?.children ?? [];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/categories");
        if (!res.ok) return;
        const data = await res.json();
        const docs = Array.isArray(data.categories)
          ? (data.categories as Category[])
          : [];
        if (!cancelled) setCollectionGroups(buildCollectionGroups(docs));
      } catch {
        /* optional helper list */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!collectionGroups.length || mappedCollectionsRef.current) return;
    mappedCollectionsRef.current = true;
    const mapped = resolveProductCollectionFields(
      form.category,
      form.subCategory,
      collectionGroups,
    );
    if (
      mapped.collectionName !== form.category ||
      mapped.categoryName !== form.subCategory
    ) {
      setForm((prev) => ({
        ...prev,
        category: mapped.collectionName,
        subCategory: mapped.categoryName,
      }));
    }
  }, [collectionGroups, form.category, form.subCategory]);

  useEffect(() => {
    if (isCreate || !product) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/products/${encodeURIComponent(product.slug)}?admin=1`,
        );
        if (!res.ok) throw new Error("Could not load product");
        const data = (await res.json()) as Product;
        if (!cancelled) {
          const next = productToEditForm(data);
          const groups = collectionGroupsRef.current;
          if (groups.length) {
            const mapped = resolveProductCollectionFields(
              next.category,
              next.subCategory,
              groups,
            );
            next.category = mapped.collectionName;
            next.subCategory = mapped.categoryName;
          }
          setForm(next);
        }
      } catch {
        if (!cancelled) {
          const next = productToEditForm(product);
          const groups = collectionGroupsRef.current;
          if (groups.length) {
            const mapped = resolveProductCollectionFields(
              next.category,
              next.subCategory,
              groups,
            );
            next.category = mapped.collectionName;
            next.subCategory = mapped.categoryName;
          }
          setForm(next);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isCreate, product]);

  const patch = useCallback((partial: Partial<ProductEditForm>) => {
    setForm((prev) => ({ ...prev, ...partial }));
    setErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(partial)) {
        delete next[key];
        if (key === "colorsText") delete next.colors;
        if (key === "sizesText") delete next.sizes;
        if (key === "detailsText") delete next.details;
        if (key === "subCategory") delete next.category;
      }
      return next;
    });
  }, []);

  const removeImage = (index: number) => {
    setForm((prev) => {
      const next = prev.images.filter((_, i) => i !== index);
      if (next.length > 0 && !next.some((img) => img.isPrimary)) {
        next[0] = { ...next[0], isPrimary: true };
      }
      return { ...prev, images: next };
    });
  };

  const setPrimaryImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: normalizePrimaryFlags(
        prev.images.map((img, i) => ({
          ...img,
          isPrimary: i === index,
        })),
      ),
    }));
  };

  const handleAddImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    try {
      const added = await filesToEditableImages(files, form.title);
      setForm((prev) => {
        const start = prev.images.length;
        const merged = [
          ...prev.images,
          ...added.map((img, i) => ({
            ...img,
            isPrimary: start === 0 && i === 0,
            order: start + i,
          })),
        ];
        if (merged.length > 0 && !merged.some((img) => img.isPrimary)) {
          merged[0] = { ...merged[0], isPrimary: true };
        }
        return { ...prev, images: merged };
      });
      setErrors((prev) => {
        const next = { ...prev };
        delete next.images;
        return next;
      });
    } catch {
      toast.error("Could not read image files");
    } finally {
      e.target.value = "";
    }
  };

  const validateForm = () => {
    const next: FormErrors = {};
    if (!form.title.trim()) next.title = REQUIRED_FIELD_MESSAGE;
    if (!form.description.trim()) next.description = REQUIRED_FIELD_MESSAGE;
    if (!form.category.trim()) next.category = REQUIRED_FIELD_MESSAGE;
    if (childCategories.length > 0 && !form.subCategory.trim()) {
      next.subCategory =
        "Select a category for this collection before saving.";
    }
    if (!(form.price > 0)) {
      next.price = "Enter a selling price before you can save this product.";
    }
    if (!form.detailsText.trim()) next.details = REQUIRED_FIELD_MESSAGE;
    if (!form.care.trim()) next.care = REQUIRED_FIELD_MESSAGE;
    if (!form.colorsText.trim()) next.colors = REQUIRED_FIELD_MESSAGE;
    if (!form.sizesText.trim()) next.sizes = REQUIRED_FIELD_MESSAGE;
    if (form.images.length === 0) {
      next.images = "Add at least one product image before saving.";
    } else if (isCreate && !form.images.some((img) => img.file)) {
      next.images = "Upload at least one image file before saving.";
    }
    setErrors(next);
    const keys = Object.keys(next);
    if (keys.length > 0) {
      toast.error("Fill every required field before saving this product.");
      requestAnimationFrame(() => {
        document
          .getElementById(`zm-field-${keys[0]}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      if (isCreate) {
        const payload = editFormToCreatePayload(form);
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(
            typeof data.error === "string" ? data.error : "Create failed",
          );
        }
        toast.success("Product created");
      } else {
        const payload = editFormToUpdatePayload(form);
        const res = await fetch(
          `/api/products/${encodeURIComponent(originalSlug)}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(
            typeof data.error === "string" ? data.error : "Update failed",
          );
        }
        toast.success("Product updated");
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const titleLabel = isCreate ? "Add Product" : "Edit Product";
  const saveLabel = saving
    ? isCreate
      ? "Creating…"
      : "Updating…"
    : isCreate
      ? "Create Product"
      : "Update Product";

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
          width: 100%; max-width: 780px;
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
        .zm-modal-header { border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
        .zm-modal-footer { border-top: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 10px; background: #f8fafc; }
        .zm-footer-note { margin: 0; font-size: 12.5px; color: #64748b; }
        .zm-footer-actions { display: flex; gap: 12px; }
        .zm-modal-body { overflow-y: auto; flex: 1; padding: 28px 32px; display: flex; flex-direction: column; gap: 22px; }
        .zm-eyebrow { font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: #7da8c7; margin: 0 0 6px; font-weight: 500; }
        .zm-modal-title { font-family: var(--heading-font-family); font-size: 1.65rem; font-weight: var(--heading-font-weight); color: #0f172a; margin: 0; letter-spacing: -0.02em; }
        .zm-close-btn { width: 36px; height: 36px; border: 1px solid #e2e8f0; background: transparent; cursor: pointer; color: #64748b; }
        .zm-section { grid-column: 1 / -1; margin-top: 6px; }
        .zm-section-title { font-family: var(--heading-font-family); font-size: 1.15rem; font-weight: var(--heading-font-weight); color: #0f172a; margin: 0 0 4px; letter-spacing: -0.015em; }
        .zm-section-lead { font-size: 13px; line-height: 1.55; color: #64748b; margin: 0 0 8px; }
        .zm-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .zm-field { display: flex; flex-direction: column; gap: 7px; }
        .zm-field.full { grid-column: 1 / -1; }
        .zm-field.has-error .zm-input, .zm-field.has-error .zm-textarea, .zm-field.has-error .zm-select {
          border-color: #f1c0c0; background: #fff8f8;
        }
        .zm-label-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .zm-label { font-size: 13px; letter-spacing: 0.01em; font-weight: 600; color: #0f172a; }
        .zm-req, .zm-opt {
          font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; font-weight: 600;
          padding: 2px 7px; border-radius: 2px;
        }
        .zm-req { color: #9a3412; background: #fff7ed; border: 1px solid #fed7aa; }
        .zm-opt { color: #64748b; background: #f8fafc; border: 1px solid #e2e8f0; }
        .zm-input, .zm-textarea, .zm-select {
          background: #f8fafc; border: 1px solid #e2e8f0; color: #0f172a;
          font-size: 14px; line-height: 1.45; padding: 11px 12px; width: 100%; box-sizing: border-box; outline: none;
          font-family: inherit;
        }
        .zm-input::placeholder, .zm-textarea::placeholder { color: #94a3b8; font-size: 13px; }
        .zm-input:focus, .zm-textarea:focus, .zm-select:focus { border-color: #7da8c7; background: #f0f6fb; }
        .zm-textarea { resize: vertical; min-height: 88px; line-height: 1.65; }
        .zm-hint { font-size: 12.5px; line-height: 1.5; color: #64748b; margin: 0; }
        .zm-error { font-size: 12.5px; line-height: 1.45; color: #b91c1c; margin: 0; font-weight: 500; }
        .zm-chips { display: flex; flex-wrap: wrap; gap: 6px; }
        .zm-chip {
          border: 1px solid #e2e8f0; background: #fff; color: #475569; cursor: pointer;
          font-size: 12px; padding: 5px 10px; font-family: inherit;
        }
        .zm-chip:hover { border-color: #7da8c7; color: #0f172a; }
        .zm-chip.is-on { border-color: #7da8c7; background: #f0f6fb; color: #0f172a; }
        .zm-images { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .zm-img-card { position: relative; aspect-ratio: 1; border: 1px solid #e2e8f0; overflow: hidden; background: #f1f5f9; }
        .zm-img-card img { width: 100%; height: 100%; object-fit: cover; }
        .zm-img-actions { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: space-between; padding: 6px; }
        .zm-img-remove, .zm-img-primary {
          align-self: flex-end; font-size: 10px; padding: 4px 6px; border: 1px solid #e2e8f0;
          background: rgba(255,255,255,0.92); cursor: pointer; text-transform: uppercase; letter-spacing: 0.08em;
        }
        .zm-img-primary.is-primary { background: #7da8c7; color: #fff; border-color: #7da8c7; }
        .zm-img-new { position: absolute; top: 6px; left: 6px; font-size: 9px; padding: 2px 5px; background: #0f172a; color: #fff; letter-spacing: 0.06em; text-transform: uppercase; }
        .zm-spec-row, .zm-acc-row { display: grid; grid-template-columns: 1fr 1fr auto; gap: 8px; margin-bottom: 8px; }
        .zm-btn-ghost { border: 1px dashed #cbd5e1; background: transparent; padding: 8px 12px; font-size: 12px; color: #475569; cursor: pointer; font-family: inherit; }
        .zm-btn-ghost:hover { border-color: #7da8c7; color: #0f172a; }
        .zm-check-row { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border: 1px solid #e2e8f0; background: #f8fafc; }
        .zm-check-box { width: 16px; height: 16px; }
        .zm-btn-cancel { background: transparent; border: 1px solid #e2e8f0; padding: 12px 18px; font-size: 13px; cursor: pointer; color: #64748b; font-family: inherit; }
        .zm-btn-save { flex: 1; background: #7da8c7; border: 1px solid #7da8c7; color: #fff; padding: 12px 18px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
        .zm-btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
        .zm-slug { font-size: 12px; color: #94a3b8; word-break: break-all; margin: 6px 0 0; }
        @media (max-width: 640px) { .zm-row { grid-template-columns: 1fr; } .zm-images { grid-template-columns: repeat(2, 1fr); } }
      `}</style>

      <div className="zm-overlay" onClick={onClose}>
        <div className="zm-modal" onClick={(e) => e.stopPropagation()}>
          <div className="zm-modal-header">
            <div>
              <p className="zm-eyebrow">ZENmen — Admin</p>
              <h2 className="zm-modal-title">{titleLabel}</h2>
              {!isCreate && form.slug ? (
                <p className="zm-slug">Slug: {form.slug}</p>
              ) : null}
            </div>
            <button
              type="button"
              className="zm-close-btn"
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="zm-modal-body">
            {loading ? (
              <p className="text-sm text-[#64748b] animate-pulse">
                Loading full product details…
              </p>
            ) : (
              <>
                <SectionHead
                  title="Essentials"
                  lead="Name, collection, and price. These appear first on the product page and in the catalog."
                />
                <div className="zm-row">
                  <Field
                    id="zm-field-title"
                    label="Title"
                    required
                    error={errors.title}
                    hint="Customer-facing product name. Example: Ivory Linen Safari Shirt"
                    full
                  >
                    <input
                      className="zm-input"
                      value={form.title}
                      onChange={(e) => patch({ title: e.target.value })}
                      placeholder="Ivory Linen Safari Shirt"
                    />
                  </Field>
                  <Field
                    label="Tagline"
                    hint="Short line under the title on the product page. Keep it to one phrase."
                    full
                  >
                    <input
                      className="zm-input"
                      value={form.tagline}
                      onChange={(e) => patch({ tagline: e.target.value })}
                      placeholder={TAGLINE_PLACEHOLDER}
                    />
                  </Field>
                  <Field
                    id="zm-field-category"
                    label="Collection"
                    required
                    error={errors.category}
                    hint="Parent group in the menu — Shirt, Suit, Indo-Western, and so on."
                  >
                    <select
                      className="zm-input"
                      value={form.category}
                      onChange={(e) =>
                        patch({
                          category: e.target.value,
                          subCategory: "",
                        })
                      }
                    >
                      <option value="">Select collection</option>
                      {collectionGroups.map((g) => (
                        <option key={g.parent._id} value={g.parent.name}>
                          {g.parent.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field
                    id="zm-field-subCategory"
                    label="Category"
                    required={childCategories.length > 0}
                    error={errors.subCategory}
                    hint={
                      childCategories.length > 0
                        ? "Child type under this collection — e.g. Designer Shirt under Shirt."
                        : "This collection has no child categories, so the product is saved under the collection only."
                    }
                  >
                    {childCategories.length > 0 ? (
                      <select
                        className="zm-input"
                        value={form.subCategory}
                        onChange={(e) =>
                          patch({ subCategory: e.target.value })
                        }
                        disabled={!form.category}
                      >
                        <option value="">Select category</option>
                        {childCategories.map((child) => (
                          <option key={child._id} value={child.name}>
                            {child.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className="zm-input"
                        value={
                          form.category
                            ? "No categories — saved under this collection"
                            : "Select a collection first"
                        }
                        disabled
                      />
                    )}
                  </Field>
                  <Field
                    id="zm-field-price"
                    label="Price (₹)"
                    required
                    error={errors.price}
                    hint="Selling price shown to the customer."
                  >
                    <input
                      type="number"
                      min={0}
                      className="zm-input"
                      value={form.price || ""}
                      onChange={(e) =>
                        patch({ price: Number(e.target.value) || 0 })
                      }
                      placeholder="24900"
                    />
                  </Field>
                  <Field
                    label="Compare price (₹)"
                    hint="Original price before discount. Leave empty if there is no strike-through price."
                  >
                    <input
                      type="number"
                      min={0}
                      className="zm-input"
                      value={form.comparePrice}
                      onChange={(e) => patch({ comparePrice: e.target.value })}
                      placeholder="32000"
                    />
                  </Field>
                  <Field
                    label="Discount (%)"
                    hint="Optional percent off. Use 0 or leave empty if not on offer."
                  >
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className="zm-input"
                      value={form.discount}
                      onChange={(e) => patch({ discount: e.target.value })}
                      placeholder="10"
                    />
                  </Field>
                  <Field
                    label="Stock"
                    hint="Pieces you can sell now. 0 marks the product out of stock."
                  >
                    <input
                      type="number"
                      min={0}
                      className="zm-input"
                      value={form.stock}
                      onChange={(e) =>
                        patch({ stock: Number(e.target.value) || 0 })
                      }
                      placeholder="8"
                    />
                  </Field>
                  <Field
                    label="Badge"
                    hint="Small label on the card — New, Limited, Bespoke. Leave empty for no badge."
                    full
                  >
                    <input
                      className="zm-input"
                      value={form.badge}
                      onChange={(e) => patch({ badge: e.target.value })}
                      placeholder="New"
                    />
                    <Chips
                      options={BADGE_PRESETS}
                      onPick={(v) => patch({ badge: v })}
                      active={(v) =>
                        form.badge.trim().toLowerCase() === v.toLowerCase()
                      }
                    />
                  </Field>
                  <Field
                    label="Delivery estimate"
                    hint='Shown as a badge like "Ready in 14 days" on the collection and product page when enabled.'
                    full
                  >
                    <label className="zm-check-row">
                      <input
                        type="checkbox"
                        className="zm-check-box"
                        checked={form.showDeliveryLead}
                        onChange={(e) =>
                          patch({ showDeliveryLead: e.target.checked })
                        }
                      />
                      <span className="text-sm text-[#475569]">
                        Show delivery timeline to customers
                      </span>
                    </label>
                    <div className="zm-row">
                      <input
                        type="number"
                        min={0}
                        className="zm-input"
                        value={form.deliveryLeadValue}
                        onChange={(e) =>
                          patch({ deliveryLeadValue: e.target.value })
                        }
                        placeholder="14"
                      />
                      <select
                        className="zm-input"
                        value={form.deliveryLeadUnit}
                        onChange={(e) =>
                          patch({
                            deliveryLeadUnit: e.target
                              .value as typeof form.deliveryLeadUnit,
                          })
                        }
                      >
                        <option value="days">Days</option>
                        <option value="weeks">Weeks</option>
                        <option value="months">Months</option>
                      </select>
                    </div>
                    <Chips
                      options={["7 days", "14 days", "3 weeks"]}
                      onPick={(v) => {
                        if (v === "3 weeks") {
                          patch({
                            deliveryLeadValue: "3",
                            deliveryLeadUnit: "weeks",
                            showDeliveryLead: true,
                          });
                          return;
                        }
                        patch({
                          deliveryLeadValue: v.split(" ")[0],
                          deliveryLeadUnit: "days",
                          showDeliveryLead: true,
                        });
                      }}
                    />
                  </Field>
                  <Field
                    id="zm-field-description"
                    label="Description"
                    required
                    error={errors.description}
                    hint="Full story on the Description tab of the product page. 2–4 sentences is enough."
                    full
                  >
                    <textarea
                      className="zm-textarea"
                      rows={5}
                      value={form.description}
                      onChange={(e) => patch({ description: e.target.value })}
                      placeholder={DESCRIPTION_PLACEHOLDER}
                    />
                  </Field>
                </div>

                <SectionHead
                  title="Colours & sizes"
                  lead="These become the colour and size pickers on the product page. Tap a chip to add or remove it."
                />
                <div className="zm-row">
                  <Field
                    id="zm-field-colors"
                    label="Colours"
                    required
                    error={errors.colors}
                    hint="Comma-separated. Example: Navy, Ivory, Black"
                    full
                  >
                    <input
                      className="zm-input"
                      value={form.colorsText}
                      onChange={(e) => patch({ colorsText: e.target.value })}
                      placeholder="Navy, Ivory, Black"
                    />
                    <Chips
                      options={COLOR_PRESETS}
                      onPick={(v) =>
                        patch({
                          colorsText: toggleCsvValue(form.colorsText, v),
                        })
                      }
                      active={(v) =>
                        form.colorsText
                          .split(",")
                          .some(
                            (c) => c.trim().toLowerCase() === v.toLowerCase(),
                          )
                      }
                    />
                  </Field>
                  <Field
                    id="zm-field-sizes"
                    label="Sizes"
                    required
                    error={errors.sizes}
                    hint="Comma-separated. Use S–XXL or shirt collar sizes like 40, 42."
                    full
                  >
                    <input
                      className="zm-input"
                      value={form.sizesText}
                      onChange={(e) => patch({ sizesText: e.target.value })}
                      placeholder="S, M, L, XL, XXL"
                    />
                    <Chips
                      options={SIZE_PRESETS}
                      onPick={(v) =>
                        patch({
                          sizesText: toggleCsvValue(form.sizesText, v),
                        })
                      }
                      active={(v) =>
                        form.sizesText
                          .split(",")
                          .some(
                            (c) => c.trim().toLowerCase() === v.toLowerCase(),
                          )
                      }
                    />
                    <Chips
                      options={SHIRT_SIZE_PRESETS}
                      onPick={(v) =>
                        patch({
                          sizesText: toggleCsvValue(form.sizesText, v),
                        })
                      }
                      active={(v) =>
                        form.sizesText
                          .split(",")
                          .some(
                            (c) => c.trim().toLowerCase() === v.toLowerCase(),
                          )
                      }
                    />
                  </Field>
                </div>

                <SectionHead
                  title="Details & care"
                  lead="Details is the bullet list on the Details tab. Care is the Care tab. Fill both so the product page is not empty."
                />
                <Field
                  id="zm-field-details"
                  label="Details"
                  required
                  error={errors.details}
                  hint="One selling point per line. Shown as bullets on the product page."
                  full
                >
                  <textarea
                    className="zm-textarea"
                    rows={5}
                    value={form.detailsText}
                    onChange={(e) => patch({ detailsText: e.target.value })}
                    placeholder={detailsPresetForCollection(form.category)}
                  />
                  <button
                    type="button"
                    className="zm-btn-ghost"
                    onClick={() =>
                      patch({
                        detailsText: detailsPresetForCollection(form.category),
                      })
                    }
                  >
                    Use {form.category || "atelier"} details template
                  </button>
                </Field>
                <Field
                  id="zm-field-care"
                  label="Care instructions"
                  required
                  error={errors.care}
                  hint="How the customer should look after the garment. Shown on the Care tab."
                  full
                >
                  <textarea
                    className="zm-textarea"
                    rows={3}
                    value={form.care}
                    onChange={(e) => patch({ care: e.target.value })}
                    placeholder="Dry clean only. Steam preferred."
                  />
                  <Chips
                    options={CARE_PRESETS.map((c) => c.label)}
                    onPick={(label) => {
                      const preset = CARE_PRESETS.find((c) => c.label === label);
                      if (preset) patch({ care: preset.value });
                    }}
                    active={(label) =>
                      CARE_PRESETS.some(
                        (c) => c.label === label && c.value === form.care,
                      )
                    }
                  />
                </Field>

                <SectionHead
                  title="Specifications"
                  lead="Label + value rows on the Specs tab (Fabric, Fit, Occasion). Edit the prefilled rows or add more."
                />
                <Chips
                  options={SPEC_LABEL_PRESETS}
                  onPick={(label) => {
                    if (
                      form.specifications.some(
                        (s) => s.label.toLowerCase() === label.toLowerCase(),
                      )
                    ) {
                      return;
                    }
                    const emptyIndex = form.specifications.findIndex(
                      (s) => !s.label.trim() && !s.value.trim(),
                    );
                    if (emptyIndex >= 0) {
                      const specifications = [...form.specifications];
                      specifications[emptyIndex] = { label, value: "" };
                      patch({ specifications });
                      return;
                    }
                    patch({
                      specifications: [
                        ...form.specifications,
                        { label, value: "" },
                      ],
                    });
                  }}
                />
                {form.specifications.map((spec, index) => (
                  <div key={index} className="zm-spec-row">
                    <input
                      className="zm-input"
                      placeholder="Label — Fabric"
                      value={spec.label}
                      onChange={(e) => {
                        const specifications = [...form.specifications];
                        specifications[index] = {
                          ...spec,
                          label: e.target.value,
                        };
                        patch({ specifications });
                      }}
                    />
                    <input
                      className="zm-input"
                      placeholder="Value — Italian linen"
                      value={spec.value}
                      onChange={(e) => {
                        const specifications = [...form.specifications];
                        specifications[index] = {
                          ...spec,
                          value: e.target.value,
                        };
                        patch({ specifications });
                      }}
                    />
                    <button
                      type="button"
                      className="zm-btn-ghost"
                      onClick={() =>
                        patch({
                          specifications: form.specifications.filter(
                            (_, i) => i !== index,
                          ),
                        })
                      }
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="zm-btn-ghost"
                  onClick={() =>
                    patch({
                      specifications: [
                        ...form.specifications,
                        { label: "", value: "" },
                      ],
                    })
                  }
                >
                  + Add specification
                </button>
                <button
                  type="button"
                  className="zm-btn-ghost"
                  onClick={() =>
                    patch({
                      specifications: DEFAULT_SPECS.map((s) => ({ ...s })),
                    })
                  }
                >
                  Reset spec templates
                </button>

                <SectionHead
                  title="Product page sections"
                  lead="Accordion titles and content under the buy buttons — Shipping, Returns, Bespoke. Prefilled so you can edit, not start from a blank box."
                />
                {form.accordion.map((item, index) => (
                  <div key={index} className="zm-row" style={{ marginBottom: 8 }}>
                    <Field
                      label="Section title"
                      hint="Heading the customer taps to open this block."
                      full
                    >
                      <input
                        className="zm-input"
                        value={item.title}
                        onChange={(e) => {
                          const accordion = [...form.accordion];
                          accordion[index] = {
                            ...item,
                            title: e.target.value,
                          };
                          patch({ accordion });
                        }}
                        placeholder="Shipping & Delivery"
                      />
                    </Field>
                    <Field
                      label="Section content"
                      hint="The paragraph shown when that heading is opened."
                      full
                    >
                      <textarea
                        className="zm-textarea"
                        rows={3}
                        value={item.content}
                        onChange={(e) => {
                          const accordion = [...form.accordion];
                          accordion[index] = {
                            ...item,
                            content: e.target.value,
                          };
                          patch({ accordion });
                        }}
                        placeholder="Express delivery in 2–4 business days…"
                      />
                    </Field>
                    <button
                      type="button"
                      className="zm-btn-ghost"
                      onClick={() =>
                        patch({
                          accordion: form.accordion.filter((_, i) => i !== index),
                        })
                      }
                    >
                      Remove section
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="zm-btn-ghost"
                  onClick={() =>
                    patch({
                      accordion: [
                        ...form.accordion,
                        { title: "", content: "" },
                      ],
                    })
                  }
                >
                  + Add accordion section
                </button>
                <button
                  type="button"
                  className="zm-btn-ghost"
                  onClick={() =>
                    patch({
                      accordion: DEFAULT_ACCORDION.map((a) => ({ ...a })),
                    })
                  }
                >
                  Use standard shipping / returns / bespoke sections
                </button>

                <SectionHead
                  title="SEO"
                  lead="Optional. If empty, the product title and description are used in search listings."
                />
                <div className="zm-row">
                  <Field
                    label="SEO title"
                    hint="Browser tab and Google title. Example: Ivory Linen Safari Shirt | ZENmen"
                    full
                  >
                    <input
                      className="zm-input"
                      value={form.seoTitle}
                      onChange={(e) => patch({ seoTitle: e.target.value })}
                      placeholder={
                        form.title
                          ? `${form.title} | ZENmen`
                          : "Product name | ZENmen"
                      }
                    />
                  </Field>
                  <Field
                    label="SEO description"
                    hint="One or two sentences for search results. Not shown on the product page itself."
                    full
                  >
                    <textarea
                      className="zm-textarea"
                      rows={2}
                      value={form.seoDescription}
                      onChange={(e) =>
                        patch({ seoDescription: e.target.value })
                      }
                      placeholder="Hand-cut linen safari shirt from the ZENmen atelier in New Delhi."
                    />
                  </Field>
                </div>

                <SectionHead
                  title={`Images (${form.images.length})`}
                  lead={
                    isCreate
                      ? "Upload at least one photo. The primary image is the catalog thumbnail and first gallery shot."
                      : "Delete removes the file from Cloudinary on save. Add new files or keep the current ones."
                  }
                />
                <div id="zm-field-images">
                  {errors.images ? (
                    <p className="zm-error" style={{ marginBottom: 8 }}>
                      {errors.images}
                    </p>
                  ) : null}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleAddImages}
                  />
                  <button
                    type="button"
                    className="zm-btn-ghost"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    + Add images
                  </button>
                  <div className="zm-images" style={{ marginTop: 12 }}>
                    {form.images.map((img, index) => (
                      <div
                        key={`${img.public_id ?? img.url}-${index}`}
                        className="zm-img-card"
                      >
                        <img src={img.url} alt={img.alt ?? form.title} />
                        {img.file ? (
                          <span className="zm-img-new">New</span>
                        ) : null}
                        <div className="zm-img-actions">
                          <button
                            type="button"
                            className={`zm-img-primary ${img.isPrimary ? "is-primary" : ""}`}
                            onClick={() => setPrimaryImage(index)}
                          >
                            {img.isPrimary ? "Primary" : "Set primary"}
                          </button>
                          <button
                            type="button"
                            className="zm-img-remove"
                            onClick={() => removeImage(index)}
                            disabled={form.images.length <= 1}
                            title={
                              form.images.length <= 1
                                ? "At least one image required"
                                : "Remove image"
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <SectionHead
                  title="Visibility"
                  lead="Featured products appear on the home rail. Unavailable products stay hidden from the storefront."
                />
                <label className="zm-check-row">
                  <input
                    type="checkbox"
                    className="zm-check-box"
                    checked={form.isFeatured}
                    onChange={(e) => patch({ isFeatured: e.target.checked })}
                  />
                  <span className="text-sm text-[#475569]">
                    Featured product — show on the home page
                  </span>
                </label>
                <label className="zm-check-row">
                  <input
                    type="checkbox"
                    className="zm-check-box"
                    checked={form.isAvailable}
                    onChange={(e) => patch({ isAvailable: e.target.checked })}
                  />
                  <span className="text-sm text-[#475569]">
                    Available on storefront
                  </span>
                </label>
              </>
            )}
          </div>

          <div className="zm-modal-footer">
            <p className="zm-footer-note">
              Fields marked Required must be filled before you can save.
            </p>
            <div className="zm-footer-actions">
              <button type="button" className="zm-btn-cancel" onClick={onClose}>
                Discard
              </button>
              <button
                type="button"
                className="zm-btn-save"
                disabled={saving || loading}
                onClick={handleSave}
              >
                {saveLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
