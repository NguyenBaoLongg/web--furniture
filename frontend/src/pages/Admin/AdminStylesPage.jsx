import React, { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Loader2,
  Tags,
} from "lucide-react";
import { axiosClient } from "../../utils/axiosClient";
import { toast } from "react-toastify";

export const AdminStylesPage = () => {
  const [styles, setStyles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStyle, setEditingStyle] = useState(null);
  const [btnLoading, setBtnLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    image_url: "",
  });

  const fetchStyles = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/styles");
      setStyles(res.data);
    } catch (error) {
      toast.error("Không thể tải danh sách phong cách");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStyles();
  }, []);

  const handleOpenModal = (style = null) => {
    if (style) {
      setEditingStyle(style);
      setFormData({
        name: style.name,
        slug: style.slug,
        image_url: style.image_url || "",
      });
    } else {
      setEditingStyle(null);
      setFormData({ name: "", slug: "", image_url: "" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStyle(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.warn("Vui lòng nhập tên phong cách");
      return;
    }

    setBtnLoading(true);
    try {
      if (editingStyle) {
        await axiosClient.put(`/styles/${editingStyle.id}`, formData);
        toast.success("Cập nhật phong cách thành công");
      } else {
        await axiosClient.post("/styles", formData);
        toast.success("Thêm phong cách mới thành công");
      }
      fetchStyles();
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi lưu dữ liệu");
    } finally {
      setBtnLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phong cách này?")) return;
    try {
      await axiosClient.delete(`/styles/${id}`);
      toast.success("Xóa phong cách thành công");
      fetchStyles();
    } catch (error) {
      toast.error("Không thể xóa phong cách này");
    }
  };

  const filteredStyles = styles.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-6 lg:p-10 font-sans max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Quản lý phong cách (Styles)
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Thiết lập các phong cách thiết kế như Hiện đại, Tối giản, Bắc Âu...
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#2b4c4f] text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-[#1f383a] transition-all font-medium text-sm shadow-sm">
          <Plus size={18} />
          Thêm phong cách
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Tìm kiếm phong cách..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#2b4c4f] focus:ring-1 focus:ring-[#2b4c4f]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                <th className="px-6 py-4">Ảnh</th>
                <th className="px-6 py-4">Tên phong cách</th>
                <th className="px-6 py-4">Slug (Đường dẫn)</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-10 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="animate-spin text-[#2b4c4f]" />
                      <span className="text-slate-400">Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredStyles.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-10 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                        <Tags size={40} className="text-slate-200" />
                        <p>Chưa có phong cách nào được tạo.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStyles.map((style) => (
                  <tr key={style.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
                        {style.image_url ? (
                          <img
                            src={style.image_url}
                            alt={style.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Tags size={20} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {style.name}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                      {style.slug}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(style)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Chỉnh sửa">
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(style.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Xóa">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-900">
                {editingStyle ? "Chỉnh sửa phong cách" : "Thêm phong cách mới"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Tên phong cách <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#2b4c4f] focus:ring-1 focus:ring-[#2b4c4f] transition-all"
                  placeholder="Ví dụ: Hiện đại"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Link ảnh đại diện
                </label>
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#2b4c4f] focus:ring-1 focus:ring-[#2b4c4f] transition-all"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Slug (Tự động tạo nếu để trống)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#2b4c4f] focus:ring-1 focus:ring-[#2b4c4f] transition-all font-mono"
                  placeholder="hien-dai"
                />
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={btnLoading}
                  className="flex-1 px-4 py-2.5 bg-[#2b4c4f] text-white rounded-lg text-sm font-bold hover:bg-[#1f383a] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-70">
                  {btnLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Plus size={16} />
                  )}
                  {editingStyle ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
