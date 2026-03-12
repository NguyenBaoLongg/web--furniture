import React from "react";
import { Truck, ShieldCheck, CreditCard, Headphones } from "lucide-react";

export const FeaturesBar = () => (
  <section className="border-y border-primary/10 py-12 bg-white">
    <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
      {[
        {
          icon: Truck,
          title: "Giao hàng Toàn cầu",
          desc: "Có mặt tại hơn 60 quốc gia",
        },
        {
          icon: ShieldCheck,
          title: "Bảo hành 2 năm",
          desc: "Cho tất cả các mặt hàng",
        },
        {
          icon: CreditCard,
          title: "Thanh toán An toàn",
          desc: "Quy trình được mã hóa",
        },
        {
          icon: Headphones,
          title: "Hỗ trợ 24/7",
          desc: "Chuyên gia tư vấn thiết kế",
        },
      ].map((feature, i) => (
        <div key={i} className="flex flex-col items-center text-center gap-2">
          <feature.icon className="text-primary w-10 h-10" />
          <h4 className="font-bold">{feature.title}</h4>
          <p className="text-xs text-slate-500">{feature.desc}</p>
        </div>
      ))}
    </div>
  </section>
);
