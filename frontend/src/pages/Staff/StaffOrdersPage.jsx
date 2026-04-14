import React, { useState, useEffect } from "react";
import {
  Search,
  Settings,
  Bell,
  Package,
  CheckCircle,
  Truck,
  Plus,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Info,
  X,
  User,
  MapPin,
  CreditCard,
  ShoppingBag,
} from "lucide-react";
import { supabase } from "../../config/supabase";
import { toast } from "react-toastify";

// --- UTILITY FUNCTIONS (OUTSIDE COMPONENT TO PREVENT TDZ ERRORS) ---
function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN").format(price ?? 0) + "đ";
}

function getProgress(status) {
  switch (status) {
    case "pending":
      return 1;
    case "processing":
      return 2;
    case "shipped":
      return 3;
    case "delivered":
    case "completed":
      return 4;
    default:
      return 1;
  }
}

function getStatusBadge(status) {
  const labels = {
    pending: "Chờ xác nhận",
    processing: "Đang xử lý",
    shipped: "Đang giao",
    delivered: "Hoàn thành",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
  };

  const styles = {
    pending: "bg-orange-50 text-orange-600 border-orange-100",
    processing: "bg-blue-50 text-blue-600 border-blue-100",
    shipped: "bg-indigo-50 text-indigo-600 border-indigo-100",
    delivered: "bg-emerald-50 text-emerald-600 border-emerald-100",
    completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
    cancelled: "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

export const StaffOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    shipping: 0,
    delivered: 0,
    overdue: 0,
  });

  // Manual Order Creation States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [productResults, setProductResults] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [manualOrder, setManualOrder] = useState({
    items: [],
    customer: {
      name: "",
      phone: "",
      email: "",
      street: "",
      ward: "",
      city: "Hà Nội",
    },
    paymentMethod: "cod",
    note: "",
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          users ( full_name, email, phone ),
          user_addresses ( receiver_name, phone_number, street_address, ward, city ),
          order_items ( *, products ( title, thumbnail ) )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const allOrders = data || [];
      setOrders(allOrders);

      // --- CALCULATE DYNAMIC STATS ---
      const today = new Date().toDateString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 2);

      const pending = allOrders.filter((o) => o.status === "pending").length;
      const shipping = allOrders.filter((o) => o.status === "shipped").length;

      // Đếm các đơn đã giao thành công (delivered/completed)
      const delivered = allOrders.filter(
        (o) => o.status === "delivered" || o.status === "completed",
      ).length;

      const overdue = allOrders.filter(
        (o) =>
          o.status !== "delivered" &&
          o.status !== "completed" &&
          o.status !== "cancelled" &&
          new Date(o.created_at) < yesterday,
      ).length;

      setStats({
        pending,
        shipping,
        delivered,
        overdue,
      });
    } catch (error) {
      console.error("Lỗi lấy đơn hàng:", error);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const getProducts = async () => {
      if (!isCreateModalOpen) return;
      
      let query = supabase
        .from("products")
        .select("id, title, price, thumbnail, stock, sku")
        .eq("is_active", true);

      if (productSearch.trim().length >= 2) {
        query = query.or(`title.ilike.%${productSearch}%,sku.ilike.%${productSearch}%`);
      }

      const { data } = await query.order("title", { ascending: true }).limit(20);
      setProductResults(data || []);
    };

    const timer = setTimeout(getProducts, 300);
    return () => clearTimeout(timer);
  }, [productSearch, isCreateModalOpen]);

  useEffect(() => {
    const searchUsers = async () => {
      if (userSearch.trim().length < 2) {
        setUserResults([]);
        return;
      }
      const { data } = await supabase
        .from("users")
        .select("id, full_name, phone, email")
        .or(`full_name.ilike.%${userSearch}%,phone.ilike.%${userSearch}%`)
        .limit(5);
      setUserResults(data || []);
    };

    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [userSearch]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      toast.success(
        `Đã cập nhật đơn hàng thành: ${newStatus === "processing" ? "Đang xử lý" : newStatus === "shipped" ? "Bắt đầu giao" : "Hoàn thành"}`,
      );

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }

      fetchOrders();
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
      toast.error("Không thể cập nhật trạng thái đơn hàng");
    }
  };

  // --- MANUAL ORDER HANDLERS ---
  const handleAddItem = (product) => {
    setManualOrder((prev) => {
      const existing = prev.items.find((i) => i.id === product.id);
      if (existing) {
        return {
          ...prev,
          items: prev.items.map((i) =>
            i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
          ),
        };
      }
      return {
        ...prev,
        items: [
          ...prev.items,
          {
            id: product.id,
            title: product.title,
            price: product.price,
            thumbnail: product.thumbnail,
            stock: product.stock,
            sku: product.sku,
            quantity: 1,
          },
        ],
      };
    });
    toast.success("Đã thêm vào giỏ hàng");
  };

  const handleRemoveItem = (productId) => {
    setManualOrder((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== productId),
    }));
  };

  const handleUpdateQty = (productId, delta) => {
    setManualOrder((prev) => ({
      ...prev,
      items: prev.items.map((i) => {
        if (i.id === productId) {
          const newQty = Math.max(1, i.quantity + delta);
          if (newQty > i.stock) {
            toast.warning(`Sản phẩm này chỉ còn ${i.stock} trong kho`);
            return i;
          }
          return { ...i, quantity: newQty };
        }
        return i;
      }),
    }));
  };

  const handleSubmitManualOrder = async () => {
    try {
      if (!manualOrder.customer.name || !manualOrder.customer.phone || !manualOrder.customer.street) {
        toast.warning("Vui lòng nhập đầy đủ thông tin khách nhận hàng");
        return;
      }
      if (manualOrder.items.length === 0) {
        toast.warning("Vui lòng chọn ít nhất 1 sản phẩm");
        return;
      }

      // 1. Tìm hoặc tạo user "Guest" (Vì backend yêu cầu user_id)
      // Trong thực tế, nên tìm theo SĐT trước. Ở đây tạm thời gán user_id mẫu hoặc tìm user gần nhất.
      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("phone", manualOrder.customer.phone)
        .maybeSingle();

      let targetUserId = userData?.id;

      if (!targetUserId) {
        // Tạo nhanh user nếu chưa có
        const { data: newUser, error: userError } = await supabase
          .from("users")
          .insert([{ 
            full_name: manualOrder.customer.name, 
            phone: manualOrder.customer.phone,
            role: 'customer' 
          }])
          .select()
          .single();
        
        if (userError) throw userError;
        targetUserId = newUser.id;
      }

      const totalPrice = manualOrder.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

      // 2. Gọi API tạo đơn hàng (sử dụng cấu trúc tương tự orderController)
      const orderPayload = {
        user_id: targetUserId,
        address: {
          receiver_name: manualOrder.customer.name,
          phone_number: manualOrder.customer.phone,
          street_address: manualOrder.customer.street,
          ward: manualOrder.customer.ward,
          city: manualOrder.customer.city
        },
        items: manualOrder.items.map(i => ({
          product_id: i.id,
          quantity: i.quantity,
          price: i.price
        })),
        total_price: totalPrice,
        payment_method: manualOrder.paymentMethod,
        note: manualOrder.note
      };

      // Mocking the backend call via direct Supabase or custom fetch if needed
      // Để đồng bộ với project, tôi sẽ dùng cấu trúc của orderController
      const { data: order, error: orderError } = await supabase.from('orders').insert([{
        user_id: targetUserId,
        address_id: null, // Sẽ được xử lý bởi backend hoặc trigger, ở đây chúng ta fill trực tiếp
        total_price: totalPrice,
        status: 'pending',
        payment_method: manualOrder.paymentMethod,
        payment_status: 'unpaid',
        note: manualOrder.note
      }]).select().single();

      if (orderError) throw orderError;

      // Chèn items
      const { error: itemsError } = await supabase.from('order_items').insert(
        manualOrder.items.map(i => ({
          order_id: order.id,
          product_id: i.id,
          quantity: i.quantity,
          price: i.price
        }))
      );

      if (itemsError) throw itemsError;

      // 4. Trừ tồn kho sản phẩm
      for (const item of manualOrder.items) {
        const { error: stockError } = await supabase
          .from("products")
          .update({ stock: item.stock - item.quantity })
          .eq("id", item.id);
        
        if (stockError) console.error(`Lỗi cập nhật kho cho sp ${item.id}:`, stockError);
      }

      // 5. Cập nhật địa chỉ (Tạo entry mới hoặc dùng có sẵn)
      await supabase.from('user_addresses').insert([{
        user_id: targetUserId,
        receiver_name: manualOrder.customer.name,
        phone_number: manualOrder.customer.phone,
        street_address: manualOrder.customer.street,
        ward: manualOrder.customer.ward,
        city: manualOrder.customer.city,
        is_default: false
      }]);

      toast.success("Tạo đơn hàng thành công và đã cập nhật kho!");
      setIsCreateModalOpen(false);
      setManualOrder({
        items: [],
        customer: { name: "", phone: "", email: "", street: "", ward: "", city: "Hà Nội" },
        paymentMethod: "cod",
        note: ""
      });
      fetchOrders();
    } catch (error) {
      console.error("Lỗi tạo đơn thủ công:", error);
      toast.error("Lỗi: " + error.message);
    }
  };


  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      String(o.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.users?.full_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    return matchesSearch && o.status === activeTab;
  });

  const getTabCount = (status) => {
    if (status === "all") return orders.length;
    return orders.filter((o) => o.status === status).length;
  };

  return (
    <div className="relative min-h-screen bg-[#fafafa]">
      <div className="p-8 space-y-8 pb-20 max-w-[1600px] mx-auto transition-all duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Quản lý đơn hàng
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2b4c4f] transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="Tìm mã đơn, tên khách..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-3.5 bg-slate-100 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#2b4c4f]/20 focus:bg-white transition-all w-full md:w-80 shadow-inner"
              />
            </div>
            <button className="p-3.5 bg-slate-100 rounded-2xl text-slate-500 hover:bg-slate-200 transition-all border border-slate-200 shadow-sm relative">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 border-2 border-slate-100 rounded-full"></span>
            </button>
            <button className="p-3.5 bg-slate-100 rounded-2xl text-slate-500 hover:bg-slate-200 transition-all border border-slate-200 shadow-sm">
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 flex items-center gap-6 group hover:shadow-xl transition-all duration-500 cursor-pointer">
            <div className="w-16 h-16 bg-orange-50 rounded-[1.25rem] flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
              <Package size={32} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
                Đơn hàng chờ xử lý
              </p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl font-black text-slate-900 leading-none">
                  {stats.pending}
                </h2>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 flex items-center gap-6 group hover:shadow-xl transition-all duration-500 cursor-pointer">
            <div className="w-16 h-16 bg-blue-50 rounded-[1.25rem] flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
              <Truck size={32} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
                Đang giao hàng
              </p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl font-black text-slate-900 leading-none">
                  {stats.shipping}
                </h2>
                <span className="text-[10px] font-bold text-slate-400">
                  Đang hoạt động
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 flex items-center gap-6 group hover:shadow-xl transition-all duration-500 cursor-pointer">
            <div className="w-16 h-16 bg-emerald-50 rounded-[1.25rem] flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
              <CheckCircle size={32} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
                Đã hoàn thành
              </p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl font-black text-slate-900 leading-none">
                  {stats.delivered}
                </h2>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  Đã giao
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex p-1.5 bg-slate-100 rounded-[1.5rem] gap-1 self-start">
            {["all", "pending", "processing", "shipped", "delivered"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-tight transition-all ${
                    activeTab === tab
                      ? "bg-white text-[#2b4c4f] shadow-sm"
                      : "text-slate-400 hover:text-slate-600"
                  }`}>
                  {tab === "all"
                    ? "Tất cả"
                    : tab === "pending"
                      ? `Mới (${getTabCount("pending")})`
                      : tab === "processing"
                        ? `Xử lý (${getTabCount("processing")})`
                        : tab === "shipped"
                          ? `Đang giao (${getTabCount("shipped")})`
                          : "Hoàn thành"}
                </button>
              ),
            )}
          </div>

          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-[#2b4c4f] text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-[#2b4c4f]/20 hover:scale-105 transition-all"
          >
            <Plus size={18} strokeWidth={3} />
            Tạo đơn thủ công
          </button>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                  <th className="px-10 py-6">Mã đơn</th>
                  <th className="px-10 py-6">Khách hàng</th>
                  <th className="px-10 py-6">Ngày đặt</th>
                  <th className="px-10 py-6">Giá trị</th>
                  <th className="px-10 py-6">Trạng thái</th>
                  <th className="px-10 py-6">Tiến độ</th>
                  <th className="px-10 py-6 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-10 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-slate-100 border-t-[#2b4c4f] rounded-full animate-spin"></div>
                        <p className="text-xs font-bold text-slate-400">
                          Đang đồng bộ dữ liệu...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-10 py-20 text-center text-slate-400 font-medium italic">
                      Không có đơn hàng nào trong mục này.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsPanelOpen(true);
                      }}
                      className="group hover:bg-slate-50/50 transition-all cursor-pointer">
                      <td className="px-10 py-6">
                        <span className="font-black text-slate-900 font-mono text-sm leading-none">
                          #ORD-{String(order.id).slice(0, 4).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs shadow-sm">
                            {order.users?.full_name?.charAt(0) || "U"}
                          </div>
                          <div className="flex flex-col leading-tight">
                            <span className="text-sm font-black text-slate-900">
                              {order.users?.full_name ||
                                order.user_addresses?.receiver_name}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                              {order.users?.email || "Chưa có email"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-700">
                            {new Date(order.created_at).toLocaleDateString(
                              "vi-VN",
                            )}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            {new Date(order.created_at).toLocaleTimeString(
                              "vi-VN",
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <span className="text-sm font-black text-slate-900 tracking-tight">
                          {formatPrice(order.total_price)}
                        </span>
                      </td>
                      <td className="px-10 py-6">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-slate-800 rounded-full transition-all duration-1000"
                              style={{
                                width: `${(getProgress(order.status) / 4) * 100}%`,
                              }}></div>
                          </div>
                          <span className="text-[10px] font-black text-slate-400 w-8">
                            {getProgress(order.status)}/4
                          </span>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                            setIsPanelOpen(true);
                          }}
                          className="text-[10px] font-black uppercase text-slate-400 hover:text-[#2b4c4f] tracking-widest transition-colors">
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Placeholder */}
          <div className="px-10 py-6 border-t border-slate-50 flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Hiển thị {filteredOrders.length} trên {orders.length} đơn hàng
            </p>
            <div className="flex gap-2">
              <button className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:bg-slate-50 transition-all">
                <ChevronLeft size={16} />
              </button>
              <button className="w-10 h-10 bg-[#2b4c4f] text-white rounded-xl text-xs font-black shadow-lg shadow-[#2b4c4f]/20">
                1
              </button>
              <button className="w-10 h-10 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50">
                2
              </button>
              <button className="w-10 h-10 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50">
                3
              </button>
              <button className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:bg-slate-50 transition-all">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex gap-6">
            <div className="w-14 h-14 bg-slate-100 rounded-[1.25rem] flex items-center justify-center text-slate-600 flex-shrink-0">
              <Info size={28} />
            </div>
            <div className="space-y-3">
              <h3 className="text-md font-black text-slate-900 uppercase tracking-tight">
                Gợi ý tác vụ
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Hiện có {stats.overdue} đơn hàng cần được xử lý gấp. Vui lòng
                kiểm tra danh sách trễ để cập nhật tình trạng cho khách hàng sớm
                nhất.
              </p>
              <button className="text-xs font-black text-[#2b4c4f] flex items-center gap-2 hover:translate-x-1 transition-transform uppercase tracking-widest">
                Xem danh sách trễ ({stats.overdue}) <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex gap-6">
            <div className="w-14 h-14 bg-slate-100 rounded-[1.25rem] flex items-center justify-center text-slate-600 flex-shrink-0">
              <TrendingUp size={28} />
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-md font-black text-slate-900 uppercase tracking-tight">
                  Tỉ lệ hoàn thành
                </h3>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                  {orders.length > 0
                    ? Math.round((stats.delivered / orders.length) * 100)
                    : 0}
                  %
                </span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed font-medium line-clamp-2">
                Chỉ số dựa trên tổng số đơn hàng đã được giao thành công so với
                tổng đơn hàng trên hệ thống.
              </p>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-800 rounded-full"
                  style={{
                    width: `${orders.length > 0 ? (stats.delivered / orders.length) * 100 : 0}%`,
                  }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side Detail Panel Overlay */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-500 ${isPanelOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsPanelOpen(false)}>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>
      </div>

      {/* Side Detail Panel Content */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-[60] transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isPanelOpen ? "translate-x-0" : "translate-x-full"}`}>
        {selectedOrder && (
          <div className="h-full flex flex-col">
            {/* Panel Header */}
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-[#f4ebd0] p-3 rounded-2xl">
                  <ShoppingBag size={24} className="text-[#2b4c4f]" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    #ORD-{String(selectedOrder.id).slice(0, 8).toUpperCase()}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(selectedOrder.status)}
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
                      •
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {new Date(selectedOrder.created_at).toLocaleDateString(
                        "vi-VN",
                      )}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsPanelOpen(false)}
                className="p-3 bg-slate-100 rounded-2xl text-slate-400 hover:bg-slate-200 transition-all">
                <X size={20} />
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
              {/* Customer Info */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                  <User size={18} className="text-[#2b4c4f]" />
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                    Thông tin khách hàng
                  </h3>
                </div>
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Tên khách hàng
                    </p>
                    <p className="text-sm font-black text-slate-900">
                      {selectedOrder.user_addresses?.receiver_name ||
                        selectedOrder.users?.full_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Số điện thoại
                    </p>
                    <p className="text-sm font-black text-slate-900">
                      {selectedOrder.user_addresses?.phone_number ||
                        selectedOrder.users?.phone ||
                        "N/A"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Địa chỉ nhận hàng
                    </p>
                    <div className="flex gap-2">
                      <MapPin
                        size={16}
                        className="text-slate-400 mt-1 flex-shrink-0"
                      />
                      <p className="text-sm font-bold text-slate-700 leading-relaxed">
                        {selectedOrder.user_addresses?.street_address},{" "}
                        {selectedOrder.user_addresses?.ward},{" "}
                        {selectedOrder.user_addresses?.city}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                  <TrendingUp size={18} className="text-[#2b4c4f]" />
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                    Cập nhật trạng thái
                  </h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {[
                    { val: "processing", label: "Xác nhận & Xử lý" },
                    { val: "shipped", label: "Bắt đầu giao hàng" },
                    { val: "delivered", label: "Giao thành công" },
                  ].map((btn) => (
                    <button
                      key={btn.val}
                      onClick={() =>
                        handleUpdateStatus(selectedOrder.id, btn.val)
                      }
                      disabled={
                        selectedOrder.status === btn.val ||
                        selectedOrder.status === "delivered" ||
                        selectedOrder.status === "completed"
                      }
                      className={`px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-tight transition-all border shadow-sm ${
                        selectedOrder.status === btn.val
                          ? "bg-[#2b4c4f] text-white border-[#2b4c4f]"
                          : "bg-white text-slate-500 border-slate-100 hover:border-[#2b4c4f] hover:text-[#2b4c4f] disabled:opacity-50 disabled:cursor-not-allowed"
                      }`}>
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
                  <Package size={18} className="text-[#2b4c4f]" />
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                    Chi tiết sản phẩm
                  </h3>
                </div>
                <div className="space-y-4">
                  {selectedOrder.order_items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-slate-50 shadow-sm hover:shadow-md transition-all">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl p-2 border border-slate-100 flex-shrink-0">
                        <img
                          src={item.products?.thumbnail}
                          alt={item.products?.title}
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-black text-slate-900 truncate">
                          {item.products?.title}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          Số lượng: {item.quantity} • Đơn giá:{" "}
                          {formatPrice(item.price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-4 shadow-2xl shadow-slate-900/20">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <CreditCard size={18} className="text-slate-400" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
                      Hình thức thanh toán
                    </span>
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">
                    {selectedOrder.payment_method?.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-400">
                    Trạng thái thanh toán
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg ${selectedOrder.payment_status === "paid" ? "bg-emerald-500/20 text-emerald-400" : "bg-orange-500/20 text-orange-400"}`}>
                    {selectedOrder.payment_status === "paid"
                      ? "Đã thanh toán"
                      : "Chờ thu tiền"}
                  </span>
                </div>
                <div className="pt-4 flex items-center justify-between border-t border-white/10">
                  <p className="text-lg font-black tracking-tight underline decoration-slate-400 underline-offset-8">
                    Tổng cộng{" "}
                  </p>
                  <p className="text-3xl font-black tracking-tight">
                    {formatPrice(selectedOrder.total_price)}
                  </p>
                </div>
              </div>
            </div>

            {/* Panel Footer */}
            <div className="p-8 border-t border-slate-50 flex gap-4">
              <button
                onClick={() => setIsPanelOpen(false)}
                className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all">
                Đóng
              </button>
              <button className="flex-1 bg-[#2b4c4f] text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-[#2b4c4f]/20 hover:scale-[1.02] active:scale-95 transition-all">
                In hóa đơn
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Manual Order Creation Modal */}
      <div
        className={`fixed inset-0 z-[100] transition-opacity duration-500 ${isCreateModalOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsCreateModalOpen(false)}
        ></div>
        <div
          className={`absolute right-0 top-0 h-full w-full max-w-4xl bg-[#fafafa] shadow-2xl transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden flex flex-col ${isCreateModalOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          {/* Modal Header */}
          <div className="p-8 bg-white border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-[#2b4c4f] p-3 rounded-2xl text-white">
                <Plus size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Tạo đơn hàng mới
                </h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Nhân viên: Bao Long (Staff)
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="p-3 bg-slate-100 rounded-2xl text-slate-400 hover:bg-slate-200 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Left Column: Customer & Shipping */}
              <div className="space-y-10">
                <section className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                    <User size={18} className="text-[#2b4c4f]" />
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                      Thông tin khách hàng
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        placeholder="Tìm SĐT hoặc Tên khách cũ..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#2b4c4f]/10 outline-none transition-all shadow-sm"
                      />
                      {userResults.length > 0 && (
                        <div className="absolute top-full left-0 w-full bg-white mt-2 rounded-2xl shadow-2xl border border-slate-100 z-10 overflow-hidden">
                          {userResults.map(u => (
                            <button
                              key={u.id}
                              onClick={() => {
                                setManualOrder(prev => ({
                                  ...prev,
                                  customer: {
                                    ...prev.customer,
                                    name: u.full_name,
                                    phone: u.phone || "",
                                    email: u.email || ""
                                  }
                                }));
                                setUserSearch("");
                                setUserResults([]);
                              }}
                              className="w-full p-4 text-left hover:bg-slate-50 flex items-center justify-between group transition-colors"
                            >
                              <div>
                                <p className="text-sm font-black text-slate-900">{u.full_name}</p>
                                <p className="text-[10px] font-bold text-slate-400">{u.phone || u.email}</p>
                              </div>
                              <ArrowRight size={14} className="text-slate-300 group-hover:text-[#2b4c4f] transition-colors" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Họ tên nhận hàng</label>
                        <input
                          type="text"
                          value={manualOrder.customer.name}
                          onChange={(e) => setManualOrder(prev=>({...prev, customer: {...prev.customer, name: e.target.value}}))}
                          className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#2b4c4f]/10 outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Số điện thoại</label>
                        <input
                          type="text"
                          value={manualOrder.customer.phone}
                          onChange={(e) => setManualOrder(prev=>({...prev, customer: {...prev.customer, phone: e.target.value}}))}
                          className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#2b4c4f]/10 outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Địa chỉ chi tiết</label>
                      <input
                        type="text"
                        placeholder="Số nhà, tên đường..."
                        value={manualOrder.customer.street}
                        onChange={(e) => setManualOrder(prev=>({...prev, customer: {...prev.customer, street: e.target.value}}))}
                        className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#2b4c4f]/10 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Phường/Xã</label>
                        <input
                          type="text"
                          value={manualOrder.customer.ward}
                          onChange={(e) => setManualOrder(prev=>({...prev, customer: {...prev.customer, ward: e.target.value}}))}
                          className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#2b4c4f]/10 outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Thành phố</label>
                        <input
                          type="text"
                          value={manualOrder.customer.city}
                          onChange={(e) => setManualOrder(prev=>({...prev, customer: {...prev.customer, city: e.target.value}}))}
                          className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#2b4c4f]/10 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                    <CreditCard size={18} className="text-[#2b4c4f]" />
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                      Ghi chú & Thanh toán
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <textarea
                      placeholder="Ghi chú đơn hàng (ví dụ: Giao sau giờ hành chính...)"
                      rows="3"
                      value={manualOrder.note}
                      onChange={(e) => setManualOrder(prev=>({...prev, note: e.target.value}))}
                      className="w-full px-5 py-4 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#2b4c4f]/10 outline-none resize-none"
                    ></textarea>
                  </div>
                </section>
              </div>

              {/* Right Column: Products & Summary */}
              <div className="space-y-10">
                <section className="space-y-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-visible">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ShoppingBag size={18} className="text-[#2b4c4f]" />
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                        Sản phẩm đã chọn ({manualOrder.items.length})
                      </h3>
                    </div>
                  </div>

                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        placeholder="Tìm tên sản phẩm để thêm..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#2b4c4f]/10 outline-none transition-all"
                      />
                      {(productSearch || productResults.length > 0) && (
                        <button 
                          onClick={() => {
                            setProductSearch("");
                            setProductResults([]);
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      )}
                      {productResults.length > 0 && (
                        <div className="absolute top-full left-0 w-full bg-white mt-2 rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden flex flex-col max-h-[400px]">
                          <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {productResults.map(p => (
                              <button
                                key={p.id}
                                onClick={() => handleAddItem(p)}
                                className="w-full p-4 text-left hover:bg-slate-50 flex items-center gap-4 transition-colors"
                              >
                                <img src={p.thumbnail} className="w-10 h-10 rounded-lg object-cover bg-slate-50" />
                                <div className="flex-1">
                                  <p className="text-sm font-black text-slate-900">{p.title}</p>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.sku || "N/A"}</span>
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">Kho: {p.stock}</span>
                                    <span className="text-[10px] font-bold text-[#2b4c4f]">{formatPrice(p.price)}</span>
                                  </div>
                                </div>
                                <Plus size={16} className="text-slate-300" />
                              </button>
                            ))}
                          </div>
                          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              Nhấn nút (X) ở ô tìm kiếm để đóng danh sách
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {manualOrder.items.length === 0 ? (
                      <div className="py-10 text-center space-y-3">
                        <Package size={40} className="mx-auto text-slate-200" strokeWidth={1} />
                        <p className="text-xs font-bold text-slate-400">Giỏ hàng đang trống</p>
                      </div>
                    ) : (
                      manualOrder.items.map(item => (
                        <div key={item.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl">
                          <img src={item.thumbnail} className="w-12 h-12 rounded-xl object-cover bg-white shadow-sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-slate-900 truncate">{item.title}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-bold text-slate-400 uppercase">{item.sku || "N/A"}</span>
                              <span className="text-[10px] font-bold text-slate-400">{formatPrice(item.price)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xl shadow-sm">
                            <button onClick={() => handleUpdateQty(item.id, -1)} className="p-1 text-slate-400 hover:text-slate-900"><X size={12} /></button>
                            <span className="text-xs font-black text-slate-900 w-4 text-center">{item.quantity}</span>
                            <button onClick={() => handleUpdateQty(item.id, 1)} className="p-1 text-slate-400 hover:text-slate-900"><Plus size={12} /></button>
                          </div>
                          <button onClick={() => handleRemoveItem(item.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                            <X size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-6 border-t border-slate-100 space-y-4">
                    <div className="flex justify-between items-center text-slate-400">
                      <span className="text-xs font-bold uppercase tracking-widest">Tạm tính</span>
                      <span className="font-bold">{formatPrice(manualOrder.items.reduce((s, i) => s + i.price * i.quantity, 0))}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Tổng thanh toán</span>
                      <span className="text-2xl font-black text-[#2b4c4f] tracking-tight">
                        {formatPrice(manualOrder.items.reduce((s, i) => s + i.price * i.quantity, 0))}
                      </span>
                    </div>
                    <button
                      onClick={handleSubmitManualOrder}
                      disabled={manualOrder.items.length === 0}
                      className="w-full bg-[#2b4c4f] text-white py-5 rounded-3xl font-black text-sm shadow-xl shadow-[#2b4c4f]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Xác nhận & Tạo đơn hàng
                    </button>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
