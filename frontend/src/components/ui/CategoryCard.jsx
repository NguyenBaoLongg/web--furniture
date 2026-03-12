import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export const CategoryCard = ({ title, image, slug }) => (
  <Link to={`/category/${slug}`} className="block group cursor-pointer">
    <motion.div whileHover={{ y: -5 }}>
      <div className="aspect-square rounded-xl overflow-hidden bg-primary/5 mb-4 relative">
        <img
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          alt={title}
          src={image}
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors"></div>
      </div>
      <h3 className="font-bold text-lg text-center">{title}</h3>
    </motion.div>
  </Link>
);
