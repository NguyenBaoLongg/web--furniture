import React from "react";
import { Armchair, Facebook, Instagram, Twitter } from "lucide-react";

export const Footer = () => (
  <footer className="bg-white pt-20 pb-10 border-t border-primary/10">
    <div className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2">
            <Armchair className="text-primary w-8 h-8" />
            <h2 className="text-xl font-bold tracking-tighter text-primary uppercase">
              Luxe Furnish
            </h2>
          </div>
          <p className="text-slate-500 max-w-sm">
            Chế tác nội thất tối giản, chất lượng cao cho ngôi nhà hiện đại. Các
            thiết kế của chúng tôi ưu tiên sự thoải mái, thẩm mỹ và tính bền
            vững.
          </p>
          <div className="flex gap-4">
            {[Facebook, Instagram, Twitter].map((Icon, i) => (
              <a
                key={i}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/5 hover:bg-primary/20 transition-colors"
                href="#">
                <Icon className="w-5 h-5 text-primary/60" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-bold mb-6">Bộ sưu tập</h4>
          <ul className="space-y-4 text-slate-500 text-sm">
            {[
              "Dòng sản phẩm Heritage",
              "Căn hộ Tối giản",
              "Nội thất Văn phòng",
              "Không gian Ngoài trời",
            ].map((link) => (
              <li key={link}>
                <a className="hover:text-primary transition-colors" href="#">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6">Về chúng tôi</h4>
          <ul className="space-y-4 text-slate-500 text-sm">
            {[
              "Câu chuyện thương hiệu",
              "Phát triển bền vững",
              "Báo chí & Truyền thông",
              "Liên hệ",
            ].map((link) => (
              <li key={link}>
                <a className="hover:text-primary transition-colors" href="#">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6">Hỗ trợ</h4>
          <ul className="space-y-4 text-slate-500 text-sm">
            {[
              "Giao hàng & Trả hàng",
              "Bảo quản Sản phẩm",
              "Câu hỏi thường gặp",
              "Theo dõi đơn hàng",
            ].map((link) => (
              <li key={link}>
                <a className="hover:text-primary transition-colors" href="#">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="pt-8 border-t border-primary/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-xs text-slate-400">
          © 2026 Luxe Furnish. Bảo lưu mọi quyền. Thiết kế cho cuộc sống hiện
          đại.
        </div>
      </div>
    </div>
  </footer>
);
