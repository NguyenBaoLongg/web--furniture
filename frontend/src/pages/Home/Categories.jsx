import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { axiosClient } from "../../utils/axiosClient";
import { CategoryCard } from "../../components/ui/CategoryCard";
import { Loader2 } from "lucide-react";

export const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

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
            Khám phá các thiết kế theo từng phòng
          </p>
        </div>
        <Link
          to="/shop"
          className="text-primary font-bold border-b-2 border-primary/20 hover:border-primary transition-all pb-1 hidden sm:block">
          Xem tất cả Danh mục
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              slug={cat.slug}
              title={cat.name}
              image={cat.image_url}
            />
          ))}
        </div>
      )}
    </section>
  );
};
