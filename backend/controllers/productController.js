import { supabase } from "../config/supabase.js";

export const getAllProducts = async (req, res) => {
  try {
    const { data, error } = await supabase.from("products").select("*");
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Lỗi lấy tất cả sản phẩm:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        product_images ( image_url ),
        product_variants ( color, image_url, stock )
      `,
      )
      .eq("slug", slug)
      .single();

    if (error) throw error;
    if (!data)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    res.json(data);
  } catch (error) {
    console.error("Lỗi lấy chi tiết sản phẩm:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

export const getNewArrivals = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_new_arrival", true)
      .limit(8);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Lỗi lấy sản phẩm mới về:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const { categorySlug } = req.params;

    const { data, error } = await supabase
      .from("products")
      .select("*, categories!inner(slug)")
      .eq("categories.slug", categorySlug);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Lỗi lấy sản phẩm theo danh mục:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

export const getProductsByRoom = async (req, res) => {
  try {
    const { roomSlug } = req.params;

    const { data, error } = await supabase
      .from("products")
      .select("*, rooms!inner(slug)")
      .eq("rooms.slug", roomSlug);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Lỗi lấy sản phẩm theo phòng:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};
