import { Product } from "@/app/types";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="product-card" data-category={product.category}>
      {/* Badge */}
      {product.badge && <div className="product-badge">{product.badge}</div>}

      {/* Image */}
      <div className="product-img-wrap">
        <div className="product-placeholder">
          {/* Keep SVG placeholder OR replace with image */}
        </div>

        {/* Overlay */}
        <div className="product-overlay">
          <button className="overlay-btn">Quick View</button>
        </div>
      </div>

      {/* Info */}
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-material">{product.material}</p>
        <span className="product-price">{product.price}</span>
      </div>
    </div>
  );
}
