import React, { useState, useEffect } from "react";
import { supabase } from "../../config/supabase";
import {
  Search,
  Filter,
  Eye,
  Calendar,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpDown,
  User,
  MapPin,
  Phone,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  X,
  ShoppingCart,
  ShoppingBag,
} from "lucide-react";
import { toast } from "react-toastify";

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const today = new Date();
  const [filters, setFilters] = useState({
    day: "",
    month: today.getMonth() + 1,
    year: today.getFullYear(),
    status: "",
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);

      let query = supabase.from("orders").select(`
        *,
        users ( full_name, email, phone ),
        user_addresses ( * ),
        order_items ( *, products ( title, thumbnail ) )
      `);

      if (filters.year) {
        const start = new Date(
          filters.year,
          (filters.month || 1) - 1,
          filters.day || 1,
        ).toISOString();

        let end;
        if (filters.day) {
          end = new Date(
            filters.year,
            filters.month - 1,
            filters.day,
            23,
            59,
            59,
          ).toISOString();
        } else if (filters.month) {
          end = new Date(
            filters.year,
            filters.month,
            0,
            23,
            59,
            59,
          ).toISOString();
        } else {
          end = new Date(filters.year, 12, 0, 23, 59, 59).toISOString();
        }

        query = query.gte("created_at", start).lte("created_at", end);
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Lỗi lấy danh sách đơn hàng:", error);
      toast.error("Không thể tải danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const updateData = { status: newStatus };

      const currentOrder = orders.find((o) => o.id === orderId);
      if (
        (newStatus === "delivered" || newStatus === "completed") &&
        currentOrder?.payment_method === "cod"
      ) {
        updateData.payment_status = "paid";
        toast.info("Đã tự động cập nhật trạng thái: Đã thanh toán (COD)");
      }

      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", orderId);

      if (error) throw error;

      toast.success("Cập nhật trạng thái thành công!");
      fetchOrders();
      if (selectedOrder) {
        setSelectedOrder((prev) => ({ ...prev, ...updateData }));
      }
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      toast.error("Không thể cập nhật trạng thái.");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-50 text-yellow-700 border-yellow-100",
      processing: "bg-blue-50 text-blue-700 border-blue-100",
      shipped: "bg-indigo-50 text-indigo-700 border-indigo-100",
      delivered: "bg-green-50 text-green-700 border-green-100",
      completed: "bg-emerald-50 text-emerald-700 border-emerald-100",
      cancelled: "bg-red-50 text-red-700 border-red-100",
    };

    const labels = {
      pending: "Chờ xác nhận",
      processing: "Đang xử lý",
      shipped: "Đang giao hàng",
      delivered: "Đã giao hàng",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };

    return (
      <span
        className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase border ${styles[status] || "bg-gray-50 text-gray-600 border-gray-100"}`}>
        {labels[status] || status}
      </span>
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const filteredOrders = orders.filter(
    (o) =>
      String(o.id)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.user_addresses?.receiver_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20">
      {/* HEADER & FILTERS */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Package className="text-[#2b4c4f]" /> Quản lý Đơn hàng
            </h1>
            <p className="text-sm text-gray-500">
              Theo dõi và cập nhật trạng thái mọi đơn hàng từ khách hàng
            </p>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 p-1 rounded-xl border border-gray-200">
            <button
              onClick={() => fetchOrders()}
              className="p-2 hover:bg-white rounded-lg transition-colors text-gray-500 hover:text-[#2b4c4f]"
              title="Làm mới">
              <ArrowUpDown size={18} />
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm mã đơn, tên khách..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#2b4c4f] w-full md:w-64"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-50">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gray-400" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Bộ lọc:
            </span>
          </div>

          <select
            value={filters.day}
            onChange={(e) => setFilters((f) => ({ ...f, day: e.target.value }))}
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium outline-none">
            <option value="">Tất cả ngày</option>
            {[...Array(31)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                Ngày {i + 1}
              </option>
            ))}
          </select>

          <select
            value={filters.month}
            onChange={(e) =>
              setFilters((f) => ({ ...f, month: e.target.value }))
            }
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium outline-none">
            <option value="">Tất cả tháng</option>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                Tháng {i + 1}
              </option>
            ))}
          </select>

          <select
            value={filters.year}
            onChange={(e) =>
              setFilters((f) => ({ ...f, year: e.target.value }))
            }
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium outline-none">
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                Năm {y}
              </option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((f) => ({ ...f, status: e.target.value }))
            }
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium outline-none">
            <option value="">Mọi trạng thái</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="processing">Đang xử lý</option>
            <option value="shipped">Đang giao hàng</option>
            <option value="delivered">Đã giao hàng</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-gray-100 border-t-[#2b4c4f] rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Đang tải đơn hàng...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <ShoppingCart size={32} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">
              Không tìm thấy đơn hàng nào phù hợp!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Đơn hàng</th>
                  <th className="px-6 py-4">Khách hàng</th>
                  <th className="px-6 py-4">Tổng cộng</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4">Thanh toán</th>
                  <th className="px-6 py-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 font-mono text-sm leading-none mb-1">
                          #{String(order.id)?.slice(0, 8).toUpperCase()}
                        </span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Clock size={10} />{" "}
                          {new Date(order.created_at).toLocaleDateString(
                            "vi-VN",
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-sm">
                          {order.users?.full_name ||
                            order.user_addresses?.receiver_name ||
                            "N/A"}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {order.user_addresses?.phone_number ||
                            order.users?.phone ||
                            "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 text-sm">
                      {formatPrice(order.total_price)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">
                          {order.payment_method?.toUpperCase()}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${order.payment_status === "paid" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"}`}>
                          {order.payment_status === "paid"
                            ? "Đã thu tiền"
                            : "Chờ thu"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowModal(true);
                        }}
                        className="p-2 hover:bg-[#2b4c4f] hover:text-white text-gray-400 rounded-lg transition-all shadow-sm active:scale-95">
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ORDER DETAIL MODAL */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-10">
              <X size={20} className="text-gray-400" />
            </button>

            <div className="p-8 border-b border-gray-50">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-[#f4ebd0] rounded-2xl flex items-center justify-center text-[#2b4c4f]">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Chi tiết đơn hàng #
                    {String(selectedOrder.id)?.slice(0, 8).toUpperCase()}
                  </h2>
                  <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />{" "}
                      {new Date(selectedOrder.created_at).toLocaleString(
                        "vi-VN",
                      )}
                    </span>
                    <span className="flex items-center gap-1 uppercase tracking-wider">
                      <CreditCard size={14} /> {selectedOrder.payment_method}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* CUSTOMER INFO */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <User size={14} /> Thông tin nhận hàng
                  </h3>
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-sm">Họ và tên:</span>
                      <span className="font-bold text-gray-900 text-sm">
                        {selectedOrder.user_addresses?.receiver_name ||
                          selectedOrder.users?.full_name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-sm">
                        Số điện thoại:
                      </span>
                      <span className="font-bold text-gray-900 text-sm">
                        {selectedOrder.user_addresses?.phone_number ||
                          selectedOrder.users?.phone}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <span className="text-gray-500 text-[11px] font-bold uppercase tracking-wider block mb-1">
                        Địa chỉ giao hàng:
                      </span>
                      <p className="text-sm font-medium text-gray-700 leading-relaxed">
                        {selectedOrder.user_addresses?.street_address},{" "}
                        {selectedOrder.user_addresses?.ward},{" "}
                        {selectedOrder.user_addresses?.city}
                      </p>
                    </div>
                  </div>
                </div>

                {/* STATUS MANAGEMENT */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Truck size={14} /> Trạng thái vận hành
                  </h3>
                  <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-gray-200 space-y-6">
                    <div>
                      <span className="text-gray-500 text-[11px] font-bold uppercase tracking-wider block mb-3">
                        Thay đổi trạng thái đơn:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "pending",
                          "processing",
                          "shipped",
                          "delivered",
                          "cancelled",
                        ].map((status) => (
                          <button
                            key={status}
                            onClick={() =>
                              handleUpdateStatus(selectedOrder.id, status)
                            }
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border ${
                              selectedOrder.status === status
                                ? "bg-[#2b4c4f] text-white border-[#2b4c4f]"
                                : "bg-white text-gray-500 border-gray-200 hover:border-[#2b4c4f] hover:text-[#2b4c4f]"
                            }`}>
                            {status === "pending"
                              ? "Xác nhận"
                              : status === "processing"
                                ? "Xử lý"
                                : status === "shipped"
                                  ? "Giao hàng"
                                  : status === "delivered"
                                    ? "Đã giao"
                                    : "Hủy đơn"}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-dotted border-gray-200">
                      <span className="text-gray-500 text-sm">
                        Trạng thái thanh toán:
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${selectedOrder.payment_status === "paid" ? "bg-green-50 text-green-700 border-green-100" : "bg-orange-50 text-orange-700 border-orange-100"}`}>
                        {selectedOrder.payment_status === "paid"
                          ? "Đã thanh toán"
                          : "Đang chờ"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PRODUCTS LIST */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Package size={14} /> Danh sách sản phẩm (
                  {selectedOrder.order_items?.length})
                </h3>
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        <th className="px-6 py-3">Sản phẩm</th>
                        <th className="px-6 py-3 text-center">Số lượng</th>
                        <th className="px-6 py-3 text-right">Đơn giá</th>
                        <th className="px-6 py-3 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {selectedOrder.order_items?.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gray-50 rounded-lg p-1 border border-gray-100 flex-shrink-0">
                                <img
                                  src={item.products?.thumbnail}
                                  className="w-full h-full object-contain mix-blend-multiply"
                                  alt=""
                                />
                              </div>
                              <span className="text-sm font-bold text-gray-900 line-clamp-1">
                                {item.products?.title}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center font-bold text-gray-700 text-sm">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-gray-500 text-sm">
                            {formatPrice(item.price)}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-[#2b4c4f] text-sm">
                            {formatPrice(item.price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50/50">
                        <td colSpan="3" className="px-6 py-4 text-right">
                          <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">
                            Tổng cộng thanh toán:
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-lg font-black text-[#2b4c4f] tracking-tighter">
                            {formatPrice(selectedOrder.total_price)}
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="bg-[#2b4c4f] text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-[#2b4c4f]/10 hover:bg-[#1a3335] transition-all">
                Đóng chi tiết
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
