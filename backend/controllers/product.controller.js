exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi Server", error: error.message });
  }
};

exports.getNewArrivals = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .select("name price discountPrice images style");
    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi Server" });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const { room, style, category, limit = 12 } = req.query;

    let filter = {};
    if (room) filter.room = room;
    if (style) filter.style = style;
    if (category) filter.category = category;

    const products = await Product.find(filter).limit(Number(limit));

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi Server" });
  }
};
