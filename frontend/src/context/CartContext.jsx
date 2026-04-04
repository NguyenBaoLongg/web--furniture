import React, { createContext, useContext, useState, useEffect } from "react";
import { axiosClient } from "../utils/axiosClient";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  const fetchCart = async () => {
    if (!user) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axiosClient.get(`/cart/${user.id}`);
      setCartItems(res.data);
    } catch (error) {
      console.error("Lỗi lấy giỏ hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productData) => {
    if (!user) {
      toast.info("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
      return;
    }

    try {
      await axiosClient.post("/cart", {
        user_id: user.id,
        product_id: productData.product_id,
        variant_id: productData.variant_id || null,
        quantity: productData.quantity,
      });
      fetchCart();
      toast.success("Đã thêm vào giỏ hàng!");
    } catch (error) {
      console.error("Lỗi thêm giỏ hàng:", error);
      toast.error("Có lỗi xảy ra khi thêm vào giỏ hàng.");
    }
  };

  const updateQuantity = async (id, newQuantity) => {
    if (!user || newQuantity < 1) return;

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item,
      ),
    );

    try {
      await axiosClient.put(`/cart/${id}`, { quantity: newQuantity });
    } catch (error) {
      fetchCart();
    }
  };

  const removeFromCart = async (id) => {
    if (!user) return;

    setCartItems((prev) => prev.filter((item) => item.id !== id));

    try {
      await axiosClient.delete(`/cart/${id}`);
    } catch (error) {
      fetchCart();
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        fetchCart,
      }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
