import express from "express";
import { getWishlist, toggleWishlist, checkWishlistStatus } from "../controllers/wishlistController.js";

const router = express.Router();

router.get("/user/:userId", getWishlist);
router.get("/check/:userId/:productId", checkWishlistStatus);
router.post("/toggle", toggleWishlist);

export default router;
