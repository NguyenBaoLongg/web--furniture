import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ChevronRight,
  MapPin,
  Truck,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  ShieldCheck,
  Package,
  Plus,
  Minus,
  Trash2,
  User,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { axiosClient } from "../../utils/axiosClient";
import { toast } from "react-toastify";
import { QRCodeCanvas } from "qrcode.react";
import { X } from "lucide-react";

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, loading: cartLoading, fetchCart } = useCart();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [hasAddress, setHasAddress] = useState(false);
  const [formData, setFormData] = useState({
    shipping: {
      receiver_name: user?.full_name || "",
      email: user?.email || "",
      phone_number: "",
      street_address: "",
      ward: "",
    },
    method: "standard",
    payment: {
      method: "cod",
      cardNumber: "",
      expiry: "",
      cvv: "",
    },
    note: "",
  });

  const [qrModal, setQrModal] = useState({
    isOpen: false,
    url: "",
    orderId: "",
  });
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Trạng thái cho luồng VNPay mới
  const [vnpayOrderId, setVnpayOrderId] = useState(null);
  const [isVnpayPaid, setIsVnpayPaid] = useState(false);
  const [isVnpayLoading, setIsVnpayLoading] = useState(false);
  const [isNextLoading, setIsNextLoading] = useState(false);
  const [vnpayOrderDetails, setVnpayOrderDetails] = useState(null);

  // Logics hiển thị tổng quát (Sidebar & Review)
  const displayItems =
    isVnpayPaid && vnpayOrderDetails?.order_items
      ? vnpayOrderDetails.order_items
      : cartItems;

  const subTotal =
    isVnpayPaid && vnpayOrderDetails
      ? vnpayOrderDetails.total_price / 1.08
      : cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const total =
    isVnpayPaid && vnpayOrderDetails ? vnpayOrderDetails.total_price : subTotal;

  React.useEffect(() => {
    if (user?.id) {
      axiosClient
        .get(`/auth/address/${user.id}`)
        .then((res) => {
          if (res.data) {
            setHasAddress(true);
            setFormData((prev) => ({
              ...prev,
              shipping: {
                ...prev.shipping,
                receiver_name:
                  res.data.receiver_name || prev.shipping.receiver_name,
                phone_number: res.data.phone_number || "",
                street_address: res.data.street_address || "",
                ward: res.data.ward || "",
              },
            }));
          }
        })
        .catch((err) => console.error("Lỗi lấy địa chỉ", err));
    }
  }, [user]);

  // Polling để kiểm tra trạng thái thanh toán VNPay
  React.useEffect(() => {
    let interval;
    if (vnpayOrderId && !isVnpayPaid) {
      interval = setInterval(async () => {
        try {
          const res = await axiosClient.get(`/orders/${vnpayOrderId}`);
          if (res.data.payment_status === "paid") {
            setVnpayOrderDetails(res.data);
            setIsVnpayPaid(true);
            toast.success("Thanh toán VNPay thành công!");
            fetchCart(); // Xóa icon giỏ hàng trên header
            clearInterval(interval);
          }
        } catch (error) {
          console.error("Lỗi polling VNPay:", error);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [vnpayOrderId, isVnpayPaid]);

  const handleVnpaySelection = async () => {
    if (isVnpayPaid) return;

    if (!formData.shipping.phone_number || !formData.shipping.street_address) {
      toast.warning(
        "Vui lòng nhập số điện thoại và địa chỉ giao hàng trước khi chọn VNPay.",
      );
      return;
    }

    try {
      setIsVnpayLoading(true);
      setFormData({
        ...formData,
        payment: { ...formData.payment, method: "vnpay" },
      });

      // 1. Tạo đơn hàng chờ (Pending)
      const orderData = {
        user_id: user.id,
        address: formData.shipping,
        items: cartItems.map((item) => ({
          product_id: item.productId,
          variant_id: item.variantId,
          quantity: item.quantity,
          price: item.price,
        })),
        total_price: Math.round(total + subTotal * 0.08),
        payment_method: "vnpay",
        note: formData.note,
      };

      const res = await axiosClient.post("/orders", orderData);
      const orderId = res.data.orderId;
      setVnpayOrderId(orderId);

      const vnpayRes = await axiosClient.post("/orders/create-vnpay-url", {
        orderId,
      });

      if (vnpayRes.data.metadata) {
        window.open(vnpayRes.data.metadata, "_blank");
      }
    } catch (error) {
      console.error("Lỗi khởi tạo VNPay:", error);
      toast.error("Không thể khởi tạo thanh toán VNPay.");
    } finally {
      setIsVnpayLoading(false);
    }
  };
  const shippingFee = 0;

  const steps = [
    { id: 1, title: "Giao hàng", icon: MapPin },
    { id: 2, title: "Thanh toán", icon: CreditCard },
    { id: 3, title: "Xem lại", icon: CheckCircle },
  ];

  const handleNext = async () => {
    // Nếu ở bước Giao hàng, thực hiện validate và đồng bộ dữ liệu vào hồ sơ ngay lập tức
    if (currentStep === 1) {
      const { receiver_name, phone_number, street_address } = formData.shipping;

      if (!receiver_name || !phone_number || !street_address) {
        toast.warning("Vui lòng điền đầy đủ Tên, SĐT và Địa chỉ để tiếp tục");
        return;
      }

      try {
        setIsNextLoading(true);
        // Lưu thông tin địa chỉ và SĐT vào profile ngay khi nhấn Tiếp tục
        await axiosClient.post("/auth/address", {
          user_id: user.id,
          receiver_name,
          phone_number,
          street_address,
          city: "HNoi", // Mặc định như logic backend bạn yêu cầu
        });
        setCurrentStep(currentStep + 1);
      } catch (error) {
        console.error("Lỗi cập nhật địa chỉ sớm:", error);
        toast.error("Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.");
      } finally {
        setIsNextLoading(false);
      }
    } else if (currentStep === 2) {
      if (formData.payment.method === "vnpay" && !isVnpayPaid) {
        toast.warning("Vui lòng hoàn tất thanh toán VNPay trước khi xác nhận");
        return;
      }
      setCurrentStep(currentStep + 1);
    } else {
      if (currentStep < 3) setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
    else navigate("/cart");
  };

  const handlePlaceOrder = async () => {
    if (isPlacingOrder) return;

    // Nếu chọn VNPay nhưng chưa thanh toán thành công
    if (formData.payment.method === "vnpay" && !isVnpayPaid) {
      toast.error("Vui lòng hoàn tất thanh toán VNPay trước.");
      return;
    }

    try {
      setIsPlacingOrder(true);

      // Nếu là VNPay và đã trả tiền, chúng ta chỉ cần thông báo thành công và chuyển trang
      // vì đơn hàng đã được tạo từ lúc chọn phương thức.
      if (formData.payment.method === "vnpay" && isVnpayPaid) {
        toast.success("Đặt hàng hoàn tất!");
        await fetchCart(); // Refresh giỏ hàng ngay lập tức
        navigate(`/profile/orders/${vnpayOrderId}`);
        return;
      }

      // Luồng cho các phương thức khác (COD, Bank Transfer)
      const orderData = {
        user_id: user.id,
        address: formData.shipping,
        items: cartItems.map((item) => ({
          product_id: item.productId,
          variant_id: item.variantId,
          quantity: item.quantity,
          price: item.price,
        })),
        total_price: total + subTotal * 0.08,
        payment_method: formData.payment.method,
        note: formData.note,
      };

      const res = await axiosClient.post("/orders", orderData);
      await fetchCart(); // Refresh giỏ hàng ngay lập tức
      toast.success("Đặt hàng hoàn tất!");
      navigate(`/profile/orders/${res.data.orderId}`);
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi đặt hàng.");
    } finally {
      setIsPlacingOrder(false);
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

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="bg-[#fcfcfc] min-h-screen">
      {/* Header Profile Style */}
      <div className="bg-white border-b border-slate-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link
            to="/"
            className="text-xl font-bold tracking-tight text-[#2b4c4f]">
            LUXE INTERIORS
          </Link>
          <div className="flex items-center gap-4 text-slate-400">
            <Package className="w-5 h-5" />
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
              <span className="text-xs font-bold text-slate-600 font-serif">
                {user.full_name?.charAt(0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Step Indicator */}
        <div className="mb-12">
          <div className="relative flex justify-between max-w-2xl mx-auto">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 -z-10"></div>
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-[#2b4c4f] -translate-y-1/2 -z-10 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / 2) * 100}%` }}></div>

            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    currentStep >= step.id
                      ? "bg-[#2b4c4f] text-white"
                      : "bg-white text-slate-400 border-2 border-slate-100"
                  }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <span
                  className={`mt-2 text-[10px] uppercase font-bold tracking-widest ${
                    currentStep >= step.id ? "text-slate-900" : "text-slate-400"
                  }`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-start">
          {/* Main Form */}
          <div className="lg:col-span-7">
            {currentStep === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Thông tin giao hàng
                  </h2>
                  {hasAddress && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                      Đã sử dụng địa chỉ mặc định
                    </span>
                  )}
                </div>
                {hasAddress && (
                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 font-medium">
                      Mỗi tài khoản chỉ sở hữu 1 địa chỉ giao hàng. Để thay đổi,
                      vui lòng cập nhật tại trang Thông tin cá nhân!
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      value={formData.shipping.receiver_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          shipping: {
                            ...formData.shipping,
                            receiver_name: e.target.value,
                          },
                        })
                      }
                      className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#2b4c4f]"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.shipping.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          shipping: {
                            ...formData.shipping,
                            email: e.target.value,
                          },
                        })
                      }
                      className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#2b4c4f]"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="text"
                      value={formData.shipping.phone_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          shipping: {
                            ...formData.shipping,
                            phone_number: e.target.value,
                          },
                        })
                      }
                      className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#2b4c4f]"
                      placeholder="+84 000 000 000"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Địa chỉ
                    </label>
                    <input
                      type="text"
                      value={formData.shipping.street_address}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          shipping: {
                            ...formData.shipping,
                            street_address: e.target.value,
                          },
                        })
                      }
                      className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#2b4c4f]"
                      placeholder="Số 123 Đường Láng"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="rounded text-[#2b4c4f]"
                    checked
                    readOnly
                  />
                  <span className="text-xs text-slate-600 font-medium">
                    Địa chỉ thanh toán giống với địa chỉ giao hàng
                  </span>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold text-slate-900">
                  Chọn phương thức thanh toán
                </h2>
                <div className="space-y-4">
                  {/* THANH TOÁN KHI NHẬN HÀNG */}
                  <div
                    onClick={() =>
                      setFormData({
                        ...formData,
                        payment: { ...formData.payment, method: "cod" },
                      })
                    }
                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${formData.payment.method === "cod" ? "border-[#2b4c4f] bg-[#f8fcfb]" : "border-slate-100 bg-white"}`}>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.payment.method === "cod" ? "border-[#2b4c4f]" : "border-slate-200"}`}>
                      {formData.payment.method === "cod" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#2b4c4f]"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="font-bold text-slate-900">
                        Thanh toán khi nhận hàng (COD)
                      </span>
                      <p className="text-xs text-slate-500 mt-1">
                        Thanh toán tiền mặt khi đơn hàng được giao đến bạn.
                      </p>
                    </div>
                  </div>

                  {/* VÍ ĐIỆN TỬ */}
                  <div
                    onClick={handleVnpaySelection}
                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${formData.payment.method === "vnpay" ? "border-[#2b4c4f] bg-[#f8fcfb]" : "border-slate-100 bg-white"}`}>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.payment.method === "vnpay" ? "border-[#2b4c4f]" : "border-slate-200"}`}>
                      {formData.payment.method === "vnpay" && (
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${isVnpayPaid ? "bg-emerald-500" : "bg-[#2b4c4f]"}`}></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 flex items-center gap-2">
                          Ví điện tử VNPay
                          {isVnpayPaid && (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          )}
                          {isVnpayLoading && (
                            <div className="w-3 h-3 border-2 border-[#2b4c4f] border-t-transparent rounded-full animate-spin"></div>
                          )}
                        </span>
                        <div className="flex gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[8px] font-bold text-white ${isVnpayPaid ? "bg-emerald-500" : "bg-[#ae2070]"}`}>
                            {isVnpayPaid ? "ĐÃ THANH TOÁN" : "VN PAY"}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {isVnpayPaid
                          ? "Giao dịch đã được xác nhận thành công."
                          : "Hệ thống sẽ mở tab thanh toán mới ngay khi bạn chọn."}
                      </p>
                    </div>
                  </div>

                  {/* CHUYỂN KHOẢN NGÂN HÀNG */}
                  <div
                    onClick={() =>
                      setFormData({
                        ...formData,
                        payment: {
                          ...formData.payment,
                          method: "bank_transfer",
                        },
                      })
                    }
                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${formData.payment.method === "bank_transfer" ? "border-[#2b4c4f] bg-[#f8fcfb]" : "border-slate-100 bg-white"}`}>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.payment.method === "bank_transfer" ? "border-[#2b4c4f]" : "border-slate-200"}`}>
                      {formData.payment.method === "bank_transfer" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#2b4c4f]"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="font-bold text-slate-900">
                        Chuyển khoản Ngân hàng
                      </span>
                      <p className="text-xs text-slate-500 mt-1">
                        Chuyển khoản trực tiếp vào số tài khoản của chúng tôi.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
                {/* SUCCESS HEADER (ONLY FOR VNPay SUCCESS) */}
                {formData.payment.method === "vnpay" && isVnpayPaid && (
                  <div className="bg-white rounded-[2rem] p-10 border border-slate-100 shadow-sm text-center space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500"></div>
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                      Thanh toán thành công!
                    </h2>
                    <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed">
                      Cảm ơn bạn đã tin tưởng dịch vụ của Luxe Interiors. Đơn hàng của bạn đã được tiếp nhận và đang triển khai.
                    </p>
                    {vnpayOrderId && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-100">
                        Mã giao dịch: <span className="text-slate-900">#{vnpayOrderId}</span>
                      </div>
                    )}
                  </div>
                )}

                {!isVnpayPaid && (
                  <h2 className="text-2xl font-bold text-slate-900">
                    Xem lại đơn hàng
                  </h2>
                )}

                {/* INFORMATION CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Info Card */}
                  <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                        <User className="w-5 h-5 text-slate-400" />
                      </div>
                      <h3 className="font-bold text-slate-900">Thông tin nhận hàng</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <User className="w-4 h-4 text-slate-300 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Người nhận</p>
                          <p className="text-sm font-bold text-slate-900">{formData.shipping.receiver_name}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <Phone className="w-4 h-4 text-slate-300 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Điện thoại</p>
                          <p className="text-sm font-bold text-slate-900">{formData.shipping.phone_number}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <Mail className="w-4 h-4 text-slate-300 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</p>
                          <p className="text-sm font-bold text-slate-900">{formData.shipping.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address Card */}
                  <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-slate-400" />
                      </div>
                      <h3 className="font-bold text-slate-900">Địa chỉ giao hàng</h3>
                    </div>
                    <div className="flex items-start gap-4">
                      <MapPin className="w-4 h-4 text-slate-300 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Giao tới</p>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                          {formData.shipping.street_address}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PRODUCT LIST SECTION (Inline Review) */}
                <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                      <Package className="w-5 h-5 text-slate-400" />
                    </div>
                    <h3 className="font-bold text-slate-900">Sản phẩm đã đặt</h3>
                  </div>
                  <div className="space-y-6">
                    {displayItems.map((item) => (
                      <div key={item.id} className="flex gap-6 pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                        <div className="w-20 h-24 rounded-2xl bg-[#f8f9fa] p-2 border border-slate-50 shrink-0 overflow-hidden">
                          <img
                            src={
                              isVnpayPaid 
                                ? (item.product_variants?.image_url || item.products?.thumbnail)
                                : item.image
                            }
                            className="w-full h-full object-contain mix-blend-multiply"
                            alt={isVnpayPaid ? item.products?.title : item.title}
                          />
                        </div>
                        <div className="flex-1 py-1">
                          <h4 className="text-sm font-bold text-slate-900 mb-1">
                            {isVnpayPaid ? item.products?.title : item.title}
                          </h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                            Số lượng: {item.quantity} | {isVnpayPaid ? item.product_variants?.color_name : item.color}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-slate-900">{formatPrice(item.price)}</span>
                            <span className="text-[10px] font-bold text-slate-400">Thành tiền: <span className="text-slate-900">{formatPrice(item.price * item.quantity)}</span></span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ORDER SUMMARY GRID (Date & Payment) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Ngày đặt hàng</p>
                        <p className="text-sm font-bold text-slate-900">{new Date().toLocaleDateString("vi-VN", { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                        <CreditCard className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Phương thức</p>
                        <p className="text-sm font-bold text-slate-900 uppercase">
                          {formData.payment.method === "cod"
                            ? "Thanh toán khi nhận hàng"
                            : formData.payment.method === "vnpay"
                              ? "Ví điện tử VNPay"
                              : "Chuyển khoản Ngân hàng"}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded ${isVnpayPaid ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"}`}>
                      {isVnpayPaid ? "Đã thanh toán" : "Chờ xác nhận"}
                    </span>
                  </div>
                </div>

                {/* NOTES BOX */}
                <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ghi chú đơn hàng</h4>
                  <textarea
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-[#2b4c4f]/20 focus:border-[#2b4c4f] transition-all outline-none"
                    rows="3"
                    placeholder="Thêm lời nhắn cho người bán..."
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="mt-12 flex items-center justify-between">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Quay lại{" "}
                {currentStep === 1 ? "Giỏ hàng" : "Bước trước"}
              </button>
              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={isNextLoading}
                  className={`px-10 py-4 rounded-xl font-bold flex items-center gap-2 transition-all ${
                    isNextLoading
                      ? "bg-slate-400 cursor-not-allowed text-white"
                      : "bg-[#2b4c4f] text-white hover:bg-[#1f383a]"
                  }`}>
                  {isNextLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      {currentStep === 1 ? (
                        "Tiếp tục thanh toán"
                      ) : formData.payment.method === "vnpay" && isVnpayPaid ? (
                        "Xem lại đơn hàng"
                      ) : (
                        "Xác nhận thanh toán"
                      )}
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  disabled={
                    isPlacingOrder ||
                    (formData.payment.method === "vnpay" && !isVnpayPaid)
                  }
                  className="bg-[#2b4c4f] text-white px-10 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-[#1f383a] shadow-lg shadow-[#2b4c4f]/20 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isPlacingOrder ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      {formData.payment.method === "vnpay" && !isVnpayPaid
                        ? "Chờ thanh toán VNPay..."
                        : "Xác nhận đơn hàng"}
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-5 mt-10 lg:mt-0">
            <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm divide-y divide-slate-100">
              <div className="pb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-6">
                  Tóm tắt đơn hàng
                </h3>
                <div className="space-y-6">
                  {displayItems.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 rounded-xl bg-[#f8f9fa] p-1 border border-slate-50 shrink-0 overflow-hidden">
                        <img
                          src={
                            isVnpayPaid
                              ? item.product_variants?.image_url ||
                                item.products?.thumbnail
                              : item.image
                          }
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-slate-900 line-clamp-1">
                          {isVnpayPaid ? item.products?.title : item.title}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Số lượng: {item.quantity} |{" "}
                          {isVnpayPaid
                            ? item.product_variants?.color_name
                            : item.color}
                        </div>
                        <div className="text-sm font-bold text-slate-900 mt-1">
                          {formatPrice(item.price)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="py-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tạm tính</span>
                  <span className="font-bold text-slate-900">
                    {formatPrice(subTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Vận chuyển</span>
                  <span className="font-bold text-slate-900">MIỄN PHÍ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Thuế ước tính</span>
                  <span className="font-bold text-slate-900">
                    {formatPrice(subTotal * 0.08)}
                  </span>
                </div>
              </div>

              <div className="pt-6">
                <div className="flex justify-between items-end mb-8">
                  <span className="text-base font-bold text-slate-900">
                    Tổng cộng
                  </span>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-slate-900 tracking-tight">
                      {isVnpayPaid && vnpayOrderDetails 
                        ? formatPrice(vnpayOrderDetails.total_price)
                        : formatPrice(total + subTotal * 0.08)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                      VND (Bao gồm VAT)
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
                    Mã giảm giá
                  </label>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 border border-slate-100 rounded-xl px-4 py-3 text-sm"
                      placeholder="Nhập mã"
                    />
                    <button className="bg-slate-50 text-slate-700 px-6 py-3 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors border border-slate-100">
                      Áp dụng
                    </button>
                  </div>
                </div>

                <div className="bg-[#f8fcfb] rounded-2xl p-5 border border-[#e2f0ee] flex gap-4">
                  <ShieldCheck className="w-6 h-6 text-[#2b4c4f] shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-slate-900 uppercase tracking-widest leading-none mb-1">
                      Thanh toán an toàn
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Dữ liệu của bạn được mã hóa và bảo mật 100% khi thanh
                      toán.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mini Footer */}
      <footer className="border-t border-slate-100 py-10 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="text-xs text-slate-400 font-medium">
            © 2024 Luxe Interiors. All rights reserved.
          </div>
          <div className="flex gap-6 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <a href="#" className="hover:text-primary transition-colors">
              Chính sách hoàn tiền
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Vận chuyển
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Bảo mật
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Điều khoản
            </a>
          </div>
        </div>
      </footer>

      {/* VNPay QR Modal */}
      {qrModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setQrModal({ ...qrModal, isOpen: false })}></div>
          <div className="bg-white rounded-[2rem] w-full max-w-md relative z-10 overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">
                    Quét mã thanh toán
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Sử dụng ứng dụng ngân hàng hoặc ví VNPay
                  </p>
                </div>
                <button
                  onClick={() => setQrModal({ ...qrModal, isOpen: false })}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="bg-[#f8fcfb] rounded-3xl p-8 flex flex-col items-center justify-center border border-[#e2f0ee] mb-6">
                <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
                  <QRCodeCanvas
                    value={qrModal.url}
                    size={200}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <div className="text-center font-bold text-slate-900 text-lg mb-1">
                  {formatPrice(total + subTotal * 0.08)}
                </div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Mã đơn hàng: #{qrModal.orderId}
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href={qrModal.url}
                  className="w-full flex items-center justify-center gap-2 bg-[#2b4c4f] text-white py-4 rounded-xl font-bold hover:bg-[#1f383a] transition-all">
                  Mở ứng dụng VNPay
                </a>
                <p className="text-[10px] text-slate-400 text-center font-medium px-4">
                  Sau khi thanh toán xong, hệ thống sẽ tự động cập nhật trạng
                  thái đơn hàng của bạn.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
