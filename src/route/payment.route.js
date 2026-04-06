import { Router } from "express";
import {
  createPaymentOrder,
  verifyPayment,
  refundPayment,
} from "../controller/payment.controller.js";
import { verifyUser } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/payment/order", verifyUser, createPaymentOrder);
router.post("/payment/verify", verifyUser, verifyPayment);
router.post("/payment/refund/:bookingId", verifyUser, refundPayment);

export { router };
