const Product = require("../models/Product");

const sampleProducts = [
  {
    name: "Apex Wireless Pro Noise-Cancelling Headphones",
    description: "Engineered with 40mm custom high-fidelity drivers, active noise cancellation, transparency mode, and 38-hour battery longevity for pure studio-grade listening.",
    price: 249,
    originalPrice: 299,
    category: "Audio",
    brand: "Apex Sound",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    rating: 4.9,
    numReviews: 184,
    countInStock: 25,
    featured: true,
    badge: "Best Seller",
    isNewArrival: false,
    colors: ["Space Black", "Silver Mist", "Midnight Navy"]
  },
  {
    name: "Horizon Ultra Retina Smartwatch",
    description: "Always-On AMOLED display, biometric cardiac and SpO2 tracking, dual-frequency GPS, titanium bezel, and water resistance up to 50 meters.",
    price: 199,
    originalPrice: 249,
    category: "Wearables",
    brand: "Horizon",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
    rating: 4.8,
    numReviews: 122,
    countInStock: 18,
    featured: true,
    badge: "Trending",
    isNewArrival: true,
    colors: ["Obsidian", "Starlight", "Titanium Gray"]
  },
  {
    name: "CloudPulse Nitro Running Sneakers",
    description: "Responsive supercritical foam cushioning, breathable engineered knit mesh upper, and high-traction rubber outsole designed for marathon comfort and street style.",
    price: 129,
    originalPrice: 165,
    category: "Footwear",
    brand: "PulseLab",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
    rating: 4.7,
    numReviews: 95,
    countInStock: 30,
    featured: true,
    badge: "-22% OFF",
    isNewArrival: false,
    colors: ["Crimson Red", "Triple Black", "Ghost White"]
  },
  {
    name: "CyberGlow RGB Wireless Mechanical Keyboard",
    description: "Hot-swappable tactile switches, aluminum top plate, per-key RGB backlighting, Bluetooth 5.2 / 2.4Ghz connectivity, and up to 200 hours battery.",
    price: 149,
    originalPrice: 189,
    category: "Gaming",
    brand: "CyberGrid",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
    rating: 4.9,
    numReviews: 76,
    countInStock: 15,
    featured: true,
    badge: "New Release",
    isNewArrival: true,
    colors: ["Stealth Black", "Cyber Lilac", "Retro Chalk"]
  },
  {
    name: "Vanguard True Spatial Earbuds",
    description: "Ultra-compact charging case with LED display, spatial dynamic audio with head tracking, quad-mic beamforming noise isolation, and IPX7 sweat resistance.",
    price: 119,
    originalPrice: 149,
    category: "Audio",
    brand: "Apex Sound",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80",
    rating: 4.8,
    numReviews: 142,
    countInStock: 40,
    featured: false,
    badge: "Popular",
    isNewArrival: false,
    colors: ["Matte Black", "Pearl White"]
  },
  {
    name: "Minimalist Water-Resistant Commuter Backpack",
    description: "Crafted from durable recycled Cordura nylon with dedicated 16-inch padded laptop sleeve, waterproof zippers, and hidden magnetic travel passport pocket.",
    price: 89,
    originalPrice: 119,
    category: "Accessories",
    brand: "UrbanNomad",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
    rating: 4.6,
    numReviews: 53,
    countInStock: 22,
    featured: false,
    badge: "Hot Deal",
    isNewArrival: false,
    colors: ["Charcoal", "Olive Drab", "Midnight Blue"]
  },
  {
    name: "Apex Precision Wireless Ergonomic Mouse",
    description: "Hyper-fast magnetic scroll wheel, dual optical sensors with 8K DPI tracking on glass, silent clicks, and customizable thumb gesture controls.",
    price: 79,
    originalPrice: 99,
    category: "Gaming",
    brand: "CyberGrid",
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80",
    rating: 4.9,
    numReviews: 64,
    countInStock: 35,
    featured: false,
    badge: "Top Rated",
    isNewArrival: true,
    colors: ["Matte Slate", "Arctic Silver"]
  },
  {
    name: "AeroFit Active GPS Health Tracker",
    description: "Ultralight aerodynamic band with heart rate variability, sleep stages analysis, stress monitor, and continuous 14-day battery reserve.",
    price: 89,
    originalPrice: 110,
    category: "Wearables",
    brand: "Horizon",
    image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&auto=format&fit=crop&q=80",
    rating: 4.6,
    numReviews: 38,
    countInStock: 28,
    featured: false,
    badge: "New",
    isNewArrival: true,
    colors: ["Graphite", "Coral Rose", "Sage Green"]
  },
  {
    name: "Nomad Polarized Aviator Titanium Sunglasses",
    description: "Ultralight beta-titanium Japanese frame with laser-etched polarized anti-reflective lenses offering 100% UVA/UVB protection and crystal visual clarity.",
    price: 135,
    originalPrice: 175,
    category: "Accessories",
    brand: "UrbanNomad",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80",
    rating: 4.7,
    numReviews: 49,
    countInStock: 19,
    featured: false,
    badge: "Premium",
    isNewArrival: false,
    colors: ["Gunmetal / Smoke", "Gold / Amber"]
  },
  {
    name: "Retro Heritage High-Top Canvas Sneakers",
    description: "Vulcanized durable rubber soles, dual-density padded insoles, vintage 90s aesthetic stitched from premium organic heavy-duty cotton canvas.",
    price: 115,
    originalPrice: 140,
    category: "Footwear",
    brand: "PulseLab",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80",
    rating: 4.8,
    numReviews: 87,
    countInStock: 24,
    featured: false,
    badge: "Limited Drop",
    isNewArrival: true,
    colors: ["Vintage White / Blue", "Mono Black"]
  }
];

// GET ALL PRODUCTS (with search, category filter, sorting, limit)
const getProducts = async (req, res) => {
  try {
    const { category, search, featured, sort, limit = 50 } = req.query;

    const query = {};

    if (category && category !== "All") {
      query.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    if (featured === "true") {
      query.featured = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === "price_asc") sortOption = { price: 1 };
    else if (sort === "price_desc") sortOption = { price: -1 };
    else if (sort === "rating") sortOption = { rating: -1 };
    else if (sort === "newest") sortOption = { createdAt: -1 };

    const products = await Product.find(query)
      .sort(sortOption)
      .limit(parseInt(limit, 10));

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error("getProducts Error:", error);
    res.status(500).json({ success: false, message: "Error fetching products", error: error.message });
  }
};

// GET FEATURED PRODUCTS
const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ featured: true }).limit(8);
    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error("getFeaturedProducts Error:", error);
    res.status(500).json({ success: false, message: "Error fetching featured products" });
  }
};

// GET PRODUCT BY ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error("getProductById Error:", error);
    res.status(500).json({ success: false, message: "Error fetching product details" });
  }
};

// GET CATEGORIES LIST WITH COUNTS
const getCategories = async (req, res) => {
  try {
    const categoriesWithCounts = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          image: { $first: "$image" }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const formatted = categoriesWithCounts.map((cat) => ({
      name: cat._id,
      count: cat.count,
      image: cat.image
    }));

    res.json({
      success: true,
      categories: formatted
    });
  } catch (error) {
    console.error("getCategories Error:", error);
    res.status(500).json({ success: false, message: "Error fetching categories" });
  }
};

// SEED PRODUCTS DATABASE
const seedProducts = async (req, res) => {
  try {
    await Product.deleteMany({});
    const inserted = await Product.insertMany(sampleProducts);
    res.status(201).json({
      success: true,
      message: `Successfully seeded ${inserted.length} products!`,
      products: inserted
    });
  } catch (error) {
    console.error("seedProducts Error:", error);
    res.status(500).json({ success: false, message: "Error seeding products", error: error.message });
  }
};

// AUTO-SEED HELPER ON SERVER START
const ensureSeedProducts = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log("No products found in DB. Seeding initial catalog...");
      await Product.insertMany(sampleProducts);
      console.log(`Auto-seeded ${sampleProducts.length} initial products successfully.`);
    }
  } catch (err) {
    console.warn("Could not check/seed products on startup:", err.message);
  }
};

module.exports = {
  getProducts,
  getFeaturedProducts,
  getProductById,
  getCategories,
  seedProducts,
  ensureSeedProducts,
  sampleProducts
};
