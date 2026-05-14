import React from "react";
import { motion } from "framer-motion";
import { Heart, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";

export const ProductCard = ({ id, title, price, image, slug, rating, review_count, padding = "p-4" }) => {
  const formattedPrice = `${Number(price).toLocaleString("en-US")} VND`;
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleAddToCartClick = (e) => {
    e.preventDefault();
    addToCart({
      product_id: id,
      variant_id: null,
      quantity: 1,
    });
  };

  return (
    <Link to={`/product/${slug}`} className="block group cursor-pointer h-full">
      <motion.div
        whileHover={{ y: -10 }}
        className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all h-full flex flex-col">
        <div className={`relative aspect-square overflow-hidden bg-white ${padding} flex items-center justify-center border-b border-primary/5`}>
          <img
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-700"
            alt={title}
            src={image}
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10 flex gap-2">
            <button
              onClick={handleAddToCartClick}
              className="flex-1 bg-white text-black border border-black py-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-colors">
              Thêm vào giỏ
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                navigate(`/product/${slug}`);
              }}
              className="flex-1 bg-black text-white border border-black py-2.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors">
              Xem thêm
            </button>
          </div>
        </div>
        <div className="p-4 flex flex-col flex-1 bg-white">
          <div className="flex justify-between items-start gap-4 h-full">
            <div className="flex-1 flex flex-col gap-1">
              <h3 className="text-[13px] md:text-sm font-medium text-slate-900 line-clamp-2 leading-relaxed">
                {title}
              </h3>
              {Number(rating) > 0 && (
                <div className="flex items-center gap-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(Number(rating))
                            ? "fill-amber-400 text-amber-400"
                            : "fill-slate-200 text-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    ({review_count || 0})
                  </span>
                </div>
              )}
            </div>
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
