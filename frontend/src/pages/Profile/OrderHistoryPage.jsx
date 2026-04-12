import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { axiosClient } from "../../utils/axiosClient";
import { ProfileSidebar } from "../../components/profile/ProfileSidebar";
import {
  Package,
  Calendar,
  ChevronRight,
  Search,
  CheckCircle,
  Clock,
  MapPin,
} from "lucide-react";

export const OrderHistoryPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user?.id) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/orders/user/${user.id}`);
      setOrders(res.data);
    } catch (error) {
      console.error("Lỗi lấy lịch sử đơn hàng:", error);
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
    return new Date(date).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#fff8e6] text-[#b28b26] border border-[#f0e6c8]">
            <Clock className="w-3.5 h-3.5" /> Chờ xác nhận
          </span>
        );
      case "processing":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#e6f0ff] text-[#2662b2] border border-[#c8dbf0]">
            <Package className="w-3.5 h-3.5" /> Đang xử lý
          </span>
        );
      case "shipped":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#e6fff0] text-[#26b262] border border-[#c8f0d8]">
            <MapPin className="w-3.5 h-3.5" /> Đang giao
          </span>
        );
      case "delivered":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle className="w-3.5 h-3.5" /> Đã giao
          </span>
        );
      case "cancelled":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100">
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
            {status}
          </span>
        );
    }
  };

  const getPaymentStatusBadge = (status, method) => {
    if (status === "paid") {
      return (
        <span className="px-2.5 py-1 rounded uppercase tracking-widest text-[9px] font-bold bg-emerald-50 text-emerald-600">
          Đã thanh toán
        </span>
      );
    }
    if (method === "cod") {
      return (
        <span className="px-2.5 py-1 rounded uppercase tracking-widest text-[9px] font-bold bg-slate-100 text-slate-500">
          Chưa thanh toán
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded uppercase tracking-widest text-[9px] font-bold bg-orange-50 text-orange-600">
        Chờ thanh toán
      </span>
    );
  };

  const filteredOrders = orders.filter((order) =>
    String(order.id).toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
        <ProfileSidebar />

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">
                Lịch sử đơn hàng
              </h1>
              <p className="text-sm text-slate-500">
                Theo dõi và quản lý các đơn hàng bạn đã đặt
              </p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm mã đơn hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2b4c4f] focus:ring-1 focus:ring-[#2b4c4f] transition-all w-full sm:w-64"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="w-10 h-10 border-4 border-slate-100 border-t-[#2b4c4f] rounded-full animate-spin mb-4"></div>
              <p className="text-sm font-medium text-slate-500">
                Đang tải danh sách...
              </p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Package className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Chưa có đơn hàng nào
              </h3>
              <p className="text-slate-500 max-w-sm mb-8 text-sm">
                Bạn chưa có đơn hàng nào trong lịch sử. Hãy khám phá ngay những sản phẩm nổi bật của chúng tôi!
              </p>
              <Link
                to="/products"
                className="bg-[#2b4c4f] text-white px-8 py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-[#2b4c4f]/20 hover:bg-[#1f383a] transition-all">
                Tiếp tục mua sắm
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold tracking-widest text-slate-400">
                      <th className="px-6 py-5 whitespace-nowrap">Mã đơn hàng</th>
                      <th className="px-6 py-5 whitespace-nowrap">Ngày đặt</th>
                      <th className="px-6 py-5 whitespace-nowrap">Trạng thái</th>
                      <th className="px-6 py-5 whitespace-nowrap">Thanh toán</th>
                      <th className="px-6 py-5 text-right whitespace-nowrap">
                        Tổng tiền
                      </th>
                      <th className="px-6 py-5 text-center whitespace-nowrap">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-[#f8fcfb] transition-colors group">
                        <td className="px-6 py-5">
                          <Link
                            to={`/profile/orders/${order.id}`}
                            className="font-mono text-sm font-bold text-[#2b4c4f] hover:underline">
                            #{String(order.id).split("-")[0].toUpperCase()}
                          </Link>
                          <div className="text-xs text-slate-400 mt-1 truncate max-w-[150px]">
                            {order.order_items?.length} sản phẩm
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            {formatDate(order.created_at).split(" ")[1]}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            {formatDate(order.created_at).split(" ")[0]}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-2 items-start">
                            <span className="text-xs font-bold text-slate-700 uppercase">
                              {order.payment_method === "vnpay"
                                ? "VNPay"
                                : order.payment_method}
                            </span>
                            {getPaymentStatusBadge(order.payment_status, order.payment_method)}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right font-bold text-slate-900">
                          {formatPrice(order.total_price)}
                        </td>
                        <td className="px-6 py-5 text-center">
                          <Link
                            to={`/profile/orders/${order.id}`}
                            className="inline-flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-[#2b4c4f] hover:bg-white border border-transparent hover:border-[#e2f0ee] hover:shadow-sm transition-all">
                            <ChevronRight className="w-5 h-5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
