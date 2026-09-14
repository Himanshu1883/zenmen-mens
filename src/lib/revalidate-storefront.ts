import { revalidatePath } from "next/cache";

/** Invalidate cached storefront pages that show product data. */
export function revalidateStorefrontProducts(slugs: string[] = []) {
  revalidatePath("/");
  revalidatePath("/collection");

  for (const slug of [...new Set(slugs.filter(Boolean))]) {
    revalidatePath(`/collection/${slug}`);
  }
}
