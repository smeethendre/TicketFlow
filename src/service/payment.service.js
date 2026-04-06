import razorpay from "../config/razorpay.js";
import crypto from "crypto";
import { Booking } from "../model/booking.model.js";
import { ApiError } from "../util/apiError.util.js";
import { confirmBookingService } from "./booking.service.js";

const createPaymentOrderService = async (bookingId, userId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, "Booking not found");

  if (booking.user.toString() !== userId.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  if (booking.bookingStatus !== "pending") {
    throw new ApiError(400, "Booking is not in pending state");
  }

  const order = await razorpay.orders.create({
    amount: booking.totalAmount * 100,
    currency: "INR",
    receipt: `booking_${bookingId}`,
    notes: {
      bookingId: bookingId.toString(),
      userId: userId.toString(),
    },
  });

  await Booking.findByIdAndUpdate(bookingId, {
    razorpayOrderId: order.id,
  });

  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    bookingId,
  };
};

const verifyPaymentService = async (paymentData) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    bookingId,
  } = paymentData;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new ApiError(400, "Payment verification failed — invalid signature");
  }

  const confirmedBooking = await confirmBookingService(
    bookingId,
    razorpay_payment_id,
    razorpay_order_id
  );

  return confirmedBooking;
};

const refundPaymentService = async (bookingId, userId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, "Booking not found");

  if (booking.user.toString() !== userId.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  if (!booking.paymentId) {
    throw new ApiError(400, "No payment found for this booking");
  }

  if (booking.paymentStatus !== "completed") {
    throw new ApiError(400, "Payment is not completed, cannot refund");
  }

  const refund = await razorpay.payments.refund(booking.paymentId, {
    amount: booking.totalAmount * 100,
    notes: {
      reason: "User requested cancellation",
      bookingId: bookingId.toString(),
    },
  });

  return refund;
};

export {
  createPaymentOrderService,
  verifyPaymentService,
  refundPaymentService,
};