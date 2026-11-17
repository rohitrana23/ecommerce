const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  createOrder,
  verifyPayment,
  confirmQrPayment,
  handleWebhook,
  recordPaymentFailure,
  getUserOrders,
  getOrderById
} = require("../controllers/paymentController");

// Razorpay Order Creation & Verification
router.post("/create-order", protect, createOrder);
router.post("/verify-payment", protect, verifyPayment);
router.post("/confirm-qr-payment", protect, confirmQrPayment);
router.post("/payment-failed", protect, recordPaymentFailure);

// Webhook endpoint (Raw body signature verified internally, no auth token)
router.post("/webhook", handleWebhook);

// Order Management Routes
router.get("/orders", protect, getUserOrders);
router.get("/orders/:id", protect, getOrderById);

module.exports = router;
