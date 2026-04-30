import ProductDetailClient from "./ProductDetailClient";

type ProductDetailPageProps = {
  searchParams: Promise<{ id?: string }>;
};

export default async function ProductDetailPage({
  searchParams,
}: ProductDetailPageProps) {
  const params = await searchParams;
  const productId = params.id ?? "";

  return <ProductDetailClient productId={productId} />;
}
