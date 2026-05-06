import { supabase } from "../config/supabase.js";
import { calculateFengShui } from "../utils/colorUtils.js";

export const getAllColors = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("colors")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error("Lỗi lấy danh mục màu sắc:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

export const createColor = async (req, res) => {
  try {
    const { name, hex, element: manualElement } = req.body;

    // Tự động tính toán mệnh nếu không được cung cấp thủ công
    const element = manualElement || calculateFengShui(hex);

    const { data, error } = await supabase
      .from("colors")
      .insert([{ name, hex, element }])
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return res
          .status(400)
          .json({ message: "Mã màu này đã tồn tại trong thư viện" });
      }
      throw error;
    }

    res.status(201).json(data);
  } catch (error) {
    console.error("Lỗi tạo màu mới:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

export const updateColor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, hex, element: manualElement } = req.body;

    // Tự động tính toán mệnh khi cập nhật
    const element = manualElement || calculateFengShui(hex);

    const { data, error } = await supabase
      .from("colors")
      .update({ name, hex, element })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    console.error("Lỗi cập nhật màu sắc:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

export const deleteColor = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("colors").delete().eq("id", id);
    if (error) throw error;
    res.status(200).json({ message: "Xóa màu thành công" });
  } catch (error) {
    console.error("Lỗi xóa màu sắc:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};
