import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { ProfileSidebar } from "../../components/profile/ProfileSidebar";
import { axiosClient } from "../../utils/axiosClient";
import { toast } from "react-toastify";
import { MapPin, User, Phone, Home, Save, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

export const ShippingAddressPage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    receiver_name: "",
    phone_number: "",
    street_address: "",
    ward: "",
    city: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchAddress();
    }
  }, [user]);

  const fetchAddress = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/auth/address/${user.id}`);
      if (res.data) {
        setFormData({
          receiver_name: res.data.receiver_name || "",
          phone_number: res.data.phone_number || "",
          street_address: res.data.street_address || "",
          ward: res.data.ward || "",
          city: res.data.city || "",
        });
      }
    } catch (error) {
      console.error("Lỗi lấy địa chỉ:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await axiosClient.post("/auth/address", {
        user_id: user.id,
        ...formData,
      });
      toast.success("Cập nhật địa chỉ thành công!");
    } catch (error) {
      console.error("Lỗi cập nhật địa chỉ:", error);
      toast.error("Lỗi khi cập nhật địa chỉ");
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
            <h1 className="text-3xl font-black text-slate-900">Địa chỉ giao hàng</h1>
            <p className="text-slate-500 font-medium">Quản lý địa chỉ nhận hàng mặc định của bạn</p>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 max-w-2xl">
            {loading ? (
              <div className="py-20 text-center text-slate-400 font-bold">Đang tải thông tin...</div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Receiver Name */}
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">
                      Tên người nhận
                    </label>
                    <div className="relative group">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 transition-colors group-focus-within:text-[#2b4c4f]" />
                      <input
                        name="receiver_name"
                        type="text"
                        value={formData.receiver_name}
                        onChange={handleChange}
                        placeholder="Nhập tên người nhận..."
                        required
                        className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[1.5rem] text-slate-900 font-bold focus:outline-none focus:border-[#2b4c4f] focus:ring-4 focus:ring-[#2b4c4f]/5 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">
                      Số điện thoại nhận hàng
                    </label>
                    <div className="relative group">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 transition-colors group-focus-within:text-[#2b4c4f]" />
                      <input
                        name="phone_number"
                        type="tel"
                        value={formData.phone_number}
                        onChange={handleChange}
                        placeholder="Nhập số điện thoại..."
                        required
                        className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[1.5rem] text-slate-900 font-bold focus:outline-none focus:border-[#2b4c4f] focus:ring-4 focus:ring-[#2b4c4f]/5 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Street Address */}
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">
                      Địa chỉ cụ thể (Số nhà, tên đường)
                    </label>
                    <div className="relative group">
                      <Home className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 transition-colors group-focus-within:text-[#2b4c4f]" />
                      <input
                        name="street_address"
                        type="text"
                        value={formData.street_address}
                        onChange={handleChange}
                        placeholder="Nhập số nhà, tên đường..."
                        required
                        className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[1.5rem] text-slate-900 font-bold focus:outline-none focus:border-[#2b4c4f] focus:ring-4 focus:ring-[#2b4c4f]/5 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Ward */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">
                      Phường / Xã
                    </label>
                    <input
                      name="ward"
                      type="text"
                      value={formData.ward}
                      onChange={handleChange}
                      placeholder="Nhập phường/xã..."
                      required
                      className="w-full px-6 py-5 bg-white border border-slate-100 rounded-[1.5rem] text-slate-900 font-bold focus:outline-none focus:border-[#2b4c4f] focus:ring-4 focus:ring-[#2b4c4f]/5 transition-all outline-none"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">
                      Thành phố / Tỉnh
                    </label>
                    <input
                      name="city"
                      type="text"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Nhập thành phố..."
                      required
                      className="w-full px-6 py-5 bg-white border border-slate-100 rounded-[1.5rem] text-slate-900 font-bold focus:outline-none focus:border-[#2b4c4f] focus:ring-4 focus:ring-[#2b4c4f]/5 transition-all outline-none"
                    />
                  </div>
                </div>

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
                    Lưu địa chỉ
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
