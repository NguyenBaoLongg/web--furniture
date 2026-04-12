import express from "express";
import {
  getAllCategories,
  getCategoryBySlug,
  getFeaturedCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

const router = express.Router();
router.get("/featured", getFeaturedCategories);
router.get("/", getAllCategories);
router.get("/:slug", getCategoryBySlug);
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
