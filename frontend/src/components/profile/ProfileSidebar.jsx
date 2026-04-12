import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Package,
  MapPin,
  User,
  Heart,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

export const ProfileSidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    {
      path: "/profile",
      name: "Tổng quan",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      path: "/profile/orders",
      name: "Quản lý đơn hàng",
      icon: <Package className="w-5 h-5" />,
    },
    {
      path: "/profile/address",
      name: "Địa chỉ giao hàng",
      icon: <MapPin className="w-5 h-5" />,
    },
    {
      path: "/profile/personal-info",
      name: "Thông tin cá nhân",
      icon: <User className="w-5 h-5" />,
    },
    {
      path: "/profile/wishlist",
      name: "Sản phẩm yêu thích",
      icon: <Heart className="w-5 h-5" />,
    },
  ];

  const handleLogout = async () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      await logout();
    }
  };

  return (
    <div className="w-full md:w-72 shrink-0">
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 sticky top-10">
        {/* User Info */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2b4c4f] to-[#3a6367] flex items-center justify-center font-serif text-3xl font-bold text-white mb-4 shadow-lg shadow-[#2b4c4f]/20">
            {user?.full_name?.charAt(0) || "U"}
          </div>
          <h3 className="font-bold text-xl text-slate-900 mb-1">
            {user?.full_name}
          </h3>
          <p className="text-xs font-bold text-[#2b4c4f]/60 uppercase tracking-widest bg-[#f0f9f8] px-3 py-1 rounded-full">
            {user?.role === "admin" ? "Administrator" : "Premium Member"}
          </p>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-[15px] font-bold transition-all duration-300 ${
                  isActive
                    ? "bg-[#2b4c4f] text-white shadow-lg shadow-[#2b4c4f]/20"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[15px] font-bold text-rose-500 hover:bg-rose-50 transition-all duration-300 mt-6"
          >
            <LogOut className="w-5 h-5" />
            Đăng xuất
          </button>
        </nav>

        {/* Collection Promo Card */}
        <div className="mt-10 pt-10 border-t border-slate-100">
           <Link 
            to="/products"
            className="block p-6 rounded-3xl bg-[#d1b06b] text-white font-bold text-center text-sm shadow-lg shadow-[#d1b06b]/30 hover:bg-[#c2a15f] transition-all transform hover:-translate-y-1"
          >
            Mua bộ sưu tập mới
          </Link>
        </div>
      </div>
    </div>
  );
};
