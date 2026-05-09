import express from "express";
import { aiSearchProducts } from "../controllers/aiController.js";

const router = express.Router();

router.post("/search", aiSearchProducts);

export default router;
