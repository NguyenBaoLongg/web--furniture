import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import { axiosClient } from "../../utils/axiosClient";
import { useAuth } from "../../context/AuthContext";

export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Vui lòng nhập đầy đủ email và mật khẩu!");
      return;
    }

    try {
      const res = await axiosClient.post("/auth/login", { email, password });
      
      const userData = res.data.user;
      
      // Strict role check
      if (userData.role !== 'admin' && userData.role !== 'staff') {
        toast.error("Truy cập bị từ chối. Tài khoản không có quyền Admin.");
        return;
      }
      
      await login(userData, res.data.session);
      toast.success("Đăng nhập Admin thành công!");
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      toast.error(
        error.response?.data?.message || "Email hoặc mật khẩu không chính xác!",
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8 lg:p-10 flex flex-col justify-center">
          <div className="mb-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-[#2b4c4f]/10 rounded-full flex items-center justify-center mb-4 text-[#2b4c4f]">
                <ShieldCheck size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Admin Portal
            </h2>
            <p className="text-slate-500 text-sm">
              Đăng nhập bằng tài khoản quản trị viên
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email / Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#2b4c4f] focus:ring-1 focus:ring-[#2b4c4f]"
                  placeholder="admin@furniturehub.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#2b4c4f] focus:ring-1 focus:ring-[#2b4c4f]"
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
              className="w-full bg-[#2b4c4f] text-white py-3 rounded-lg font-bold hover:bg-[#1f383a] transition-colors mt-4">
              Đăng nhập
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <span className="text-xs text-slate-400">Secure access restricted to authorized personnel only.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
