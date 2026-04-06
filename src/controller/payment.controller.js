import {
  createPaymentOrderService,
  verifyPaymentService,
  refundPaymentService,
} from "../service/payment.service.js";
import asyncHandler from "../util/asyncHandler.util.js";

const createPaymentOrder = asyncHandler(async (req, res) => {
  const order = await createPaymentOrderService(
    req.body.bookingId,
    req.user._id
  );
  res.status(200).json({
    success: true,
    message: "Payment order created",
    data: order,
  });
});

const verifyPayment = asyncHandler(async (req, res) => {
  const booking = await verifyPaymentService(req.body);
  res.status(200).json({
    success: true,
    message: "Payment verified and booking confirmed",
    data: booking,
  });
});

const refundPayment = asyncHandler(async (req, res) => {
  const refund = await refundPaymentService(
    req.params.bookingId,
    req.user._id
  );
  res.status(200).json({
    success: true,
    message: "Refund initiated",
    data: refund,
  });
});

export { createPaymentOrder, verifyPayment, refundPayment };