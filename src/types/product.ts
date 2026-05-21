// src/types/product.ts

export interface ProductImage {
  url: string;
  alt?: string;
  isPrimary?: boolean;
  order?: number;
  public_id?: string;
}

export interface ProductReview {
  _id?: string;
  userId?: string;
  name?: string;
  rating: number;
  comment?: string;
  createdAt?: string;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface ProductAccordion {
  title: string;
  content: string;
}

export interface Product {
  _id: string;
  title: string;
  slug: string;
  tagline?: string;
  description?: string;

  category?: string;
  subCategory?: string;

  price: number;
  comparePrice?: number;
  discount?: number;

  images: ProductImage[];

  details?: string[];
  specifications?: ProductSpec[];
  care?: string;

  colors?: string[];
  sizes?: string[];

  stock?: number;
  isAvailable: boolean;

  reviews?: ProductReview[];
  rating?: number;
  numReviews?: number;

  badge?: string;
  isFeatured?: boolean;

  accordion?: ProductAccordion[];

  seoTitle?: string;
  seoDescription?: string;

  createdAt?: string;
  updatedAt?: string;
}

// The lightweight card variant used in listings
export type ProductSummary = Pick<
  Product,
  | "_id"
  | "title"
  | "slug"
  | "price"
  | "comparePrice"
  | "images"
  | "badge"
  | "category"
  | "colors"
  | "isAvailable"
>;
