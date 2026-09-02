// src/app/collection/[slug]/page.tsx
import JsonLd from "@/app/components/seo/JsonLd";
import { connectDB } from "@/lib/db";
import {
  getPrimaryImage,
  productHasStorefrontImage,
  STOREFRONT_HAS_IMAGE_FILTER,
} from "@/lib/product-images";
import { getDisplayPricing } from "@/lib/product-price";
import { absoluteUrl, siteUrl, SITE_NAME } from "@/lib/site";
import { findProductBySlug } from "@/lib/find-product-by-slug";
import {
  decodeSlugParam,
  encodeProductSlug,
  isStaticSafeSlug,
  productCollectionHref,
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
    return {
      title: { absolute: `Product Not Found — ${SITE_NAME}` },
      robots: { index: false, follow: false },
    };
  }

  const description =
    product.seoDescription ??
    product.tagline ??
    product.description ??
    `Shop ${product.title} at ZENmen, New Delhi.`;
  const primary = getPrimaryImage(product.images);
  const imageUrl = primary?.url;
  const path = productCollectionHref(product.slug);

  return {
    title: product.seoTitle ?? product.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: product.title,
      description: product.tagline ?? description,
      type: "website",
      url: path,
      images: imageUrl
        ? [{ url: imageUrl, alt: primary?.alt || product.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: product.tagline ?? description,
      images: imageUrl ? [imageUrl] : undefined,
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

  const canonical = encodeProductSlug(product.slug);
  const requested = decodeSlugParam(slug);
  if (canonical && requested !== canonical && slug !== canonical) {
    redirect(`/collection/${canonical}`);
  }

  const primary = getPrimaryImage(product.images);
  const { selling } = getDisplayPricing(product);
  const path = productCollectionHref(product.slug);
  const productUrl = absoluteUrl(path);
  const origin = siteUrl();

  return (
    <>
      <JsonLd
        data={{
          "@type": "Product",
          name: product.title,
          url: productUrl,
          description:
            product.seoDescription ??
            product.tagline ??
            product.description ??
            product.title,
          image: primary?.url ? absoluteUrl(primary.url) : undefined,
          brand: { "@type": "Brand", name: SITE_NAME },
          sku: product.slug,
          offers: {
            "@type": "Offer",
            url: productUrl,
            priceCurrency: "INR",
            price: selling,
            itemCondition: "https://schema.org/NewCondition",
            availability:
              product.isAvailable === false
                ? "https://schema.org/OutOfStock"
                : "https://schema.org/InStock",
            seller: { "@type": "Organization", name: SITE_NAME },
          },
        }}
      />
      <JsonLd
        data={{
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: origin,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Collections",
              item: `${origin}/collection`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: product.title,
              item: productUrl,
            },
          ],
        }}
      />
      <ProductDetailClient product={JSON.parse(JSON.stringify(product))} />
    </>
  );
}
