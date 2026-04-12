import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ProfileSidebar } from "../../components/profile/ProfileSidebar";
import { axiosClient } from "../../utils/axiosClient";
import {
  ShoppingBag,
  Star,
  Heart,
  ChevronRight,
  Clock,
  CheckCircle,
  Package,
  MapPin,
  Settings,
} from "lucide-react";

export const ProfilePage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    ordersCount: 0,
    points: 1450,
    wishlistCount: 12,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [ordersRes, wishlistRes] = await Promise.all([
        axiosClient.get(`/orders/user/${user.id}`),
        axiosClient.get(`/wishlist/user/${user.id}`)
      ]);
      const orders = ordersRes.data;
      setRecentOrders(orders.slice(0, 3));
      setStats((prev) => ({
        ...prev,
        ordersCount: orders.length,
        wishlistCount: wishlistRes.data.length,
      }));
    } catch (error) {
      console.error("Lỗi lấy dữ liệu dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(price)
      .replace("₫", "đ");
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "delivered":
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#e6fff0] text-[#26b262] border border-[#c8f0d8]">
            Đã giao hàng
          </span>
        );
      case "processing":
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#fff8e6] text-[#b28b26] border border-[#f0e6c8]">
            Đang chuẩn bị hàng
          </span>
        );
      case "shipped":
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#e6f0ff] text-[#2662b2] border border-[#c8dbf0]">
            Giao hàng thành công
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 uppercase">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
        <ProfileSidebar />

        <div className="flex-1 space-y-10">
          {/* Welcome Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Chào mừng quay trở lại, {user?.full_name?.split(" ")[0]}!
            </h1>
            <p className="text-slate-500 font-medium text-lg">
              Theo dõi trạng thái đơn hàng và quản lý thông tin tài khoản của
              bạn tại đây.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-md transition-all">
              <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#2b4c4f] group-hover:text-white transition-all">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
                  Đơn hàng đang giao
                </p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">
                  {recentOrders
                    .filter(
                      (o) =>
                        o.status !== "delivered" && o.status !== "cancelled",
                    )
                    .length.toString()
                    .padStart(2, "0")}
                </p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-md transition-all">
              <div className="w-16 h-16 rounded-[1.5rem] bg-[#fff8e6] flex items-center justify-center text-[#b28b26] transition-all">
                <Star className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
                  Điểm tích lũy
                </p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">
                  {stats.points.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-md transition-all">
              <div className="w-16 h-16 rounded-[1.5rem] bg-[#fdf2f4] flex items-center justify-center text-[#d23f57] transition-all">
                <Heart className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
                  Sản phẩm yêu thích
                </p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">
                  {stats.wishlistCount}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-slate-900">
                Đơn hàng gần đây
              </h2>
              <Link
                to="/profile/orders"
                className="text-sm font-bold text-[#2b4c4f] hover:underline">
                Xem tất cả
              </Link>
            </div>

            {loading ? (
              <div className="py-10 text-center text-slate-400">
                Đang tải...
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                Chưa có đơn hàng nào
              </div>
            ) : (
              <div className="overflow-x-auto text-sm">
                <table className="w-full">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-50">
                      <th className="text-left py-4 pb-6">Mã đơn hàng</th>
                      <th className="text-left py-4 pb-6">Ngày đặt</th>
                      <th className="text-left py-4 pb-6">Trạng thái</th>
                      <th className="text-right py-4 pb-6">Tổng tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="group transition-all">
                        <td className="py-5 font-bold text-slate-900 font-mono">
                          #{String(order.id).split("-")[0].toUpperCase()}
                        </td>
                        <td className="py-5 font-medium text-slate-500">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="py-5 font-bold">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="py-5 text-right font-black text-slate-900">
                          {formatPrice(order.total_price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
