import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Sparkles,
  X,
  Minus,
  Send,
  Star,
  ShoppingBag,
  Eye,
  Check,
  Loader2,
  RefreshCw
} from "lucide-react";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import ProductQuickView from "./ProductQuickView";

const SUGGESTED_PROMPTS = [
  "Find products under ₹1000",
  "Recommend the best products",
  "Show me the latest products",
  "Compare two products",
  "Help me choose a product"
];

export default function Chatbot() {
  const { addToCart } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [addedProductIds, setAddedProductIds] = useState(new Set());

  const [messages, setMessages] = useState([
    {
      role: "model",
      content: "Hi! I'm your AI shopping assistant. How can I help you today?",
      products: []
    }
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, isOpen]);

  // Focus input when chat window is opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || loading) return;

    // Append user message immediately
    const userTurn = { role: "user", content: query };
    const updatedMessages = [...messages, userTurn];
    setMessages(updatedMessages);
    setInputMessage("");
    setLoading(true);

    try {
      // Send conversation history (last 6 turns) + current message to backend
      const historyPayload = messages
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await api.post("/ai/chat", {
        message: query,
        history: historyPayload
      });

      if (res.data && res.data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            content: res.data.reply,
            products: res.data.products || []
          }
        ]);
      } else {
        throw new Error(res.data?.message || "Failed to get reply");
      }
    } catch (err) {
      console.error("AI Chatbot request error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content:
            err.response?.data?.message ||
            "I'm sorry, I encountered a temporary connection issue. Please feel free to try again!",
          products: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAddToCartFromChat = (product) => {
    addToCart(product, 1, product.colors?.[0] || "Default");
    setAddedProductIds((prev) => new Set(prev).add(product._id));
    setTimeout(() => {
      setAddedProductIds((prev) => {
        const next = new Set(prev);
        next.delete(product._id);
        return next;
      });
    }, 2000);
  };

  // Helper to format AI markdown text into styled spans and bullets
  const renderFormattedContent = (content) => {
    if (!content) return null;

    const lines = content.split("\n");
    return lines.map((line, idx) => {
      // Bullet list items
      if (line.startsWith("• ") || line.startsWith("- ") || line.startsWith("* ")) {
        const clean = line.replace(/^[•\-*]\s+/, "");
        return (
          <div key={idx} style={{ display: "flex", gap: "6px", margin: "4px 0" }}>
            <span style={{ color: "#6366f1" }}>•</span>
            <span>{formatBoldSpans(clean)}</span>
          </div>
        );
      }
      // Numbered list items (e.g. 1. 2.)
      const numMatch = line.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return (
          <div key={idx} style={{ display: "flex", gap: "6px", margin: "4px 0" }}>
            <strong style={{ color: "#6366f1" }}>{numMatch[1]}.</strong>
            <span>{formatBoldSpans(numMatch[2])}</span>
          </div>
        );
      }
      // Header items (###)
      if (line.startsWith("###") || line.startsWith("##")) {
        return (
          <h5 key={idx} style={{ margin: "8px 0 4px", color: "#ffffff", fontWeight: 700 }}>
            {formatBoldSpans(line.replace(/^#+\s*/, ""))}
          </h5>
        );
      }
      // Table rows (| ... |)
      if (line.startsWith("|") && line.endsWith("|")) {
        if (line.includes("---")) return null; // skip markdown divider
        const cells = line.split("|").filter((c) => c.trim().length > 0);
        return (
          <div
            key={idx}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "3px 6px",
              background: idx % 2 === 0 ? "rgba(255, 255, 255, 0.03)" : "transparent",
              fontSize: "0.82rem"
            }}
          >
            {cells.map((cell, cIdx) => (
              <span key={cIdx} style={{ flex: 1 }}>
                {formatBoldSpans(cell.trim())}
              </span>
            ))}
          </div>
        );
      }
      // Normal paragraph line
      if (line.trim().length === 0) {
        return <div key={idx} style={{ height: "6px" }} />;
      }
      return (
        <p key={idx} style={{ margin: "2px 0" }}>
          {formatBoldSpans(line)}
        </p>
      );
    });
  };

  const formatBoldSpans = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} style={{ color: "#ffffff" }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Circular Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          className="chatbot-float-btn"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Shopping Assistant"
          title="Chat with AI Shopping Assistant"
        >
          <div className="chatbot-pulse-ring" />
          <Bot size={26} />
          <div className="chatbot-badge-dot" />
        </button>
      )}

      {/* Modern Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">
                <Bot size={20} />
                <div className="chatbot-online-indicator" />
              </div>
              <div className="chatbot-header-text">
                <h4>
                  AI Shopping Assistant <Sparkles size={14} color="#fbbf24" />
                </h4>
                <p>
                  <span>●</span> Online • Powered by Gemini
                </p>
              </div>
            </div>

            <div className="chatbot-header-actions">
              <button
                type="button"
                className="chatbot-icon-btn"
                onClick={() => setIsOpen(false)}
                title="Minimize chat"
                aria-label="Minimize"
              >
                <Minus size={18} />
              </button>
              <button
                type="button"
                className="chatbot-icon-btn"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="chatbot-body">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chatbot-msg-row ${msg.role === "user" ? "user" : "ai"}`}
              >
                {msg.role !== "user" && (
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: "rgba(99, 102, 241, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#6366f1",
                      flexShrink: 0
                    }}
                  >
                    <Bot size={16} />
                  </div>
                )}

                <div className={`chatbot-msg-bubble ${msg.role === "user" ? "user" : "ai"}`}>
                  {renderFormattedContent(msg.content)}

                  {/* Render Embedded Product Cards */}
                  {Array.isArray(msg.products) && msg.products.length > 0 && (
                    <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                      {msg.products.map((product) => {
                        const isAdded = addedProductIds.has(product._id);
                        return (
                          <div key={product._id} className="chatbot-product-card">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="chatbot-product-img"
                            />
                            <div className="chatbot-product-info">
                              <h5 className="chatbot-product-title" title={product.name}>
                                {product.name}
                              </h5>
                              <div className="chatbot-product-meta">
                                <span className="chatbot-product-price">${product.price}</span>
                                <span className="chatbot-product-rating">
                                  <Star size={12} fill="#fbbf24" /> {product.rating || "4.8"}
                                </span>
                              </div>
                              <div className="chatbot-product-actions">
                                <button
                                  type="button"
                                  className="chatbot-card-btn-view"
                                  onClick={() => setQuickViewProduct(product)}
                                >
                                  <Eye size={12} /> View Details
                                </button>
                                <button
                                  type="button"
                                  className={`chatbot-card-btn-add ${isAdded ? "added" : ""}`}
                                  onClick={() => handleAddToCartFromChat(product)}
                                >
                                  {isAdded ? (
                                    <>
                                      <Check size={12} /> Added!
                                    </>
                                  ) : (
                                    <>
                                      <ShoppingBag size={12} /> Add to Cart
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {loading && (
              <div className="chatbot-msg-row ai">
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "rgba(99, 102, 241, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#6366f1",
                    flexShrink: 0
                  }}
                >
                  <Bot size={16} />
                </div>
                <div className="chatbot-typing-indicator">
                  <div className="chatbot-dot" />
                  <div className="chatbot-dot" />
                  <div className="chatbot-dot" />
                  <span style={{ fontSize: "0.78rem", color: "var(--text-dim)", marginLeft: "6px" }}>
                    Searching products...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts Pills */}
          <div className="chatbot-prompts-wrapper">
            {SUGGESTED_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                className="chatbot-prompt-pill"
                onClick={() => handleSendMessage(prompt)}
                disabled={loading}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="chatbot-input-bar">
            <input
              ref={inputRef}
              type="text"
              className="chatbot-input"
              placeholder="Ask about products, budget, features..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={500}
              disabled={loading}
            />
            <button
              type="button"
              className="chatbot-send-btn"
              onClick={() => handleSendMessage()}
              disabled={loading || !inputMessage.trim()}
              aria-label="Send message"
            >
              {loading ? (
                <Loader2 size={16} className="spin-animation" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Global Product QuickView Modal Triggered from Chatbot */}
      {quickViewProduct && (
        <ProductQuickView
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </>
  );
}
