import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Key, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import { axiosClient } from "../../utils/axiosClient";

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Vui lòng nhập email!");
      return;
    }
    try {
      const res = await axiosClient.post("/auth/forgot-password", { email });
      toast.success(res.data.message || "Đã gửi mã OTP!");
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi gửi mã OTP");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error("Vui lòng nhập mã OTP!");
      return;
    }
    try {
      const res = await axiosClient.post("/auth/verify-reset-otp", { email, otp });
      toast.success("Xác thực OTP thành công, vui lòng nhập mật khẩu mới!");
      setStep(3);
    } catch (error) {
      toast.error(error.response?.data?.message || "Mã OTP không hợp lệ");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }
    try {
      const res = await axiosClient.post("/auth/reset-password", { email, newPassword, otp });
      toast.success("Đổi mật khẩu thành công!");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi đổi mật khẩu");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-8">
        <div className="mb-6">
          <button onClick={() => navigate("/login")} className="flex items-center text-sm text-slate-500 hover:text-[#2b4c4f] transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Quay lại đăng nhập
          </button>
        </div>
        
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Quên mật khẩu
          </h2>
          <p className="text-slate-500 text-sm">
            {step === 1 && "Nhập email của bạn để nhận mã xác nhận"}
            {step === 2 && "Nhập mã OTP vừa được gửi đến email của bạn"}
            {step === 3 && "Nhập mật khẩu mới cho tài khoản của bạn"}
          </p>
        </div>

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#2b4c4f] focus:ring-1 focus:ring-[#2b4c4f]"
                  placeholder="example@gmail.com"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-[#2b4c4f] text-white py-3 rounded-lg font-bold hover:bg-[#1f383a] transition-colors mt-2">
              Gửi mã xác nhận
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Mã OTP
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#2b4c4f] focus:ring-1 focus:ring-[#2b4c4f] tracking-widest text-center"
                  placeholder="------"
                  maxLength={6}
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-[#2b4c4f] text-white py-3 rounded-lg font-bold hover:bg-[#1f383a] transition-colors mt-2">
              Xác nhận mã OTP
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Mật khẩu mới
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#2b4c4f] focus:ring-1 focus:ring-[#2b4c4f]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-[#2b4c4f] text-white py-3 rounded-lg font-bold hover:bg-[#1f383a] transition-colors mt-2">
              Lưu mật khẩu mới
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
