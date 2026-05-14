import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Files,
  Users,
  ShieldCheck,
  Settings,
  Armchair,
  Tags,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const AdminSidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    {
      name: "Bảng điều khiển",
      icon: LayoutDashboard,
      path: "/admin/dashboard",
    },
    { name: "Quản lý đơn hàng", icon: ShoppingCart, path: "/admin/orders" },
    { name: "Sản phẩm", icon: Armchair, path: "/admin/products" },
    { name: "Danh mục", icon: Files, path: "/admin/categories" },
    { name: "Khách hàng", icon: Users, path: "/admin/customers" },
    { name: "Phong cách", icon: Tags, path: "/admin/styles" },
    { name: "Phân quyền", icon: ShieldCheck, path: "/admin/permissions" },
  ];

  return (
    <div className="w-64 bg-white border-r border-[#f0f0f0] flex flex-col h-screen font-sans">
      <div className="p-6 pb-8 border-b border-[#f0f0f0]">
        <div className="flex items-center gap-3">
          <div className="bg-[#2b4c4f] w-10 h-10 rounded-lg flex items-center justify-center">
            <Armchair className="text-[#facc15] h-6 w-6" />
          </div>
          <div>
            <h1 className="text-[#2b4c4f] font-bold text-lg leading-tight">
              Furniture Hub
            </h1>
            <p className="text-gray-400 text-[10px] tracking-wider uppercase font-semibold">
              ADMIN PORTAL
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6">
        <nav className="space-y-1.5 px-3">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#2b4c4f] text-white"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}>
                <Icon
                  size={18}
                  className={isActive ? "text-white" : "text-gray-500"}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-6 border-t border-[#f0f0f0]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#f4ebd0] flex items-center justify-center text-sm font-semibold text-[#2b4c4f]">
            {user?.full_name?.charAt(0) || "A"}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">
              {user?.full_name || "Admin User"}
            </p>
            <p className="text-xs text-gray-400 capitalize">
              {user?.role?.replace("_", " ")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
