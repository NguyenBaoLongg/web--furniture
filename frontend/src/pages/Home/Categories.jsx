import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { axiosClient } from "../../utils/axiosClient";
import { CategoryCard } from "../../components/ui/CategoryCard";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

export const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = React.useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth : clientWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosClient.get("/categories/featured");
        setCategories(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Mua sắm theo Danh mục
          </h2>
          <p className="text-slate-500">
            Khám phá các nhóm sản phẩm đa dạng cho ngôi nhà
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="relative group/slider">
          {/* Navigation Buttons */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/80 backdrop-blur-md border border-slate-200 text-slate-800 shadow-xl opacity-0 group-hover/slider:opacity-100 transition-all hover:bg-primary hover:text-white hover:border-primary hidden sm:flex items-center justify-center translate-x-[-10px] group-hover/slider:translate-x-0"
            title="Trượt sang trái">
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={() => scroll("right")}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/80 backdrop-blur-md border border-slate-200 text-slate-800 shadow-xl opacity-0 group-hover/slider:opacity-100 transition-all hover:bg-primary hover:text-white hover:border-primary hidden sm:flex items-center justify-center translate-x-[10px] group-hover/slider:translate-x-0"
            title="Trượt sang phải">
            <ChevronRight size={24} />
          </button>

          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-6 pb-4 scroll-smooth snap-x snap-mandatory scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="min-w-[70%] sm:min-w-[45%] lg:min-w-[calc(25%-18px)] snap-start">
                <CategoryCard
                  slug={cat.slug}
                  title={cat.name}
                  image={cat.image_url}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
