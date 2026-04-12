import React, { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  ImageIcon,
  Loader2,
  Upload,
  CloudUpload,
} from "lucide-react";
import { axiosClient } from "../../utils/axiosClient";
import { supabase } from "../../config/supabase";
import { toast } from "react-toastify";

export const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [btnLoading, setBtnLoading] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    image_url: "",
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/categories");
      setCategories(res.data);
    } catch (error) {
      toast.error("Không thể tải danh sách danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        image_url: category.image_url || "",
      });
      setPreviewUrl(category.image_url || "");
    } else {
      setEditingCategory(null);
      setFormData({ name: "", slug: "", image_url: "" });
      setPreviewUrl("");
    }
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setSelectedFile(null);
    setPreviewUrl("");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFileSelect(file);
    } else {
      toast.error("Vui lòng chọn file hình ảnh");
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = fileName;

    const { data, error } = await supabase.storage
      .from("categories")
      .upload(filePath, file);
    if (error) throw error;
    const {
      data: { publicUrl },
    } = supabase.storage.from("categories").getPublicUrl(filePath);
    return publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.warn("Vui lòng nhập tên danh mục");
      return;
    }

    setBtnLoading(true);
    try {
      let finalImageUrl = formData.image_url;
      if (selectedFile) {
        toast.info("Đang tải ảnh lên Supabase...");
        finalImageUrl = await uploadImage(selectedFile);
      }
      const submissionData = { ...formData, image_url: finalImageUrl };
      if (editingCategory) {
        await axiosClient.put(
          `/categories/${editingCategory.id}`,
          submissionData,
        );
        toast.success("Cập nhật danh mục thành công");
      } else {
        await axiosClient.post("/categories", submissionData);
        toast.success("Thêm danh mục mới thành công");
      }
      fetchCategories();
      handleCloseModal();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || "Đã xảy ra lỗi khi lưu dữ liệu");
    } finally {
      setBtnLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;
    try {
      await axiosClient.delete(`/categories/${id}`);
      toast.success("Xóa danh mục thành công");
      fetchCategories();
    } catch (error) {
      toast.error("Không thể xóa danh mục này");
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-6 lg:p-10 font-sans max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Quản lý danh mục
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Xem, thêm mới và chỉnh sửa các danh mục sản phẩm của bạn
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#2b4c4f] text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-[#1f383a] transition-all font-medium text-sm shadow-sm">
          <Plus size={18} />
          Thêm danh mục
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
              placeholder="Tìm kiếm danh mục..."
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
                <th className="px-6 py-4">Hình ảnh</th>
                <th className="px-6 py-4">Tên danh mục</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="animate-spin text-[#2b4c4f]" />
                      <span className="text-slate-400">
                        Đang tải dữ liệu...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-10 text-center text-slate-400">
                    Không tìm thấy danh mục nào.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200">
                        {category.image_url ? (
                          <img
                            src={category.image_url}
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="text-slate-300" size={20} />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {category.name}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                      {category.slug}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(category)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Chỉnh sửa">
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
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
                {editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
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
                  Tên danh mục <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#2b4c4f] focus:ring-1 focus:ring-[#2b4c4f] transition-all"
                  placeholder="Ví dụ: Bàn làm việc"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Hình ảnh danh mục
                </label>
                <div
                  className={`relative group border-2 border-dashed rounded-xl p-6 transition-all duration-200 flex flex-col items-center justify-center gap-3 overflow-hidden
                    ${isDragging ? "border-[#2b4c4f] bg-[#2b4c4f]/5" : "border-slate-200 hover:border-slate-300 bg-slate-50/30"}
                    ${previewUrl ? "aspect-video" : "h-32"}
                  `}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}>
                  {previewUrl ? (
                    <>
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            setPreviewUrl("");
                            setFormData({ ...formData, image_url: "" });
                          }}
                          className="bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/40">
                          <X size={20} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-3 bg-white rounded-full shadow-sm text-slate-400 group-hover:text-[#2b4c4f] transition-colors">
                        <CloudUpload size={24} />
                      </div>
                      <div className="text-center">
                        <p className="text-[11px] font-medium text-slate-600">
                          Kéo thả ảnh hoặc{" "}
                          <label className="text-[#2b4c4f] cursor-pointer hover:underline font-bold">
                            chọn file
                          </label>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Hỗ trợ JPG, PNG (Max 5MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => handleFileSelect(e.target.files[0])}
                      />
                    </>
                  )}
                </div>
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
                  {editingCategory ? "Cập nhật" : "Tạo danh mục"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
