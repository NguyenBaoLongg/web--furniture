import express from "express";
import {
  getAllStyles,
  getStyleBySlug,
  createStyle,
  updateStyle,
  deleteStyle,
} from "../controllers/styleController.js";

const router = express.Router();

router.get("/", getAllStyles);
router.get("/:slug", getStyleBySlug);
router.post("/", createStyle);
router.put("/:id", updateStyle);
router.delete("/:id", deleteStyle);

export default router;
