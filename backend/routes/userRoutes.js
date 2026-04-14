import express from "express";
import { getAllUsers, getUserStats, updateUserRole } from "../controllers/userController.js";

const router = express.Router();

router.get("/", getAllUsers);
router.get("/stats", getUserStats);
router.put("/:id/role", updateUserRole);

export default router;
