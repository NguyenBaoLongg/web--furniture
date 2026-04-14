import { supabase } from "../config/supabase.js";

export const getCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from("cart_items")
      .select(
        `
        id,
        quantity,
        product_id,
        variant_id,
        products ( 
          title, 
          price, 
          thumbnail,
          product_colors (
            colors ( name )
          )
        )
      `,
      )
      .eq("user_id", userId);

    if (error) throw error;

    const formattedCart = data
      .filter((item) => item.products !== null)
      .map((item) => {
        const colorNames =
          item.products.product_colors
            ?.map((pc) => pc.colors?.name)
            .filter(Boolean)
            .join(", ") || "Mặc định";

        return {
          id: item.id,
          productId: item.product_id,
          variantId: item.variant_id,
          title: item.products.title,
          price: item.products.price,
          quantity: item.quantity,
          color: colorNames,
          image: item.products.thumbnail,
        };
      });

    res.json(formattedCart);
  } catch (error) {
    console.error("Lỗi getCart:", error);
    res.status(500).json({ message: "Lỗi lấy giỏ hàng" });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { user_id, product_id, variant_id, quantity } = req.body;

    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", user_id)
      .eq("product_id", product_id)
      .eq("variant_id", variant_id)
      .single();

    if (existingItem) {
      const { data, error } = await supabase
        .from("cart_items")
        .update({ quantity: existingItem.quantity + quantity })
        .eq("id", existingItem.id)
        .select();
      if (error) throw error;
      return res.json(data);
    } else {
      const { data, error } = await supabase
        .from("cart_items")
        .insert([{ user_id, product_id, variant_id, quantity }])
        .select();
      if (error) throw error;
      return res.json(data);
    }
  } catch (error) {
    console.error("Lỗi addToCart:", error);
    res.status(500).json({ message: "Lỗi thêm vào giỏ hàng" });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", cartItemId);
    if (error) throw error;
    res.json({ message: "Đã xóa thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa sản phẩm" });
  }
};

export const updateCartQuantity = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const { quantity } = req.body;
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", cartItemId);
    if (error) throw error;
    res.json({ message: "Đã cập nhật số lượng" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật số lượng" });
  }
};
