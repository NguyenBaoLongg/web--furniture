import React from "react";

export const CODPayment = ({ formData, setFormData }) => {
  return (
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
  );
};
