import React, { forwardRef } from "react";

const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

export const InvoiceTemplate = forwardRef(({ order }, ref) => {
  if (!order) return null;

  const orderId = String(order.id).slice(0, 8).toUpperCase();
  const orderDate = new Date(order.created_at).toLocaleDateString("vi-VN");
  const customerName =
    order.user_addresses?.receiver_name || order.users?.full_name || "N/A";
  const customerPhone =
    order.user_addresses?.phone_number || order.users?.phone || "N/A";
  const address = `${order.user_addresses?.street_address || ""}, ${order.user_addresses?.ward || ""}, ${order.user_addresses?.city || ""}`.replace(
    /^, |, $/g,
    "",
  );

  return (
    <div
      ref={ref}
      className="bg-white text-black p-10 font-sans"
      style={{
        width: "794px",
        minHeight: "1123px",
        position: "absolute",
        top: "-9999px",
        left: "-9999px",
      }}>
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-6">
        <div>
          <h1 className="text-4xl font-black text-[#2b4c4f] tracking-tighter uppercase">
            FURNITURE
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Nội thất cao cấp & Sang trọng
          </p>
          <div className="mt-4 text-sm">
            <p>
              <strong>Địa chỉ:</strong> Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội
            </p>
            <p>
              <strong>Hotline:</strong> 1900 1234
            </p>
            <p>
              <strong>Email:</strong> contact@furniture.vn
            </p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-bold text-gray-800 uppercase tracking-widest">
            Hóa Đơn
          </h2>
          <div className="mt-4 space-y-1 text-sm">
            <p>
              <strong>Mã ĐH:</strong> #{orderId}
            </p>
            <p>
              <strong>Ngày lập:</strong> {orderDate}
            </p>
            <p>
              <strong>Phương thức TT:</strong>{" "}
              {order.payment_method?.toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-2 border-b border-gray-200 pb-1">
          THÔNG TIN KHÁCH HÀNG
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="mb-1">
              <span className="text-gray-500 w-24 inline-block">Họ và tên:</span>{" "}
              <strong className="text-gray-900">{customerName}</strong>
            </p>
            <p className="mb-1">
              <span className="text-gray-500 w-24 inline-block">Điện thoại:</span>{" "}
              <strong className="text-gray-900">{customerPhone}</strong>
            </p>
          </div>
          <div>
            <p className="mb-1">
              <span className="text-gray-500 w-24 inline-block">Địa chỉ:</span>{" "}
              <strong className="text-gray-900">{address}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-800 text-sm">
              <th className="p-3 border border-gray-200 w-12 text-center">
                STT
              </th>
              <th className="p-3 border border-gray-200">Sản phẩm</th>
              <th className="p-3 border border-gray-200 w-24 text-center">
                Số lượng
              </th>
              <th className="p-3 border border-gray-200 w-32 text-right">
                Đơn giá
              </th>
              <th className="p-3 border border-gray-200 w-32 text-right">
                Thành tiền
              </th>
            </tr>
          </thead>
          <tbody>
            {order.order_items?.map((item, idx) => (
              <tr key={item.id} className="text-sm text-gray-700">
                <td className="p-3 border border-gray-200 text-center">
                  {idx + 1}
                </td>
                <td className="p-3 border border-gray-200 font-medium">
                  {item.products?.title}
                </td>
                <td className="p-3 border border-gray-200 text-center">
                  {item.quantity}
                </td>
                <td className="p-3 border border-gray-200 text-right">
                  {formatPrice(item.price)}
                </td>
                <td className="p-3 border border-gray-200 text-right font-bold text-gray-900">
                  {formatPrice(item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total */}
      <div className="flex justify-end mb-10">
        <div className="w-1/2">
          <div className="flex justify-between py-2 border-b border-gray-200 text-sm">
            <span className="text-gray-600">Tổng tiền hàng:</span>
            <span className="font-bold">{formatPrice(order.total_price)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200 text-sm">
            <span className="text-gray-600">Phí vận chuyển:</span>
            <span className="font-bold">Miễn phí</span>
          </div>
          <div className="flex justify-between py-3 text-lg">
            <span className="font-bold text-gray-800">TỔNG CỘNG:</span>
            <span className="font-black text-[#2b4c4f]">
              {formatPrice(order.total_price)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 pt-8 border-t border-gray-200 mt-auto">
        <p className="font-bold text-gray-700 mb-1">
          CẢM ƠN QUÝ KHÁCH ĐÃ MUA HÀNG!
        </p>
        <p>Mọi thắc mắc về đơn hàng vui lòng liên hệ hotline 1900 1234</p>
      </div>
    </div>
  );
});

InvoiceTemplate.displayName = "InvoiceTemplate";
