import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { axiosClient } from "../../utils/axiosClient";
import { ProductCard } from "../../components/ui/ProductCard";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

export const NewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const response = await axiosClient.get("/products/new-arrivals");
        setProducts(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchNewArrivals();
  }, []);

  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (products.length <= 4 || !isAutoPlaying) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollRef.current.scrollBy({ left: clientWidth, behavior: "smooth" });
        }
      }
    }, 7000);

    return () => clearInterval(interval);
  }, [products, isAutoPlaying]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      setIsAutoPlaying(false);
      const { clientWidth, scrollLeft, scrollWidth } = scrollRef.current;

      if (direction === "right") {
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollRef.current.scrollBy({ left: clientWidth, behavior: "smooth" });
        }
      } else {
        if (scrollLeft <= 0) {
          scrollRef.current.scrollTo({ left: scrollWidth, behavior: "smooth" });
        } else {
          scrollRef.current.scrollBy({
            left: -clientWidth,
            behavior: "smooth",
          });
        }
      }
      setTimeout(() => setIsAutoPlaying(true), 10000);
    }
  };

  return (
    <section className="bg-white py-20 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">
            Sản phẩm mới
          </h2>
          <Link
            to="/products"
            className="text-sm font-semibold text-slate-500 hover:text-primary transition-colors flex items-center gap-1">
            Xem tất cả <span className="text-lg">›</span>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="relative group/slider">
            <button
              onClick={() => scroll("left")}
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full bg-white backdrop-blur-md border border-slate-200 text-slate-800 shadow-2xl opacity-0 group-hover/slider:opacity-100 transition-all hover:bg-primary hover:text-white hover:border-primary hidden sm:flex items-center justify-center translate-x-4 group-hover/slider:translate-x-0"
              title="Trượt sang trái">
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={() => scroll("right")}
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full bg-white backdrop-blur-md border border-slate-200 text-slate-800 shadow-2xl opacity-0 group-hover/slider:opacity-100 transition-all hover:bg-primary hover:text-white hover:border-primary hidden sm:flex items-center justify-center translate-x-[-4px] group-hover/slider:translate-x-0"
              title="Trượt sang phải">
              <ChevronRight size={24} />
            </button>

            <div
              ref={scrollRef}
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
              className="flex overflow-x-auto gap-6 md:gap-8 pb-4 snap-x snap-mandatory scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="min-w-[100%] sm:min-w-[calc(50%-12px)] lg:min-w-[calc(25%-24px)] snap-start">
                  <ProductCard
                    id={product.id}
                    slug={product.slug}
                    title={product.title}
                    price={product.price}
                    image={product.thumbnail}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
