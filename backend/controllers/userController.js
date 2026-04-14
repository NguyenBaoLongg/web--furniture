import { supabase } from "../config/supabase.js";

export const getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;

    let query = supabase.from("users").select(`
      *,
      orders (
        total_price,
        status
      )
    `);

    if (role && role !== "all") {
      query = query.eq("role", role);
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;

    // Tính tổng tiền đã mua cho mỗi khách hàng (đơn hàng delivered hoặc completed)
    const usersWithSpent = data.map((user) => {
      const totalSpent = (user.orders || [])
        .filter((o) => ["delivered", "completed"].includes(o.status))
        .reduce((sum, o) => sum + (o.total_price || 0), 0);

      const { orders, ...userWithoutOrders } = user;
      return {
        ...userWithoutOrders,
        total_spent: totalSpent,
      };
    });

    res.status(200).json(usersWithSpent);
  } catch (error) {
    console.error("Lỗi lấy danh sách khách hàng:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const { data, error, count } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    if (error) throw error;

    res.status(200).json({ totalUsers: count });
  } catch (error) {
    console.error("Lỗi lấy thống kê khách hàng:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const { data, error } = await supabase
      .from("users")
      .update({ role })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ message: "Cập nhật quyền thành công", user: data });
  } catch (error) {
    console.error("Lỗi cập nhật quyền:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};
