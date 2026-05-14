import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, LayoutGrid } from "lucide-react";
import { axiosClient } from "../../utils/axiosClient";

export const CollectionsPage = () => {
  const [styles, setStyles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStyles = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get("/styles");
        setStyles(res.data);
      } catch (error) {
        console.error("Lỗi lấy danh sách phong cách:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStyles();
  }, []);

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Breadcrumbs */}
      <div className="bg-slate-50/50 py-4 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link to="/" className="hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 font-semibold">Bộ sưu tập phong cách</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Khám phá theo <span className="text-primary italic">Phong cách</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Mỗi bộ sưu tập là một câu chuyện về không gian sống. Từ sự tối giản tinh tế đến vẻ đẹp cổ điển sang trọng, hãy tìm thấy phong cách phản ánh cá tính của bạn.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-medium">Đang tải các bộ sưu tập...</p>
          </div>
        ) : styles.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <LayoutGrid size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium text-lg">Hiện tại chưa có bộ sưu tập nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {styles.map((style) => (
              <Link
                key={style.id}
                to={`/style/${style.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl bg-slate-100 aspect-[4/5] shadow-sm hover:shadow-2xl transition-all duration-500"
              >
                <img
                  src={style.image_url || "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800"}
                  alt={style.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
                
                <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                  <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-2 block">
                      Bộ sưu tập
                    </span>
                    <h2 className="text-3xl font-bold mb-3 tracking-tight">
                      {style.name}
                    </h2>
                    <div className="h-0.5 w-12 bg-primary group-hover:w-full transition-all duration-500 origin-left mb-4"></div>
                    <p className="text-sm text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity duration-500 line-clamp-2">
                      Khám phá những sản phẩm nội thất được tuyển chọn kỹ lưỡng theo phong cách {style.name}.
                    </p>
                  </div>
                </div>
                
                <div className="absolute top-6 right-6 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 rotate-45 group-hover:rotate-0">
                  <ChevronRight size={24} className="text-white" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
