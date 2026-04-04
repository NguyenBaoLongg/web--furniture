import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Header } from "./components/layout/Header.jsx";
import { Footer } from "./components/layout/Footer.jsx";
import { Home } from "./pages/Home/Home.jsx";
import { CategoryDetailPage } from "./pages/Category/CategoryDetailPage.jsx";
import { RoomDetailPage } from "./pages/Room/RoomDetailPage.jsx";
import { ProductDetailPage } from "./pages/Product/ProductDetailPage.jsx";
import { CartPage } from "./pages/Cart/CartPage.jsx";
import { LoginPage } from "./pages/Auth/LoginPage.jsx";
import { RegisterPage } from "./pages/Auth/RegisterPage.jsx";
import { useCart } from "./context/CartContext.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ProductsPage } from "./pages/Product/ProductsPage.jsx";
import { CheckoutPage } from "./pages/Checkout/CheckoutPage.jsx";
import VNPayReturn from "./pages/Checkout/VNPayReturn.jsx";
import { OrderHistoryPage } from "./pages/Profile/OrderHistoryPage.jsx";
import { OrderDetailPage } from "./pages/Profile/OrderDetailPage.jsx";
import { TransactionHistoryPage } from "./pages/Profile/TransactionHistoryPage.jsx";

export default function App() {
  const { cartItems } = useCart();
  const location = useLocation();
  const hideHeaderFooterPaths = ["/login", "/register", "/vnpay-return"];
  const isAuthPage = hideHeaderFooterPaths.includes(location.pathname);
  return (
    <div className="min-h-screen font-sans bg-white text-slate-900 flex flex-col">
      {!isAuthPage && (
        <Header
          cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        />
      )}
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={true}
      />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/category/:categorySlug"
            element={<CategoryDetailPage />}
          />
          <Route path="/room/:roomSlug" element={<RoomDetailPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/vnpay-return" element={<VNPayReturn />} />
          <Route path="/profile/orders" element={<OrderHistoryPage />} />
          <Route path="/profile/orders/:id" element={<OrderDetailPage />} />
          <Route path="/profile/transactions" element={<TransactionHistoryPage />} />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
}
