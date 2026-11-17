import { useState } from "react";
<<<<<<< HEAD
import { useNavigate } from "react-router-dom";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  CheckCircle,
  AlertCircle,
  Loader2,
  Lock,
  ExternalLink,
  ShieldCheck,
  QrCode
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { loadRazorpayScript } from "../utils/loadRazorpay";
=======
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, CheckCircle, Sparkles } from "lucide-react";
import { useCart } from "../context/CartContext";
>>>>>>> 2847380a4d8f298fdb345e977cd04f557505e050

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

<<<<<<< HEAD
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [qrOrder, setQrOrder] = useState(null);
=======
  const [checkoutComplete, setCheckoutComplete] = useState(false);
>>>>>>> 2847380a4d8f298fdb345e977cd04f557505e050

  if (!isCartOpen) return null;

  const freeShippingRemaining = Math.max(0, shippingThreshold - cartSubtotal);
  const progressPercent = Math.min(100, (cartSubtotal / shippingThreshold) * 100);

<<<<<<< HEAD
  const handleClose = () => {
    if (isProcessing || isVerifying) return;
    setIsCartOpen(false);
    setShowQrScanner(false);
    setCheckoutError("");
  };

  const handleNavigateToLogin = () => {
    setIsCartOpen(false);
    setShowQrScanner(false);
    navigate("/login");
  };

  const handleNavigateToOrders = () => {
    setIsCartOpen(false);
    setShowQrScanner(false);
    setCheckoutComplete(false);
    setConfirmedOrder(null);
    navigate("/orders");
  };

  const handleResetCheckout = () => {
    setCheckoutComplete(false);
    setShowQrScanner(false);
    setConfirmedOrder(null);
    setIsCartOpen(false);
  };

  // Launch on-screen UPI QR Code Scanner
  const handleOpenQrScanner = async () => {
    setCheckoutError("");

    if (!isAuthenticated) {
      setCheckoutError("Please sign in to proceed to checkout.");
      return;
    }

    if (!cart || cart.length === 0) {
      setCheckoutError("Your shopping bag is empty.");
      return;
    }

    try {
      setIsProcessing(true);
      const orderPayload = {
        items: cart.map((item) => ({
          _id: item._id,
          quantity: item.quantity,
          selectedColor: item.selectedColor
        }))
      };

      const { data } = await api.post("/payment/create-order", orderPayload);

      if (!data || !data.orderId) {
        throw new Error(data?.message || "Failed to initialize order.");
      }

      setQrOrder(data);
      setShowQrScanner(true);
    } catch (err) {
      console.error("QR order initiation error:", err);
      setCheckoutError(err.response?.data?.message || err.message || "Failed to open QR Scanner.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Confirm payment made via UPI QR
  const handleConfirmQrPayment = async () => {
    if (!qrOrder || !qrOrder.orderId) return;

    try {
      setIsVerifying(true);
      const res = await api.post("/payment/confirm-qr-payment", {
        razorpay_order_id: qrOrder.orderId
      });

      if (res.data && res.data.success) {
        setConfirmedOrder(res.data.order);
        setCheckoutComplete(true);
        setShowQrScanner(false);
        clearCart();
      } else {
        setCheckoutError(res.data?.message || "Payment verification failed.");
      }
    } catch (err) {
      console.error("QR payment confirmation error:", err);
      setCheckoutError(err.response?.data?.message || "Payment verification failed.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Launch official Razorpay standard popup
  const handleCheckout = async () => {
    setCheckoutError("");

    if (!isAuthenticated) {
      setCheckoutError("Please sign in to proceed to checkout.");
      return;
    }

    if (!cart || cart.length === 0) {
      setCheckoutError("Your shopping bag is empty.");
      return;
    }

    try {
      setIsProcessing(true);

      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded || typeof window.Razorpay === "undefined") {
        throw new Error(
          "Could not initialize Razorpay SDK. Please verify your internet connection or disable ad blockers."
        );
      }

      const orderPayload = {
        items: cart.map((item) => ({
          _id: item._id,
          quantity: item.quantity,
          selectedColor: item.selectedColor
        }))
      };

      const { data } = await api.post("/payment/create-order", orderPayload);

      if (!data || !data.orderId || !data.keyId) {
        throw new Error(data?.message || "Failed to initiate payment order on the server.");
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency || "INR",
        name: "ApexStore",
        description: `Order Checkout (${cart.reduce((sum, item) => sum + item.quantity, 0)} items)`,
        image: "/favicon.svg",
        order_id: data.orderId,
        config: {
          display: {
            blocks: {
              upi: {
                name: "Scan QR & Pay (UPI)",
                instruments: [
                  {
                    method: "upi",
                    flows: ["qr"]
                  }
                ]
              },
              cards: {
                name: "Cards",
                instruments: [{ method: "card" }]
              },
              netbanking: {
                name: "Netbanking",
                instruments: [{ method: "netbanking" }]
              },
              wallet: {
                name: "Wallets",
                instruments: [{ method: "wallet" }]
              }
            },
            sequence: ["block.upi", "block.cards", "block.netbanking", "block.wallet"],
            preferences: {
              show_default_blocks: true
            }
          }
        },
        prefill: {
          name: user?.name || "Shopper",
          email: user?.email || "shopper@example.com",
          contact: user?.phone || "8837556344",
          method: "upi"
        },
        theme: {
          color: "#6366f1"
        },
        handler: async function (response) {
          try {
            setIsVerifying(true);
            const verifyRes = await api.post("/payment/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.data && verifyRes.data.success) {
              setConfirmedOrder(verifyRes.data.order);
              setCheckoutComplete(true);
              setShowQrScanner(false);
              clearCart();
            } else {
              setCheckoutError(verifyRes.data?.message || "Payment verification failed.");
            }
          } catch (verifyErr) {
            console.error("Signature verification error:", verifyErr);
            setCheckoutError(
              verifyErr.response?.data?.message ||
                "Payment signature verification failed. Please contact support if your account was debited."
            );
          } finally {
            setIsProcessing(false);
            setIsVerifying(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            setCheckoutError("Payment was cancelled or checkout window was closed.");
            api
              .post("/payment/payment-failed", {
                razorpay_order_id: data.orderId,
                reason: "Customer closed Razorpay checkout window"
              })
              .catch(() => {});
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on("payment.failed", function (failResponse) {
        setIsProcessing(false);
        const reason =
          failResponse.error?.description || "Payment failed. Please try again with a different payment method.";
        setCheckoutError(reason);
        api
          .post("/payment/payment-failed", {
            razorpay_order_id: data.orderId,
            reason
          })
          .catch(() => {});
      });

      razorpayInstance.open();
    } catch (err) {
      console.error("Checkout initialization failed:", err);
      setCheckoutError(
        err.response?.data?.message || err.message || "Failed to initialize payment. Please try again."
      );
      setIsProcessing(false);
    }
  };

  // Generate UPI URI for standard QR scanning
  const upiUri = qrOrder
    ? `upi://pay?pa=apexstore@razorpay&pn=ApexStore&am=${qrOrder.totalAmount?.toFixed(2)}&cu=INR&tr=${qrOrder.orderId}&tn=Order%20Payment`
    : "";
  const qrImageUrl = upiUri
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(upiUri)}`
    : "";

  return (
    <>
      {/* Backdrop */}
      <div className="cart-backdrop" onClick={handleClose} />
=======
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
>>>>>>> 2847380a4d8f298fdb345e977cd04f557505e050

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
<<<<<<< HEAD
            onClick={handleClose}
            aria-label="Close cart"
            disabled={isProcessing || isVerifying}
=======
            onClick={() => setIsCartOpen(false)}
            aria-label="Close cart"
>>>>>>> 2847380a4d8f298fdb345e977cd04f557505e050
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

<<<<<<< HEAD
        {/* Checkout Error Alert */}
        {checkoutError && (
          <div className="cart-alert-error">
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0 }}>{checkoutError}</p>
              {!isAuthenticated && (
                <button
                  type="button"
                  onClick={handleNavigateToLogin}
                  className="btn-primary"
                  style={{
                    padding: "6px 14px",
                    fontSize: "0.82rem",
                    marginTop: "8px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  Sign In to Continue <ArrowRight size={14} />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setCheckoutError("")}
              style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: "2px" }}
              aria-label="Dismiss error"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Content */}
        {checkoutComplete ? (
          <div style={{ padding: "40px 24px", textAlign: "center", margin: "auto", width: "100%" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "rgba(16, 185, 129, 0.2)",
                color: "#10b981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px"
              }}
            >
              <CheckCircle size={36} />
            </div>
            <h3 style={{ fontSize: "1.35rem", marginBottom: "8px" }}>Payment Successful!</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", lineHeight: "1.5", marginBottom: "20px" }}>
              Thank you for shopping with ApexStore. Your order has been securely verified and confirmed.
            </p>

            {confirmedOrder && (
              <div className="order-confirm-card">
                <div className="order-confirm-row">
                  <span>Order Reference:</span>
                  <strong>{confirmedOrder.razorpayOrderId || confirmedOrder._id}</strong>
                </div>
                {confirmedOrder.razorpayPaymentId && (
                  <div className="order-confirm-row">
                    <span>Payment ID / Ref:</span>
                    <strong>{confirmedOrder.razorpayPaymentId}</strong>
                  </div>
                )}
                <div className="order-confirm-row">
                  <span>Amount Paid:</span>
                  <strong style={{ color: "#10b981" }}>
                    ₹{confirmedOrder.totalAmount?.toFixed(2)} ({confirmedOrder.currency || "INR"})
                  </strong>
                </div>
                <div className="order-confirm-row" style={{ marginBottom: 0 }}>
                  <span>Status:</span>
                  <span className="order-badge-paid">
                    <ShieldCheck size={14} /> Verified & Paid
                  </span>
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "24px" }}>
              <button
                type="button"
                className="btn-primary"
                style={{ width: "100%", padding: "12px" }}
                onClick={handleNavigateToOrders}
              >
                View My Orders <ExternalLink size={16} />
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ width: "100%", padding: "12px" }}
                onClick={handleResetCheckout}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : showQrScanner && qrOrder ? (
          /* =========================================================================
             ON-SCREEN UPI QR CODE SCANNER VIEW
             ========================================================================= */
          <div style={{ padding: "20px", display: "flex", flexDirection: "column", height: "100%" }}>
            <button
              type="button"
              onClick={() => setShowQrScanner(false)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                marginBottom: "12px",
                fontSize: "0.88rem"
              }}
            >
              <ArrowLeft size={16} /> Back to Bag
            </button>

            <div className="qr-scanner-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "#6366f1", marginBottom: "4px" }}>
                <QrCode size={20} />
                <h4 style={{ margin: 0, fontSize: "1.1rem" }}>Scan to Pay with Any UPI App</h4>
              </div>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "4px 0 14px" }}>
                Open Google Pay, PhonePe, Paytm, or BHIM and scan this QR code
              </p>

              {/* Dynamic QR Code with Scanning Laser Animation */}
              <div className="qr-code-wrapper">
                <img src={qrImageUrl} alt="UPI QR Code" className="qr-code-img" />
                <div className="qr-scan-line" />
              </div>

              {/* UPI Supported Apps Pills */}
              <div className="upi-apps-row">
                <span className="upi-app-pill">Google Pay</span>
                <span className="upi-app-pill">PhonePe</span>
                <span className="upi-app-pill">Paytm</span>
                <span className="upi-app-pill">BHIM / CRED</span>
              </div>

              {/* Order Amount */}
              <div style={{ padding: "10px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "10px", marginBottom: "16px" }}>
                <div style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>TOTAL PAYABLE AMOUNT</div>
                <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#10b981", marginTop: "2px" }}>
                  ₹{qrOrder.totalAmount?.toFixed(2)}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "monospace", marginTop: "4px" }}>
                  Ref: {qrOrder.orderId}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ width: "100%", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                  onClick={handleConfirmQrPayment}
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 size={16} className="spin-animation" /> Verifying Payment...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} /> I Have Paid / Verify Payment
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  style={{ width: "100%", padding: "10px", fontSize: "0.85rem" }}
                  onClick={handleCheckout}
                  disabled={isProcessing || isVerifying}
                >
                  Open Razorpay Modal Instead
                </button>
              </div>
            </div>
          </div>
        ) : cart.length === 0 ? (
          <div style={{ padding: "64px 24px", textAlign: "center", margin: "auto" }}>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.05)",
                color: "var(--text-dim)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px"
              }}
            >
=======
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
>>>>>>> 2847380a4d8f298fdb345e977cd04f557505e050
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
<<<<<<< HEAD
                          disabled={isProcessing || isVerifying}
=======
>>>>>>> 2847380a4d8f298fdb345e977cd04f557505e050
                          onClick={() => updateQuantity(item._id, item.selectedColor, item.quantity - 1)}
                        >
                          <Minus size={13} />
                        </button>
                        <span className="qty-val">{item.quantity}</span>
                        <button
                          type="button"
                          className="qty-btn"
<<<<<<< HEAD
                          disabled={isProcessing || isVerifying}
=======
>>>>>>> 2847380a4d8f298fdb345e977cd04f557505e050
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
<<<<<<< HEAD
                          disabled={isProcessing || isVerifying}
                          onClick={() => removeFromCart(item._id, item.selectedColor)}
                          style={{
                            color: "var(--text-dim)",
                            cursor: (isProcessing || isVerifying) ? "not-allowed" : "pointer",
                            background: "none",
                            border: "none",
                            padding: 0
                          }}
=======
                          onClick={() => removeFromCart(item._id, item.selectedColor)}
                          style={{ color: "var(--text-dim)", cursor: "pointer" }}
>>>>>>> 2847380a4d8f298fdb345e977cd04f557505e050
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
<<<<<<< HEAD

              {!isAuthenticated && (
                <div style={{ marginBottom: "12px", fontSize: "0.82rem", color: "#fbbf24", display: "flex", alignItems: "center", gap: "6px" }}>
                  <AlertCircle size={14} /> You need to sign in before checking out
                </div>
              )}

              {/* Primary Action 1: UPI QR Scanner */}
              <button
                type="button"
                className="btn-primary"
                style={{
                  width: "100%",
                  padding: "13px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  marginBottom: "8px",
                  background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                  boxShadow: "0 4px 15px rgba(99, 102, 241, 0.35)",
                  opacity: (isProcessing || isVerifying) ? 0.75 : 1,
                  cursor: (isProcessing || isVerifying) ? "not-allowed" : "pointer"
                }}
                onClick={handleOpenQrScanner}
                disabled={isProcessing || isVerifying || cart.length === 0}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={18} className="spin-animation" /> Preparing Scanner...
                  </>
                ) : (
                  <>
                    <QrCode size={18} /> Pay via UPI QR Scanner
                  </>
                )}
              </button>

              {/* Primary Action 2: Razorpay Popup (Cards, NetBanking, UPI) */}
              <button
                type="button"
                className="btn-secondary"
                style={{
                  width: "100%",
                  padding: "11px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  opacity: (isProcessing || isVerifying) ? 0.75 : 1,
                  cursor: (isProcessing || isVerifying) ? "not-allowed" : "pointer",
                  fontSize: "0.88rem"
                }}
                onClick={handleCheckout}
                disabled={isProcessing || isVerifying || cart.length === 0}
              >
                <Lock size={15} /> All Payment Methods (Cards, NetBanking)
              </button>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "12px", fontSize: "0.78rem", color: "var(--text-dim)" }}>
                <ShieldCheck size={14} color="#10b981" />
                <span>Secured 256-bit encrypted checkout via Razorpay</span>
              </div>
=======
              <button
                type="button"
                className="btn-primary"
                style={{ width: "100%", padding: "14px" }}
                onClick={handleCheckout}
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>
>>>>>>> 2847380a4d8f298fdb345e977cd04f557505e050
            </div>
          </>
        )}
      </div>
    </>
  );
}
