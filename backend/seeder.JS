// File: backend/seeder.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product"); // Trỏ đúng đường dẫn tới file Product model của bạn

// Load biến môi trường từ file .env (để lấy link kết nối Database)
dotenv.config();

// Dữ liệu giả lập (Mock Data) chuẩn Decor
const products = [
  {
    name: "Ghế Sofa Băng Vải Nỉ Mềm Mại",
    sku: "SF-NORDIC-001",
    description:
      "Sofa 3 chỗ ngồi êm ái, thiết kế tối giản mang lại cảm giác ấm cúng cho không gian phòng khách.",
    price: 5500000,
    discountPrice: 4900000,
    stock: 15,
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
    ],
    category: "Ghế",
    style: ["Bắc Âu (Nordic)", "Tối giản (Minimalist)"],
    room: ["Phòng khách", "Phòng làm việc"],
    material: "Vải nỉ, Khung gỗ sồi",
    color: ["Xám nhạt", "Be"],
    dimensions: { length: 200, width: 85, height: 80 },
    aiTags: ["thư giãn", "êm ái", "thanh lịch", "tiết kiệm diện tích"],
  },
  {
    name: "Bàn Trà Gỗ Sồi Mặt Kính",
    sku: "TB-MODERN-002",
    description:
      "Bàn trà đôi thiết kế hiện đại, mặt kính cường lực chống xước kết hợp chân gỗ tự nhiên chắc chắn.",
    price: 2200000,
    discountPrice: 0,
    stock: 20,
    images: [
      "https://images.unsplash.com/photo-1533090481720-856c2e3e15f8?auto=format&fit=crop&w=800&q=80",
    ],
    category: "Bàn",
    style: ["Hiện đại (Modern)", "Bắc Âu (Nordic)"],
    room: ["Phòng khách", "Ban công"],
    material: "Gỗ sồi, Kính cường lực",
    color: ["Nâu vân gỗ", "Trong suốt"],
    dimensions: { length: 100, width: 60, height: 45 },
    aiTags: ["sang trọng", "gọn gàng", "dễ lau chùi"],
  },
  {
    name: "Đèn Thả Trần Kim Loại Đen",
    sku: "LM-INDUS-003",
    description:
      "Đèn thả trần phong cách công nghiệp mạnh mẽ, ánh sáng vàng ấm áp phù hợp cho bàn ăn hoặc quầy bar.",
    price: 850000,
    discountPrice: 700000,
    stock: 50,
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f7821?auto=format&fit=crop&w=800&q=80",
    ],
    category: "Đèn",
    style: ["Công nghiệp (Industrial)", "Tối giản (Minimalist)"],
    room: ["Phòng bếp", "Phòng khách"],
    material: "Kim loại sơn tĩnh điện",
    color: ["Đen nhám"],
    dimensions: { length: 30, width: 30, height: 40 },
    aiTags: ["ấm áp", "cá tính", "điểm nhấn", "hoài cổ"],
  },
  {
    name: "Tủ Đầu Giường Gỗ Tràm",
    sku: "CB-VINT-004",
    description:
      "Tủ tab đầu giường 2 ngăn kéo tiện lợi, thiết kế mang hơi hướng hoài cổ, lưu trữ đồ dùng cá nhân gọn gàng.",
    price: 1500000,
    discountPrice: 0,
    stock: 30,
    images: [
      "https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=800&q=80",
    ],
    category: "Tủ",
    style: ["Cổ điển (Vintage)", "Bắc Âu (Nordic)"],
    room: ["Phòng ngủ"],
    material: "Gỗ tràm tự nhiên",
    color: ["Nâu cánh gián"],
    dimensions: { length: 45, width: 40, height: 50 },
    aiTags: ["tiện lợi", "ngăn nắp", "mộc mạc", "giấc ngủ ngon"],
  },
  {
    name: "Tranh Canvas Trừu Tượng",
    sku: "AR-MODERN-005",
    description:
      "Bộ 3 tranh canvas in UV chất lượng cao, họa tiết nét vẽ trừu tượng tông màu nóng tạo năng lượng tích cực.",
    price: 1200000,
    discountPrice: 990000,
    stock: 40,
    images: [
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
    ],
    category: "Tranh",
    style: ["Hiện đại (Modern)"],
    room: ["Phòng khách", "Phòng làm việc", "Phòng ngủ"],
    material: "Vải Canvas, Khung Composite",
    color: ["Đỏ", "Vàng", "Cam"],
    dimensions: { length: 60, width: 40, height: 3 },
    aiTags: ["sáng tạo", "năng lượng", "nghệ thuật", "nổi bật"],
  },
  {
    name: "Thảm Trải Sàn Lông Cừu Nhân Tạo",
    sku: "RP-NORDIC-006",
    description:
      "Thảm trải sàn siêu mềm mịn, giữ nhiệt tốt vào mùa đông, chống trơn trượt an toàn cho trẻ nhỏ.",
    price: 1800000,
    discountPrice: 1500000,
    stock: 25,
    images: [
      "https://images.unsplash.com/photo-1590209149466-2678c0053709?auto=format&fit=crop&w=800&q=80",
    ],
    category: "Thảm",
    style: ["Bắc Âu (Nordic)"],
    room: ["Phòng khách", "Phòng ngủ"],
    material: "Lông cừu nhân tạo",
    color: ["Trắng kem"],
    dimensions: { length: 200, width: 160, height: 2 },
    aiTags: ["mềm mại", "ấm áp", "an toàn", "sang trọng"],
  },
  {
    name: "Ghế Thư Giãn Đọc Sách Bọc Da",
    sku: "SF-VINT-007",
    description:
      "Ghế bành thư giãn bọc da PU cao cấp, góc nghiêng hoàn hảo nâng đỡ cột sống giúp đọc sách không mỏi.",
    price: 4200000,
    discountPrice: 0,
    stock: 12,
    images: [
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80",
    ],
    category: "Ghế",
    style: ["Cổ điển (Vintage)", "Công nghiệp (Industrial)"],
    room: ["Phòng làm việc", "Phòng khách", "Ban công"],
    material: "Da PU, Khung sắt",
    color: ["Nâu bò", "Đen"],
    dimensions: { length: 90, width: 80, height: 100 },
    aiTags: ["thư giãn", "cổ điển", "nam tính", "tập trung"],
  },
  {
    name: "Kệ Sách Tổ Ong Tối Giản",
    sku: "SH-MINI-008",
    description:
      "Kệ sách treo tường hình tổ ong ghép nối linh hoạt, tiết kiệm không gian và trang trí mảng tường trống.",
    price: 650000,
    discountPrice: 550000,
    stock: 60,
    images: [
      "https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=800&q=80",
    ],
    category: "Phụ kiện",
    style: ["Tối giản (Minimalist)"],
    room: ["Phòng làm việc", "Phòng ngủ"],
    material: "Gỗ MDF chống ẩm",
    color: ["Trắng", "Vân gỗ sáng"],
    dimensions: { length: 30, width: 20, height: 30 },
    aiTags: ["thông minh", "tiết kiệm diện tích", "gọn gàng"],
  },
];

const importData = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("MongoDB Connected...");

    await Product.deleteMany();
    console.log("Đã xóa dữ liệu cũ...");

    await Product.insertMany(products);
    console.log("✅ IMPORT THÀNH CÔNG! Đã bơm dữ liệu Sản phẩm vào Database.");

    process.exit(); // Thoát chương trình
  } catch (error) {
    console.error("❌ LỖI IMPORT:", error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    await Product.deleteMany();
    console.log("🗑️ ĐÃ XÓA SẠCH DỮ LIỆU SẢN PHẨM!");
    process.exit();
  } catch (error) {
    console.error("❌ LỖI XÓA:", error);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
