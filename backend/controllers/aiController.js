import axios from "axios";
import { supabase } from "../config/supabase.js";

const OLLAMA_URL = "http://127.0.0.1:11434/api/generate";
const MODEL = "deepseek-r1:8b";

export const aiSearchProducts = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Vui lòng nhập yêu cầu" });
    }

    const { data: categories } = await supabase.from("categories").select("name, slug");
    const { data: rooms } = await supabase.from("rooms").select("name, slug");
    const { data: styles } = await supabase.from("styles").select("name, slug");
    const { data: colors } = await supabase.from("colors").select("name");

    const categoryList = categories?.map((c) => c.name).join(", ");
    const roomList = rooms?.map((r) => r.name).join(", ");
    const styleList = styles?.map((s) => s.name).join(", ");
    const colorList = colors?.map((c) => c.name).join(", "); 
    const prompt = `
Trích xuất thông tin tìm kiếm thành JSON. KHÔNG TRẢ LỜI GÌ THÊM.

- Danh mục hợp lệ: ${categoryList}
- Phòng hợp lệ: ${roomList}
- Phong cách hợp lệ: ${styleList}
- tên màu hợp lệ: ${colorList}
LUẬT:
1. "category": Chọn 1 từ "Danh mục hợp lệ". Nếu không có, xuất null (kiểu null, không phải chuỗi).
2. "room": Chọn 1 từ "Phòng hợp lệ". Nếu không có, xuất null.
3. "style": Chọn 1 từ "Phong cách hợp lệ". Nếu không có, xuất null.
4. "color": Chọn 1 từ "tên màu hợp lệ". Nếu không có, xuất null.
5. Giá tiền (1 triệu = 1000000):
   - Từ "trên", "hơn", "tối thiểu" -> BẮT BUỘC ghi vào "min_price", để "max_price" là null.
   - Từ "dưới", "không quá", "tối đa" -> BẮT BUỘC ghi vào "max_price", để "min_price" là null.

Ví dụ minh họa cấu trúc (Không sao chép nội dung):
{
  "category": "Tên danh mục",
  "room": "room",
  "min_price": null,
  "max_price": null,
  "style": "style",
  "color": "color"
}

Câu của người dùng: "${message}"
JSON:`.trim();
console.log(prompt)
    let aiResponse;
    try {
      const response = await axios.post(
        OLLAMA_URL,
        {
          model: MODEL,
          prompt: prompt,
          stream: false,
          format: "json",
        },
        { timeout: 90000 },
      );

      aiResponse = JSON.parse(response.data.response);

      for (let key in aiResponse) {
        if (aiResponse[key] === "null" || aiResponse[key] === "") {
          aiResponse[key] = null;
        }
      }
      if (aiResponse.min_price && typeof aiResponse.min_price === "string") {
        aiResponse.min_price = parseInt(
          aiResponse.min_price.replace(/\\D/g, ""),
        );
      }
      if (aiResponse.max_price && typeof aiResponse.max_price === "string") {
        aiResponse.max_price = parseInt(
          aiResponse.max_price.replace(/\\D/g, ""),
        );
      }

      console.log(">>> Ollama Extracted Data:", aiResponse);
    } catch (error) {
      console.error("Lỗi gọi Ollama:", error.message);
      return res.status(500).json({
        message:
          "Không thể kết nối với AI (Ollama). Vui lòng đảm bảo Ollama đang chạy.",
        detail: error.message,
      });
    }

    // Xây dựng query Supabase dựa trên JSON từ AI
    let selectFields = `
      *,
      product_images (image_url)
    `;

    // Category: Luôn lấy thông tin, dùng !inner nếu có lọc
    if (aiResponse.category) {
      selectFields += `, categories!inner(name, slug)`;
    } else {
      selectFields += `, categories(name, slug)`;
    }

    if (aiResponse.room) {
      selectFields += `, product_rooms!inner(rooms!inner(name, slug))`;
    } else {
      selectFields += `, product_rooms(rooms(name, slug))`;
    }

    if (aiResponse.style) {
      selectFields += `, product_styles!inner(styles!inner(name, slug))`;
    } else {
      selectFields += `, product_styles(styles(name, slug))`;
    }

    if (aiResponse.color) {
      selectFields += `, product_colors!inner(colors!inner(id, name, hex, element))`;
    } else {
      selectFields += `, product_colors(colors(id, name, hex, element))`;
    }

    let query = supabase.from("products").select(selectFields);

    if (aiResponse.category) {
      query = query.ilike("categories.name", `%${aiResponse.category}%`);
    }

    if (aiResponse.room) {
      query = query.ilike("product_rooms.rooms.name", `%${aiResponse.room}%`);
    }

    if (aiResponse.style) {
      query = query.ilike("product_styles.styles.name", `%${aiResponse.style}%`);
    }

    if (aiResponse.color) {
      query = query.ilike("product_colors.colors.name", `%${aiResponse.color}%`);
    }

    if (aiResponse.max_price) {
      query = query.lte("price", aiResponse.max_price);
    }

    if (aiResponse.min_price) {
      query = query.gte("price", aiResponse.min_price);
    }

    query = query.eq("is_active", true).limit(12);

    const { data: products, error: productError } = await query;

    if (productError) {
      console.error("Lỗi Supabase Query:", productError);
      throw productError;
    }
    return res.status(200).json({
      filters: aiResponse,
      products: products || [],
    });
  } catch (error) {
    console.error("Lỗi AI Search:", error);
    res.status(500).json({ message: "Lỗi Server", detail: error.message });
  }
};
