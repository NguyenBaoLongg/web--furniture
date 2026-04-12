import React, { useState, useEffect } from "react";
import { supabase } from "../../config/supabase";
import { Search, ShieldAlert, UserCheck, Trash2, Mail, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";

export const AdminPermissionsPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data);
    } catch (error) {
      console.error("Lỗi lấy danh sách người dùng:", error);
      toast.error("Không thể tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) throw error;
      
      toast.success(`Cập nhật vai trò thành công!`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error("Lỗi cập nhật vai trò:", error);
      toast.error("Lỗi khi cập nhật vai trò người dùng.");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role) => {
    switch (role) {
      case "staff":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "admin":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="text-[#2b4c4f]" /> Phân quyền & Quản trị
          </h1>
          <p className="text-sm text-gray-500">
            Quản lý vai trò và quyền truy cập của người dùng hệ thống
          </p>
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#2b4c4f] w-full md:w-80 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">Người dùng</th>
                <th className="px-6 py-4 font-bold">Email/SĐT</th>
                <th className="px-6 py-4 font-bold">Vai trò hiện tại</th>
                <th className="px-6 py-4 font-bold">Thay đổi quyền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#f4ebd0] flex items-center justify-center text-sm font-bold text-[#2b4c4f]">
                        {user.full_name?.charAt(0) || "U"}
                      </div>
                      <span className="font-bold text-gray-900">{user.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-gray-600 flex items-center gap-1.5"><Mail size={14} /> {user.email}</span>
                      <span className="text-gray-400 text-xs mt-0.5">{user.phone || "Chưa cập nhật SĐT"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getRoleBadge(user.role)}`}>
                      {user.role === 'customer' ? 'Khách hàng' : user.role === 'staff' ? 'Nhân viên' : 'Admin'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                        className="bg-white border border-gray-200 rounded px-2 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#2b4c4f] cursor-pointer"
                      >
                        <option value="customer">Khách hàng</option>
                        <option value="admin">Admin</option>
                        <option value="staff">Nhân viên</option>
                      </select>
                      
                      {user.role === 'customer' ? (
                         <div className="p-1.5 bg-green-50 text-green-600 rounded-lg" title="Người dùng thông thường">
                            <UserCheck size={16} />
                         </div>
                      ) : (
                        <div className="p-1.5 bg-red-50 text-red-600 rounded-lg" title="Tài khoản quản trị">
                            <ShieldAlert size={16} />
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
               <ShieldCheck className="text-gray-300 h-8 w-8" />
            </div>
            <p className="text-gray-500 font-medium">Không tìm thấy người dùng phù hợp!</p>
          </div>
        )}
      </div>
    </div>
  );
};
