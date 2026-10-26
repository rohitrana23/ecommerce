const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");
const { ensureSeedProducts } = require("./controllers/productController");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const homeRoutes = require("./routes/homeRoutes");

const app = express();

// Database Connection
connectDB().then(() => {
  ensureSeedProducts();
}).catch((err) => {
  console.error("DB connection error in startup hook:", err.message);
});

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(null, true); // Allow during development
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/home", homeRoutes);

// Health check / API status route
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "Apex E-Commerce Backend API is active",
    endpoints: {
      auth: "/api/auth (register, login, logout, me)",
      products: "/api/products (filter, search, categories, featured, seed)",
      home: "/api/home (hero banners, categories, trending, deals, perks, stats)"
    }
  });
});

// 404 Handler for undefined API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Internal Server Error:", err);
  res.status(500).json({
    success: false,
    message: "An internal server error occurred",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 API Docs: http://localhost:${PORT}/`);
});