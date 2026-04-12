import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export const RoomCard = ({ title, image, slug }) => (
  <Link to={`/room/${slug}`} className="block group cursor-pointer">
    <motion.div whileHover={{ y: -5 }}>
      <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-slate-100 mb-4 relative shadow-sm border border-slate-50">
        <img
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          alt={title}
          src={image || "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800"}
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-between translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <span className="text-white font-bold text-lg">{title}</span>
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-500">
            <span className="text-primary text-xl">›</span>
          </div>
        </div>
      </div>
    </motion.div>
  </Link>
);
