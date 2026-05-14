import React from "react";
import { CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import { axiosClient } from "../../../utils/axiosClient";

export const VNPayPayment = ({ 
  formData, 
  setFormData, 
  cartItems, 
  user, 
  total, 
  subTotal, 
  isVnpayPaid, 
  isVnpayLoading, 
  setIsVnpayLoading,
  setVnpayOrderId
}) => {
  const handleVnpaySelection = async () => {
    if (isVnpayPaid) return;

    if (!formData.shipping.phone_number || !formData.shipping.street_address) {
      toast.warning("Vui lòng nhập số điện thoại và địa chỉ giao hàng trước khi chọn VNPay.");
      return;
    }

    try {
      setIsVnpayLoading(true);
      setFormData({
        ...formData,
        payment: { ...formData.payment, method: "vnpay" },
      });

      const orderData = {
        user_id: user.id,
        address: formData.shipping,
        items: cartItems.map((item) => ({
          product_id: item.productId,
          variant_id: item.variantId,
          quantity: item.quantity,
          price: item.price,
        })),
        total_price: Math.round(total),
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

  return (
    <div
      onClick={handleVnpaySelection}
      className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${formData.payment.method === "vnpay" ? "border-[#2b4c4f] bg-[#f8fcfb]" : "border-slate-100 bg-white"}`}>
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.payment.method === "vnpay" ? "border-[#2b4c4f]" : "border-slate-200"}`}>
        {formData.payment.method === "vnpay" && (
          <div className={`w-2.5 h-2.5 rounded-full ${isVnpayPaid ? "bg-emerald-500" : "bg-[#2b4c4f]"}`}></div>
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-900 flex items-center gap-2">
            Ví điện tử VNPay
            {isVnpayPaid && <CheckCircle className="w-4 h-4 text-emerald-500" />}
            {isVnpayLoading && (
              <div className="w-3 h-3 border-2 border-[#2b4c4f] border-t-transparent rounded-full animate-spin"></div>
            )}
          </span>
          <div className="flex gap-2">
            <span className={`px-2 py-0.5 rounded text-[8px] font-bold text-white ${isVnpayPaid ? "bg-emerald-500" : "bg-[#ae2070]"}`}>
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
  );
};
