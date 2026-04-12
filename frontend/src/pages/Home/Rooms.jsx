import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { axiosClient } from "../../utils/axiosClient";
import { RoomCard } from "../../components/ui/RoomCard";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

export const Rooms = () => {
  const [rooms, setRooms] = useState([]);
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
    const fetchRooms = async () => {
      try {
        const response = await axiosClient.get("/rooms");
        setRooms(response.data);
      } catch (error) {
        console.error("Lỗi lấy danh sách phòng:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 py-20 bg-[#f8f9fa] rounded-[3rem] my-10 border border-slate-100/50 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-6 text-center md:text-left">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Nâng Tầm Không Gian Sống
          </h2>
          <p className="text-slate-500 font-medium">
            Mua sắm theo từng không gian riêng biệt trong ngôi nhà của bạn
          </p>
        </div>
        <div>
          <Link
            to="/products"
            className="bg-white px-6 py-3 rounded-xl shadow-sm border border-slate-200 text-sm font-bold text-slate-700 hover:bg-primary hover:text-white hover:border-primary transition-all group hidden md:inline-block"
          >
            Khám phá tất cả không gian 
            <span className="ml-2 group-hover:translate-x-1 inline-block transition-transform">›</span>
          </Link>
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
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 p-4 rounded-full bg-white backdrop-blur-md border border-slate-200 text-slate-800 shadow-2xl opacity-0 group-hover/slider:opacity-100 transition-all hover:bg-primary hover:text-white hover:border-primary hidden sm:flex items-center justify-center translate-x-4 group-hover/slider:translate-x-0"
            title="Trượt sang trái">
            <ChevronLeft size={24} />
          </button>
          
          <button
            onClick={() => scroll("right")}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 p-4 rounded-full bg-white backdrop-blur-md border border-slate-200 text-slate-800 shadow-2xl opacity-0 group-hover/slider:opacity-100 transition-all hover:bg-primary hover:text-white hover:border-primary hidden sm:flex items-center justify-center translate-x-[-4px] group-hover/slider:translate-x-0"
            title="Trượt sang phải">
            <ChevronRight size={24} />
          </button>

          <div 
            ref={scrollRef}
            className="flex overflow-x-auto gap-8 pb-4 scroll-smooth snap-x snap-mandatory scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {rooms.map((room) => (
              <div key={room.id} className="min-w-[85%] sm:min-w-[45%] lg:min-w-[calc(25%-24px)] snap-start">
                <RoomCard
                  slug={room.slug}
                  title={room.name}
                  image={room.image_url}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
