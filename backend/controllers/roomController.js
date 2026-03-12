import { supabase } from "../config/supabase.js";

export const getAllRooms = async (req, res) => {
  try {
    const { data, error } = await supabase.from("rooms").select("*");
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Lỗi lấy danh sách phòng:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};
