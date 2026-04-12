import { supabase } from "../config/supabase.js";

// Lấy danh sách wishlist của người dùng
export const getWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Lấy chi tiết sản phẩm thông qua khoá ngoại
    const { data, error } = await supabase
      .from("wishlists")
      .select(`
        id,
        user_id,
        product_id,
        products (*)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Lỗi getWishlist:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

// Thêm/Huỷ sản phẩm khỏi wishlist
export const toggleWishlist = async (req, res) => {
  try {
    const { user_id, product_id } = req.body;

    // Kiểm tra xem đã có trong wishlist chưa
    const { data: existing } = await supabase
      .from("wishlists")
      .select("*")
      .eq("user_id", user_id)
      .eq("product_id", product_id)
      .single();

    if (existing) {
      // Nếu có rồi thì huỷ
      const { error } = await supabase
        .from("wishlists")
        .delete()
        .eq("id", existing.id);

      if (error) throw error;
      return res.json({ message: "Removed from wishlist", isFavorite: false });
    } else {
      // Nếu chưa có thì thêm mới
      const { data, error } = await supabase
        .from("wishlists")
        .insert([{ user_id, product_id }])
        .select()
        .single();

      if (error) throw error;
      return res.json({ message: "Added to wishlist", isFavorite: true, data });
    }
  } catch (error) {
    console.error("Lỗi toggleWishlist:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

// Kiểm tra trạng thái yêu thích
export const checkWishlistStatus = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const { data, error } = await supabase
      .from("wishlists")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .single();

    // Nếu ko tìm thấy (error sẽ ném hoặc record rỗng), có nghĩa là ko favorited
    if (!data) {
      return res.json({ isFavorite: false });
    }

    res.json({ isFavorite: true });
  } catch (error) {
    res.json({ isFavorite: false }); // Lỗi hoặc k có dl
  }
};
