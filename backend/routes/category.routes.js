import express from "express";
import {
  getAllCategories,
  getCategoryBySlug,
  getFeaturedCategories,
} from "../controllers/categoryController.js";

const router = express.Router();
router.get("/featured", getFeaturedCategories);
router.get("/", getAllCategories);
router.get("/:slug", getCategoryBySlug);

export default router;
