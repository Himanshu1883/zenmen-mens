import { resolveImagePublicId } from "@/lib/cloudinary-public-id";
import type { Product, ProductAccordion, ProductSpec } from "@/types/product";

export type EditableImage = {
  url: string;
  alt?: string;
  isPrimary?: boolean;
  order?: number;
  public_id?: string;
};

export type ProductEditForm = {
  _id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  subCategory: string;
  price: number;
  comparePrice: string;
  discount: string;
  stock: number;
  badge: string;
  care: string;
  colorsText: string;
  sizesText: string;
  detailsText: string;
  specifications: ProductSpec[];
  accordion: ProductAccordion[];
  seoTitle: string;
  seoDescription: string;
  isFeatured: boolean;
  isAvailable: boolean;
  images: EditableImage[];
};

function splitLines(text: string): string[] {
  return text
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function productToEditForm(product: Product): ProductEditForm {
  return {
    _id: product._id,
    slug: product.slug,
    title: product.title ?? "",
    tagline: product.tagline ?? "",
    description: product.description ?? "",
    category: product.category ?? "",
    subCategory: product.subCategory ?? "",
    price: product.price ?? 0,
    comparePrice:
      product.comparePrice != null ? String(product.comparePrice) : "",
    discount: product.discount != null ? String(product.discount) : "",
    stock: product.stock ?? 0,
    badge: product.badge ?? "",
    care: product.care ?? "",
    colorsText: (product.colors ?? []).join(", "),
    sizesText: (product.sizes ?? []).join(", "),
    detailsText: (product.details ?? []).join("\n"),
    specifications: product.specifications?.length
      ? product.specifications.map((s) => ({ ...s }))
      : [{ label: "", value: "" }],
    accordion: product.accordion?.length
      ? product.accordion.map((a) => ({ ...a }))
      : [{ title: "", content: "" }],
    seoTitle: product.seoTitle ?? "",
    seoDescription: product.seoDescription ?? "",
    isFeatured: Boolean(product.isFeatured),
    isAvailable: product.isAvailable !== false,
    images: (product.images ?? []).map((img, index) => ({
      url: img.url,
      alt: img.alt ?? product.title,
      isPrimary: img.isPrimary ?? index === 0,
      order: img.order ?? index,
      public_id: resolveImagePublicId(img) ?? undefined,
    })),
  };
}

export function editFormToUpdatePayload(form: ProductEditForm) {
  const comparePrice = form.comparePrice.trim()
    ? Number(form.comparePrice)
    : undefined;
  const discount = form.discount.trim() ? Number(form.discount) : undefined;

  const images = form.images
    .map((img, index) => {
      const public_id = resolveImagePublicId(img);
      if (!public_id) return null;
      return {
        url: img.url,
        alt: img.alt || form.title,
        isPrimary: img.isPrimary ?? index === 0,
        order: img.order ?? index,
        public_id,
      };
    })
    .filter(Boolean) as {
    url: string;
    alt: string;
    isPrimary: boolean;
    order: number;
    public_id: string;
  }[];

  if (images.length > 0 && !images.some((i) => i.isPrimary)) {
    images[0].isPrimary = true;
  }

  return {
    title: form.title.trim(),
    tagline: form.tagline.trim() || undefined,
    description: form.description.trim(),
    category: form.category.trim(),
    subCategory: form.subCategory.trim() || undefined,
    price: Number(form.price),
    comparePrice:
      comparePrice != null && !Number.isNaN(comparePrice)
        ? comparePrice
        : undefined,
    discount:
      discount != null && !Number.isNaN(discount) ? discount : undefined,
    stock: Number(form.stock),
    isAvailable: form.isAvailable,
    badge: form.badge.trim() || undefined,
    care: form.care.trim() || undefined,
    colors: splitLines(form.colorsText),
    sizes: splitLines(form.sizesText),
    details: form.detailsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    specifications: form.specifications.filter(
      (s) => s.label.trim() || s.value.trim(),
    ),
    accordion: form.accordion.filter(
      (a) => a.title.trim() || a.content.trim(),
    ),
    seoTitle: form.seoTitle.trim() || undefined,
    seoDescription: form.seoDescription.trim() || undefined,
    isFeatured: form.isFeatured,
    images,
  };
}
