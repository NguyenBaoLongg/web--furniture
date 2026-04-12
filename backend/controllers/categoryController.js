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

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

export const createCategory = async (req, res) => {
  try {
    const { name, image_url } = req.body;
    const slug = req.body.slug || slugify(name);

    const { data, error } = await supabase
      .from("categories")
      .insert([{ name, slug, image_url }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error("Lỗi tạo danh mục:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image_url } = req.body;
    const slug = req.body.slug || (name ? slugify(name) : undefined);

    const updateData = { name, image_url };
    if (slug) updateData.slug = slug;

    const { data, error } = await supabase
      .from("categories")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Lỗi cập nhật danh mục:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) throw error;
    res.json({ message: "Xóa danh mục thành công" });
  } catch (error) {
    console.error("Lỗi xóa danh mục:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};
