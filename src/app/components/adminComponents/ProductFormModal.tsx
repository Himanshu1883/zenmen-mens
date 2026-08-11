"use client";

import {
  editFormToCreatePayload,
  editFormToUpdatePayload,
  emptyProductForm,
  filesToEditableImages,
  productToEditForm,
  type ProductEditForm,
} from "@/lib/product-edit-form";
import { normalizePrimaryFlags } from "@/lib/product-images";
import type { Product } from "@/types/product";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type Props = {
  mode: "create" | "edit";
  product?: Product;
  onClose: () => void;
  onSaved: () => void;
  initialCategory?: string;
};

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={`zm-field ${full ? "full" : ""}`}>
      <label className="zm-label">{label}</label>
      {children}
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
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(!isCreate);
  const [saving, setSaving] = useState(false);
  const [originalSlug] = useState(product?.slug ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/categories");
        if (!res.ok) return;
        const data = await res.json();
        const names = Array.isArray(data.categories)
          ? (data.categories as { name: string }[])
              .map((c) => c.name)
              .filter(Boolean)
          : [];
        if (!cancelled) setCategoryOptions(names);
      } catch {
        /* optional helper list */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
        if (!cancelled) setForm(productToEditForm(data));
      } catch {
        if (!cancelled) setForm(productToEditForm(product));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isCreate, product]);

  const patch = useCallback(
    (partial: Partial<ProductEditForm>) =>
      setForm((prev) => ({ ...prev, ...partial })),
    [],
  );

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
    } catch {
      toast.error("Could not read image files");
    } finally {
      e.target.value = "";
    }
  };

  const validateForm = () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return false;
    }
    if (!form.description.trim()) {
      toast.error("Description is required");
      return false;
    }
    if (!form.category.trim()) {
      toast.error("Category is required");
      return false;
    }
    if (form.images.length === 0) {
      toast.error("At least one image is required");
      return false;
    }
    if (isCreate && !form.images.some((img) => img.file)) {
      toast.error("Upload at least one image file");
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
        .zm-modal-footer { border-top: 1px solid #e2e8f0; display: flex; gap: 12px; background: #f8fafc; }
        .zm-modal-body { overflow-y: auto; flex: 1; padding: 28px 32px; display: flex; flex-direction: column; gap: 22px; }
        .zm-eyebrow { font-size: 9px; letter-spacing: 0.38em; text-transform: uppercase; color: #7da8c7; margin: 0 0 4px; }
        .zm-modal-title { font-family: var(--heading-font-family); font-size: 1.5rem; font-weight: var(--heading-font-weight); color: #0f172a; margin: 0; }
        .zm-close-btn { width: 36px; height: 36px; border: 1px solid #e2e8f0; background: transparent; cursor: pointer; color: #64748b; }
        .zm-badge { font-size: 9px; letter-spacing: 0.32em; text-transform: uppercase; color: #7da8c7; }
        .zm-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .zm-field { display: flex; flex-direction: column; gap: 6px; }
        .zm-field.full { grid-column: 1 / -1; }
        .zm-label { font-size: 9px; letter-spacing: 0.28em; text-transform: uppercase; color: #64748b; }
        .zm-input, .zm-textarea, .zm-select {
          background: #f8fafc; border: 1px solid #e2e8f0; color: #0f172a;
          font-size: 0.82rem; padding: 10px 12px; width: 100%; box-sizing: border-box; outline: none;
        }
        .zm-input:focus, .zm-textarea:focus { border-color: #7da8c7; background: #f0f6fb; }
        .zm-textarea { resize: vertical; min-height: 72px; line-height: 1.6; }
        .zm-hint { font-size: 10px; color: #94a3b8; margin-top: 2px; }
        .zm-images { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .zm-img-card { position: relative; aspect-ratio: 1; border: 1px solid #e2e8f0; overflow: hidden; background: #f1f5f9; }
        .zm-img-card img { width: 100%; height: 100%; object-fit: cover; }
        .zm-img-actions { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: space-between; padding: 6px; }
        .zm-img-remove, .zm-img-primary {
          align-self: flex-end; font-size: 9px; padding: 4px 6px; border: 1px solid #e2e8f0;
          background: rgba(255,255,255,0.92); cursor: pointer; text-transform: uppercase; letter-spacing: 0.1em;
        }
        .zm-img-primary.is-primary { background: #7da8c7; color: #fff; border-color: #7da8c7; }
        .zm-img-new { position: absolute; top: 6px; left: 6px; font-size: 8px; padding: 2px 5px; background: #0f172a; color: #fff; letter-spacing: 0.08em; text-transform: uppercase; }
        .zm-spec-row, .zm-acc-row { display: grid; grid-template-columns: 1fr 1fr auto; gap: 8px; margin-bottom: 8px; }
        .zm-btn-ghost { border: 1px dashed #cbd5e1; background: transparent; padding: 8px 12px; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: #64748b; cursor: pointer; }
        .zm-btn-ghost:hover { border-color: #7da8c7; color: #0f172a; }
        .zm-check-row { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border: 1px solid #e2e8f0; background: #f8fafc; }
        .zm-check-box { width: 16px; height: 16px; }
        .zm-btn-cancel { background: transparent; border: 1px solid #e2e8f0; padding: 12px 18px; font-size: 0.72rem; letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer; color: #64748b; }
        .zm-btn-save { flex: 1; background: #7da8c7; border: 1px solid #7da8c7; color: #fff; padding: 12px 18px; font-size: 0.72rem; letter-spacing: 0.2em; text-transform: uppercase; cursor: pointer; }
        .zm-btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
        .zm-slug { font-size: 11px; color: #94a3b8; word-break: break-all; }
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
                <span className="zm-badge">Essentials</span>
                <div className="zm-row">
                  <Field label="Title" full>
                    <input
                      className="zm-input"
                      value={form.title}
                      onChange={(e) => patch({ title: e.target.value })}
                    />
                  </Field>
                  <Field label="Tagline" full>
                    <input
                      className="zm-input"
                      value={form.tagline}
                      onChange={(e) => patch({ tagline: e.target.value })}
                    />
                  </Field>
                  <Field label="Category">
                    <input
                      className="zm-input"
                      list="product-category-options"
                      value={form.category}
                      onChange={(e) => patch({ category: e.target.value })}
                    />
                    {categoryOptions.length > 0 ? (
                      <datalist id="product-category-options">
                        {categoryOptions.map((name) => (
                          <option key={name} value={name} />
                        ))}
                      </datalist>
                    ) : null}
                  </Field>
                  <Field label="Sub-category">
                    <input
                      className="zm-input"
                      value={form.subCategory}
                      onChange={(e) => patch({ subCategory: e.target.value })}
                    />
                  </Field>
                  <Field label="Price (₹)">
                    <input
                      type="number"
                      min={0}
                      className="zm-input"
                      value={form.price}
                      onChange={(e) =>
                        patch({ price: Number(e.target.value) || 0 })
                      }
                    />
                  </Field>
                  <Field label="Compare price (₹)">
                    <input
                      type="number"
                      min={0}
                      className="zm-input"
                      value={form.comparePrice}
                      onChange={(e) => patch({ comparePrice: e.target.value })}
                    />
                  </Field>
                  <Field label="Discount (%)">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className="zm-input"
                      value={form.discount}
                      onChange={(e) => patch({ discount: e.target.value })}
                    />
                  </Field>
                  <Field label="Stock">
                    <input
                      type="number"
                      min={0}
                      className="zm-input"
                      value={form.stock}
                      onChange={(e) =>
                        patch({ stock: Number(e.target.value) || 0 })
                      }
                    />
                  </Field>
                  <Field label="Badge">
                    <input
                      className="zm-input"
                      value={form.badge}
                      onChange={(e) => patch({ badge: e.target.value })}
                      placeholder="New, Limited, etc."
                    />
                  </Field>
                  <Field label="Delivery estimate" full>
                    <label className="zm-check-row mb-3">
                      <input
                        type="checkbox"
                        className="zm-check-box"
                        checked={form.showDeliveryLead}
                        onChange={(e) =>
                          patch({ showDeliveryLead: e.target.checked })
                        }
                      />
                      <span className="text-sm text-[#475569]">
                        Show delivery timeline on collection &amp; product page
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
                        placeholder="e.g. 14"
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
                    <p className="zm-hint mt-2">
                      Customers see a badge like &quot;Ready in 14 days&quot; when
                      enabled and a value is set.
                    </p>
                  </Field>
                  <Field label="Description" full>
                    <textarea
                      className="zm-textarea"
                      rows={5}
                      value={form.description}
                      onChange={(e) => patch({ description: e.target.value })}
                    />
                  </Field>
                  <Field label="Care instructions" full>
                    <textarea
                      className="zm-textarea"
                      rows={3}
                      value={form.care}
                      onChange={(e) => patch({ care: e.target.value })}
                    />
                  </Field>
                </div>

                <span className="zm-badge">Variants</span>
                <div className="zm-row">
                  <Field label="Colors" full>
                    <input
                      className="zm-input"
                      value={form.colorsText}
                      onChange={(e) => patch({ colorsText: e.target.value })}
                      placeholder="Navy, Ivory, Black"
                    />
                    <p className="zm-hint">Comma-separated</p>
                  </Field>
                  <Field label="Sizes" full>
                    <input
                      className="zm-input"
                      value={form.sizesText}
                      onChange={(e) => patch({ sizesText: e.target.value })}
                      placeholder="S, M, L, XL"
                    />
                    <p className="zm-hint">Comma-separated</p>
                  </Field>
                </div>

                <span className="zm-badge">Details &amp; specs</span>
                <Field label="Detail bullets (one per line)" full>
                  <textarea
                    className="zm-textarea"
                    rows={4}
                    value={form.detailsText}
                    onChange={(e) => patch({ detailsText: e.target.value })}
                  />
                </Field>

                {form.specifications.map((spec, index) => (
                  <div key={index} className="zm-spec-row">
                    <input
                      className="zm-input"
                      placeholder="Label"
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
                      placeholder="Value"
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

                <span className="zm-badge">Accordion (PDP)</span>
                {form.accordion.map((item, index) => (
                  <div key={index} className="zm-row" style={{ marginBottom: 8 }}>
                    <Field label="Section title" full>
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
                      />
                    </Field>
                    <Field label="Content" full>
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

                <span className="zm-badge">SEO</span>
                <div className="zm-row">
                  <Field label="SEO title" full>
                    <input
                      className="zm-input"
                      value={form.seoTitle}
                      onChange={(e) => patch({ seoTitle: e.target.value })}
                    />
                  </Field>
                  <Field label="SEO description" full>
                    <textarea
                      className="zm-textarea"
                      rows={2}
                      value={form.seoDescription}
                      onChange={(e) =>
                        patch({ seoDescription: e.target.value })
                      }
                    />
                  </Field>
                </div>

                <span className="zm-badge">Images ({form.images.length})</span>
                <p className="zm-hint">
                  {isCreate
                    ? "Upload one or more images. Mark one as primary."
                    : "Remove deletes from Cloudinary on save. Add new files or keep existing URLs."}
                </p>
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
                <div className="zm-images">
                  {form.images.map((img, index) => (
                    <div
                      key={`${img.public_id ?? img.url}-${index}`}
                      className="zm-img-card"
                    >
                      <img src={img.url} alt={img.alt ?? form.title} />
                      {img.file ? <span className="zm-img-new">New</span> : null}
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

                <span className="zm-badge">Visibility</span>
                <label className="zm-check-row">
                  <input
                    type="checkbox"
                    className="zm-check-box"
                    checked={form.isFeatured}
                    onChange={(e) => patch({ isFeatured: e.target.checked })}
                  />
                  <span className="text-sm text-[#475569]">Featured product</span>
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
    </>
  );
}
