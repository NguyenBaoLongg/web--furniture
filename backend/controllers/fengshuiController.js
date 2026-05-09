import { supabase } from "../config/supabase.js";
import { calculateFengShui } from "../utils/colorUtils.js";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "YOUR_API_KEY",
});

export const consultFengShui = async (req, res) => {
  try {
    const { birthDate } = req.body;

    if (!birthDate) {
      return res.status(400).json({
        message: "Vui lòng cung cấp ngày sinh",
      });
    }

    const prompt = `
Bạn là chuyên gia tư vấn phong thủy nội thất.

Nhiệm vụ:
1. Xác định mệnh (Ngũ hành nạp âm) dựa trên ngày sinh: ${birthDate}.
2. Đưa ra lời khuyên chọn nội thất phù hợp với mệnh đó.

Quy tắc bắt buộc:
- Chỉ xác định mệnh theo năm sinh âm lịch/nạp âm.
- Chỉ trả về JSON hợp lệ.
- Không markdown, không giải thích, không thêm chữ ngoài JSON.
Trả về đúng định dạng:
{
  "element": "Tên mệnh (Kim, Mộc, Thủy, Hỏa, hoặc Thổ)",
  "element_en": "Tên mệnh tiếng Anh (Metal, Wood, Water, Fire, hoặc Earth)",
  "advice": "Lời khuyên tối đa 30 từ về chọn nội thất theo mệnh."
}
`.trim();

    let fengShuiData;

    try {
      console.log(">>> Using Gemini API (gemini-2.0-flash-lite)");

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0,
        },
      });
      const text = response.text;

      console.log(">>> Gemini Response:", text);

      if (!text) {
        throw new Error("Gemini không trả về dữ liệu.");
      }

      try {
        fengShuiData = JSON.parse(text);
      } catch (parseError) {
        console.error("AI không trả về JSON hợp lệ. Nội dung gốc:", text);
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
      console.error("Lỗi Gemini:", error.message);

      return res.status(500).json({
        message: "Không thể kết nối hoặc xử lý dữ liệu từ Gemini.",
        detail: error.message,
      });
    }

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
