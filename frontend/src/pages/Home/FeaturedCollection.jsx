import React from "react";
import { motion } from "framer-motion";
import { Leaf, ShieldCheck, Truck } from "lucide-react";

export const FeaturedCollection = () => (
  <section className="max-w-7xl mx-auto px-4 py-24">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="relative rounded-2xl overflow-hidden h-[600px]">
        <img
          className="w-full h-full object-cover"
          alt="Heritage collection"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYwDhL-__cS-bbHqY8eRRF6R-TuOLUwhBFYjEPJwB27bI-Go1To057p_I4EaRPjPb1LLjsduqncHyWMpzdl5njwRay9JUgNHYOOLf9YjNlrXj9bXgUJFFjkfQ-YSYeOskEi0tO7N8q0eozyT3zzNPM_d7WnK3SstIgHqF0hL5DVo3oaWWJ8ttXnyihXzhMynhvq7DglmiGoPG9iTE4MudtXWJLS7voAa3rejNhMuq1kQGlMPRuQ6Qy4-iGj927M08RuXZkjyWXwAc"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-primary/10"></div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="space-y-8 lg:pl-12">
        <span className="text-primary font-bold tracking-[0.2em] uppercase text-sm">
          Bộ sưu tập Tuyển chọn
        </span>
        <h2 className="text-5xl font-extrabold leading-tight">
          Dòng sản phẩm Heritage
        </h2>
        <p className="text-lg text-slate-600 leading-relaxed">
          Sự kết hợp hoàn hảo giữa tay nghề thủ công truyền thống và thiết kế
          tiên phong. Mỗi món đồ đều được làm thủ công từ gỗ óc chó tái chế và
          hoàn thiện bằng dầu tự nhiên.
        </p>
        <ul className="space-y-4">
          <li className="flex items-center gap-3 font-medium">
            <Leaf className="text-primary w-5 h-5" /> Gỗ óc chó nguyên khối bền
            vững
          </li>
          <li className="flex items-center gap-3 font-medium">
            <ShieldCheck className="text-primary w-5 h-5" /> Bảo hành cấu trúc
            trọn đời
          </li>
          <li className="flex items-center gap-3 font-medium">
            <Truck className="text-primary w-5 h-5" /> Bao gồm dịch vụ giao hàng
            cao cấp
          </li>
        </ul>
        <button className="bg-primary text-white px-10 py-5 rounded-lg font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
          Khám phá Bộ sưu tập
        </button>
      </motion.div>
    </div>
  </section>
);
