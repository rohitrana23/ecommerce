import { useState } from "react";
import { X, Star, ShoppingBag, Check, ShieldCheck, Truck } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function ProductQuickView({ product, onClose }) {
  const { addToCart, setIsCartOpen } = useCart();
  const [selectedColor, setSelectedColor] = useState(
    product.colors && product.colors.length > 0 ? product.colors[0] : "Default"
  );
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product, qty, selectedColor);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
      setIsCartOpen(true);
    }, 600);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="quickview-modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div className="modal-img-col">
          <img src={product.image} alt={product.name} />
        </div>

        <div className="modal-body-col">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span className="badge badge-primary">{product.category}</span>
            {product.badge && <span className="badge badge-accent">{product.badge}</span>}
          </div>

          <h2 style={{ fontSize: "1.6rem", fontWeight: "800", marginBottom: "10px", lineHeight: "1.25" }}>
            {product.name}
          </h2>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#f59e0b" }}>
              <Star size={16} fill="#f59e0b" />
              <strong style={{ fontSize: "0.95rem" }}>{product.rating?.toFixed(1) || "4.8"}</strong>
            </div>
            <span style={{ color: "var(--text-dim)", fontSize: "0.85rem" }}>
              Based on {product.numReviews || 24} customer reviews
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "20px" }}>
            <span style={{ fontSize: "1.8rem", fontWeight: "800", color: "#ffffff" }}>
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice > product.price && (
              <span style={{ fontSize: "1.1rem", color: "var(--text-dim)", textDecoration: "line-through" }}>
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", lineHeight: "1.6", marginBottom: "24px" }}>
            {product.description}
          </p>

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", marginBottom: "10px" }}>
                Select Color: <span style={{ color: "var(--primary)" }}>{selectedColor}</span>
              </label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {product.colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.82rem",
                      fontWeight: "600",
                      background: selectedColor === color ? "var(--primary)" : "rgba(255, 255, 255, 0.05)",
                      color: selectedColor === color ? "#fff" : "var(--text-muted)",
                      border: "1px solid",
                      borderColor: selectedColor === color ? "var(--primary)" : "var(--border-subtle)",
                      cursor: "pointer"
                    }}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div style={{ display: "flex", gap: "16px", marginTop: "auto", marginBottom: "20px" }}>
            <div className="qty-control" style={{ height: "46px" }}>
              <button
                type="button"
                className="qty-btn"
                style={{ width: "36px", height: "100%" }}
                onClick={() => setQty(Math.max(1, qty - 1))}
              >
                -
              </button>
              <span className="qty-val" style={{ width: "36px", fontSize: "1rem" }}>
                {qty}
              </span>
              <button
                type="button"
                className="qty-btn"
                style={{ width: "36px", height: "100%" }}
                onClick={() => setQty(qty + 1)}
              >
                +
              </button>
            </div>

            <button
              type="button"
              className="btn-primary"
              style={{ flex: 1, padding: "0 24px" }}
              onClick={handleAddToCart}
            >
              {added ? (
                <>
                  <Check size={18} /> Added!
                </>
              ) : (
                <>
                  <ShoppingBag size={18} /> Add ${ (product.price * qty).toFixed(2) } to Bag
                </>
              )}
            </button>
          </div>

          {/* Trust points */}
          <div style={{ display: "flex", gap: "16px", fontSize: "0.78rem", color: "var(--text-dim)", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Truck size={14} color="#10b981" /> Free Express Shipping
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <ShieldCheck size={14} color="#6366f1" /> 2-Year Official Warranty
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
