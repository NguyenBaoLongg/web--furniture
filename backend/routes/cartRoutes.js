import express from "express";
import {
  getCart,
  addToCart,
  removeFromCart,
  updateCartQuantity,
} from "../controllers/cartController.js";

const router = express.Router();

router.get("/:userId", getCart);
router.post("/", addToCart);
router.put("/:cartItemId", updateCartQuantity);
router.delete("/:cartItemId", removeFromCart);

export default router;
