import express from "express";
import { 
  getAllColors, 
  createColor, 
  updateColor, 
  deleteColor 
} from "../controllers/colorController.js";

const router = express.Router();

router.get("/", getAllColors);
router.post("/", createColor);
router.put("/:id", updateColor);
router.delete("/:id", deleteColor);

export default router;
