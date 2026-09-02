import {
  ACCESSORIES_COLLECTION_HREF,
  defaultNavGroupsFallback,
  resolveCollectionPageContext,
} from "@/lib/categories";
import { SITE_NAME } from "@/lib/site";
import type { Metadata } from "next";

function firstParam(value?: string | string[]) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export function collectionListingMetadata(
  qRaw?: string | string[],
  categoryRaw?: string | string[],
): Metadata {
  const q = firstParam(qRaw);
  const category = firstParam(categoryRaw);
  const ctx = resolveCollectionPageContext(
    q,
    category,
    defaultNavGroupsFallback(),
  );

  if (ctx.isTextSearch && ctx.searchNeedle) {
    const title = `Search results for “${ctx.searchNeedle}”`;
    const description = `Search ${SITE_NAME} collections for ${ctx.searchNeedle}.`;
    return {
      title,
      description,
      robots: { index: false, follow: true },
      alternates: {
        canonical: `/collection?q=${encodeURIComponent(ctx.searchNeedle)}`,
      },
    };
  }

  if (ctx.accessoryGroups && ctx.accessoryGroups.length > 0) {
    const title = "Accessories";
    const description = `Buttons, ties, and brooches from ${SITE_NAME}, New Delhi.`;
    return {
      title,
      description,
      alternates: { canonical: ACCESSORIES_COLLECTION_HREF },
      openGraph: {
        title,
        description,
        url: ACCESSORIES_COLLECTION_HREF,
      },
    };
  }

  if (ctx.group) {
    const collection = ctx.group.parent.name;
    const child = ctx.group.children.find((item) => item.name === ctx.childName);
    const title = ctx.childName ?? collection;
    const description = ctx.childName
      ? `${ctx.childName} from ${SITE_NAME}’s ${collection} collection. Bespoke menswear, New Delhi.`
      : `Shop ${collection} at ${SITE_NAME}. Bespoke menswear from our New Delhi atelier.`;
    const href = child?.href ?? ctx.group.parent.href;
    return {
      title,
      description,
      alternates: { canonical: href },
      openGraph: { title, description, url: href },
    };
  }

  return {
    title: "Collections",
    description:
      "Shop ZENmen collections: suits, shirts, Indo-Western, Jodhpuri, sherwanis, kurtas and accessories. Bespoke menswear from New Delhi.",
    alternates: { canonical: "/collection" },
    openGraph: {
      title: "Collections",
      description:
        "Shop ZENmen collections of bespoke menswear from our New Delhi atelier.",
      url: "/collection",
    },
  };
}
