import { supabase } from "../config/supabase.js";
import { calculateFengShui } from "../utils/colorUtils.js";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL;

export const consultFengShui = async (req, res) => {
  try {
    const { birthDate } = req.body;

    if (!birthDate) {
      return res.status(400).json({
        message: "Vui lòng cung cấp ngày sinh",
      });
    }

    const prompt = `
Bạn là bộ tạo JSON phong thủy nội thất.

Quy tắc bắt buộc:
- Chỉ xác định mệnh theo năm sinh âm lịch/nạp âm.
- Không dùng cung mệnh, bát tự, ngày sinh, giờ sinh.
- Ngày sinh đầu vào có định dạng DD/MM/YYYY.
- Chỉ trả về JSON hợp lệ.
- Không markdown, không giải thích, không thêm chữ ngoài JSON.
Người dùng sinh ngày: ${birthDate}
Trả về đúng định dạng:
{
  "element": "Thủy",
  "element_en": "Water",
  "advice": "Lời khuyên tối đa 30 từ về chọn nội thất theo mệnh."
}
`.trim();

    let fengShuiData;

    try {
      console.log(">>> OLLAMA URL:", OLLAMA_URL);
      console.log(">>> OLLAMA MODEL:", OLLAMA_MODEL);

      const ollamaResponse = await fetch(`${OLLAMA_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          prompt,
          stream: false,
          format: "json",
          options: {
            temperature: 0,
            top_p: 1,
            seed: 1,
          },
        }),
      });
      const result = await ollamaResponse.json();

      console.log(">>> Ollama Response:", result);

      if (result.error) {
        throw new Error(`Ollama báo lỗi: ${result.error}`);
      }

      if (!result.response) {
        throw new Error("Ollama không trả về dữ liệu 'response'.");
      }

      try {
        fengShuiData = JSON.parse(result.response);
      } catch (parseError) {
        console.error(
          "AI không trả về JSON hợp lệ. Nội dung gốc:",
          result.response,
        );
        throw new Error("Dữ liệu từ AI không đúng định dạng JSON");
      }

      if (
        !fengShuiData.element ||
        !fengShuiData.element_en ||
        !fengShuiData.advice
      ) {
        throw new Error("JSON từ AI thiếu trường bắt buộc.");
      }
    } catch (error) {
      console.error("Lỗi Ollama:", error.message);

      return res.status(500).json({
        message: "Không thể kết nối hoặc xử lý dữ liệu từ Ollama.",
        detail: error.message,
      });
    }

    // --- LOGIC TỰ ĐỘNG TÌM MÀU THEO MỆNH ---

    // 1. Lấy tất cả màu trong database
    const { data: allColors, error: colorsError } = await supabase
      .from("colors")
      .select("name, hex");

    if (colorsError) throw colorsError;
    const matchingColors = allColors.filter((color) => {
      const colorElement = calculateFengShui(color.hex);
      return colorElement === fengShuiData.element;
    });
    fengShuiData.luckyColors = matchingColors.map((c) => ({
      name: c.name,
      hex: c.hex,
    }));

    // 3. Truy vấn sản phẩm dựa trên cột element mới (sử dụng ilike để tìm kiếm trong chuỗi)
    const { data: products, error: productError } = await supabase
      .from("products")
      .select(
        `
        *,
        product_images (
          image_url
        )
      `,
      )
      .ilike("element", `%${fengShuiData.element}%`)
      .eq("is_active", true);

    if (productError) {
      console.error("Lỗi Supabase:", productError);
      return res.status(500).json({
        message: "Không thể lấy danh sách sản phẩm phù hợp.",
        detail: productError.message,
      });
    }

    return res.status(200).json({
      consultation: fengShuiData,
      suggestedProducts: products || [],
    });
  } catch (error) {
    console.error("Lỗi tư vấn phong thủy:", error);

    return res.status(500).json({
      message: "Lỗi Server",
      detail: error.message,
    });
  }
};

export const getProductsByElement = async (req, res) => {
  try {
    const { element } = req.query;

    if (!element) {
      return res.status(400).json({
        message: "Vui lòng cung cấp tên mệnh (Kim, Mộc, Thủy, Hỏa, Thổ)",
      });
    }

    const { data: products, error: productError } = await supabase
      .from("products")
      .select(
        `
        *,
        product_images (
          image_url
        )
      `,
      )
      .ilike("element", `%${element}%`)
      .eq("is_active", true);

    if (productError) {
      console.error("Lỗi Supabase:", productError);
      return res.status(500).json({
        message: "Không thể lấy danh sách sản phẩm theo mệnh.",
        detail: productError.message,
      });
    }

    return res.status(200).json(products || []);
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm theo mệnh:", error);
    return res.status(500).json({
      message: "Lỗi Server",
      detail: error.message,
    });
  }
};
