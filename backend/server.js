// File: backend/server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Import các Routes
const productRoutes = require("./routes/product.routes");
// const aiRoutes = require('./routes/ai.routes'); // Tạm comment lại, sau này làm AI thì mở ra

// 1. Load file .env
dotenv.config();

// 2. Kết nối Database
connectDB();

// 3. Khởi tạo ứng dụng Express
const app = express();

// 4. Các Middleware bắt buộc (Rất hay bị thầy cô hỏi)
app.use(cors()); // Cho phép Frontend (chạy cổng khác) được quyền gọi API của Backend (Tránh lỗi CORS Policy)
app.use(express.json()); // Giúp Backend đọc được dữ liệu JSON do Frontend gửi lên (nằm trong req.body)

// 5. Trang chủ API (Để test xem server sống không)
app.get("/", (req, res) => {
  res.send(
    "Chào mừng đến với API Đồ án E-commerce Decor! Server đang chạy ngon lành 🚀",
  );
});

// 6. Gắn các đường dẫn (Mount Routes)
app.use("/api/products", productRoutes);
// app.use('/api/ai', aiRoutes); // Tạm ẩn

// 7. Khởi động Server lắng nghe trên một Cổng (Port)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server Backend đang chạy êm ru trên cổng ${PORT}`);
  console.log(`👉 Bấm vào đây để test: http://localhost:${PORT}`);
});
