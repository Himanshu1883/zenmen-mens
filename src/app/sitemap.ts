// src/app/sitemap.ts
import { connectDB } from "@/lib/db";
import { isStaticSafeSlug } from "@/lib/product-slug";
import Product from "@/models/Product";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL ?? "https://zenmen.in";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/collection`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    { url: `${baseUrl}/services`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/process`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/shipping`, changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    await connectDB();
    const products = await Product.find({}, { slug: 1, updatedAt: 1 }).lean();

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
