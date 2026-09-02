// src/app/sitemap.ts
import { connectDB } from "@/lib/db";
import { STOREFRONT_HAS_IMAGE_FILTER } from "@/lib/product-images";
import { isStaticSafeSlug } from "@/lib/product-slug";
import { siteUrl } from "@/lib/site";
import {
  ACCESSORIES_COLLECTION_HREF,
  defaultNavGroupsFallback,
} from "@/lib/categories";
import Product from "@/models/Product";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteUrl();

  const collectionPaths = new Set<string>([
    "/collection",
    ACCESSORIES_COLLECTION_HREF,
  ]);
  for (const group of defaultNavGroupsFallback()) {
    collectionPaths.add(group.parent.href);
    for (const child of group.children) {
      collectionPaths.add(child.href);
    }
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...[...collectionPaths].map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "/collection" ? 0.9 : 0.75,
    })),
    { url: `${baseUrl}/about`, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${baseUrl}/appointment`, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${baseUrl}/stories`, changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${baseUrl}/services`, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${baseUrl}/privacy`, changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${baseUrl}/terms`, changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${baseUrl}/shipping`, changeFrequency: "yearly" as const, priority: 0.3 },
  ];

  try {
    await connectDB();
    const products = await Product.find(
      { isAvailable: true, ...STOREFRONT_HAS_IMAGE_FILTER },
      { slug: 1, updatedAt: 1 },
    ).lean();

    const productUrls: MetadataRoute.Sitemap = products
      .filter((p) => isStaticSafeSlug(p.slug))
      .map((p) => ({
        url: `${baseUrl}/collection/${encodeURIComponent(String(p.slug))}`,
        lastModified: p.updatedAt ?? new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));

    return [...staticRoutes, ...productUrls];
  } catch (err) {
    console.error("[sitemap] skipped product URLs (database unavailable)", err);
    return staticRoutes;
  }
}
