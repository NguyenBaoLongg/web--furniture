import React from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

export const ProductCard = ({ title, price, image, slug }) => {
  const formattedPrice = `${Number(price).toLocaleString("en-US")} VND`;

  return (
    <Link to={`/product/${slug}`} className="block group cursor-pointer h-full">
      <motion.div
        whileHover={{ y: -10 }}
        className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all h-full flex flex-col">
        <div className="relative aspect-square overflow-hidden bg-white p-6 flex items-center justify-center border-b border-primary/5">
          <img
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-700"
            alt={title}
            src={image}
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10 flex gap-2">
            <button
              onClick={(e) => e.preventDefault()}
              className="flex-1 bg-white text-black border border-black py-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-colors">
              Thêm vào giỏ
            </button>
            <button
              onClick={(e) => e.preventDefault()}
              className="flex-1 bg-black text-white border border-black py-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors">
              Xem thêm
            </button>
          </div>
        </div>
        <div className="p-5 flex flex-col flex-1 bg-white">
          <div className="flex justify-between items-start gap-4 h-full">
            <h3 className="text-[13px] md:text-sm font-medium text-slate-900 line-clamp-2 leading-relaxed flex-1">
              {title}
            </h3>
            <div className="flex flex-col items-end justify-between h-full min-h-[44px] shrink-0">
              <button
                onClick={(e) => e.preventDefault()}
                className="text-slate-400 hover:text-red-500 transition-colors">
                <Heart className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </button>
              <span className="text-[13px] md:text-sm font-semibold text-slate-900 mt-2">
                {formattedPrice}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};
