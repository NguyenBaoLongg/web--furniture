import express from "express";
import { register, login, updateAddress, getAddress } from "../controllers/authController.js";
const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.post("/address", updateAddress);
router.get("/address/:userId", getAddress);
export default router;
