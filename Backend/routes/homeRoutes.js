const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // 1. Fetch featured products
    const featuredProducts = await Product.find({ featured: true }).limit(6);

    // 2. Fetch new arrivals
    const newArrivals = await Product.find({ isNewArrival: true }).limit(6);

    // 3. Fetch distinct categories
    const categories = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          image: { $first: "$image" }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // 4. Hero Banners
    const heroBanners = [
      {
        id: "banner-1",
        badge: "Spring 2026 Collection",
        title: "Next-Gen Audio & Smart Wearables",
        subtitle: "Immerse yourself in acoustic precision and titanium craftsmanship. Built for modern high-performance living.",
        ctaText: "Shop The Collection",
        ctaLink: "/#products",
        highlight: "Up to 30% Off",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80",
        accentColor: "#6366f1"
      },
      {
        id: "banner-2",
        badge: "Exclusive Launch",
        title: "Titanium Horizon Ultra Series",
        subtitle: "Dual-GPS, aerospace grade finish, and continuous biometric telemetry on your wrist.",
        ctaText: "Explore Smartwatches",
        ctaLink: "/#products",
        highlight: "Limited Release",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop&q=80",
        accentColor: "#10b981"
      }
    ];

    // 5. Value propositions / guarantees
    const perks = [
      {
        icon: "Truck",
        title: "Free Express Shipping",
        description: "Complimentary global shipping on all orders over $75"
      },
      {
        icon: "ShieldCheck",
        title: "Authenticity Guaranteed",
        description: "100% genuine products backed by 2-year warranty"
      },
      {
        icon: "RotateCcw",
        title: "30-Day Hassle-Free Returns",
        description: "Instant return pickup and effortless full refunds"
      },
      {
        icon: "Headphones",
        title: "24/7 Concierge Support",
        description: "Dedicated expert assistance whenever you need it"
      }
    ];

    // 6. Store Stats
    const stats = [
      { value: "50K+", label: "Happy Shoppers" },
      { value: "99.4%", label: "Satisfaction Rate" },
      { value: "24/7", label: "Global Support" },
      { value: "48h", label: "Fastest Delivery" }
    ];

    res.json({
      success: true,
      data: {
        heroBanners,
        categories: categories.map((c) => ({
          name: c._id,
          count: c.count,
          image: c.image
        })),
        featuredProducts,
        newArrivals,
        perks,
        stats
      }
    });
  } catch (error) {
    console.error("Home route error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching home page data",
      error: error.message
    });
  }
});

module.exports = router;
