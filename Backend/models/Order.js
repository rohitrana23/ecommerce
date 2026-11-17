const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"]
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"]
    },
    selectedColor: {
      type: String,
      default: "Default"
    },
    image: {
      type: String
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Order must belong to a user"],
      index: true
    },
    products: {
      type: [orderItemSchema],
      required: [true, "Order must contain at least one item"],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "Order products list cannot be empty"
      }
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, "Subtotal cannot be negative"]
    },
    shippingAmount: {
      type: Number,
      default: 0,
      min: [0, "Shipping cannot be negative"]
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, "Total amount cannot be negative"]
    },
    currency: {
      type: String,
      required: true,
      default: "INR",
      uppercase: true,
      trim: true
    },
    razorpayOrderId: {
      type: String,
      required: [true, "Razorpay Order ID is required"],
      unique: true,
      trim: true,
      index: true
    },
    razorpayPaymentId: {
      type: String,
      default: "",
      trim: true
    },
    razorpaySignature: {
      type: String,
      default: "",
      trim: true
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ["pending", "paid", "failed", "refunded"],
        message: "{VALUE} is not a valid payment status"
      },
      default: "pending",
      index: true
    },
    orderStatus: {
      type: String,
      enum: {
        values: ["created", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
        message: "{VALUE} is not a valid order status"
      },
      default: "created",
      index: true
    },
    failureReason: {
      type: String,
      default: ""
    },
    paidAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Compound index for user order queries
orderSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
