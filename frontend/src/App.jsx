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
import { ProfilePage } from "./pages/Profile/ProfilePage.jsx";
import { PersonalInfoPage } from "./pages/Profile/PersonalInfoPage.jsx";
import { ShippingAddressPage } from "./pages/Profile/ShippingAddressPage.jsx";
import { WishlistPage } from "./pages/Profile/WishlistPage.jsx";
import { AdminRoute } from "./components/auth/AdminRoute.jsx";
import { AdminLoginPage } from "./pages/Admin/AdminLoginPage.jsx";
import { AdminLayout } from "./components/layout/AdminLayout.jsx";
import { AdminDashboard } from "./pages/Admin/AdminDashboard.jsx";
import { AdminPermissionsPage } from "./pages/Admin/AdminPermissionsPage.jsx";
import { AdminOrdersPage } from "./pages/Admin/AdminOrdersPage.jsx";
import { AdminProductsPage } from "./pages/Admin/AdminProductsPage";
import { AdminCategoriesPage } from "./pages/Admin/AdminCategoriesPage";

export default function App() {
  const { cartItems } = useCart();
  const location = useLocation();
  const hideHeaderFooterPaths = ["/login", "/register", "/vnpay-return"];
  const isAuthPage =
    hideHeaderFooterPaths.includes(location.pathname) ||
    location.pathname.startsWith("/admin");
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
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/orders" element={<OrderHistoryPage />} />
          <Route path="/profile/orders/:id" element={<OrderDetailPage />} />
          <Route
            path="/profile/transactions"
            element={<TransactionHistoryPage />}
          />
          <Route path="/profile/personal-info" element={<PersonalInfoPage />} />
          <Route path="/profile/address" element={<ShippingAddressPage />} />
          <Route path="/profile/wishlist" element={<WishlistPage />} />

          {/* admin */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="permissions" element={<AdminPermissionsPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
          </Route>
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
}
