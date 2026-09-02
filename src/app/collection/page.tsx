import CollectionPageClient from "./CollectionPageClient";
import { collectionListingMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { Suspense } from "react";

type Props = {
  searchParams: Promise<{ q?: string | string[]; category?: string | string[] }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q, category } = await searchParams;
  return collectionListingMetadata(q, category);
}

export default function CollectionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center bg-white">
          <p className="text-sm text-[#64748b]">Loading collections…</p>
        </div>
      }
    >
      <CollectionPageClient />
    </Suspense>
  );
}
