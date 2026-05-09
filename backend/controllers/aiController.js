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

    const { data: categories } = await supabase
      .from("categories")
      .select("name, slug");
    const { data: rooms } = await supabase.from("rooms").select("name, slug");

    const categoryList = categories?.map((c) => c.name).join(", ");
    const roomList = rooms?.map((r) => r.name).join(", ");

    const prompt = `
Trích xuất thông tin tìm kiếm thành JSON. KHÔNG TRẢ LỜI GÌ THÊM.

- Danh mục hợp lệ: ${categoryList}
- Phòng hợp lệ: ${roomList}

LUẬT:
1. "category": Chọn 1 từ "Danh mục hợp lệ". Nếu không có, xuất null (kiểu null, không phải chuỗi).
2. "room": Chọn 1 từ "Phòng hợp lệ".
3. Giá tiền (1 triệu = 1000000):
   - Từ "trên", "hơn", "tối thiểu" -> BẮT BUỘC ghi vào "min_price", để "max_price" là null.
   - Từ "dưới", "không quá", "tối đa" -> BẮT BUỘC ghi vào "max_price", để "min_price" là null.

Ví dụ minh họa cấu trúc (Không sao chép nội dung):
{
  "category": "Tên danh mục",
  "room": null,
  "min_price": 15000000,
  "max_price": null,
  "style": "hiện đại",
  "color": "da"
}

Câu của người dùng: "${message}"
JSON:`.trim();

    console.log(">>> Sending prompt to Ollama...");

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
    let query = supabase.from("products").select(`
      *,
      categories!inner(name, slug),
      product_images (image_url),
      product_rooms!inner(rooms!inner(name, slug)),
      product_colors (colors (id, name, hex, element))
    `);

    if (aiResponse.category) {
      query = query.ilike("categories.name", `%${aiResponse.category}%`);
    }

    if (aiResponse.room) {
      query = query.ilike("product_rooms.rooms.name", `%${aiResponse.room}%`);
    }

    if (aiResponse.max_price) {
      query = query.lte("price", aiResponse.max_price);
    }

    if (aiResponse.min_price) {
      query = query.gte("price", aiResponse.min_price);
    }

    // Lọc thêm theo title hoặc description nếu có style hoặc color
    if (aiResponse.style || aiResponse.color) {
      const filterTerm = [aiResponse.style, aiResponse.color]
        .filter(Boolean)
        .join(" ");
      query = query.or(
        `title.ilike.%${filterTerm}%,description.ilike.%${filterTerm}%`,
      );
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
