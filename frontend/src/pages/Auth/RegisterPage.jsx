import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock, RefreshCcw } from "lucide-react";
import { toast } from "react-toastify";
import { axiosClient } from "../../utils/axiosClient";
import { supabase } from "../../config/supabase";
import { useAuth } from "../../context/AuthContext";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "customer",
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }
    if (!agreeTerms) {
      toast.error("Bạn cần đồng ý với Điều khoản dịch vụ!");
      return;
    }

    try {
      await axiosClient.post("/auth/send-otp", {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
      });

      toast.success("Mã OTP đã được gửi đến email (hoặc Terminal log)!");
      setStep(2); // Chuyển sang bước nhập OTP
    } catch (error) {
      console.error("Lỗi từ Backend:", error);
      toast.error(error.response?.data?.message || "Lỗi khi gửi mã OTP!");
    }
  };

  const handleOtpChange = (index, value) => {
    // Nếu người dùng dán hoặc điền nhanh nhiều số vào 1 ô
    if (value.length > 1) {
      const pastedData = value.replace(/\D/g, "").slice(0, 6);
      const newOtp = [...otpValues];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pastedData[i] || "";
      }
      setOtpValues(newOtp);
      // Chuyển tới ô tiếp theo cần điền
      const focusIndex = pastedData.length < 6 ? pastedData.length : 5;
      if (otpRefs[focusIndex]?.current) {
        otpRefs[focusIndex].current.focus();
      }
      return;
    }

    // Chỉ cho phép điền số
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpValues];
    const char = value.slice(-1); // Lấy duy nhất kí tự cuối cùng nếu có
    newOtp[index] = char;
    setOtpValues(newOtp);

    // Chuyển focus sang ô tiếp theo
    if (char && index < 5) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpCode = otpValues.join("");
    if (otpCode.length < 6) {
      toast.error("Vui lòng nhập đủ 6 số OTP");
      return;
    }

    try {
      const res = await axiosClient.post("/auth/verify-registration", {
        email: formData.email,
        otp: otpCode,
      });

      toast.success("Đăng ký thành công!");
      
      // Auto login và chuyển về trang chủ
      if (res.data && res.data.user) {
        await login(res.data.user, res.data.session);
        navigate("/");
      } else {
        navigate("/login");
      }
      
    } catch (error) {
      console.error("Lỗi xác minh OTP:", error);
      toast.error(error.response?.data?.message || "Mã OTP không chính xác!");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Lỗi Google Auth:", error);
      toast.error("Không thể kết nối với Google!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-8 z-10 transition-all duration-300">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            {step === 1 ? "Tạo tài khoản" : "Xác thực Email"}
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            {step === 1 
              ? "Tham gia cùng cộng đồng nội thất hiện đại để nhận ưu đãi đặc biệt."
              : `Vui lòng nhập mã gồm 6 số vừa được gửi đến email ${formData.email}`}
          </p>
        </div>

        {step === 1 ? (
          // STEP 1: BẢNG NHẬP THÔNG TIN
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Họ tên</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Nguyễn Văn A"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="example@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Số điện thoại</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="090x xxx xxx"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Xác nhận mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <RefreshCcw className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-start pt-2">
              <input
                id="terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded cursor-pointer shrink-0"
              />
              <label htmlFor="terms" className="ml-2 block text-xs text-slate-600 cursor-pointer">
                Tôi đồng ý với <span className="font-bold text-slate-800">Điều khoản dịch vụ</span> và <span className="font-bold text-slate-800">Chính sách bảo mật</span>.
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-[#2b4c4f] text-white py-3 rounded-lg font-bold hover:bg-[#1f383a] transition-colors mt-4">
              Đăng ký ngay
            </button>
          </form>
        ) : (
          // STEP 2: BẢNG NHẬP OTP
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="flex justify-between gap-2">
              {otpValues.map((value, index) => (
                <input
                  key={index}
                  ref={otpRefs[index]}
                  type="text"
                  value={value}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onFocus={(e) => e.target.select()}
                  className="w-12 h-14 text-center text-xl font-bold border-2 border-slate-200 rounded-lg focus:border-[#2b4c4f] focus:outline-none text-slate-800"
                />
              ))}
            </div>
            
            <button
              type="submit"
              className="w-full bg-[#2b4c4f] text-white py-3 rounded-lg font-bold hover:bg-[#1f383a] transition-colors mt-4">
              Xác thực và Đăng nhập
            </button>
            <div className="text-center mt-4">
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="text-sm font-semibold text-slate-500 hover:text-slate-800">
                Quay lại sửa Email
              </button>
            </div>
          </form>
        )}

        {step === 1 && (
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                  Hoặc tiếp tục với
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
                Google
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <p className="mt-8 text-center text-sm text-slate-600">
            Đã có tài khoản?{" "}
            <Link to="/login" className="font-bold text-slate-900 hover:text-primary transition-colors">
              Đăng nhập
            </Link>
          </p>
        )}
      </div>

      <div className="w-full max-w-5xl mt-[-80px] pt-[120px] pb-12 px-10 bg-[#7c8b86] rounded-2xl overflow-hidden relative shadow-inner">
        <img
          src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=1200"
          alt="Banner"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40"
        />
        <div className="relative z-10 text-white max-w-lg">
          <h3 className="text-2xl font-bold mb-2">Không gian sống hoàn mỹ</h3>
          <p className="text-sm text-white/80">
            Khám phá bộ sưu tập nội thất phong cách Scandinavia mới nhất của
            chúng tôi.
          </p>
        </div>
      </div>
    </div>
  );
};
