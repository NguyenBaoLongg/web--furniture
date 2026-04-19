import express from "express";
import { 
  checkIn, 
  checkOut, 
  getMonthlyAttendance, 
  getCurrentStatus 
} from "../controllers/attendanceController.js";

const router = express.Router();

router.post("/check-in", checkIn);
router.post("/check-out", checkOut);
router.get("/status/:userId", getCurrentStatus);
router.get("/stats/:userId", getMonthlyAttendance);

export default router;
