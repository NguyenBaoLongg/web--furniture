import { supabase } from "../../config/supabase";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { exportAdminReport } from "../../utils/excelExport";
import {
  Bell,
  Calendar,
  Download,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  UserPlus,
  Star,
  FileSpreadsheet,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    aov: 0,
    conversionRate: 0,
    activeUsers: 0,
  });
  const [filterDate, setFilterDate] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [revenueChartData, setRevenueChartData] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Calculate date range for filter
        const startOfMonth = new Date(filterDate.year, filterDate.month - 1, 1).toISOString();
        const endOfMonth = new Date(filterDate.year, filterDate.month, 0, 23, 59, 59).toISOString();

        // 1. Fetch Orders with filter
        const { data: orders, error: ordersError } = await supabase
          .from("orders")
          .select("*")
          .neq("status", "cancelled")
          .gte("created_at", startOfMonth)
          .lte("created_at", endOfMonth);

        if (ordersError) throw ordersError;

        // 2. Fetch Order Items with filter
        const { data: orderItems, error: itemsError } = await supabase.from(
          "order_items",
        ).select(`
            quantity,
            price,
            created_at,
            products (
              id,
              title,
              thumbnail,
              categories ( name )
            )
          `)
          .gte("created_at", startOfMonth)
          .lte("created_at", endOfMonth);

        if (itemsError) throw itemsError;

        // 3. Fetch New Users for current month
        const { count: newUserCount, error: userError } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .gte("created_at", startOfMonth)
          .lte("created_at", endOfMonth);

        if (userError) throw userError;

        // 4. Fetch Total Users for Conversion Rate (Overall)
        const { count: totalUserCount, error: totalUserError } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true });

        if (totalUserError) throw totalUserError;

        // --- PROCESSING DATA ---

        // Metrics
        const paidOrders = orders.filter((o) => o.payment_status === "paid");
        const revenue = paidOrders.reduce(
          (sum, order) => sum + order.total_price,
          0,
        );
        const totalOrders = orders.length;
        const aov = totalOrders > 0 ? revenue / totalOrders : 0;
        const conversionRate =
          totalUserCount > 0 ? (totalOrders / totalUserCount) * 100 : 0;

        setMetrics({
          totalRevenue: revenue,
          totalOrders: totalOrders,
          aov: aov,
          conversionRate: conversionRate.toFixed(1),
          activeUsers: newUserCount,
        });

        // Revenue Chart (Selected Month)
        const daysInMonth = new Date(filterDate.year, filterDate.month, 0).getDate();
        const dailyData = {};
        
        for (let i = 1; i <= daysInMonth; i++) {
          const dateStr = `${filterDate.month.toString().padStart(2, '0')}/${i.toString().padStart(2, '0')}`;
          dailyData[dateStr] = { name: dateStr, value: 0 };
        }

        paidOrders.forEach((order) => {
          const d = new Date(order.created_at);
          const dateStr = `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
          if (dailyData[dateStr]) {
            dailyData[dateStr].value += order.total_price;
          }
        });
        setRevenueChartData(Object.values(dailyData));

        // Category Stats
        const catMap = {};
        orderItems.forEach((item) => {
          const catName = item.products?.categories?.name || "Khác";
          catMap[catName] = (catMap[catName] || 0) + item.quantity;
        });

        const totalSold = orderItems.reduce((sum, i) => sum + i.quantity, 0);
        const colors = ["#2b4c4f", "#eab308", "#9ca3af", "#d1d5db", "#4b5563"];
        const catList = Object.entries(catMap)
          .map(([name, value], idx) => ({
            name,
            value: totalSold > 0 ? Math.round((value / totalSold) * 100) : 0,
            color: colors[idx % colors.length],
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 4);

        setCategoryStats(catList);

        // Top Products
        const prodMap = {};
        orderItems.forEach((item) => {
          const p = item.products;
          if (!p) return;
          if (!prodMap[p.id]) {
            prodMap[p.id] = {
              id: p.id,
              name: p.title,
              quantity: 0,
              revenue: 0,
              image: p.thumbnail,
              trend: "+ 5%", // Mock trend
            };
          }
          prodMap[p.id].quantity += item.quantity;
          prodMap[p.id].revenue += item.price * item.quantity;
        });

        const topProds = Object.values(prodMap)
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5)
          .map((p) => ({
            ...p,
            revenue: new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(p.revenue),
          }));

        setTopSellingProducts(topProds);
      } catch (error) {
        console.error("Lỗi tải dữ liệu Dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [filterDate]);

  const handleExportExcel = async () => {
    try {
      setLoading(true);
      
      const startOfMonth = new Date(filterDate.year, filterDate.month - 1, 1).toISOString();
      const endOfMonth = new Date(filterDate.year, filterDate.month, 0, 23, 59, 59).toISOString();

      // FETCH DATA (Dashboard stays responsible for fetching)
      const { data: fullOrders, error: ordersErr } = await supabase
        .from("orders")
        .select(`
          id, user_id, total_price, status, payment_method, payment_status, created_at,
          user_addresses ( street_address, ward, city, receiver_name, phone_number ),
          order_items ( quantity, price, products ( title ) )
        `)
        .gte("created_at", startOfMonth)
        .lte("created_at", endOfMonth)
        .order("created_at", { ascending: false });

      if (ordersErr) throw ordersErr;

      const { data: allUsers, error: usersErr } = await supabase.from("users").select("*");
      if (usersErr) throw usersErr;

      const { data: allProducts, error: prodsErr } = await supabase
        .from("products")
        .select("*, categories(name)");
      
      if (prodsErr) throw prodsErr;

      // CALL UTILITY
      await exportAdminReport({
        fullOrders,
        allUsers,
        allProducts,
        metrics,
        filterDate
      });

      toast.success("Xuất báo cáo thành công!");
    } catch (error) {
      console.error("Lỗi xuất Excel:", error);
      toast.error("Có lỗi xảy ra khi xuất báo cáo.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2b4c4f]"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
            Thống kê kinh doanh
          </h1>
          <p className="text-gray-500 font-medium">
            Phân tích số liệu thực tế từ hệ thống
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
            <Calendar size={16} className="text-[#2b4c4f]" />
            <select
              value={filterDate.month}
              onChange={(e) => setFilterDate(prev => ({ ...prev, month: parseInt(e.target.value) }))}
              className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
              ))}
            </select>
            <select
              value={filterDate.year}
              onChange={(e) => setFilterDate(prev => ({ ...prev, year: parseInt(e.target.value) }))}
              className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer border-l pl-2 border-gray-300"
            >
              {[2024, 2025, 2026].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 bg-[#2b4c4f] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-[#1a3335] transition-all hover:scale-[1.02] active:scale-[0.98]">
            <FileSpreadsheet size={18} />
            <span>Xuất báo cáo Excel</span>
          </button>
        </div>
      </div>

      {/* 4 STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">
              Tổng doanh thu
            </span>
            <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
              <DollarSign size={16} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(metrics.totalRevenue)}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-500 font-semibold flex items-center gap-1">
                <TrendingUp size={14} /> +12%
              </span>
              <span className="text-gray-400">trung bình</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">
              Tỷ lệ chuyển đổi
            </span>
            <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
              <ShoppingBag size={16} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {metrics.conversionRate}%
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-500 font-semibold flex items-center gap-1">
                <TrendingUp size={14} /> +0.5%
              </span>
              <span className="text-gray-400">trung bình</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">
              Giá trị đơn hàng TB
            </span>
            <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
              <ShoppingBag size={16} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(metrics.aov)}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-500 font-semibold flex items-center gap-1">
                <TrendingUp size={14} /> +2.1%
              </span>
              <span className="text-gray-400">trung bình</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">
              Giá trị vòng đời KH
            </span>
            <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
              <Star size={16} />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {metrics.activeUsers}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-700 font-medium flex items-center gap-1">
                <UserPlus size={14} /> Khách hàng
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Biểu đồ Doanh thu và Mục tiêu
              </h2>
              <p className="text-sm text-gray-500">
                Theo dõi tiến độ doanh thu theo thời gian
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="w-3 h-3 rounded-full bg-[#2b4c4f]"></span> Thực
                tế
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <span className="w-3 h-3 rounded-full bg-gray-200"></span> Mục
                tiêu
              </div>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={revenueChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f3f4f6"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                />
                <Tooltip
                  cursor={{ stroke: "#f3f4f6", strokeWidth: 2 }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#2b4c4f"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#2b4c4f", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#e5e7eb"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-8">
            Danh mục doanh thu
          </h2>
          <div className="relative h-48 w-full flex-1 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none">
                  {categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-gray-900">
                {categoryStats.length > 0 ? "100%" : "0%"}
              </span>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                ĐƠN VỊ ĐÃ BÁN
              </span>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {categoryStats.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}></span>
                  <span className="font-medium text-gray-700">{item.name}</span>
                </div>
                <span className="font-bold text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling Products */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              Sản phẩm bán chạy nhất
            </h2>
            <Link
              to="/admin/products"
              className="text-sm font-semibold text-yellow-600 hover:text-yellow-700">
              Xem tất cả
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="pb-4 font-bold">Sản phẩm</th>
                  <th className="pb-4 font-bold">Sản lượng</th>
                  <th className="pb-4 font-bold">Doanh thu</th>
                  <th className="pb-4 font-bold text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topSellingProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-bold text-gray-900">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500 font-medium">
                            SKU: {product.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-sm font-medium text-gray-900">
                      {product.quantity} sản phẩm
                    </td>
                    <td className="py-4 text-sm font-bold text-gray-900">
                      {product.revenue}
                    </td>
                    <td className="py-4 text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600">
                        <TrendingUp size={12} /> {product.trend}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
