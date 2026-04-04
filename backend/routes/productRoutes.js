import express from "express";
import {
  getAllProducts,
  getProductBySlug,
  getNewArrivals,
  getProductsByCategory,
  getProductsByRoom,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/new-arrivals", getNewArrivals);
router.get("/category/:categorySlug", getProductsByCategory);
router.get("/room/:roomSlug", getProductsByRoom);

router.get("/", getAllProducts);
router.get("/:slug", getProductBySlug);
router.get("/products", getAllProducts);

export default router;
