import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Send,
  Loader2,
  Info,
  ChevronLeft,
  ChevronRight,
  Search,
  MessageSquare,
} from "lucide-react";
import { ProductCard } from "../../components/ui/ProductCard";

export const AISearch = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const resultRef = useRef(null);
  const scrollRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data);
        setTimeout(() => {
          resultRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      } else {
        setError(data.message || "Có lỗi xảy ra, vui lòng thử lại.");
      }
    } catch (err) {
      setError(
        "Không thể kết nối đến máy chủ AI. Vui lòng đảm bảo Ollama đang chạy.",
      );
    } finally {
      setLoading(false);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === "right" ? clientWidth : -clientWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const suggestions = [
    "Sofa da hiện đại dưới 15 triệu",
    "Bàn ăn gỗ cho phòng nhỏ",
    "Giường ngủ phong cách tối giản",
    "Kệ tivi gỗ sồi giá rẻ",
  ];

  return (
    <section className="py-20 bg-slate-50 border-b border-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight max-w-3xl">
            Bạn đang tìm kiếm{" "}
            <span className="text-indigo-600 italic font-light">
              món đồ gì?
            </span>
          </motion.h2>
        </div>

        <div className="max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative">
            <form onSubmit={handleSubmit} className="relative group">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                <MessageSquare size={20} />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ví dụ: Tôi muốn sofa đẹp cho phòng khách nhỏ dưới 10 triệu..."
                className="w-full pl-14 pr-32 py-6 bg-white border-2 border-slate-100 rounded-[2rem] shadow-xl shadow-slate-200/50 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none text-slate-700 text-lg"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="absolute right-3 top-3 bottom-3 px-8 bg-indigo-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span className="hidden sm:inline">Tìm ngay</span>
                    <Send size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(s)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:border-indigo-600 hover:text-indigo-600 hover:shadow-md transition-all active:scale-95">
                  {s}
                </button>
              ))}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium">
                <Info size={18} />
                {error}
              </motion.div>
            )}
          </motion.div>
        </div>

        <div ref={resultRef} className="relative">
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                key="ai-result-content"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
                  <div className="flex flex-col gap-1">
                    <h4 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                      <Search size={24} className="text-indigo-600" />
                      Kết quả tìm kiếm thông minh
                    </h4>
                    <p className="text-slate-500 text-sm">
                      Chúng tôi đã tìm thấy {result.products.length} sản phẩm
                      phù hợp với yêu cầu của bạn.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {result.filters.category && (
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-100">
                        Danh mục: {result.filters.category}
                      </span>
                    )}
                    {result.filters.room && (
                      <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-lg text-xs font-semibold border border-teal-100">
                        Phòng: {result.filters.room}
                      </span>
                    )}
                    {result.filters.min_price && (
                      <span className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-semibold border border-green-100">
                        Trên:{" "}
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(result.filters.min_price)}
                      </span>
                    )}
                    {result.filters.max_price && (
                      <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold border border-amber-100">
                        Dưới:{" "}
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(result.filters.max_price)}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => scroll("left")}
                      className="p-3 rounded-full border border-slate-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm">
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => scroll("right")}
                      className="p-3 rounded-full border border-slate-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>

                <div
                  ref={scrollRef}
                  className="flex overflow-x-auto gap-6 md:gap-8 pb-8 px-4 snap-x snap-mandatory scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {result.products.map((product) => (
                    <div
                      key={product.id}
                      className="min-w-[100%] max-w-[100%] sm:min-w-[calc(50%-12px)] sm:max-w-[calc(50%-12px)] lg:min-w-[calc(25%-24px)] lg:max-w-[calc(25%-24px)] snap-start flex-none">
                      <ProductCard
                        id={product.id}
                        title={product.title}
                        price={product.price}
                        image={
                          product.thumbnail ||
                          product.product_images?.[0]?.image_url
                        }
                        slug={product.slug}
                        rating={product.rating}
                        review_count={product.review_count}
                        padding="p-4"
                      />
                    </div>
                  ))}
                  {result.products.length === 0 && (
                    <div className="w-full py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center px-6">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                        <Search size={32} />
                      </div>
                      <h5 className="text-xl font-bold text-slate-900 mb-2">
                        Không tìm thấy sản phẩm nào
                      </h5>
                      <p className="text-slate-500 max-w-md">
                        Rất tiếc, AI không tìm thấy sản phẩm nào khớp hoàn toàn
                        với yêu cầu của bạn. Hãy thử thay đổi mô tả hoặc tìm
                        kiếm theo danh mục.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
