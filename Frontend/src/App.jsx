import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider, useCart } from "./context/CartContext";
import Navbar from "./components/Navbar";
import CartDrawer from "./components/CartDrawer";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
<<<<<<< HEAD
import Orders from "./pages/Orders";
import Chatbot from "./components/Chatbot";
=======
>>>>>>> 2847380a4d8f298fdb345e977cd04f557505e050
import "./App.css";

function AppContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toastMessage } = useCart();

  return (
    <>
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main style={{ flexGrow: 1 }}>
        <Routes>
          <Route
            path="/"
            element={<Home searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
<<<<<<< HEAD
          <Route path="/orders" element={<Orders />} />
=======
>>>>>>> 2847380a4d8f298fdb345e977cd04f557505e050
          <Route
            path="*"
            element={<Home searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}
          />
        </Routes>
      </main>

      <Footer />

      {/* Slide-out Bag Drawer */}
      <CartDrawer />

<<<<<<< HEAD
      {/* Floating AI Shopping Assistant */}
      <Chatbot />

=======
>>>>>>> 2847380a4d8f298fdb345e977cd04f557505e050
      {/* Global Notification Toast */}
      {toastMessage && <div className="global-toast">{toastMessage}</div>}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}