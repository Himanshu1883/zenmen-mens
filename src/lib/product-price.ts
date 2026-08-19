/** Catalog prices: `price` is the selling amount stored in Mongo. Never apply `discount` on top. */

export type ProductPriceFields = {
  price: number;
  comparePrice?: number;
  discount?: number;
};

export function getSellingPrice(
  product: Pick<ProductPriceFields, "price">,
): number {
  return product.price;
}

/** Strike-through original when comparePrice is higher than the selling price. */
export function getCompareAtPrice(
  product: Pick<ProductPriceFields, "price" | "comparePrice">,
): number | null {
  return product.comparePrice != null && product.comparePrice > product.price
    ? product.comparePrice
    : null;
}

export function getSalePercent(product: ProductPriceFields): number | null {
  const compare = getCompareAtPrice(product);
  if (compare != null) {
    const pct = Math.round(((compare - product.price) / compare) * 100);
    return pct > 0 ? pct : null;
  }
  return product.discount != null && product.discount > 0
    ? product.discount
    : null;
}

export function getDisplayPricing(product: ProductPriceFields) {
  return {
    selling: getSellingPrice(product),
    compare: getCompareAtPrice(product),
    salePercent: getSalePercent(product),
  };
}
