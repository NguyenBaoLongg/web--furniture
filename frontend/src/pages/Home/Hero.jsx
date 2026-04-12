import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export const Hero = ({ onNavigate }) => {
  return (
    <section className="relative h-[85vh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <img
          className="w-full h-full object-cover"
          alt="Modern minimalist living room"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuANPGNCi7A_ShJwI2x-X_URxWxUCB3_56qGbDGeEkfHqJsgMlvT2_3hNeQyjzKtg03zN1nQvymv-rKsFsmaU80YE6nH7CtkiHsF0B6DgX_EqmC27tDAb464cYUhnN2Cv3-FEFYYW3UV-8A2KZDBhCZRrhjv41EP97Ru87Q-V70QWtpGaqdMqIBhXfvD0Wpwy4Wn16wnqGQvSMXd5hjxWQ5gtz3E5xq5FAelmOBZhcsO1B3MplQP-q2CB597JS0Gk0H7gzukFROYtrc"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent"></div>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 h-full flex flex-col justify-center items-start">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-primary bg-background-light/90 px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-6">
          Sống Xanh Hiện Đại
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight max-w-2xl">
          Nâng Tầm <br />
          <span className="text-primary italic font-light">Không Gian Sống</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-lg text-slate-200 mb-8 max-w-lg leading-relaxed">
          Khám phá bộ sưu tập nội thất tối giản, cao cấp được thiết kế cho ngôi
          nhà hiện đại và tinh tế.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-wrap gap-4">
          <button
            onClick={onNavigate}
            className="bg-primary text-white px-8 py-4 rounded-lg font-bold hover:opacity-90 transition-all flex items-center gap-2 group">
            Mua Ngay{" "}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="bg-white/10 backdrop-blur-md text-white border border-white/30 px-8 py-4 rounded-lg font-bold hover:bg-white/20 transition-all">
            Khám phá Lookbook
          </button>
        </motion.div>
      </div>
    </section>
  );
};
