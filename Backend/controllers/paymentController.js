const crypto = require("crypto");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { getRazorpayInstance } = require("../config/razorpay");

/**
 * Helper: Safely compare two hex signatures using crypto.timingSafeEqual
 */
const timingSafeStringCompare = (known, given) => {
  if (typeof known !== "string" || typeof given !== "string") return false;
  const bufKnown = Buffer.from(known, "utf8");
  const bufGiven = Buffer.from(given, "utf8");
  if (bufKnown.length !== bufGiven.length) return false;
  return crypto.timingSafeEqual(bufKnown, bufGiven);
};

/**
 * @desc    Create a new Razorpay order after server-side price & stock verification
 * @route   POST /api/payment/create-order
 * @access  Private
 */
const createOrder = async (req, res) => {
  try {
    const rawItems = req.body.items || req.body.cart;

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty. Please add items before checking out."
      });
    }

    // 1. Validate items and verify products, stock, and prices from database
    const verifiedProducts = [];
    let calculatedSubtotal = 0;

    for (const item of rawItems) {
      const productId = item._id || item.id || item.productId;
      const quantity = parseInt(item.quantity, 10);

      if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
          success: false,
          message: `Invalid product ID provided: ${productId}`
        });
      }

      if (isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Item quantity must be a positive integer"
        });
      }

      // Fetch authentic product data directly from MongoDB (NEVER trust frontend price)
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found (ID: ${productId})`
        });
      }

      // Check stock availability
      if (product.countInStock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.countInStock}, Requested: ${quantity}`
        });
      }

      const itemTotal = Number((product.price * quantity).toFixed(2));
      calculatedSubtotal = Number((calculatedSubtotal + itemTotal).toFixed(2));

      verifiedProducts.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity,
        selectedColor: item.selectedColor || (product.colors && product.colors[0]) || "Default",
        image: product.image
      });
    }

    // 2. Shipping calculation (consistent with store rules: Free shipping over $75, else $9.99)
    const shippingThreshold = 75;
    const shippingAmount = calculatedSubtotal >= shippingThreshold || calculatedSubtotal === 0 ? 0 : 9.99;
    const totalAmount = Number((calculatedSubtotal + shippingAmount).toFixed(2));

    // Razorpay requires amount in integer paise (1 INR = 100 paise)
    // Configure currency from environment or default to INR
    const currency = (process.env.RAZORPAY_CURRENCY || "INR").toUpperCase();
    const amountInPaise = Math.round(totalAmount * 100);

    if (amountInPaise <= 0) {
      return res.status(400).json({
        success: false,
        message: "Order total must be greater than zero"
      });
    }

    // 3. Create order using official Razorpay SDK
    let razorpayOrder;
    try {
      const razorpay = getRazorpayInstance();
      const options = {
        amount: amountInPaise,
        currency,
        receipt: `rcpt_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        notes: {
          userId: req.userId ? req.userId.toString() : "guest",
          itemsCount: verifiedProducts.length
        }
      };

      razorpayOrder = await razorpay.orders.create(options);
    } catch (rzpErr) {
      console.error("Razorpay order creation failed:", rzpErr);
      return res.status(500).json({
        success: false,
        message: rzpErr.error?.description || rzpErr.message || "Failed to initiate payment with Razorpay"
      });
    }

    // 4. Save pending order in MongoDB linked to authenticated user
    const newOrder = await Order.create({
      user: req.userId,
      products: verifiedProducts,
      subtotal: calculatedSubtotal,
      shippingAmount,
      totalAmount,
      currency,
      razorpayOrderId: razorpayOrder.id,
      paymentStatus: "pending",
      orderStatus: "created"
    });

    // 5. Return Razorpay order details and public key to frontend (NEVER send secret key)
    res.status(201).json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: (process.env.RAZORPAY_KEY_ID || "").trim(),
      dbOrderId: newOrder._id,
      subtotal: calculatedSubtotal,
      shippingAmount,
      totalAmount
    });
  } catch (error) {
    console.error("Error creating payment order:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while creating your order",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

/**
 * @desc    Verify Razorpay payment signature and confirm order
 * @route   POST /api/payment/verify-payment
 * @access  Private
 */
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification details (order ID, payment ID, signature) are required"
      });
    }

    // 1. Fetch matching order from MongoDB
    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order matching the provided Razorpay order ID was not found"
      });
    }

    // 2. Prevent user from paying for or verifying another user's order
    if (order.user.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You cannot verify an order that does not belong to you"
      });
    }

    // 3. Idempotency: If order is already verified and marked as paid, return success immediately
    if (order.paymentStatus === "paid") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified successfully",
        order
      });
    }

    // 4. Verify HMAC SHA256 signature using Razorpay Secret Key
    const secret = (process.env.RAZORPAY_KEY_SECRET || "").trim();
    if (!secret || secret === "your_razorpay_secret") {
      return res.status(500).json({
        success: false,
        message: "Server payment configuration error: RAZORPAY_KEY_SECRET is not configured"
      });
    }

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex");

    const isSignatureValid = timingSafeStringCompare(generatedSignature, razorpay_signature);

    if (!isSignatureValid) {
      // Mark as failed upon invalid signature
      order.paymentStatus = "failed";
      order.orderStatus = "cancelled";
      order.failureReason = "HMAC SHA256 signature verification failed";
      await order.save();

      return res.status(400).json({
        success: false,
        message: "Invalid payment signature. Payment could not be verified."
      });
    }

    // 5. Payment is authentic! Confirm order and update status
    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.paidAt = new Date();

    // Idempotently deduct product stock
    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { countInStock: -item.quantity }
      });
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Payment verified and order placed successfully",
      order
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while verifying the payment",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

/**
 * @desc    Handle Razorpay Webhooks (reliable status update when user closes tab)
 * @route   POST /api/payment/webhook
 * @access  Public (Signature verified via HMAC SHA256)
 */
const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const webhookSecret = (process.env.RAZORPAY_WEBHOOK_SECRET || "").trim();

    if (!webhookSecret || webhookSecret === "your_webhook_secret") {
      console.warn("Webhook received but RAZORPAY_WEBHOOK_SECRET is not configured");
      return res.status(500).json({
        success: false,
        message: "Webhook secret is not configured on the server"
      });
    }

    if (!signature) {
      return res.status(400).json({
        success: false,
        message: "Missing x-razorpay-signature header"
      });
    }

    // Use raw request body buffer for exact HMAC SHA256 computation
    const rawPayload = req.rawBody ? req.rawBody.toString("utf8") : JSON.stringify(req.body);
    const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(rawPayload).digest("hex");

    if (!timingSafeStringCompare(expectedSignature, signature)) {
      console.error("Invalid webhook signature received");
      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature"
      });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    // Handle payment.captured or order.paid events
    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id || payload?.order?.entity?.id;
      const razorpayPaymentId = paymentEntity?.id;

      if (razorpayOrderId) {
        const order = await Order.findOne({ razorpayOrderId });
        if (order) {
          // Idempotent: Only process if not already marked paid
          if (order.paymentStatus !== "paid") {
            order.paymentStatus = "paid";
            order.orderStatus = "confirmed";
            if (razorpayPaymentId) {
              order.razorpayPaymentId = razorpayPaymentId;
            }
            order.paidAt = new Date();

            // Deduct stock
            for (const item of order.products) {
              await Product.findByIdAndUpdate(item.product, {
                $inc: { countInStock: -item.quantity }
              });
            }

            await order.save();
            console.log(`Order ${order._id} confirmed via webhook (${event})`);
          } else {
            console.log(`Order ${order._id} was already marked as paid. Webhook handled idempotently.`);
          }
        }
      }
    } else if (event === "payment.failed") {
      const paymentEntity = payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;
      const errorDesc = paymentEntity?.error_description || "Payment failed at gateway";

      if (razorpayOrderId) {
        const order = await Order.findOne({ razorpayOrderId });
        if (order && order.paymentStatus === "pending") {
          order.paymentStatus = "failed";
          order.orderStatus = "cancelled";
          order.failureReason = errorDesc;
          await order.save();
          console.log(`Order ${order._id} marked failed via webhook (${event})`);
        }
      }
    }

    // Always acknowledge Razorpay webhooks with 200 OK
    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({
      success: false,
      message: "Webhook processing error"
    });
  }
};

/**
 * @desc    Record client-side payment failure or checkout cancellation
 * @route   POST /api/payment/payment-failed
 * @access  Private
 */
const recordPaymentFailure = async (req, res) => {
  try {
    const { razorpay_order_id, reason } = req.body;

    if (!razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Razorpay order ID is required"
      });
    }

    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (order.user.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to order"
      });
    }

    // Only update if still pending
    if (order.paymentStatus === "pending") {
      order.paymentStatus = "failed";
      order.orderStatus = "cancelled";
      order.failureReason = reason || "Payment cancelled or failed on client side";
      await order.save();
    }

    res.status(200).json({
      success: true,
      message: "Order payment failure recorded"
    });
  } catch (error) {
    console.error("Error recording payment failure:", error);
    res.status(500).json({
      success: false,
      message: "Error recording payment failure"
    });
  }
};

/**
 * @desc    Fetch logged in user's order history
 * @route   GET /api/payment/orders or GET /api/orders
 * @access  Private
 */
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve orders",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

/**
 * @desc    Fetch specific order details by ID
 * @route   GET /api/payment/orders/:id or GET /api/orders/:id
 * @access  Private
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    let order = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await Order.findById(id).populate("user", "name email");
    } else {
      order = await Order.findOne({ razorpayOrderId: id }).populate("user", "name email");
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Ensure user can only view their own orders
    if (order.user._id.toString() !== req.userId.toString() && order.user.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You cannot access an order that does not belong to you"
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error("Error retrieving order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve order details",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

/**
 * @desc    Confirm UPI QR Code payment directly
 * @route   POST /api/payment/confirm-qr-payment
 * @access  Private
 */
const confirmQrPayment = async (req, res) => {
  try {
    const { razorpay_order_id, utr_or_payment_id } = req.body;

    if (!razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required"
      });
    }

    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (order.user.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access to order"
      });
    }

    if (order.paymentStatus === "paid") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        order
      });
    }

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.razorpayPaymentId = utr_or_payment_id || `upi_qr_${Date.now()}`;
    order.paidAt = new Date();

    for (const item of order.products) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { countInStock: -item.quantity }
      });
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "UPI QR Payment verified and order confirmed successfully",
      order
    });
  } catch (error) {
    console.error("Error confirming QR payment:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while confirming QR payment"
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  confirmQrPayment,
  handleWebhook,
  recordPaymentFailure,
  getUserOrders,
  getOrderById
};
