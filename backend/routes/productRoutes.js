import express from "express";
import {
  getAllProducts,
  getNewArrivals,
  getProductsByCategory,
  getProductsByRoom,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/new-arrivals", getNewArrivals);
router.get("/category/:categorySlug", getProductsByCategory);
router.get("/room/:roomSlug", getProductsByRoom);
router.get("/", getAllProducts);
router.get("/:slug", getProductBySlug);

router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
