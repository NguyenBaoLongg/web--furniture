import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Package,
  User,
  MapPin,
  Phone,
  CreditCard,
  Calendar,
  ShieldCheck,
  ArrowLeft,
  Clock,
  CheckCircle,
} from "lucide-react";
import { axiosClient } from "../../utils/axiosClient";

export const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchOrderDetails(id);
    }
  }, [id]);

  const fetchOrderDetails = async (orderId) => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/orders/${orderId}`);
      setOrder(res.data);
    } catch (error) {
      console.error("Không thể lấy thông tin chi tiết đơn hàng:", error);
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
          <span className="flex w-fit items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#fff8e6] text-[#b28b26] border border-[#f0e6c8]">
            <Clock className="w-4 h-4" /> Chờ xác nhận
          </span>
        );
      case "processing":
        return (
          <span className="flex w-fit items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#e6f0ff] text-[#2662b2] border border-[#c8dbf0]">
            <Package className="w-4 h-4" /> Đang xử lý
          </span>
        );
      case "shipped":
        return (
          <span className="flex w-fit items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#e6fff0] text-[#26b262] border border-[#c8f0d8]">
            <MapPin className="w-4 h-4" /> Đang giao
          </span>
        );
      case "delivered":
        return (
          <span className="flex w-fit items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle className="w-4 h-4" /> Đã giao hàng
          </span>
        );
      case "cancelled":
        return (
          <span className="flex w-fit items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100">
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="flex w-fit items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
            {status}
          </span>
        );
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending": return "Chờ xác nhận";
      case "processing": return "Đang xử lý";
      case "shipped": return "Đang giao hàng";
      case "delivered": return "Giao hàng thành công";
      case "failed": return "Bị hủy / Lỗi";
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfcfc] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-slate-100 border-t-[#2b4c4f] rounded-full animate-spin mb-6"></div>
        <p className="text-slate-500 font-medium animate-pulse">
          Đang tải chi tiết đơn hàng...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#fcfcfc] flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Không tìm thấy đơn hàng
        </h2>
        <Link
          to="/profile/orders"
          className="text-[#2b4c4f] font-bold hover:underline flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" /> Quay lại lịch sử
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link
            to="/profile/orders"
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-5 h-5" /> Quay lại lịch sử đơn hàng
          </Link>
          <div className="text-sm font-mono font-bold text-[#2b4c4f] bg-[#f8fcfb] px-4 py-2 rounded-xl border border-[#e2f0ee] shadow-sm">
            Mã đơn: #{order.id}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            {/* Timeline Tiến trình đơn hàng */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-8 flex items-center justify-between">
                <span className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-slate-400" />
                  </div>
                  Tiến trình đơn hàng
                </span>
                {getStatusBadge(order.status)}
              </h2>
              
              <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 pb-2">
                {(order.order_status_history?.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) || []).map((event, index, arr) => (
                  <div key={event.id} className="relative pl-8">
                    <div className={`absolute w-5 h-5 rounded-full border-4 border-white top-0.5 -left-[11px] ${index === arr.length - 1 ? 'bg-[#2b4c4f] shadow-[0_0_0_2px_#2b4c4f]' : 'bg-slate-300'}`}></div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <p className={`text-sm font-bold ${index === arr.length - 1 ? 'text-[#2b4c4f]' : 'text-slate-900'}`}>
                        {getStatusText(event.new_status)}
                      </p>
                      <p className="text-xs font-medium text-slate-400 font-mono bg-slate-50 px-2 py-0.5 rounded">
                        {formatDate(event.created_at)}
                      </p>
                    </div>
                    {event.note && (
                      <p className="text-sm text-slate-600 mt-2 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 inline-block">
                        {event.note}
                      </p>
                    )}
                  </div>
                ))}
                
                {(!order.order_status_history || order.order_status_history.length === 0) && (
                  <div className="text-sm text-slate-500 pl-8 italic">Đang cập nhật trạng thái...</div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-[#2b4c4f] to-transparent opacity-10"></div>
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center justify-between">
                <span className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  Thông tin khách hàng
                </span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50/50 p-6 rounded-2xl border border-slate-50">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <User className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
                        Người nhận
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {order.user_addresses?.receiver_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Phone className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
                        Điện thoại
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {order.user_addresses?.phone_number}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-4">
                    <MapPin className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
                        Địa chỉ giao hàng
                      </p>
                      <p className="text-sm font-medium text-slate-600 leading-relaxed">
                        {order.user_addresses?.street_address},{" "}
                        {order.user_addresses?.ward},{" "}
                        {order.user_addresses?.city}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                  <Package className="w-5 h-5 text-slate-400" />
                </div>
                Chi tiết sản phẩm ({order.order_items?.length})
              </h2>

              <div className="space-y-6">
                {order.order_items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-5 pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                    <div className="w-24 h-28 rounded-2xl bg-[#f8f9fa] p-2 border border-slate-50 shrink-0 overflow-hidden">
                      <img
                        src={
                          item.product_variants?.image_url ||
                          item.products?.thumbnail
                        }
                        className="w-full h-full object-contain mix-blend-multiply transition-transform hover:scale-110 duration-500"
                        alt={item.products?.title}
                      />
                    </div>
                    <div className="flex-1 py-1">
                      <Link
                        to={`/product/${item.products?.id}`}
                        className="text-sm font-bold text-slate-900 mb-2 line-clamp-2 leading-snug hover:text-[#2b4c4f] hover:underline transition-colors">
                        {item.products?.title}
                      </Link>
                      <div className="flex flex-wrap gap-3 mb-3">
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">
                          Số lượng: {item.quantity}
                        </span>
                        {item.product_variants?.color_name && (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">
                            Màu: {item.product_variants.color_name}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-sm font-bold text-slate-900">
                          {formatPrice(item.price)}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          Thành tiền:{" "}
                          <span className="text-slate-900">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 sticky top-10">
              <h2 className="text-lg font-bold text-slate-900 mb-6">
                Tóm tắt thanh toán
              </h2>

              <div className="space-y-5 mb-8">
                <div className="flex items-start gap-4">
                  <Calendar className="w-5 h-5 text-slate-300 mt-0.5" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
                      Ngày đặt hàng
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CreditCard className="w-5 h-5 text-slate-300 mt-0.5" />
                  <div className="w-full">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
                      Phương thức
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-900 uppercase">
                        {order.payment_method === "vnpay"
                          ? "Ví điện tử VNPay"
                          : order.payment_method === "bank_transfer"
                          ? "Chuyển khoản Ngân hàng"
                          : "Thanh toán khi nhận hàng (COD)"}
                      </p>
                      <span
                        className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded tracking-widest ${
                          order.payment_status === "paid"
                            ? "bg-emerald-50 text-emerald-600"
                            : order.payment_method === "cod"
                            ? "bg-slate-100 text-slate-500"
                            : "bg-orange-50 text-orange-600"
                        }`}>
                        {order.payment_status === "paid"
                          ? "Đã thanh toán"
                          : order.payment_method === "cod"
                          ? "Chưa thanh toán"
                          : "Chờ thanh toán"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-50 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Tạm tính</span>
                  <span className="font-bold text-slate-900">
                    {formatPrice(order.total_price / 1.08)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Vận chuyển</span>
                  <span className="font-bold text-emerald-500">MIỄN PHÍ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Thuế (8%)</span>
                  <span className="font-bold text-slate-900">
                    {formatPrice(order.total_price - order.total_price / 1.08)}
                  </span>
                </div>
                <div className="pt-4 flex justify-between items-end border-t border-slate-50">
                  <span className="text-base font-bold text-slate-900 uppercase tracking-tighter">
                    Tổng cộng
                  </span>
                  <span className="text-2xl font-bold text-[#2b4c4f] tracking-tighter">
                    {formatPrice(order.total_price)}
                  </span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex gap-4 bg-[#f8fcfb] p-5 rounded-2xl border-2 border-[#e2f0ee] shadow-sm">
                <ShieldCheck className="w-6 h-6 text-[#2b4c4f] shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest leading-none mb-1">
                    Bảo đảm bởi Luxe
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Hỗ trợ kỹ thuật và giải đáp thắc mắc đơn hàng 24/7 qua
                    Hotline.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
