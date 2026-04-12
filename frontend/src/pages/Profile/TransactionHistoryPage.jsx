import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { axiosClient } from "../../utils/axiosClient";
import { ProfileSidebar } from "../../components/profile/ProfileSidebar";
import {
  CreditCard,
  Calendar,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  Package,
  Receipt,
  ArrowLeft,
} from "lucide-react";

export const TransactionHistoryPage = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user?.id) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/orders/transactions/user/${user.id}`);
      setTransactions(res.data);
    } catch (error) {
      console.error("Lỗi lấy lịch sử giao dịch:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(price)
      .replace("₫", "đ");
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getResponseStatusBadge = (code) => {
    if (code === "00") {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
          <CheckCircle className="w-3.5 h-3.5" /> Thành công
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100">
        <XCircle className="w-3.5 h-3.5" /> Thất bại
      </span>
    );
  };

  const filteredTransactions = transactions.filter(
    (t) =>
      t.transaction_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.order_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#fcfcfc] min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
        <ProfileSidebar />

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">
                Nhật ký giao dịch chi tiết
              </h1>
              <p className="text-sm text-slate-500">
                Lịch sử các nỗ lực thanh toán trực tuyến qua cổng VNPay
              </p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm giao dịch/đơn hàng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2b4c4f] focus:ring-1 focus:ring-[#2b4c4f] transition-all w-full sm:w-64"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="w-10 h-10 border-4 border-slate-100 border-t-[#2b4c4f] rounded-full animate-spin mb-4"></div>
              <p className="text-sm font-medium text-slate-500">
                Đang tải danh sách giao dịch...
              </p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Receipt className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Chưa có giao dịch trực tuyến nào
              </h3>
              <p className="text-slate-500 max-w-sm mb-8 text-sm">
                Bạn chưa thực hiện thanh toán trực tuyến nào qua hệ thống.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold tracking-widest text-slate-400">
                      <th className="px-6 py-5 whitespace-nowrap">Mã giao dịch</th>
                      <th className="px-6 py-5 whitespace-nowrap">Hết hạn/Ngày</th>
                      <th className="px-6 py-5 whitespace-nowrap">Số tiền</th>
                      <th className="px-6 py-5 whitespace-nowrap">Ngân hàng/Thẻ</th>
                      <th className="px-6 py-5 whitespace-nowrap">Trạng thái</th>
                      <th className="px-6 py-5 text-center whitespace-nowrap">
                        Đơn hàng
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredTransactions.map((t) => (
                      <tr
                        key={t.id}
                        className="hover:bg-[#f8fcfb] transition-colors group"
                      >
                        <td className="px-6 py-5">
                          <div className="font-mono text-sm font-bold text-slate-700">
                            {t.transaction_no || "N/A"}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">
                            Ref: {t.txn_ref}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            {formatDate(t.created_at).split(" ")[1]}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            {formatDate(t.created_at).split(" ")[0]}
                          </div>
                        </td>
                        <td className="px-6 py-5 font-bold text-slate-900">
                          {formatPrice(t.amount)}
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-xs font-bold text-slate-700 uppercase">
                            {t.bank_code}
                          </div>
                          <div className="text-[10px] text-slate-400 uppercase mt-0.5">
                            {t.card_type}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          {getResponseStatusBadge(t.response_code)}
                        </td>
                        <td className="px-6 py-5 text-center">
                          <Link
                            to={`/profile/orders/${t.order_id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#2b4c4f] hover:bg-white border border-transparent hover:border-[#e2f0ee] transition-all"
                          >
                            Xem đơn <ChevronRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
