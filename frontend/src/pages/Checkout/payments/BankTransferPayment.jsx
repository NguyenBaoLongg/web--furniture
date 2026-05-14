import React from "react";
import { toast } from "react-toastify";

export const BankTransferPayment = ({ 
  formData, 
  setFormData, 
  subTotal, 
  setBankTransferData,
  generateRandomString
}) => {
  const handleSelection = () => {
    if (!formData.shipping.phone_number || !formData.shipping.street_address) {
      toast.warning("Vui lòng nhập số điện thoại và địa chỉ giao hàng trước khi chọn Chuyển khoản.");
      return;
    }

    const randomCode = generateRandomString(10);
    const finalAmount = Math.round(subTotal);
    const bankId = "OCB";
    const accountNo = "CASS11052004";
    const template = "compact2";
    const accountName = "NGUYEN BAO LONG";

    const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?amount=${finalAmount}&addInfo=${randomCode}&accountName=${encodeURIComponent(accountName)}`;

    setBankTransferData({
      qrUrl,
      randomCode,
      showQR: true,
    });

    setFormData({
      ...formData,
      payment: { ...formData.payment, method: "bank_transfer" },
    });
  };

  return (
    <div
      onClick={handleSelection}
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
  );
};
