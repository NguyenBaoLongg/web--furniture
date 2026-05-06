import express from "express";
import { consultFengShui, getProductsByElement } from "../controllers/fengshuiController.js";

const router = express.Router();

router.post("/consult", consultFengShui);
router.get("/products-by-element", getProductsByElement);

export default router;
