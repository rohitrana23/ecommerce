import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Loader2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Orders() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await api.get("/orders");
        if (res.data && res.data.orders) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error("Failed to fetch user orders:", err);
        setError(err.response?.data?.message || "Failed to load order history.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="container" style={{ padding: "80px 0", textAlign: "center", minHeight: "60vh" }}>
        <Loader2 size={36} className="spin-animation" style={{ color: "#6366f1", margin: "0 auto 16px" }} />
        <p style={{ color: "var(--text-muted)" }}>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="orders-page container">
      <div className="orders-header">
        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "var(--text-muted)",
            fontSize: "0.88rem",
            marginBottom: "16px",
            textDecoration: "none"
          }}
        >
          <ArrowLeft size={16} /> Back to Shop
        </Link>
        <h1 style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "8px" }}>Your Orders</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Review and track all your purchases and payment verifications.
        </p>
      </div>

      {error && (
        <div className="cart-alert-error" style={{ margin: "0 0 24px" }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {orders.length === 0 ? (
        <div
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px dashed var(--border-subtle)",
            borderRadius: "16px",
            padding: "60px 24px",
            textAlign: "center",
            maxWidth: "540px",
            margin: "0 auto"
          }}
        >
          <Package size={48} style={{ color: "var(--text-dim)", margin: "0 auto 16px" }} />
          <h3 style={{ fontSize: "1.3rem", marginBottom: "8px" }}>No orders placed yet</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", marginBottom: "24px" }}>
            When you check out with Razorpay, your confirmed purchases will appear here.
          </p>
          <Link to="/" className="btn-primary">
            Start Exploring Products
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {orders.map((order) => {
            const dateStr = new Date(order.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            });

            return (
              <div key={order._id} className="order-card">
                <div className="order-header-row">
                  <div>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-dim)", textTransform: "uppercase" }}>
                      Order ID
                    </span>
                    <h4 style={{ fontSize: "1.05rem", fontFamily: "monospace", margin: "2px 0 0" }}>
                      {order.razorpayOrderId}
                    </h4>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      <Calendar size={15} />
                      <span>{dateStr}</span>
                    </div>

                    {order.paymentStatus === "paid" ? (
                      <span className="order-badge-paid">
                        <CheckCircle size={14} /> Paid
                      </span>
                    ) : order.paymentStatus === "pending" ? (
                      <span className="order-badge-pending">
                        <Clock size={14} /> Pending
                      </span>
                    ) : (
                      <span className="order-badge-failed">
                        <AlertTriangle size={14} /> Failed
                      </span>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", margin: "16px 0" }}>
                  {order.products.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        padding: "8px 0",
                        borderBottom: idx === order.products.length - 1 ? "none" : "1px solid rgba(255, 255, 255, 0.05)"
                      }}
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{
                            width: "56px",
                            height: "56px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            backgroundColor: "rgba(255, 255, 255, 0.04)"
                          }}
                        />
                      )}
                      <div style={{ flex: 1 }}>
                        <h5 style={{ fontSize: "0.95rem", fontWeight: "600", margin: "0 0 4px" }}>{item.name}</h5>
                        <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "flex", gap: "12px" }}>
                          <span>Color: {item.selectedColor || "Default"}</span>
                          <span>Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <div style={{ fontWeight: "700", fontSize: "0.95rem" }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer details */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    paddingTop: "14px",
                    borderTop: "1px solid var(--border-subtle)",
                    fontSize: "0.85rem",
                    color: "var(--text-muted)"
                  }}
                >
                  <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                    {order.razorpayPaymentId && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <CreditCard size={14} /> Payment ID:{" "}
                        <strong style={{ color: "#fff", fontFamily: "monospace" }}>{order.razorpayPaymentId}</strong>
                      </span>
                    )}
                    <span>
                      Order Status: <strong style={{ color: "#fff", textTransform: "capitalize" }}>{order.orderStatus}</strong>
                    </span>
                  </div>

                  <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "#fff" }}>
                    Total: ${order.totalAmount?.toFixed(2)} <span style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>({order.currency})</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
