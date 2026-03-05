const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên sản phẩm không được để trống"],
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Giá không thể âm"],
    },
    discountPrice: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    images: [{ type: String }],

    category: {
      type: String,
      required: true,
      enum: ["Bàn", "Ghế", "Tủ", "Đèn", "Tranh", "Thảm", "Phụ kiện"],
    },
    style: [
      {
        type: String,
        enum: [
          "Bắc Âu (Nordic)",
          "Tối giản (Minimalist)",
          "Cổ điển (Vintage)",
          "Hiện đại (Modern)",
          "Công nghiệp (Industrial)",
        ],
      },
    ],
    room: [
      {
        type: String,
        enum: [
          "Phòng khách",
          "Phòng ngủ",
          "Phòng bếp",
          "Phòng làm việc",
          "Ban công",
        ],
      },
    ],
    material: {
      type: String,
    },
    color: [
      {
        type: String,
      },
    ],
    dimensions: {
      length: { type: Number },
      width: { type: Number },
      height: { type: Number },
    },

    aiTags: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
