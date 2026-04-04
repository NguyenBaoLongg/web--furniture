import React from "react";
import { Link } from "react-router-dom";
import {
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  CreditCard,
  Landmark,
  Wallet,
  ShieldCheck,
  Package,
} from "lucide-react";
import { useCart } from "../../context/CartContext";

export const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(price)
      .replace("₫", "đ");
  };

  const subTotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const shippingFee = 0;
  const discount = 0;
  const total = subTotal + shippingFee - discount;

  if (cartItems.length === 0) {
    return (
      <div className="bg-slate-50 min-h-[60vh] flex flex-col items-center justify-center">
        <Package className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Giỏ hàng trống
        </h2>
        <p className="text-slate-500 mb-6">
          Bạn chưa thêm sản phẩm nào vào giỏ hàng.
        </p>
        <Link
          to="/"
          className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
          <div className="lg:col-span-8">
            <div className="flex justify-between items-end border-b border-slate-200 pb-4 mb-6">
              <h1 className="text-3xl font-bold text-slate-900">
                Giỏ hàng của bạn
              </h1>
              <span className="text-slate-500 font-medium">
                {cartItems.length} sản phẩm
              </span>
            </div>

            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-2xl flex gap-5 relative shadow-sm border border-slate-100">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 size={20} />
                  </button>

                  <div className="w-28 h-28 shrink-0 bg-[#f8f9fa] rounded-xl overflow-hidden flex items-center justify-center p-2 border border-slate-50">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="pr-8">
                      <h3 className="text-lg font-bold text-slate-900 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-500">
                        Màu sắc: {item.color}
                      </p>
                    </div>

                    <div className="flex justify-between items-end mt-4">
                      <div className="flex items-center bg-slate-50 border border-slate-100 rounded-lg p-1">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-primary hover:bg-white rounded-md transition-colors">
                          <Minus size={16} />
                        </button>
                        <span className="w-10 text-center text-sm font-bold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-primary hover:bg-white rounded-md transition-colors">
                          <Plus size={16} />
                        </button>
                      </div>
                      <span className="text-lg font-bold text-slate-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 mt-8 lg:mt-0 sticky top-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                Tóm tắt đơn hàng
              </h2>

              <div className="mb-6">
                <label className="block text-sm text-slate-600 mb-2">
                  Mã giảm giá
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Nhập mã của bạn"
                  />
                  <button className="bg-slate-100 text-slate-700 px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">
                    Áp dụng
                  </button>
                </div>
              </div>

              <div className="space-y-4 text-sm text-slate-600 mb-6 border-b border-slate-100 pb-6">
                <div className="flex justify-between items-center">
                  <p>Tạm tính</p>
                  <p className="font-medium text-slate-900">
                    {formatPrice(subTotal)}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p>Phí vận chuyển</p>
                  <p className="font-medium text-slate-900">
                    {shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p>Giảm giá</p>
                  <p className="font-medium text-green-600">
                    - {formatPrice(discount)}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <p className="text-base font-bold text-slate-900">Tổng cộng</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatPrice(total)}
                </p>
              </div>

              <Link to="/checkout" className="w-full bg-[#2b4c4f] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#1f383a] transition-colors mb-6">
                Tiến hành thanh toán <ArrowRight size={20} />
              </Link>

              <div className="text-center">
                <p className="text-xs text-slate-500 mb-4">
                  Chấp nhận thanh toán qua
                </p>
                <div className="flex justify-center gap-4 text-slate-400">
                  <CreditCard size={28} strokeWidth={1.5} />
                  <Landmark size={28} strokeWidth={1.5} />
                  <Wallet size={28} strokeWidth={1.5} />
                </div>
              </div>
            </div>

            <div className="bg-[#f8fcfb] rounded-2xl p-5 mt-5 flex gap-4 items-start border border-[#e2f0ee]">
              <ShieldCheck
                className="text-[#2b4c4f] shrink-0 mt-0.5"
                size={24}
              />
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1.5">
                  Chính sách đảm bảo
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Hoàn trả trong 30 ngày nếu có lỗi từ nhà sản xuất. Bảo hành 12
                  tháng.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
