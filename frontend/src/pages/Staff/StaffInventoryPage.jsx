import React, { useState, useEffect } from "react";
import {
  Search,
  Box,
  AlertTriangle,
  CheckCircle,
  ArrowUpDown,
  Filter,
  Download,
  Info,
} from "lucide-react";
import axios from "axios";

export const StaffInventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "stock",
    direction: "asc",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      setProducts(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi lấy danh sách sản phẩm:", error);
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredProducts = products
    .filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterType === "all"
          ? true
          : filterType === "low"
            ? p.stock > 0 && p.stock < 10
            : filterType === "out"
              ? p.stock <= 0
              : true;

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

  const stats = {
    total: products.length,
    lowStock: products.filter((p) => p.stock > 0 && p.stock < 10).length,
    outOfStock: products.filter((p) => p.stock <= 0).length,
  };

  return (
    <div className="p-8 bg-[#fafafa] min-h-full font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Kiểm tra kho hàng
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Theo dõi và quản lý hàng tồn kho của bạn
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            <Download size={18} />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Box size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Tổng sản phẩm
            </p>
            <p className="text-3xl font-black text-slate-900">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
            <AlertTriangle size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Sắp hết hàng
            </p>
            <p className="text-3xl font-black text-orange-600">
              {stats.lowStock}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
            <AlertTriangle size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Hết hàng
            </p>
            <p className="text-3xl font-black text-red-600">
              {stats.outOfStock}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm sản phẩm theo tên hoặc SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#2b4c4f] transition-all"
              />
            </div>
            <div className="flex bg-slate-50 p-1 rounded-2xl">
              {[
                { id: "all", label: "Tất cả", icon: Box },
                { id: "low", label: "Sắp hết", icon: AlertTriangle },
                { id: "out", label: "Hết hàng", icon: AlertTriangle },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setFilterType(t.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    filterType === t.id
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-400 hover:text-slate-600"
                  }`}>
                  <t.icon size={14} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Sản phẩm
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  SKU
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Danh mục
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Giá
                </th>
                <th
                  className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-600 transition-colors"
                  onClick={() => handleSort("stock")}>
                  <div className="flex items-center gap-2">
                    Số lượng tồn
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-slate-100 border-t-[#2b4c4f] rounded-full animate-spin"></div>
                      <p className="text-sm font-bold text-slate-400">
                        Đang tải dữ liệu kho...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                        <Search size={32} />
                      </div>
                      <p className="text-slate-400 font-bold">
                        Không tìm thấy sản phẩm nào
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isLow = product.stock > 0 && product.stock < 10;
                  const isOut = product.stock <= 0;

                  return (
                    <tr
                      key={product.id}
                      className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <img
                            src={product.thumbnail}
                            alt={product.title}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-100 group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-900">
                              {product.title}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                              {product.material}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-xs font-bold text-slate-600 font-mono bg-slate-100 px-2 py-1 rounded-lg">
                          {product.sku || "N/A"}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-slate-600">
                        {product.categories?.name}
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm font-black text-slate-900">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(product.price)}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div
                          className={`text-sm font-black flex items-center gap-2 ${
                            isOut
                              ? "text-red-600"
                              : isLow
                                ? "text-orange-600"
                                : "text-green-600"
                          }`}>
                          {product.stock}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        {isOut ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-red-100">
                            Hết hàng
                          </div>
                        ) : isLow ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-orange-100">
                            Sắp hết
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-green-100">
                            Còn hàng
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Hint */}
        <div className="p-6 bg-slate-50/30 border-t border-slate-50 flex items-center gap-3">
          <Info className="text-[#2b4c4f] w-4 h-4" />
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest italic">
            * Nhấn vào cột "Số lượng tồn" để sắp xếp theo mức độ ưu tiên nhập
            hàng.
          </p>
        </div>
      </div>
    </div>
  );
};
