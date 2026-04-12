import { supabase } from "../config/supabase.js";

export const getAllProducts = async (req, res) => {
  try {
    const { activeOnly, search } = req.query;
    let query = supabase.from("products").select(`
        *,
        categories ( name, slug ),
        product_images ( image_url ),
        product_rooms ( rooms ( id, name, slug ) ),
        product_colors ( colors ( id, name, hex, element ) )
      `);

    if (activeOnly === "true") {
      query = query.eq("is_active", true);
    }

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    const { data: products, error } = await query;

    if (error) throw error;

    res.status(200).json(products);
  } catch (error) {
    console.error("Lỗi lấy tất cả sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server khi lấy dữ liệu" });
  }
};

export const getNewArrivals = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        product_colors ( colors ( id, name, hex, element ) )
      `)
      .eq("is_new_arrival", true)
      .eq("is_active", true)
      .limit(12);

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
      .select(`
        *, 
        categories!inner(slug),
        product_colors ( colors ( id, name, hex, element ) )
      `)
      .eq("categories.slug", categorySlug)
      .eq("is_active", true);

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
      .from("product_rooms")
      .select(`
        rooms!inner(slug),
        products (
          *, 
          categories (name, slug),
          product_colors ( colors ( id, name, hex, element ) )
        )
      `)
      .eq("rooms.slug", roomSlug)
      .eq("products.is_active", true);

    // Giải nén cấu trúc lồng nhau của Supabase
    const products = data?.map(item => item.products).filter(p => p !== null) || [];

    if (error) throw error;
    res.json(products);
  } catch (error) {
    console.error("Lỗi lấy sản phẩm theo phòng:", error);
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
        categories ( name, slug ),
        product_images ( image_url ),
        product_rooms ( rooms ( id, name, slug ) ),
        product_colors ( colors ( id, name, hex, element ) )
      `,
      )
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error) throw error;
    if (!data)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    res.json(data);
  } catch (error) {
    console.error("Lỗi ở Backend:", error);
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

export const createProduct = async (req, res) => {
  try {
    const {
      title,
      price,
      description,
      stock,
      category_id,
      thumbnail,
      is_new_arrival,
      width,
      depth,
      height,
      weight,
      material,
      care_instructions,
      sku,
      color_ids,
      images,
      room_ids,
      is_active,
    } = req.body;

    const slug = req.body.slug || slugify(title);

    const { data: product, error } = await supabase
      .from("products")
      .insert([
        {
          title,
          slug,
          price: price ? parseFloat(price) : 0,
          description,
          stock: stock ? parseInt(stock) : 0,
          category_id,
          thumbnail,
          is_new_arrival: is_new_arrival || false,
          width,
          depth,
          height,
          weight,
          material,
          care_instructions,
          sku,
          is_active: is_active !== undefined ? is_active : true,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    if (images && Array.isArray(images) && images.length > 0) {
      const imageData = images.map((url) => ({
        product_id: product.id,
        image_url: url,
      }));

      const { error: imageError } = await supabase
        .from("product_images")
        .insert(imageData);

      if (imageError) console.error("Lỗi lưu ảnh phụ:", imageError);
    }

    if (room_ids && Array.isArray(room_ids) && room_ids.length > 0) {
      const roomData = room_ids.map((roomId) => ({
        product_id: product.id,
        room_id: roomId,
      }));

      const { error: roomError } = await supabase
        .from("product_rooms")
        .insert(roomData);

      if (roomError) console.error("Lỗi lưu quan hệ phòng:", roomError);
    }

    if (color_ids && Array.isArray(color_ids) && color_ids.length > 0) {
      const colorData = color_ids.map((colorId) => ({
        product_id: product.id,
        color_id: colorId,
      }));

      const { error: colorError } = await supabase
        .from("product_colors")
        .insert(colorData);

      if (colorError) console.error("Lỗi lưu quan hệ màu sắc:", colorError);
    }

    res.status(201).json(product);
  } catch (error) {
    console.error("Lỗi tạo sản phẩm:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { images, room_ids, color_ids, ...productData } = req.body;

    if (productData.title && !productData.slug) {
      productData.slug = slugify(productData.title);
    }

    const { data: updatedProduct, error } = await supabase
      .from("products")
      .update(productData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    if (images && Array.isArray(images)) {
      await supabase.from("product_images").delete().eq("product_id", id);
      if (images.length > 0) {
        const imageData = images.map((url) => ({
          product_id: id,
          image_url: url,
        }));
        const { error: imageError } = await supabase
          .from("product_images")
          .insert(imageData);
        if (imageError) console.error("Lỗi cập nhật ảnh phụ:", imageError);
      }
    }

    // Cập nhật quan hệ phòng (Sync Many-to-Many)
    if (room_ids && Array.isArray(room_ids)) {
      await supabase.from("product_rooms").delete().eq("product_id", id);
      if (room_ids.length > 0) {
        const roomData = room_ids.map((roomId) => ({
          product_id: id,
          room_id: roomId,
        }));
        const { error: roomError } = await supabase
          .from("product_rooms")
          .insert(roomData);
        if (roomError) console.error("Lỗi cập nhật quan hệ phòng:", roomError);
      }
    }

    // Cập nhật quan hệ màu sắc (Sync Many-to-Many)
    if (color_ids && Array.isArray(color_ids)) {
      await supabase.from("product_colors").delete().eq("product_id", id);
      if (color_ids.length > 0) {
        const colorData = color_ids.map((colorId) => ({
          product_id: id,
          color_id: colorId,
        }));
        const { error: colorError } = await supabase
          .from("product_colors")
          .insert(colorData);
        if (colorError) console.error("Lỗi cập nhật quan hệ màu sắc:", colorError);
      }
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error("Lỗi cập nhật sản phẩm:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) throw error;
    res.json({ message: "Xóa sản phẩm thành công" });
  } catch (error) {
    console.error("Lỗi xóa sản phẩm:", error);
    res.status(500).json({ message: "Lỗi Server" });
  }
};
