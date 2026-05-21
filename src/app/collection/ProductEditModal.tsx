"use client";

import ProductFormModal from "@/app/components/adminComponents/ProductFormModal";
import type { Product } from "@/types/product";

type Props = {
  product: Product;
  onClose: () => void;
  onSaved: () => void;
};

export default function ProductEditModal({ product, onClose, onSaved }: Props) {
  return (
    <ProductFormModal
      mode="edit"
      product={product}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}
