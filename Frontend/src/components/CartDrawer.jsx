import { useState } from "react";
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, CheckCircle, Sparkles } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartSubtotal,
    shippingCost,
    shippingThreshold,
    cartTotal
  } = useCart();

  const [checkoutComplete, setCheckoutComplete] = useState(false);

  if (!isCartOpen) return null;

  const freeShippingRemaining = Math.max(0, shippingThreshold - cartSubtotal);
  const progressPercent = Math.min(100, (cartSubtotal / shippingThreshold) * 100);

  const handleCheckout = () => {
    setCheckoutComplete(true);
    setTimeout(() => {
      clearCart();
      setCheckoutComplete(false);
      setIsCartOpen(false);
    }, 3000);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="cart-backdrop" onClick={() => setIsCartOpen(false)} />

      {/* Drawer */}
      <div className="cart-drawer">
        {/* Header */}
        <div className="cart-header">
          <div className="cart-header-title">
            <ShoppingBag size={22} color="#6366f1" />
            <span>Your Bag</span>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "500" }}>
              ({cart.reduce((c, i) => c + i.quantity, 0)} items)
            </span>
          </div>
          <button
            type="button"
            className="cart-close-btn"
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Progress Strip */}
        <div className="shipping-progress-box">
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: "600" }}>
            {freeShippingRemaining === 0 ? (
              <span style={{ color: "#10b981", display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle size={15} /> Free Express Shipping Unlocked!
              </span>
            ) : (
              <span>
                Add <strong style={{ color: "#6366f1" }}>${freeShippingRemaining.toFixed(2)}</strong> more for FREE Shipping
              </span>
            )}
            <span style={{ color: "var(--text-dim)" }}>${shippingThreshold} Target</span>
          </div>
          <div className="shipping-bar-bg">
            <div className="shipping-bar-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Content */}
        {checkoutComplete ? (
          <div style={{ padding: "48px 24px", textAlign: "center", margin: "auto" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.2)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <CheckCircle size={36} />
            </div>
            <h3 style={{ fontSize: "1.4rem", marginBottom: "8px" }}>Order Confirmed!</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.5" }}>
              Thank you for shopping with ApexStore. Your premium package is now being prepared for express delivery!
            </p>
          </div>
        ) : cart.length === 0 ? (
          <div style={{ padding: "64px 24px", textAlign: "center", margin: "auto" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(255, 255, 255, 0.05)", color: "var(--text-dim)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <ShoppingBag size={32} />
            </div>
            <h4 style={{ fontSize: "1.2rem", marginBottom: "8px" }}>Your bag is empty</h4>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "24px" }}>
              Discover our latest premium releases and timeless gear.
            </p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setIsCartOpen(false)}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items-list">
              {cart.map((item) => (
                <div key={`${item._id}-${item.selectedColor}`} className="cart-item-row">
                  <img src={item.image} alt={item.name} className="cart-item-img" />
                  <div className="cart-item-info">
                    <h5 className="cart-item-name">{item.name}</h5>
                    <span className="cart-item-color">Color: {item.selectedColor}</span>
                    <div className="cart-item-qty-row">
                      <div className="qty-control">
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => updateQuantity(item._id, item.selectedColor, item.quantity - 1)}
                        >
                          <Minus size={13} />
                        </button>
                        <span className="qty-val">{item.quantity}</span>
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => updateQuantity(item._id, item.selectedColor, item.quantity + 1)}
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontWeight: "700", color: "#fff", fontSize: "0.95rem" }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item._id, item.selectedColor)}
                          style={{ color: "var(--text-dim)", cursor: "pointer" }}
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="cart-footer">
              <div className="cart-summary-line">
                <span>Subtotal</span>
                <span>${cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="cart-summary-line">
                <span>Estimated Shipping</span>
                <span style={{ color: shippingCost === 0 ? "#10b981" : "inherit" }}>
                  {shippingCost === 0 ? "FREE" : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="cart-total-line">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <button
                type="button"
                className="btn-primary"
                style={{ width: "100%", padding: "14px" }}
                onClick={handleCheckout}
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
