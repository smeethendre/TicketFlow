import {
  holdSeatsService,
  releaseHoldService,
  createBookingService,
  confirmBookingService,
  cancelBookingService,
  getUserBookingsService,
} from "../service/booking.service.js";
import asyncHandler from "../util/asyncHandler.util.js";

const holdSeats = asyncHandler(async (req, res) => {
  const result = await holdSeatsService(
    req.body.showId,
    req.body.seatIds,
    req.user._id
  );
  res.status(200).json({
    success: true,
    message: "Seats held successfully",
    data: result,
  });
});

const releaseHold = asyncHandler(async (req, res) => {
  const result = await releaseHoldService(
    req.body.showId,
    req.body.seatIds,
    req.user._id
  );
  res.status(200).json({
    success: true,
    message: "Hold released",
    data: result,
  });
});

const createBooking = asyncHandler(async (req, res) => {
  const booking = await createBookingService(
    req.body.showId,
    req.body.seatIds,
    req.user._id
  );
  res.status(201).json({
    success: true,
    message: "Booking created — complete payment to confirm",
    data: booking,
  });
});

const confirmBooking = asyncHandler(async (req, res) => {
  const booking = await confirmBookingService(
    req.body.bookingId,
    req.body.paymentId,
    req.body.razorpayOrderId
  );
  res.status(200).json({
    success: true,
    message: "Booking confirmed",
    data: booking,
  });
});

const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await cancelBookingService(
    req.params.bookingId,
    req.user._id
  );
  res.status(200).json({
    success: true,
    message: "Booking cancelled",
    data: booking,
  });
});

const getUserBookings = asyncHandler(async (req, res) => {
  const bookings = await getUserBookingsService(req.user._id);
  res.status(200).json({
    success: true,
    message: "Bookings fetched",
    data: bookings,
  });
});

export {
  holdSeats,
  releaseHold,
  createBooking,
  confirmBooking,
  cancelBooking,
  getUserBookings,
};