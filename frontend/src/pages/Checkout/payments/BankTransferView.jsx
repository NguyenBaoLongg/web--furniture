import React, { useState } from "react";
import { ArrowLeft, CreditCard, ShieldCheck, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import { axiosClient } from "../../../utils/axiosClient";

export const BankTransferView = ({ 
  bankTransferData, 
  setBankTransferData, 
  subTotal, 
  formatPrice,
  onPaymentSuccess
}) => {
  const [isVerifying, setIsVerifying] = useState(false);

  const checkPaymentStatus = async () => {
    try {
      setIsVerifying(true);
      toast.info("Đang kiểm tra giao dịch trên hệ thống...");
      
      const response = await axiosClient.post("/orders/verify-bank-transfer", {
        code: bankTransferData.randomCode
      });
      
      if (response.data.success) {
        toast.success("Xác nhận thanh toán thành công!");
        await onPaymentSuccess(true);
      } else {
        toast.error("Hệ thống chưa ghi nhận giao dịch của bạn. Vui lòng kiểm tra lại nội dung chuyển khoản hoặc đợi 1-2 phút.");
      }
    } catch (error) {
      console.error("Lỗi đối soát thanh toán:", error);
      toast.error("Lỗi: " + (error.response?.data?.message || "Không thể kết nối với hệ thống đối soát."));
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-12 px-4 font-sans">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => setBankTransferData(prev => ({ ...prev, showQR: false }))}
          className="flex items-center gap-2 text-slate-400 hover:text-[#2b4c4f] font-bold text-xs uppercase tracking-widest mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại thanh toán
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-500">
          <div className="p-8 md:p-12">
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-[#f8fcfb] rounded-3xl flex items-center justify-center mx-auto mb-6 border border-[#e2f0ee]">
                <CreditCard className="w-10 h-10 text-[#2b4c4f]" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Thanh toán chuyển khoản</h2>
              <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
                Quét mã QR dưới đây bằng ứng dụng Ngân hàng của bạn để hoàn tất thanh toán.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                <div className="bg-[#f8fcfb] p-6 rounded-[2rem] border border-[#e2f0ee] relative group">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2b4c4f] text-white text-[8px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg">
                    VietQR Chính chủ
                  </div>
                  <img 
                    src={bankTransferData.qrUrl} 
                    alt="VietQR Payment" 
                    className="w-full aspect-square object-contain rounded-2xl shadow-sm mix-blend-multiply transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Thanh toán an toàn 256-bit
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Số tiền cần trả</p>
                    <p className="text-2xl font-black text-[#2b4c4f] tracking-tight">
                      {formatPrice(subTotal)}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nội dung chuyển khoản</p>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-slate-900 font-mono tracking-wider">{bankTransferData.randomCode}</p>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(bankTransferData.randomCode);
                          toast.success("Đã sao chép mã!");
                        }}
                        className="text-[10px] font-bold text-[#2b4c4f] hover:underline"
                      >
                        SAO CHÉP
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Ngân hàng</span>
                    <span className="text-slate-900 font-bold">MB Bank (Quân Đội)</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Chủ tài khoản</span>
                    <span className="text-slate-900 font-bold">NGUYEN BAO LONG</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium">Số tài khoản</span>
                    <span className="text-slate-900 font-bold">0365741639</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-8 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button 
                onClick={checkPaymentStatus}
                disabled={isVerifying}
                className="w-full sm:flex-1 bg-[#2b4c4f] text-white py-4 rounded-2xl font-bold hover:bg-[#1f383a] transition-all shadow-lg shadow-[#2b4c4f]/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                Tôi đã chuyển khoản
              </button>
              <button 
                onClick={() => setBankTransferData(prev => ({ ...prev, showQR: false }))}
                className="w-full sm:w-auto px-8 py-4 text-slate-500 font-bold hover:text-slate-900 transition-colors"
              >
                Hủy bỏ
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-6 font-medium leading-relaxed">
              Sau khi chuyển khoản, vui lòng giữ lại ảnh chụp màn hình giao dịch. Hệ thống sẽ tự động xác nhận sau 1-3 phút.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
