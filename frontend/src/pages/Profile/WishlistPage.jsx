import React, { useEffect, useState } from "react";
import { ProfileSidebar } from "../../components/profile/ProfileSidebar";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { axiosClient } from "../../utils/axiosClient";
import { ProductCard } from "../../components/ui/ProductCard";
import { toast } from "react-toastify";

export const WishlistPage = () => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const fetchWishlist = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await axiosClient.get(`/wishlist/user/${user.id}`);
      setWishlist(res.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách yêu thích:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await axiosClient.post("/wishlist/toggle", {
        user_id: user.id,
        product_id: productId,
      });
      setWishlist(wishlist.filter((item) => item.product_id !== productId));
      toast.success("Đã xoá khỏi mục yêu thích");
    } catch (error) {
      toast.error("Lỗi khi xoá sản phẩm");
    }
  };

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
        <ProfileSidebar />

        <div className="flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900">Sản phẩm yêu thích</h1>
            <p className="text-slate-500 font-medium">Danh sách các sản phẩm bạn đã lưu để mua sau</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : wishlist.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm py-20 px-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-8">
                <Heart className="w-12 h-12 text-rose-300" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4">Danh sách trống</h3>
              <p className="text-slate-500 max-w-md mx-auto mb-10 font-medium leading-relaxed">
                Bạn chưa có sản phẩm yêu thích nào. Hãy khám phá và lưu lại những sản phẩm bạn thích nhé!
              </p>
              <Link
                to="/products"
                className="bg-[#2b4c4f] text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl shadow-[#2b4c4f]/20 hover:bg-[#1f383a] transition-all flex items-center gap-3"
              >
                <ShoppingCart className="w-5 h-5" />
                Khám phá sản phẩm
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((item) => (
                <div key={item.id} className="relative group">
                  <ProductCard
                    id={item.products.id}
                    slug={item.products.slug}
                    title={item.products.title}
                    price={item.products.price}
                    image={item.products.thumbnail}
                  />
                  <button
                    onClick={() => handleRemove(item.product_id)}
                    className="absolute top-4 right-4 w-8 h-8 bg-white text-rose-500 rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-50"
                    title="Xoá khỏi danh sách"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
