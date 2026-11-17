import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("apex_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem("apex_cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [cart]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 2800);
  };

  const addToCart = (product, quantity = 1, selectedColor = null) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item._id === product._id && item.selectedColor === (selectedColor || product.colors?.[0] || "")
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prev,
          {
            _id: product._id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            image: product.image,
            category: product.category,
            selectedColor: selectedColor || product.colors?.[0] || "Default",
            quantity
          }
        ];
      }
    });

    showToast(`Added "${product.name.slice(0, 24)}..." to bag`);
  };

  const removeFromCart = (id, selectedColor) => {
    setCart((prev) =>
      prev.filter((item) => !(item._id === id && (!selectedColor || item.selectedColor === selectedColor)))
    );
  };

  const updateQuantity = (id, selectedColor, newQty) => {
    if (newQty <= 0) {
      removeFromCart(id, selectedColor);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item._id === id && (!selectedColor || item.selectedColor === selectedColor)
          ? { ...item, quantity: newQty }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingThreshold = 75;
  const shippingCost = cartSubtotal >= shippingThreshold || cartSubtotal === 0 ? 0 : 9.99;
  const cartTotal = cartSubtotal + shippingCost;

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        setIsCartOpen,
        toastMessage,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        shippingCost,
        shippingThreshold,
        cartTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
