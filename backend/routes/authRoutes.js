import express from "express";
import {
  sendOtp,
  verifyRegistration,
  login,
  updateAddress,
  getAddress,
  getProfile,
  updateProfile,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-registration", verifyRegistration);
router.post("/login", login);
router.post("/address", updateAddress);
router.get("/address/:userId", getAddress);
router.get("/profile/:userId", getProfile);
router.put("/profile/:userId", updateProfile);

router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

export default router;
