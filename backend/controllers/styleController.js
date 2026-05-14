import { supabase } from "../config/supabase.js";

export const getAllStyles = async (req, res) => {
  try {
    const { data, error } = await supabase.from("styles").select("*").order("name");

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Lỗi lấy danh sách style:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

export const getStyleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { data, error } = await supabase
      .from("styles")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Lỗi lấy style theo slug:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

const slugify = (text) => {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

export const createStyle = async (req, res) => {
  try {
    const { name, image_url } = req.body;
    const slug = req.body.slug || slugify(name);

    const { data, error } = await supabase
      .from("styles")
      .insert([{ name, slug, image_url }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error("Lỗi tạo style:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

export const updateStyle = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image_url } = req.body;
    let slug = req.body.slug;
    
    if (name && !slug) {
        slug = slugify(name);
    }

    const { data, error } = await supabase
      .from("styles")
      .update({ name, slug, image_url })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Lỗi cập nhật style:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

export const deleteStyle = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("styles").delete().eq("id", id);

    if (error) throw error;
    res.json({ message: "Xóa style thành công" });
  } catch (error) {
    console.error("Lỗi xóa style:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};
