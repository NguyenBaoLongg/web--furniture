import express from "express";
import {
  getOrCreateConversation,
  getChatHistory,
  sendMessage,
  getAllConversations,
  assignStaff,
} from "../controllers/chatController.js";

const router = express.Router();

router.get("/conversations", getAllConversations);
router.get("/conversations/customer/:customerId", getOrCreateConversation);
router.get("/history/:conversationId", getChatHistory);
router.post("/send", sendMessage);
router.patch("/assign/:conversationId", assignStaff);

export default router;
