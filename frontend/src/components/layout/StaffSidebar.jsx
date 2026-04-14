import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Package,
  Headphones,
  Box,
  BarChart2,
  Truck,
  LogOut,
  Armchair,
  Settings,
  Bell,
  Search,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const StaffSidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const mainMenuItems = [
    { name: "Quản lý đơn hàng", icon: Package, path: "/staff/orders" },
    { name: "Hỗ trợ khách hàng", icon: Headphones, path: "/staff/support" },
    { name: "Kiểm tra kho hàng", icon: Box, path: "/staff/inventory" },
  ];

  const reportMenuItems = [
    { name: "Doanh thu tuần", icon: BarChart2, path: "/staff/reports/revenue" },
  ];

  return (
    <div className="w-72 bg-white border-r border-slate-100 flex flex-col h-screen font-sans">
      {/* Brand Header */}
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="bg-[#2b4c4f] w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-[#2b4c4f]/10">
            <Armchair className="text-white h-6 w-6" />
          </div>
          <div>
            <h1 className="text-slate-900 font-black text-xl tracking-tight leading-none">
              Furniture Hub
            </h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
              Bảng điều khiển nhân viên
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-8">
        {/* Main Section */}
        <div>
          <h3 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
            Chính
          </h3>
          <nav className="space-y-1">
            {mainMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                    isActive
                      ? "bg-[#2b4c4f] text-white shadow-xl shadow-[#2b4c4f]/20 scale-[1.02]"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}>
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={isActive ? "text-white" : "text-slate-400"}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Reports Section */}
        <div>
          <h3 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
            Báo cáo
          </h3>
          <nav className="space-y-1">
            {reportMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                    isActive
                      ? "bg-[#2b4c4f] text-white shadow-xl shadow-[#2b4c4f]/20 scale-[1.02]"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}>
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={isActive ? "text-white" : "text-slate-400"}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Staff Profile Card */}
      <div className="p-4 mb-2">
        <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 font-black text-lg shadow-sm">
              {user?.full_name?.charAt(0) || "S"}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-slate-900 truncate max-w-[120px]">
                {user?.full_name || "Nhân viên"}
              </span>
              <span className="text-[10px] font-bold text-slate-400 truncate max-w-[120px]">
                {user?.email || "staff@furniture.com"}
              </span>
            </div>
          </div>
          <button className="p-2 hover:bg-white rounded-xl transition-all text-slate-400 hover:text-red-500 hover:shadow-sm">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
