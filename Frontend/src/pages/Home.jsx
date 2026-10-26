import { useState, useEffect } from "react";
import {
  Sparkles,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  ArrowRight,
  Star,
  SlidersHorizontal
} from "lucide-react";
import api from "../services/api";
import ProductCard from "../components/ProductCard";
import ProductQuickView from "../components/ProductQuickView";
import { useCart } from "../context/CartContext";

export default function Home({ searchQuery, setSearchQuery }) {
  const { addToCart, setIsCartOpen } = useCart();

  const [homeData, setHomeData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Fetch Home aggregated data and products
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [homeRes, productsRes] = await Promise.all([
          api.get("/home"),
          api.get("/products")
        ]);

        if (homeRes.data?.data) {
          setHomeData(homeRes.data.data);
        }
        if (productsRes.data?.products) {
          setProducts(productsRes.data.products);
        }
      } catch (err) {
        console.error("Failed to load store data:", err);
        setError("Unable to connect to ApexStore backend. Please ensure backend server is active.");
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // Filter and sort products
  const filteredProducts = products.filter((p) => {
    const matchCategory =
      activeCategory === "All" || p.category.toLowerCase() === activeCategory.toLowerCase();
    const matchSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchCategory && matchSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price_asc") return a.price - b.price;
    if (sortBy === "price_desc") return b.price - a.price;
    if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
    if (sortBy === "newest") return b.isNewArrival ? 1 : -1;
    return b.featured ? 1 : -1;
  });

  const categories = [
    "All",
    "Audio",
    "Wearables",
    "Footwear",
    "Gaming",
    "Accessories"
  ];

  const heroBanners = homeData?.heroBanners || [
    {
      id: "b-1",
      badge: "Spring 2026 Collection",
      title: "Next-Gen Audio & Smart Wearables",
      subtitle:
        "Immerse yourself in acoustic precision and titanium craftsmanship. Built for modern high-performance living.",
      ctaText: "Shop The Collection",
      ctaLink: "#products",
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80"
    },
    {
      id: "b-2",
      badge: "Exclusive Launch",
      title: "Titanium Horizon Ultra Series",
      subtitle:
        "Dual-frequency GPS, aerospace grade finish, and continuous biometric telemetry on your wrist.",
      ctaText: "Explore Smartwatches",
      ctaLink: "#products",
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&auto=format&fit=crop&q=80"
    }
  ];

  const currentHero = heroBanners[0];

  const perks = [
    {
      icon: <Truck size={22} />,
      title: "Free Express Shipping",
      desc: "Complimentary global shipping on all orders over $75"
    },
    {
      icon: <ShieldCheck size={22} />,
      title: "Authenticity Guaranteed",
      desc: "100% genuine products backed by 2-year warranty"
    },
    {
      icon: <RotateCcw size={22} />,
      title: "30-Day Hassle-Free Returns",
      desc: "Instant return pickup and effortless full refunds"
    },
    {
      icon: <Headphones size={22} />,
      title: "24/7 Concierge Support",
      desc: "Dedicated expert assistance whenever you need it"
    }
  ];

  const testimonials = [
    {
      name: "Alex Vance",
      role: "Audiophile & Music Producer",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      content:
        "The Apex Wireless Pro headphones completely blew away my expectations. The soundstage is remarkably neutral and clear.",
      product: "Apex Wireless Pro Headphones"
    },
    {
      name: "Marcus Chen",
      role: "Marathon Runner & Tech Enthusiast",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      content:
        "CloudPulse sneakers offer sensational energy return. Ordering was seamless, and delivery took less than 48 hours to my doorstep.",
      product: "CloudPulse Nitro Sneakers"
    },
    {
      name: "Elena Rostova",
      role: "Architect & Designer",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
      content:
        "The build quality on the Horizon Ultra Smartwatch rivals watches twice its price. The minimalist titanium aesthetic is breathtaking.",
      product: "Horizon Ultra Smartwatch"
    }
  ];

  return (
    <div style={{ paddingBottom: "64px" }}>
      {/* Quick View Modal */}
      {quickViewProduct && (
        <ProductQuickView
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}

      {/* Hero Banner Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-banner-card">
            <div className="hero-banner-content">
              <span className="hero-tagline">
                <Sparkles size={14} /> {currentHero.badge}
              </span>
              <h1 className="hero-title">{currentHero.title}</h1>
              <p className="hero-description">{currentHero.subtitle}</p>

              <div className="hero-actions">
                <a href="#products" className="btn-primary">
                  {currentHero.ctaText} <ArrowRight size={18} />
                </a>
              </div>
            </div>

            <div className="hero-image-wrapper">
              <img
                src={currentHero.image}
                alt={currentHero.title}
                className="hero-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Perks / Store Guarantees */}
      <section className="perks-strip">
        <div className="container">
          <div className="perks-grid">
            {perks.map((p, idx) => (
              <div key={idx} className="perk-card">
                <div className="perk-icon-wrap">{p.icon}</div>
                <div>
                  <h4 className="perk-title">{p.title}</h4>
                  <p className="perk-desc">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Filter Tabs */}
      <section className="categories-section" id="products">
        <div className="container">
          <div className="section-header">
            <div>
              <span className="section-tag">Curated Collections</span>
              <h2 className="section-title">Discover Premium Gear</h2>
            </div>
          </div>

          <div className="categories-pills-bar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`cat-pill-btn ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Catalog Grid */}
      <section className="catalog-section">
        <div className="container">
          {/* Toolbar */}
          <div className="filter-toolbar">
            <span className="filter-count-label">
              Showing <strong style={{ color: "#fff" }}>{sortedProducts.length}</strong> items{" "}
              {searchQuery && (
                <span>
                  matching "<strong>{searchQuery}</strong>"
                </span>
              )}
            </span>

            <div className="filter-controls">
              <SlidersHorizontal size={16} color="var(--text-dim)" />
              <label htmlFor="sort-select" style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Sort By:
              </label>
              <select
                id="sort-select"
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="featured">Featured First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)" }}>
              <div style={{ width: "40px", height: "40px", border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "var(--primary)", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 1s linear infinite" }} />
              <p>Loading curated catalog...</p>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div
              className="glass-panel"
              style={{ textAlign: "center", padding: "64px 24px", maxWidth: "540px", margin: "40px auto" }}
            >
              <h3 style={{ fontSize: "1.3rem", marginBottom: "8px" }}>No items matched your query</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", marginBottom: "20px" }}>
                Try searching for a different keyword or resetting your category filters.
              </p>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setActiveCategory("All");
                  if (setSearchQuery) setSearchQuery("");
                }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="product-grid">
              {sortedProducts.map((prod) => (
                <ProductCard
                  key={prod._id}
                  product={prod}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Customer Testimonials & Trust */}
      <section style={{ padding: "32px 0 64px" }}>
        <div className="container">
          <div className="section-header" style={{ textAlign: "center", display: "block", marginBottom: "40px" }}>
            <span className="section-tag">Verified Community</span>
            <h2 className="section-title">Loved by 50,000+ Discerning Shoppers</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
            {testimonials.map((t, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", gap: "4px", color: "#f59e0b" }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>

                <p style={{ color: "var(--text-main)", fontSize: "0.95rem", lineHeight: "1.6", fontStyle: "italic" }}>
                  "{t.content}"
                </p>

                <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: "12px", borderTop: "1px solid var(--border-subtle)", paddingTop: "16px" }}>
                  <img
                    src={t.avatar}
                    alt={t.name}
                    style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover", border: "1px solid var(--border-subtle)" }}
                  />
                  <div>
                    <h5 style={{ fontSize: "0.92rem", fontWeight: "700" }}>{t.name}</h5>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
