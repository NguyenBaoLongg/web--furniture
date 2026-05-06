import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Calendar, ArrowRight, Loader2, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "../../components/ui/ProductCard";

export const FengShuiConsultant = () => {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const resultRef = useRef(null);
  const scrollRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!day || !month || !year) return;

    // Ghép lại thành chuỗi DD/MM/YYYY để gửi cho AI
    const birthDateStr = `${day}/${month}/${year}`;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("http://localhost:5000/api/fengshui/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthDate: birthDateStr }),
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data);
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
      } else {
        setError(data.message || "Có lỗi xảy ra, vui lòng thử lại.");
      }
    } catch (err) {
      setError("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối.");
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

  const elementColors = {
    Kim: "from-slate-100 to-yellow-100 border-yellow-200 text-slate-800",
    Mộc: "from-emerald-50 to-green-100 border-green-200 text-emerald-900",
    Thủy: "from-blue-50 to-indigo-100 border-indigo-200 text-blue-900",
    Hỏa: "from-orange-50 to-red-100 border-red-200 text-orange-900",
    Thổ: "from-amber-50 to-yellow-100 border-yellow-200 text-amber-900",
  };

  const elementIcons = {
    Kim: "✨",
    Mộc: "🌿",
    Thủy: "🌊",
    Hỏa: "🔥",
    Thổ: "🏔️",
  };

  return (
    <section className="py-16 bg-white border-b border-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header & Form Section - Horizontal Layout */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-10">
          <div className="lg:max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6"
            >
              <Sparkles size={14} />
              <span>Cá nhân hóa không gian</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight"
            >
              Tìm Kiếm Nội Thất <br />
              <span className="text-primary italic font-light">Hợp Phong Thủy</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-slate-600 leading-relaxed"
            >
              Nhập ngày sinh của bạn để AI phân tích cung mệnh và gợi ý những món đồ nội thất mang lại năng lượng tích cực cho ngôi nhà của bạn.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-full lg:max-w-md bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-sm"
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-3">
                {/* Ngày */}
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="Ngày"
                    value={day}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      if (val === "" || (Number(val) >= 1 && Number(val) <= 31)) {
                        setDay(val);
                      }
                    }}
                    autoComplete="new-password"
                    className="w-full px-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-slate-700"
                  />
                </div>
                {/* Tháng */}
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="Tháng"
                    value={month}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      if (val === "" || (Number(val) >= 1 && Number(val) <= 12)) {
                        setMonth(val);
                      }
                    }}
                    autoComplete="new-password"
                    className="w-full px-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-slate-700"
                  />
                </div>
                {/* Năm */}
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="Năm"
                    value={year}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      if (val === "" || val.length <= 4) {
                        setYear(val);
                      }
                    }}
                    autoComplete="new-password"
                    className="w-full px-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-slate-700"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>Phân tích cung mệnh</>
                )}
              </button>
            </form>
            {error && (
              <p className="mt-4 text-sm text-red-500 flex items-center gap-2 font-medium">
                <Info size={14} /> {error}
              </p>
            )}
          </motion.div>
        </div>

        {/* Result & Products Section */}
        <div ref={resultRef} className="relative">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result-content"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10"
              >
                {/* Result Card - Horizontal */}
                <div className={`p-8 md:p-12 rounded-[2.5rem] border bg-gradient-to-r ${elementColors[result.consultation.element]} flex flex-col md:flex-row gap-10 items-center shadow-xl shadow-slate-200/50`}>
                  <div className="flex-shrink-0 w-32 h-32 md:w-48 md:h-48 rounded-full bg-white/50 backdrop-blur-xl border border-white flex items-center justify-center text-6xl md:text-8xl shadow-inner">
                    {elementIcons[result.consultation.element]}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
                      <h3 className="text-5xl md:text-7xl font-black tracking-tighter uppercase">
                        Mệnh {result.consultation.element}
                      </h3>
                      <div className="flex flex-wrap justify-center md:justify-start gap-2 pb-1">
                        {result.consultation.luckyColors.map((colorObj, idx) => (
                          <span key={idx} className="flex items-center gap-2 px-4 py-1.5 bg-white/40 backdrop-blur-md rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-white/20">
                            <span 
                              className="w-3 h-3 rounded-full border border-white/40 shadow-sm" 
                              style={{ backgroundColor: colorObj.hex }}
                            />
                            {colorObj.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xl md:text-2xl font-medium leading-relaxed opacity-90 max-w-3xl">
                      "{result.consultation.advice}"
                    </p>
                  </div>
                </div>

                {/* Product Slider - New Arrival Style */}
                <div className="space-y-8">
                  <div className="flex items-center justify-between px-4">
                    <h4 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Gợi ý riêng cho bạn</h4>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => scroll("left")}
                        className="p-3 rounded-full border border-slate-200 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button 
                        onClick={() => scroll("right")}
                        className="p-3 rounded-full border border-slate-200 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>

                  <div 
                    ref={scrollRef}
                    className="flex overflow-x-auto gap-6 md:gap-8 pb-4 snap-x snap-mandatory scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {result.suggestedProducts.map((product) => (
                      <div key={product.id} className="min-w-[100%] max-w-[100%] sm:min-w-[calc(50%-12px)] sm:max-w-[calc(50%-12px)] lg:min-w-[calc(25%-24px)] lg:max-w-[calc(25%-24px)] snap-start flex-none">
                        <ProductCard
                          id={product.id}
                          title={product.title}
                          price={product.price}
                          image={product.thumbnail || (product.product_images?.[0]?.image_url)}
                          slug={product.slug}
                          padding="p-4"
                        />
                      </div>
                    ))}
                    {result.suggestedProducts.length === 0 && (
                        <div className="w-full py-12 text-center text-slate-400 italic">
                            Chưa tìm thấy sản phẩm phù hợp hoàn toàn với mệnh này. Hãy khám phá các bộ sưu tập khác nhé!
                        </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : loading ? (
              <motion.div
                key="loading-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <div className="relative w-20 h-20 mb-6">
                  <Loader2 className="w-20 h-20 animate-spin text-primary opacity-20" />
                  <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                </div>
                <p className="text-lg text-slate-500 font-medium animate-pulse">AI đang phân tích cung mệnh của bạn...</p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </section>
  );
};
