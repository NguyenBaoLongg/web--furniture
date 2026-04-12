import React, { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronRight, SlidersHorizontal, Star } from "lucide-react";
import { axiosClient } from "../../utils/axiosClient";
import { ProductCard } from "../../components/ui/ProductCard.jsx";

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [activeSort, setActiveSort] = useState("Phổ biến");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [maxPrice, setMaxPrice] = useState(100000000);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [minRating, setMinRating] = useState(0);

  const formatVND = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          axiosClient.get(`/products?activeOnly=true${searchQuery ? `&search=${searchQuery}` : ""}`),
          axiosClient.get("/categories"),
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data);
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchQuery]);

  // TỰ ĐỘNG LẤY DANH SÁCH MÀU SẮC VÀ CHẤT LIỆU TỪ DATABASE
  const availableColors = useMemo(() => {
    const colors = new Set();
    products.forEach((p) => {
      if (p.colors && Array.isArray(p.colors)) {
        p.colors.forEach((c) => {
          if (c.hex) colors.add(c.hex.toLowerCase());
        });
      }
    });
    return Array.from(colors);
  }, [products]);

  const availableMaterials = useMemo(() => {
    const materials = new Set();
    products.forEach((p) => {
      if (p.material) materials.add(p.material);
    });
    return Array.from(materials);
  }, [products]);

  const toggleCategory = (id) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleMaterial = (mat) => {
    setSelectedMaterials((prev) =>
      prev.includes(mat) ? prev.filter((item) => item !== mat) : [...prev, mat],
    );
  };

  const toggleColor = (color) => {
    setSelectedColors((prev) =>
      prev.includes(color)
        ? prev.filter((item) => item !== color)
        : [...prev, color],
    );
  };

  const clearFilters = () => {
    setSelectedCategoryIds([]);
    setMaxPrice(100000000);
    setSelectedMaterials([]);
    setSelectedColors([]);
    setMinRating(0);
    setActiveSort("Phổ biến");
  };

  const displayedProducts = products
    .filter((product) => {
      const matchCategory =
        selectedCategoryIds.length === 0 ||
        selectedCategoryIds.includes(product.category_id);
      const matchPrice = Number(product.price || 0) <= maxPrice;
      const matchMaterial =
        selectedMaterials.length === 0 ||
        (product.material && selectedMaterials.includes(product.material));

      const matchColor =
        selectedColors.length === 0 ||
        (product.colors &&
          Array.isArray(product.colors) &&
          product.colors.some(
            (c) => c.hex && selectedColors.includes(c.hex.toLowerCase()),
          ));

      const matchRating = Number(product.rating || 0) >= minRating;

      return (
        matchCategory &&
        matchPrice &&
        matchMaterial &&
        matchColor &&
        matchRating
      );
    })
    .sort((a, b) => {
      if (activeSort === "Tăng dần")
        return Number(a.price || 0) - Number(b.price || 0);
      if (activeSort === "Giảm dần")
        return Number(b.price || 0) - Number(a.price || 0);
      return 0;
    });

  return (
    <div className="bg-[#fcfcfc] min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {searchQuery && (
          <div className="mb-6 p-4 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
            <h2 className="text-lg font-medium text-slate-800">
              Kết quả tìm kiếm cho: <span className="font-bold text-primary">"{searchQuery}"</span>
            </h2>
            <span className="text-sm text-slate-400">
              Tìm thấy <span className="font-bold text-slate-600">{displayedProducts.length}</span> sản phẩm
            </span>
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center text-sm text-slate-500 gap-2">
            <Link to="/" className="hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900 font-medium">Tất cả sản phẩm</span>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 shadow-sm">
              <SlidersHorizontal className="w-4 h-4" />
              Bộ lọc
            </button>

            <div className="hidden sm:flex items-center gap-3">
              <span className="text-sm text-slate-500">Sắp xếp theo:</span>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                {["Phổ biến", "Tăng dần", "Giảm dần"].map((item) => (
                  <button
                    key={item}
                    onClick={() => setActiveSort(item)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                      activeSort === item
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }`}>
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside
            className={`w-full lg:w-[280px] flex-shrink-0 ${showMobileFilters ? "block" : "hidden lg:block"}`}>
            <div className="bg-white rounded-2xl border border-slate-100 p-6 sticky top-28 shadow-sm">
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                <h3 className="font-bold text-slate-900 text-lg">
                  Bộ lọc nâng cao
                </h3>
                <button
                  onClick={clearFilters}
                  className="text-xs font-semibold text-slate-500 hover:text-red-500 transition-colors">
                  Xóa tất cả
                </button>
              </div>

              <div className="mb-8">
                <h4 className="text-[13px] uppercase tracking-wider font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-1 h-3.5 bg-primary rounded-full"></span>
                  Danh mục
                </h4>
                <div className="space-y-3">
                  {categories.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={selectedCategoryIds.includes(cat.id)}
                        onChange={() => toggleCategory(cat.id)}
                      />
                      <div
                        className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors ${selectedCategoryIds.includes(cat.id) ? "bg-primary border-primary" : "border-slate-300 group-hover:border-primary"}`}>
                        {selectedCategoryIds.includes(cat.id) && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <span
                        className={`ml-3 text-sm transition-colors ${selectedCategoryIds.includes(cat.id) ? "text-slate-900 font-semibold" : "text-slate-600 group-hover:text-slate-900"}`}>
                        {cat.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-[13px] uppercase tracking-wider font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-1 h-3.5 bg-primary rounded-full"></span>
                  Khoảng giá
                </h4>
                <input
                  type="range"
                  className="w-full accent-primary h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  min="0"
                  max="100000000"
                  step="500000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                />
                <div className="flex justify-between mt-3 text-xs text-slate-500 font-medium">
                  <span>0đ</span>
                  <span className="text-slate-900 font-bold bg-slate-100 px-2 py-1 rounded">
                    {formatVND(maxPrice)}
                  </span>
                </div>
              </div>

              {availableMaterials.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-[13px] uppercase tracking-wider font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-1 h-3.5 bg-primary rounded-full"></span>
                    Chất liệu
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {availableMaterials.map((mat) => (
                      <button
                        key={mat}
                        onClick={() => toggleMaterial(mat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                          selectedMaterials.includes(mat)
                            ? "bg-[#2b4c4f] text-white border-[#2b4c4f]"
                            : "bg-white text-slate-600 border-slate-200 hover:border-[#2b4c4f] hover:text-[#2b4c4f]"
                        }`}>
                        {mat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {availableColors.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-[13px] uppercase tracking-wider font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-1 h-3.5 bg-primary rounded-full"></span>
                    Màu sắc
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {availableColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => toggleColor(color)}
                        style={{ backgroundColor: color }}
                        className={`w-6 h-6 rounded-full border border-slate-200 shadow-sm transition-all ${
                          selectedColors.includes(color)
                            ? "ring-2 ring-primary ring-offset-2 scale-110"
                            : "hover:scale-110"
                        }`}
                        title={color}></button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-[13px] uppercase tracking-wider font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-1 h-3.5 bg-primary rounded-full"></span>
                  Đánh giá
                </h4>
                <div className="space-y-2">
                  {[5, 4, 3].map((rating) => (
                    <label
                      key={rating}
                      className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="rating"
                        className="hidden"
                        checked={minRating === rating}
                        onChange={() => setMinRating(rating)}
                      />
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${minRating === rating ? "border-primary" : "border-slate-300"}`}>
                        {minRating === rating && (
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                        )}
                      </div>
                      <div className="flex text-amber-400 ml-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < rating ? "fill-current" : "text-slate-300 fill-slate-100"}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-slate-500 ml-2 group-hover:text-primary transition-colors">
                        & trở lên
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <main className="flex-1">
            {loading ? (
              <div className="mt-16 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-slate-100 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-sm text-slate-400 font-medium">
                  Đang tải sản phẩm...
                </p>
              </div>
            ) : displayedProducts.length === 0 ? (
              <div className="text-center mt-20 bg-white p-10 rounded-2xl border border-slate-100">
                <p className="text-slate-500 font-medium text-lg">
                  Không tìm thấy sản phẩm nào phù hợp với tiêu chí của bạn.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-6 px-6 py-2.5 bg-[#2b4c4f] text-white text-sm font-bold rounded-lg hover:bg-[#1f383a] transition-colors">
                  Xóa tất cả bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {displayedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    price={product.price}
                    image={
                      product.thumbnail ||
                      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800"
                    }
                    slug={product.slug}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
