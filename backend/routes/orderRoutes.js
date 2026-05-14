import express from "express";
import {
  createOrder,
  getUserOrders,
  createVnpayPaymentUrl,
  handleVnpayIpn,
  vnpayCallback,
  getOrderById,
  getUserTransactions,
  verifyBankTransfer,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", createOrder);
router.get("/user/:userId", getUserOrders);
router.get("/transactions/user/:userId", getUserTransactions);
router.post("/create-vnpay-url", createVnpayPaymentUrl);
router.get("/vnpay-ipn", handleVnpayIpn);
router.get("/vnpay-callback", vnpayCallback);
router.get("/:orderId", getOrderById);
router.post("/verify-bank-transfer", verifyBankTransfer);


export default router;
