import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Header } from "./components/layout/Header.jsx";
import { Footer } from "./components/layout/Footer.jsx";
import { Home } from "./pages/Home/Home.jsx";
import { CategoryDetailPage } from "./pages/Category/CategoryDetailPage.jsx";

export default function App() {
  const [cartItems, setCartItems] = useState([]);

  return (
    <div className="min-h-screen font-sans bg-white text-slate-900">
      <Header
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
      />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/category/:categorySlug"
            element={<CategoryDetailPage />}
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
