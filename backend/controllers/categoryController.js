import { supabase } from "../config/supabase.js";

export const getFeaturedCategories = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .limit(4);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Lỗi lấy danh mục:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const { data, error } = await supabase.from("categories").select("*");

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Lỗi lấy danh mục:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

// Lấy chi tiết 1 Danh mục/Phòng dựa vào slug
export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Lỗi lấy chi tiết danh mục:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};
