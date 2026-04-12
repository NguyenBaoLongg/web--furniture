import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { axiosClient } from "../../utils/axiosClient";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../config/supabase";

export const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Vui lòng nhập đầy đủ email và mật khẩu!");
      return;
    }

    try {
      const res = await axiosClient.post("/auth/login", { email, password });
      await login(res.data.user, res.data.session);
      toast.success("Đăng nhập thành công!");
      navigate("/");
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      toast.error(
        error.response?.data?.message || "Email hoặc mật khẩu không chính xác!",
      );
    }
  };

  const handleGoogleLogin = async () => {
    console.log("1. Nút Google đã được bấm!");
    console.log(
      "2. URL Supabase hiện tại là:",
      import.meta.env.VITE_SUPABASE_URL,
    );

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

      console.log("3. Phản hồi từ Supabase:", data);

      if (error) {
        console.error("Lỗi từ Supabase:", error.message);
        throw error;
      }
    } catch (error) {
      console.error("Lỗi bao quát:", error);
      toast.error("Không thể kết nối với Google! Mở F12 để xem lỗi.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/2 relative h-64 lg:h-auto hidden sm:block">
          <img
            src="https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&q=80&w=800"
            alt="Interior minimalism"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-10">
            <h2 className="text-3xl font-bold text-white mb-3">
              Kiến tạo không gian
              <br />
              sống hiện đại
            </h2>
            <p className="text-white/80 text-sm leading-relaxed">
              Khám phá bộ sưu tập nội thất cao cấp mang phong cách Minimalism
              tinh tế.
            </p>
          </div>
        </div>

        <div className="w-full lg:w-1/2 p-8 lg:p-14 flex flex-col justify-center">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Chào mừng trở lại
            </h2>
            <p className="text-slate-500 text-sm">
              Vui lòng đăng nhập để tiếp tục trải nghiệm
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
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
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="example@gmail.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Mật khẩu
                </label>
                <Link
                  to="#"
                  className="text-xs font-medium text-slate-500 hover:text-primary transition-colors">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
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

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded cursor-pointer"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-slate-600 cursor-pointer">
                Ghi nhớ đăng nhập
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-[#2b4c4f] text-white py-3 rounded-lg font-bold hover:bg-[#1f383a] transition-colors mt-2">
              Đăng nhập
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500 text-xs">
                  Hoặc đăng nhập với
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

          <p className="mt-8 text-center text-sm text-slate-600">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="font-bold text-slate-900 hover:text-primary transition-colors">
              Đăng ký tài khoản mới
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
