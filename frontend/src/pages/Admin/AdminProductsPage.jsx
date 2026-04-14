import React, { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  ImageIcon,
  Loader2,
  Filter,
  Package,
  AlertCircle,
  CloudUpload,
  ArrowUpDown,
  RotateCcw,
  LayoutGrid,
} from "lucide-react";
import { axiosClient } from "../../utils/axiosClient";
import { supabase } from "../../config/supabase";
import { toast } from "react-toastify";

export const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterRoom, setFilterRoom] = useState("");
  const [filterStatus, setFilterStatus] = useState(""); // active, hidden
  const [filterStock, setFilterStock] = useState(""); // in_stock, out_of_stock
  const [sortOrder, setSortOrder] = useState("newest");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [btnLoading, setBtnLoading] = useState(false);
  const [colorLibrary, setColorLibrary] = useState([]);

  // File upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [additionalImages, setAdditionalImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingAdditional, setIsDraggingAdditional] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    price: "",
    sku: "",
    description: "",
    stock: "",
    category_id: "",
    thumbnail: "",
    is_new_arrival: false,
    material: "",
    width: "",
    depth: "",
    height: "",
    weight: "",
    care_instructions: "",
    room_ids: [],
    color_ids: [],
    is_active: true,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes, roomRes, colorRes] = await Promise.all([
        axiosClient.get("/products"),
        axiosClient.get("/categories"),
        axiosClient.get("/rooms"),
        axiosClient.get("/colors"),
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
      setRooms(roomRes.data);
      setColorLibrary(colorRes.data);
    } catch (error) {
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        title: product.title || "",
        slug: product.slug || "",
        price: product.price || "",
        description: product.description || "",
        stock: product.stock || "",
        category_id: product.category_id || "",
        thumbnail: product.thumbnail || "",
        is_new_arrival: !!product.is_new_arrival,
        material: product.material || "",
        width: product.width || "",
        depth: product.depth || "",
        height: product.height || "",
        weight: product.weight || "",
        sku: product.sku || "",
        care_instructions: product.care_instructions || "",
        room_ids:
          product.product_rooms?.map((pr) => pr.rooms?.id).filter((id) => id) ||
          [],
        color_ids:
          product.product_colors
            ?.map((pc) => pc.colors?.id)
            .filter((id) => id) || [],
        is_active: product.is_active !== undefined ? product.is_active : true,
      });
      setPreviewUrl(product.thumbnail || "");

      // Load additional images
      const existingImages =
        product.product_images?.map((img, idx) => ({
          id: `existing-${idx}`,
          url: img.image_url,
          file: null,
          isExisting: true,
        })) || [];
      setAdditionalImages(existingImages);
    } else {
      setEditingProduct(null);
      setFormData({
        title: "",
        slug: "",
        price: "",
        description: "",
        stock: "",
        category_id: categories[0]?.id || "",
        thumbnail: "",
        is_new_arrival: false,
        material: "",
        width: "",
        depth: "",
        height: "",
        weight: "",
        sku: "",
        care_instructions: "",
        room_ids: [],
        color_ids: [],
        is_active: true,
      });
      setPreviewUrl("");
      setAdditionalImages([]);
    }
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setSelectedFile(null);
    setPreviewUrl("");
    setAdditionalImages([]);
  };

  const calculateFengShui = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // 2. RGB → HSL
    const rNorm = r / 255,
      gNorm = g / 255,
      bNorm = b / 255;

    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);

    let h = 0,
      s = 0,
      l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case rNorm:
          h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
          break;
        case gNorm:
          h = (bNorm - rNorm) / d + 2;
          break;
        case bNorm:
          h = (rNorm - gNorm) / d + 4;
          break;
      }
      h /= 6;
    }

    h = h * 360;
    s = s * 100;
    l = l * 100;
    if (l < 12) return "Thủy";
    if (s < 10) {
      if (l > 85) return "Kim";
      return "Kim";
    }
    if ((h >= 0 && h < 25) || (h >= 330 && h <= 360)) return "Hỏa";
    if (h >= 290 && h < 330) return "Hỏa";
    if (h >= 25 && h < 50) return "Thổ";
    if (h >= 50 && h < 160) return "Mộc";
    if (h >= 160 && h < 260) return "Thủy";
    if (l < 40 && h < 50) return "Thổ";
    return "Thổ";
  };

  const handleCreateNewColor = async () => {
    const name = prompt("Nhập tên màu sắc mới (VD: Xanh Rêu):");
    if (!name) return;

    const hex = prompt("Nhập mã màu Hex (VD: #556B2F):", "#000000");
    if (!hex || !hex.startsWith("#")) {
      toast.error("Mã màu không hợp lệ");
      return;
    }

    const element = calculateFengShui(hex);
    const confirmElement = prompt(
      `Hệ thống nhận diện đây là mệnh: ${element}. Bạn có muốn đổi không? (Để trống nếu giữ nguyên):`,
      element,
    );

    try {
      const res = await axiosClient.post("/colors", {
        name,
        hex,
        element: confirmElement || element,
      });
      setColorLibrary([...colorLibrary, res.data]);
      setFormData({
        ...formData,
        color_ids: [...formData.color_ids, res.data.id],
      });
      toast.success("Đã thêm màu mới vào thư viện!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi tạo màu");
    }
  };

  // Drag & Drop handlers
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

  const handleAdditionalDragOver = (e) => {
    e.preventDefault();
    setIsDraggingAdditional(true);
  };

  const handleAdditionalDragLeave = () => {
    setIsDraggingAdditional(false);
  };

  const handleAdditionalDrop = (e) => {
    e.preventDefault();
    setIsDraggingAdditional(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const allImages = Array.from(files).every((file) =>
        file.type.startsWith("image/"),
      );
      if (allImages) {
        handleAdditionalFilesSelect(files);
      } else {
        toast.error("Một số file không phải là hình ảnh");
      }
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAdditionalFilesSelect = (files) => {
    if (!files || files.length === 0) return;

    const newImages = Array.from(files).map((file) => ({
      id: `new-${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(file),
      file: file,
      isExisting: false,
    }));

    setAdditionalImages((prev) => [...prev, ...newImages]);
  };

  const removeAdditionalImage = (id) => {
    setAdditionalImages((prev) => prev.filter((img) => img.id !== id));
  };

  const uploadImage = async (file) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { data, error } = await supabase.storage
      .from("products")
      .upload(filePath, file);

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from("products").getPublicUrl(filePath);

    return publicUrl;
  };

  const handleToggleActive = async (product) => {
    try {
      const newStatus = !product.is_active;
      await axiosClient.put(`/products/${product.id}`, {
        is_active: newStatus,
      });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, is_active: newStatus } : p,
        ),
      );
      toast.success(
        `Đã ${newStatus ? "cho phép" : "ẩn"} hiển thị sản phẩm: ${product.title}`,
      );
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBtnLoading(true);
    try {
      let finalThumbnailUrl = formData.thumbnail;

      if (selectedFile) {
        toast.info("Đang tải ảnh thumbnail...");
        finalThumbnailUrl = await uploadImage(selectedFile);
      }

      // Upload additional images
      toast.info("Đang xử lý các ảnh phụ...");
      const uploadPromises = additionalImages.map(async (img) => {
        if (img.isExisting) return img.url;
        return await uploadImage(img.file);
      });

      const imageUrls = await Promise.all(uploadPromises);

      const submissionData = {
        ...formData,
        thumbnail: finalThumbnailUrl,
        images: imageUrls,
      };

      if (editingProduct) {
        await axiosClient.put(`/products/${editingProduct.id}`, submissionData);
        toast.success("Cập nhật sản phẩm thành công");
      } else {
        await axiosClient.post("/products", submissionData);
        toast.success("Thêm sản phẩm mới thành công");
      }
      fetchData();
      handleCloseModal();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || "Đã xảy ra lỗi");
    } finally {
      setBtnLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa sản phẩm này? Thao tác không thể hoàn tác."))
      return;
    try {
      await axiosClient.delete(`/products/${id}`);
      toast.success("Đã xóa sản phẩm");
      fetchData();
    } catch (error) {
      toast.error("Lỗi khi xóa sản phẩm");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterCategory("");
    setFilterRoom("");
    setFilterStatus("");
    setFilterStock("");
    setSortOrder("newest");
  };

  const filteredProducts = products
    .filter((p) => {
      // 1. Lọc theo từ khóa tìm kiếm
      const matchesSearch =
        !searchTerm ||
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));

      // 2. Lọc theo danh mục (ép kiểu về string để so sánh ID)
      const matchesCategory =
        !filterCategory || String(p.category_id) === String(filterCategory);

      // 3. Lọc theo phòng
      const matchesRoom =
        !filterRoom ||
        p.product_rooms?.some(
          (pr) => String(pr.rooms?.id) === String(filterRoom),
        );

      // 4. Lọc theo trạng thái hiển thị
      const matchesStatus =
        !filterStatus ||
        (filterStatus === "active" ? p.is_active : !p.is_active);

      // 5. Lọc theo tình trạng kho
      const matchesStock =
        !filterStock ||
        (filterStock === "in_stock" ? p.stock > 0 : p.stock <= 0);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesRoom &&
        matchesStatus &&
        matchesStock
      );
    })
    .sort((a, b) => {
      switch (sortOrder) {
        case "price_high":
          return b.price - a.price;
        case "price_low":
          return a.price - b.price;
        case "stock_high":
          return b.stock - a.stock;
        case "stock_low":
          return a.stock - b.stock;
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at);
        case "newest":
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

  const formatPrice = (price) => `${Number(price).toLocaleString()} VND`;

  return (
    <div className="p-6 lg:p-10 font-sans max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Quản lý sản phẩm
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Tổng số:{" "}
            <span className="font-bold text-slate-900">{products.length}</span>{" "}
            sản phẩm trong kho
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#2b4c4f] text-white px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-[#1f383a] transition-all font-bold text-sm shadow-md">
          <Plus size={20} />
          Thêm sản phẩm mới
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-100 bg-slate-50/20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Search */}
            <div className="lg:col-span-4 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/5 transition-all"
              />
            </div>

            {/* Category */}
            <div className="lg:col-span-2 relative">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none appearance-none cursor-pointer">
                <option value="">Tất cả danh mục</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <Filter
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                size={14}
              />
            </div>

            {/* Room */}
            <div className="lg:col-span-2 relative">
              <select
                value={filterRoom}
                onChange={(e) => setFilterRoom(e.target.value)}
                className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none appearance-none cursor-pointer">
                <option value="">Tất cả phòng</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
              <LayoutGrid
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                size={14}
              />
            </div>

            {/* Status */}
            <div className="lg:col-span-2 relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none appearance-none cursor-pointer">
                <option value="">Trạng thái</option>
                <option value="active">Đang hiển thị</option>
                <option value="hidden">Đã ẩn</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-400 pointer-events-none" />
            </div>

            {/* Stock */}
            <div className="lg:col-span-2 relative">
              <select
                value={filterStock}
                onChange={(e) => setFilterStock(e.target.value)}
                className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none appearance-none cursor-pointer">
                <option value="">Tình trạng kho</option>
                <option value="in_stock">Còn hàng</option>
                <option value="out_of_stock">Hết hàng</option>
              </select>
              <Package
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                size={14}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <ArrowUpDown size={16} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Sắp xếp:
                </span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer">
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="price_high">Giá cao đến thấp</option>
                  <option value="price_low">Giá thấp đến cao</option>
                  <option value="stock_high">Kho (Nhiều đến ít)</option>
                  <option value="stock_low">Kho (Ít đến nhiều)</option>
                </select>
              </div>
            </div>

            {(searchTerm ||
              filterCategory ||
              filterRoom ||
              filterStatus ||
              filterStock) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-wider">
                <RotateCcw size={14} />
                Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                <th className="px-6 py-4">Sản phẩm</th>
                <th className="px-6 py-4">Danh mục</th>
                <th className="px-6 py-4">Giá bán</th>
                <th className="px-6 py-4">Kho</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="animate-spin text-[#2b4c4f]" />
                      <span className="text-slate-400 font-medium">
                        Đang đồng bộ dữ liệu...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-300">
                      <Package size={48} strokeWidth={1} />
                      <p>Không có sản phẩm nào phù hợp</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-lg bg-slate-50 border border-slate-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                          {p.thumbnail ? (
                            <img
                              src={p.thumbnail}
                              alt={p.title}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <ImageIcon className="text-slate-200" size={24} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate max-w-[200px]">
                            {p.title}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {p.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="px-2 py-1 bg-slate-100 rounded-full text-[10px] font-bold">
                        {categories.find((c) => c.id === p.category_id)?.name ||
                          "---"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {formatPrice(p.price)}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-600">
                      {p.stock}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        {/* Toggle hiển thị */}
                        <button
                          onClick={() => handleToggleActive(p)}
                          className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold transition-all w-fit shadow-sm border ${
                            p.is_active
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                              : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100"
                          }`}>
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${p.is_active ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`}
                          />
                          {p.is_active ? "ĐANG HIỂN THỊ" : "ĐÃ ẨN"}
                        </button>

                        {/* Status Stock */}
                        {p.stock > 0 ? (
                          <span className="text-[9px] text-slate-400 pl-1 uppercase">
                            Kho: {p.stock} sản phẩm
                          </span>
                        ) : (
                          <div className="flex items-center gap-1 text-red-500 text-[9px] font-bold pl-1 uppercase">
                            <AlertCircle size={9} />
                            HẾT HÀNG
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(p)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                          <Trash2 size={18} />
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

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-auto animate-in fade-in zoom-in duration-200 overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {editingProduct ? "Chỉnh sửa sản phẩm" : "Tạo sản phẩm mới"}
                </h3>
                <p className="text-xs text-slate-400">
                  Điền đầy đủ thông tin chi tiết cho sản phẩm
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 pb-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="group">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Tên sản phẩm <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-[#2b4c4f] focus:ring-1 focus:ring-[#2b4c4f] outline-none text-sm font-medium transition-all"
                      placeholder="VD: Ghế bọc vải cao cấp"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Giá bán (VND) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-[#2b4c4f] focus:ring-1 focus:ring-[#2b4c4f] outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Mã SKU{" "}
                        <span className="text-slate-400 font-normal">
                          (Tùy chọn)
                        </span>
                      </label>
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) =>
                          setFormData({ ...formData, sku: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-[#2b4c4f] focus:ring-1 focus:ring-[#2b4c4f] outline-none text-sm"
                        placeholder="VD: FURN-001"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Số lượng kho <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.stock}
                        onChange={(e) =>
                          setFormData({ ...formData, stock: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-[#2b4c4f] focus:ring-1 focus:ring-[#2b4c4f] outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Danh mục <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.category_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category_id: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-[#2b4c4f] outline-none text-sm bg-white">
                      <option value="">Chọn danh mục</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                      Mua sắm theo phòng (Chọn nhiều){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 max-h-[200px] overflow-y-auto scrollbar-hide">
                      {rooms.map((room) => (
                        <label
                          key={room.id}
                          className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-primary transition-all group">
                          <input
                            type="checkbox"
                            checked={formData.room_ids.includes(room.id)}
                            onChange={(e) => {
                              const newRooms = e.target.checked
                                ? [...formData.room_ids, room.id]
                                : formData.room_ids.filter(
                                    (id) => id !== room.id,
                                  );
                              setFormData({ ...formData, room_ids: newRooms });
                            }}
                            className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                          />
                          <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 truncate">
                            {room.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Mô tả sản phẩm
                    </label>
                    <textarea
                      rows="4"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-[#2b4c4f] outline-none text-sm"
                      placeholder="Mô tả ngắn gọn về sản phẩm..."
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Hình ảnh sản phẩm (Thumbnail)
                    </label>
                    <div
                      className={`relative group border-2 border-dashed rounded-xl p-6 transition-all duration-200 flex flex-col items-center justify-center gap-3 overflow-hidden
                        ${isDragging ? "border-[#2b4c4f] bg-[#2b4c4f]/5" : "border-slate-200 hover:border-slate-300 bg-slate-50/30"}
                        ${previewUrl ? "aspect-square max-h-[250px] mx-auto" : "h-40"}
                      `}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}>
                      {previewUrl ? (
                        <>
                          <img
                            src={previewUrl}
                            alt="Thumbnail Preview"
                            className="absolute inset-0 w-full h-full object-contain p-2"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedFile(null);
                                setPreviewUrl("");
                                setFormData({ ...formData, thumbnail: "" });
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
                            onChange={(e) =>
                              handleFileSelect(e.target.files[0])
                            }
                          />
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Thông tin ảnh phụ (Bộ sưu tập)
                    </label>
                    <div
                      className={`grid grid-cols-4 gap-3 mb-4 p-4 border-2 border-dashed rounded-xl transition-all ${
                        isDraggingAdditional
                          ? "border-[#2b4c4f] bg-[#2b4c4f]/5"
                          : "border-transparent"
                      }`}
                      onDragOver={handleAdditionalDragOver}
                      onDragLeave={handleAdditionalDragLeave}
                      onDrop={handleAdditionalDrop}>
                      {additionalImages.map((img) => (
                        <div
                          key={img.id}
                          className="relative aspect-square rounded-lg bg-slate-50 border border-slate-100 overflow-hidden group">
                          <img
                            src={img.url}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeAdditionalImage(img.id)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                      <label className="aspect-square rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-[#2b4c4f] hover:bg-slate-50 transition-all">
                        <Plus size={20} className="text-slate-400" />
                        <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase">
                          Thêm ảnh
                        </span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleAdditionalFilesSelect(e.target.files)
                          }
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Kích thước (R x S x C)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="R"
                          value={formData.width}
                          onChange={(e) =>
                            setFormData({ ...formData, width: e.target.value })
                          }
                          className="w-full px-2 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#2b4c4f]"
                        />
                        <input
                          type="text"
                          placeholder="S"
                          value={formData.depth}
                          onChange={(e) =>
                            setFormData({ ...formData, depth: e.target.value })
                          }
                          className="w-full px-2 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#2b4c4f]"
                        />
                        <input
                          type="text"
                          placeholder="C"
                          value={formData.height}
                          onChange={(e) =>
                            setFormData({ ...formData, height: e.target.value })
                          }
                          className="w-full px-2 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#2b4c4f]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Vật liệu
                      </label>
                      <input
                        type="text"
                        value={formData.material}
                        onChange={(e) =>
                          setFormData({ ...formData, material: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#2b4c4f]"
                        placeholder="VD: Gỗ Sồi"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Danh sách màu sắc (Chọn từ thư viện)
                      </label>
                      <button
                        type="button"
                        onClick={handleCreateNewColor}
                        className="text-[10px] font-bold text-[#2b4c4f] hover:underline flex items-center gap-1 uppercase">
                        <Plus size={12} /> Thêm màu mới vào thư viện
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-[250px] overflow-y-auto pr-2 scrollbar-hide py-1">
                      {colorLibrary.map((color) => {
                        const isSelected = formData.color_ids.includes(
                          color.id,
                        );
                        return (
                          <div
                            key={color.id}
                            onClick={() => {
                              const newIds = isSelected
                                ? formData.color_ids.filter(
                                    (id) => id !== color.id,
                                  )
                                : [...formData.color_ids, color.id];
                              setFormData({ ...formData, color_ids: newIds });
                            }}
                            className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? "border-[#2b4c4f] bg-[#2b4c4f]/5 ring-1 ring-[#2b4c4f]"
                                : "border-slate-100 bg-white hover:border-slate-300"
                            }`}>
                            <div
                              className="w-5 h-5 rounded-full border border-slate-200"
                              style={{ backgroundColor: color.hex }}
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="text-[11px] font-bold text-slate-700 truncate">
                                {color.name}
                              </span>
                              <span
                                className={`text-[9px] font-medium ${
                                  color.element === "Kim"
                                    ? "text-slate-400"
                                    : color.element === "Mộc"
                                      ? "text-green-500"
                                      : color.element === "Thủy"
                                        ? "text-blue-500"
                                        : color.element === "Hỏa"
                                          ? "text-red-500"
                                          : "text-amber-600"
                                }`}>
                                Mệnh {color.element}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {colorLibrary.length === 0 && (
                      <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-xl text-slate-400 text-[11px]">
                        Thư viện màu trống. Vui lòng thêm màu mới.
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <input
                        id="is-active"
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            is_active: e.target.checked,
                          })
                        }
                        className="w-5 h-5 text-[#2b4c4f] border-slate-300 rounded focus:ring-[#2b4c4f]"
                      />
                      <label
                        htmlFor="is-active"
                        className="text-sm font-bold text-slate-700 cursor-pointer">
                        Cho phép hiển thị lên trang web
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        id="new-arrival"
                        type="checkbox"
                        checked={formData.is_new_arrival}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            is_new_arrival: e.target.checked,
                          })
                        }
                        className="w-5 h-5 text-[#2b4c4f] border-slate-300 rounded focus:ring-[#2b4c4f]"
                      />
                      <label
                        htmlFor="new-arrival"
                        className="text-sm font-bold text-slate-700 cursor-pointer">
                        Sản phẩm mới về (New Arrival)
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Hướng dẫn bảo quản
                    </label>
                    <textarea
                      rows="3"
                      value={formData.care_instructions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          care_instructions: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-[#2b4c4f] outline-none text-sm"
                      placeholder="Lau khô sau khi sử dụng..."
                    />
                  </div>
                </div>
              </div>

              <div className="mt-12 flex items-center justify-end gap-4 border-t border-slate-100 pt-8">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-8 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
                  HỦY BỎ
                </button>
                <button
                  type="submit"
                  disabled={btnLoading}
                  className="px-10 py-3 bg-[#2b4c4f] text-white rounded-xl text-sm font-bold hover:bg-[#1f383a] transition-all flex items-center gap-3 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-70">
                  {btnLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Plus size={18} />
                  )}
                  {editingProduct ? "CẬP NHẬT SẢN PHẨM" : "ĐĂNG BÁN SẢN PHẨM"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
