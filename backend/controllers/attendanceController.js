import { supabase } from "../config/supabase.js";

export const checkIn = async (req, res) => {
  try {
    const { userId } = req.body;

    // Kiểm tra xem đã check-in hôm nay chưa mà chưa check-out
    const { data: existing, error: checkError } = await supabase
      .from("staff_attendance")
      .select("*")
      .eq("user_id", userId)
      .is("check_out", null)
      .maybeSingle();

    if (checkError) throw checkError;
    if (existing) {
      return res
        .status(400)
        .json({ message: "Bạn đã check-in rồi, vui lòng check-out trước!" });
    }

    const { data, error } = await supabase
      .from("staff_attendance")
      .insert([{ user_id: userId, check_in: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: "Check-in thành công!", data });
  } catch (error) {
    console.error("Lỗi Check-in:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

// Check-out
export const checkOut = async (req, res) => {
  try {
    const { userId } = req.body;

    // Tìm bản ghi đang open (chưa check-out)
    const { data: attendance, error: findError } = await supabase
      .from("staff_attendance")
      .select("*")
      .eq("user_id", userId)
      .is("check_out", null)
      .order("check_in", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (findError) throw findError;
    if (!attendance) {
      return res
        .status(400)
        .json({ message: "Không tìm thấy lượt check-in nào đang hoạt động!" });
    }

    const checkOutTime = new Date();
    const checkInTime = new Date(attendance.check_in);

    // Tính tổng giờ làm (đơn vị: giờ)
    const durationMs = checkOutTime - checkInTime;
    const totalHours = parseFloat((durationMs / (1000 * 60 * 60)).toFixed(2));

    const { data, error } = await supabase
      .from("staff_attendance")
      .update({
        check_out: checkOutTime.toISOString(),
        total_hours: totalHours,
      })
      .eq("id", attendance.id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ message: "Check-out thành công!", data });
  } catch (error) {
    console.error("Lỗi Check-out:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

// Lấy lịch sử điểm danh theo tháng
export const getMonthlyAttendance = async (req, res) => {
  try {
    const { userId } = req.params;
    const { month, year } = req.query;

    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

    const { data, error } = await supabase
      .from("staff_attendance")
      .select("*")
      .eq("user_id", userId)
      .gte("check_in", startDate)
      .lte("check_in", endDate)
      .order("check_in", { ascending: true });

    if (error) throw error;

    // Nhóm theo ngày để tính tổng giờ làm trong ngày đó
    const dailyStats = data.reduce((acc, curr) => {
      const dateKey = curr.date; // Bảng SQL có cột date
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          total_hours: 0,
          sessions: [],
        };
      }
      acc[dateKey].total_hours += parseFloat(curr.total_hours || 0);
      acc[dateKey].sessions.push(curr);
      return acc;
    }, {});

    res.status(200).json(Object.values(dailyStats));
  } catch (error) {
    console.error("Lỗi lấy thống kê điểm danh:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

// Lấy trạng thái hiện tại (đã check-in chưa)
export const getCurrentStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from("staff_attendance")
      .select("*")
      .eq("user_id", userId)
      .is("check_out", null)
      .maybeSingle();

    if (error) throw error;
    res.status(200).json({ isCheckedIn: !!data, attendance: data });
  } catch (error) {
    console.error("Lỗi lấy trạng thái điểm danh:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};
