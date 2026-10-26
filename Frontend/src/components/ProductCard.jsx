import { useState } from "react";
import { Star, ShoppingBag, Eye, Check } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product, onQuickView }) {
  const { addToCart } = useCart();
  const [addedAnim, setAddedAnim] = useState(false);

  const handleAdd = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1500);
  };

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <div className="product-card" onClick={() => onQuickView && onQuickView(product)}>
      <div className="card-img-container">
        <img src={product.image} alt={product.name} className="card-img" loading="lazy" />

        {/* Badge Tag */}
        {product.badge && (
          <div className="card-badge-tag">
            <span
              className={`badge ${
                product.badge.toLowerCase().includes("off") || product.badge.toLowerCase().includes("deal")
                  ? "badge-discount"
                  : product.badge.toLowerCase().includes("trend") || product.badge.toLowerCase().includes("seller")
                  ? "badge-accent"
                  : "badge-primary"
              }`}
            >
              {product.badge}
            </span>
          </div>
        )}

        {/* Quick View Button */}
        <button
          type="button"
          className="quick-view-overlay-btn"
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
        >
          <Eye size={15} /> Quick View
        </button>
      </div>

      <div className="card-content">
        <div className="card-meta-row">
          <span className="card-category">{product.category}</span>
          <div className="card-rating">
            <Star size={14} fill="#f59e0b" color="#f59e0b" />
            <span>{product.rating?.toFixed(1) || "4.8"}</span>
            <span className="card-rating-count">({product.numReviews || 24})</span>
          </div>
        </div>

        <h3 className="card-title" title={product.name}>
          {product.name}
        </h3>

        <div className="card-pricing-row">
          <span className="current-price">${product.price.toFixed(2)}</span>
          {product.originalPrice > product.price && (
            <span className="original-price">${product.originalPrice.toFixed(2)}</span>
          )}
          {discountPercent && (
            <span style={{ fontSize: "0.78rem", color: "#10b981", fontWeight: "700" }}>
              Save {discountPercent}%
            </span>
          )}
        </div>

        <button
          type="button"
          className="card-add-btn"
          onClick={handleAdd}
          style={addedAnim ? { background: "rgba(16, 185, 129, 0.2)", borderColor: "#10b981", color: "#10b981" } : {}}
        >
          {addedAnim ? (
            <>
              <Check size={16} /> Added to Bag
            </>
          ) : (
            <>
              <ShoppingBag size={16} /> Add to Bag
            </>
          )}
        </button>
      </div>
    </div>
  );
}
