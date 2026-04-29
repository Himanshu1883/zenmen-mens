import ProductDetailClient from "./ProductDetailClient";

type ProductDetailPageProps = {
  searchParams: Promise<{ id?: string }>;
};

export default async function ProductDetailPage({ searchParams }: ProductDetailPageProps) {
  const params = await searchParams;
  const parsedId = Number(params.id);
  const productId = Number.isFinite(parsedId) && parsedId > 0 ? parsedId : 1;

  return <ProductDetailClient productId={productId} />;
}
