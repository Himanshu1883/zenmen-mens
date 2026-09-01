// src/app/collection/[slug]/page.tsx
import { connectDB } from "@/lib/db";
import { productHasStorefrontImage, STOREFRONT_HAS_IMAGE_FILTER } from "@/lib/product-images";
import {
  decodeSlugParam,
  encodeProductSlug,
  findProductBySlug,
  isStaticSafeSlug,
} from "@/lib/product-slug";
import Product from "@/models/Product";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";

type Props = { params: Promise<{ slug: string }> };

/** Allow request-time rendering for legacy / non-canonical slugs */
export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const product = await findProductBySlug(slug);
  if (!product || !productHasStorefrontImage(product.images)) {
    return { title: "Product Not Found — ZENmen" };
  }

  return {
    title: `${product.seoTitle ?? product.title} — ZENmen Bespoke`,
    description:
      product.seoDescription ?? product.tagline ?? product.description,
    openGraph: {
      title: product.title,
      description: product.tagline ?? "",
      images: product.images?.[0]?.url ? [product.images[0].url] : [],
    },
  };
}

export async function generateStaticParams() {
  try {
    await connectDB();
    const products = await Product.find(STOREFRONT_HAS_IMAGE_FILTER, {
      slug: 1,
    }).lean();
    return products
      .map((p) => String(p.slug ?? ""))
      .filter(isStaticSafeSlug)
      .map((slug) => ({ slug }));
  } catch (err) {
    console.error("[generateStaticParams] collection/[slug]", err);
    return [];
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  await connectDB();
  const product = await findProductBySlug(slug);
  if (!product) notFound();
  if (!productHasStorefrontImage(product.images)) notFound();

  const requested = decodeSlugParam(slug);
  if (requested !== product.slug) {
    redirect(`/collection/${encodeProductSlug(product.slug)}`);
  }

  return <ProductDetailClient product={JSON.parse(JSON.stringify(product))} />;
}
