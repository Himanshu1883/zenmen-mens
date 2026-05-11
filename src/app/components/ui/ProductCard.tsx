type Product = {
  category: string;
  badge?: string;
  title: string;
  price: string | number;
};

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
        <h3 className="product-name">{product.title}</h3>
        <span className="product-price">{product.price}</span>
      </div>
    </div>
  );

}
