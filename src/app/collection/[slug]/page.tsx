// src/app/collection/[slug]/page.tsx
import { connectDB } from "@/lib/db";
import {
  decodeSlugParam,
  encodeProductSlug,
  findProductBySlug,
} from "@/lib/product-slug";
import Product from "@/models/Product";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const product = await findProductBySlug(slug);
  if (!product) return { title: "Product Not Found — ZENmen" };

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
  await connectDB();
  const products = await Product.find({}, { slug: 1 }).lean();
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  await connectDB();
  const product = await findProductBySlug(slug);
  if (!product) notFound();

  const requested = decodeSlugParam(slug);
  if (requested !== product.slug) {
    redirect(`/collection/${encodeProductSlug(product.slug)}`);
  }

  return <ProductDetailClient product={JSON.parse(JSON.stringify(product))} />;
}
