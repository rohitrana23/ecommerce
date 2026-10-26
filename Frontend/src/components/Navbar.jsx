import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, Search, X, User as UserIcon, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar({ searchQuery, setSearchQuery }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleSearchChange = (e) => {
    if (setSearchQuery) {
      setSearchQuery(e.target.value);
    }
    // If user is searching on login/register page, navigate back home
    if (location.pathname !== "/" && e.target.value.trim().length > 0) {
      navigate("/");
    }
  };

  const clearSearch = () => {
    if (setSearchQuery) {
      setSearchQuery("");
    }
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo">
          <div className="brand-icon-wrapper">
            <Sparkles size={22} />
          </div>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span className="brand-text">ApexStore</span>
            <span className="brand-badge">PRO</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <ul className="nav-links">
          <li>
            <Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`}>
              Explore
            </Link>
          </li>
          <li>
            <a href="/#products" className="nav-link">
              Products
            </a>
          </li>
        </ul>

        {/* Live Search Input */}
        <div className="nav-search-bar">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search audio, watches, sneakers, gaming..."
            value={searchQuery || ""}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={clearSearch}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Actions (Auth & Cart) */}
        <div className="nav-actions">
          {isAuthenticated ? (
            <div className="user-pill">
              <div className="user-avatar">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <span className="user-name">{user?.name?.split(" ")[0]}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="logout-icon-btn"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <Link to="/login" className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.88rem" }}>
                Sign In
              </Link>
              <Link to="/register" className="btn-primary" style={{ padding: "8px 16px", fontSize: "0.88rem" }}>
                Register
              </Link>
            </div>
          )}

          {/* Cart Trigger */}
          <button
            type="button"
            className="cart-btn"
            onClick={() => setIsCartOpen(true)}
            aria-label="View shopping bag"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className="cart-badge-count">{cartCount}</span>}
          </button>
        </div>
      </div>
    </nav>
  );
}
