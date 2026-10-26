import { useState } from "react";
import { Sparkles, Shield, Send, Check } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div className="brand-icon-wrapper" style={{ width: "36px", height: "36px" }}>
                <Sparkles size={18} />
              </div>
              <span className="brand-text" style={{ fontSize: "1.3rem" }}>
                ApexStore
              </span>
            </div>
            <p className="footer-brand-desc">
              Curating cutting-edge consumer electronics, acoustic innovations, and modern street aesthetics for discerning enthusiasts worldwide.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer-col-title">Shop Collection</h4>
            <ul className="footer-links-list">
              <li><a href="/#products" className="footer-link">High-Res Audio</a></li>
              <li><a href="/#products" className="footer-link">Smart Wearables</a></li>
              <li><a href="/#products" className="footer-link">Performance Footwear</a></li>
              <li><a href="/#products" className="footer-link">Tactile Gaming Gear</a></li>
              <li><a href="/#products" className="footer-link">Minimalist Accessories</a></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="footer-col-title">Customer Care</h4>
            <ul className="footer-links-list">
              <li><span className="footer-link" style={{ cursor: "pointer" }}>Track Your Order</span></li>
              <li><span className="footer-link" style={{ cursor: "pointer" }}>30-Day Returns</span></li>
              <li><span className="footer-link" style={{ cursor: "pointer" }}>Express Shipping Info</span></li>
              <li><span className="footer-link" style={{ cursor: "pointer" }}>2-Year Warranty</span></li>
              <li><span className="footer-link" style={{ cursor: "pointer" }}>24/7 Concierge Support</span></li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div>
            <h4 className="footer-col-title">Unlock 15% Off</h4>
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "16px", lineHeight: "1.5" }}>
              Join the Apex VIP Club for exclusive member-only early drops and secret discounts.
            </p>

            {subscribed ? (
              <div style={{ background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "12px 16px", borderRadius: "var(--radius-sm)", color: "#6ee7b7", fontSize: "0.85rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "700", marginBottom: "4px" }}>
                  <Check size={16} /> Welcome to the Club!
                </div>
                <span>Use code <strong style={{ color: "#fff", background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: "4px" }}>APEX15</strong> at checkout.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: "flex", gap: "8px" }}>
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-sm)",
                    color: "#fff",
                    outline: "none",
                    fontSize: "0.88rem"
                  }}
                />
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: "10px 16px", borderRadius: "var(--radius-sm)" }}
                  title="Subscribe"
                >
                  <Send size={15} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Shield size={16} color="#10b981" />
            <span>256-Bit SSL Encrypted & Bank-Grade Payment Security</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} ApexStore Inc. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
