import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  ChevronRight,
  Home,
  Package,
  User,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Calendar,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { axiosClient } from "../../utils/axiosClient";

const VNPayReturn = () => {
  const location = useLocation();
  const [status, setStatus] = useState("loading");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const responseCode = queryParams.get("vnp_ResponseCode");
    const txnRef = queryParams.get("vnp_TxnRef");

    if (responseCode === "00") {
      setStatus("success");
    } else {
      setStatus("failed");
    }

    if (txnRef) {
      fetchOrderDetails(txnRef);
    }
  }, [location]);

  const fetchOrderDetails = async (orderId) => {
    try {
      const res = await axiosClient.get(`/orders/${orderId}`);
      setOrder(res.data);
    } catch (error) {
      console.error("Không thể lấy thông tin đơn hàng:", error);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfcfc] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 border-4 border-slate-100 border-t-[#2b4c4f] rounded-full animate-spin mb-6"></div>
        <p className="text-slate-500 font-medium animate-pulse">
          Đang xác thực giao dịch...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Status Hero Card */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10 text-center mb-10 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-[#2b4c4f] to-transparent opacity-20"></div>

          <div className="flex justify-center mb-6">
            {status === "success" ? (
              <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle className="w-12 h-12 text-emerald-500" />
              </div>
            ) : (
              <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center animate-shake">
                <XCircle className="w-12 h-12 text-rose-500" />
              </div>
            )}
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-3">
            {status === "success"
              ? "Thanh toán thành công!"
              : "Thanh toán thất bại"}
          </h1>
          <p className="text-slate-500 max-w-sm mx-auto mb-8 text-sm leading-relaxed">
            {status === "success"
              ? "Cảm ơn bạn đã tin tưởng dịch vụ của Luxe Interiors. Đơn hàng của bạn đã được tiếp nhận và đang chờ xử lý."
              : "Rất tiếc, đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng kiểm tra lại tài khoản hoặc phương thức thanh toán."}
          </p>

          <div className="flex items-center justify-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Mã giao dịch:
            </span>
            <span className="text-sm font-mono font-bold text-[#2b4c4f] bg-[#f8fcfb] px-3 py-1 rounded-full border border-[#e2f0ee]">
              #{order?.id}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Order Content */}
          <div className="lg:col-span-7 space-y-10">
            {/* Customer & Shipping */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                Thông tin nhận hàng
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <User className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
                        Người nhận
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        {order?.user_addresses?.receiver_name}
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
                        {order?.user_addresses?.phone_number}
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
                      <p className="text-sm font-semibold text-slate-600 leading-relaxed">
                        {order?.user_addresses?.street_address},{" "}
                        {order?.user_addresses?.ward},{" "}
                        {order?.user_addresses?.city}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products List */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                  <Package className="w-4 h-4 text-slate-400" />
                </div>
                Sản phẩm đã đặt
              </h2>

              <div className="space-y-6">
                {order?.order_items?.map((item) => (
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
                      <h3 className="text-sm font-bold text-slate-900 mb-2 line-clamp-2 leading-snug">
                        {item.products?.title}
                      </h3>
                      <div className="flex flex-wrap gap-3 mb-3">
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded uppercase tracking-wider">
                          Số lượng: {item.quantity}
                        </span>
                        {item.product_variants?.color_name && (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded uppercase tracking-wider">
                            Màu: {item.product_variants.color_name}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-base font-bold text-slate-900">
                          {formatPrice(item.price)}
                        </span>
                        <span className="text-[10px] font-bold text-slate-300 italic">
                          Thành tiền: {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Actions */}
          <div className="lg:col-span-5 space-y-10">
            {/* Payment Summary */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 sticky top-10">
              <h2 className="text-lg font-bold text-slate-900 mb-6">
                Chi tiết đơn hàng
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4">
                  <Calendar className="w-5 h-5 text-slate-300 mt-0.5" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
                      Ngày đặt hàng
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {formatDate(order?.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CreditCard className="w-5 h-5 text-slate-300 mt-0.5" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
                      Phương thức
                    </p>
                    <p className="text-sm font-bold text-slate-900 uppercase">
                      {order?.payment_method === "vnpay"
                        ? "Ví điện tử VNPay"
                        : order?.payment_method}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-50 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Tạm tính</span>
                  <span className="font-bold text-slate-900">
                    {formatPrice(order?.total_price / 1.08)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Vận chuyển</span>
                  <span className="font-bold text-emerald-500">MIỄN PHÍ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">
                    Thuế (8% VAT)
                  </span>
                  <span className="font-bold text-slate-900">
                    {formatPrice(
                      order?.total_price - order?.total_price / 1.08,
                    )}
                  </span>
                </div>
                <div className="pt-4 border-t border-slate-50 flex justify-between items-end">
                  <span className="text-base font-bold text-slate-900 uppercase tracking-tighter">
                    Tổng cộng
                  </span>
                  <span className="text-2xl font-bold text-[#2b4c4f] tracking-tighter">
                    {formatPrice(order?.total_price)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {status === "failed" && (
                  <Link
                    to="/checkout"
                    className="w-full flex items-center justify-center gap-3 bg-[#e2f0ee] text-[#2b4c4f] py-4 rounded-2xl font-bold hover:bg-[#d6e8e5] transition-all group">
                    Tiếp tục thanh toán khác
                  </Link>
                )}
                <Link
                  to="/"
                  className="w-full flex items-center justify-center gap-3 bg-[#2b4c4f] text-white py-4 rounded-2xl font-bold hover:bg-[#1f383a] transition-all shadow-lg shadow-[#2b4c4f]/10 group">
                  <Home className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />{" "}
                  Tiếp tục mua sắm
                </Link>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-50 flex gap-4">
                <ShieldCheck className="w-6 h-6 text-[#2b4c4f] shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest leading-none mb-1">
                    Bảo đảm bởi Luxe
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Đơn hàng của bạn được bảo mật và hỗ trợ kỹ thuật 24/7.
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

export default VNPayReturn;
