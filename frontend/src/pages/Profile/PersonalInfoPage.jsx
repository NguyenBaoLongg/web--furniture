import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { ProfileSidebar } from "../../components/profile/ProfileSidebar";
import { axiosClient } from "../../utils/axiosClient";
import { toast } from "react-toastify";
import { User, Phone, Mail, Save, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

export const PersonalInfoPage = () => {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        phone: user.phone || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await axiosClient.put(`/auth/profile/${user.id}`, {
        full_name: formData.full_name,
        phone: formData.phone,
      });
      
      // Update local state in context
      login(res.data.user);
      
      toast.success("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Lỗi cập nhật profile:", error);
      toast.error(error.response?.data?.message || "Lỗi khi cập nhật thông tin");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
        <ProfileSidebar />

        <div className="flex-1">
          <div className="mb-8">
            <Link 
              to="/profile" 
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-[#2b4c4f] transition-colors mb-4"
            >
              <ChevronLeft className="w-4 h-4" /> Quay lại tổng quan
            </Link>
            <h1 className="text-3xl font-black text-slate-900">Thông tin cá nhân</h1>
            <p className="text-slate-500 font-medium">Quản lý và cập nhật thông tin tài khoản của bạn</p>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 max-w-2xl">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Internal Grid */}
              <div className="space-y-6">
                 {/* Email (Read Only) */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">
                    Địa chỉ Email
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 transition-colors group-focus-within:text-[#2b4c4f]" />
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-slate-400 font-bold cursor-not-allowed"
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-slate-400 font-medium italic">
                    * Email không thể thay đổi để đảm bảo bảo mật tài khoản.
                  </p>
                </div>

                {/* Full Name */}
                <div>
                  <label htmlFor="full_name" className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">
                    Họ và Tên
                  </label>
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 transition-colors group-focus-within:text-[#2b4c4f]" />
                    <input
                      id="full_name"
                      name="full_name"
                      type="text"
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="Nhập họ và tên đầy đủ..."
                      required
                      className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[1.5rem] text-slate-900 font-bold focus:outline-none focus:border-[#2b4c4f] focus:ring-4 focus:ring-[#2b4c4f]/5 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">
                    Số điện thoại
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 transition-colors group-focus-within:text-[#2b4c4f]" />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Nhập số điện thoại..."
                      className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[1.5rem] text-slate-900 font-bold focus:outline-none focus:border-[#2b4c4f] focus:ring-4 focus:ring-[#2b4c4f]/5 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-slate-50">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-10 py-5 bg-[#2b4c4f] text-white rounded-[1.5rem] font-black text-sm shadow-xl shadow-[#2b4c4f]/20 hover:bg-[#1f383a] transition-all flex items-center justify-center gap-3 disabled:bg-slate-300 disabled:shadow-none"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
