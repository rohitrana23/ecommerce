const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { getUserOrders, getOrderById } = require("../controllers/paymentController");

// Authenticated Order Management Routes
router.get("/", protect, getUserOrders);
router.get("/:id", protect, getOrderById);

module.exports = router;
