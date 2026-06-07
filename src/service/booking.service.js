import { Booking } from "../model/booking.model.js";
import { Seat } from "../model/seat.model.js";
import { Show } from "../model/show.model.js";
import { ApiError } from "../util/apiError.util.js";
import redisClient from "../config/redis.js";

const HOLD_TTL = 600; // 10 minutes in seconds

// ── HOLD SEATS ──────────────────────────────────────
const holdSeatsService = async (showId, seatIds, userId) => {
  await redisClient.requireConnection();

  // check show exists
  const show = await Show.findById(showId);
  if (!show) throw new ApiError(404, "Show not found");
  if (show.status !== "scheduled") throw new ApiError(400, "Show is not available for booking");

  // check all seats exist and are available
  const seats = await Seat.find({
    _id: { $in: seatIds },
    show: showId,
  });

  if (seats.length !== seatIds.length) {
    throw new ApiError(404, "One or more seats not found");
  }

  // check each seat — is it held or booked?
  for (const seat of seats) {
    // check Redis hold first
    const holdKey = `seat_hold:${seat._id}`;
    const heldBy = await redisClient.get(holdKey);

    if (heldBy && heldBy !== userId.toString()) {
      throw new ApiError(409, `Seat ${seat.seatNumber} is currently held by another user`);
    }

    if (seat.status === "booked") {
      throw new ApiError(409, `Seat ${seat.seatNumber} is already booked`);
    }
  }

  // all seats are available — set hold in Redis
  for (const seat of seats) {
    const holdKey = `seat_hold:${seat._id}`;
    await redisClient.setEx(holdKey, HOLD_TTL, userId.toString());

    // update seat status in DB
    await Seat.findByIdAndUpdate(seat._id, {
      status: "held",
      heldBy: userId,
    });
  }

  return {
    message: "Seats held successfully",
    heldSeats: seats.map(s => s.seatNumber),
    expiresInSeconds: HOLD_TTL,
  };
};

// ── RELEASE HOLD ─────────────────────────────────────
const releaseHoldService = async (showId, seatIds, userId) => {
  await redisClient.requireConnection();

  for (const seatId of seatIds) {
    const holdKey = `seat_hold:${seatId}`;
    const heldBy = await redisClient.get(holdKey);

    // only release if this user holds it
    if (heldBy === userId.toString()) {
      await redisClient.del(holdKey);
      await Seat.findByIdAndUpdate(seatId, {
        status: "available",
        heldBy: null,
      });
    }
  }

  return { message: "Hold released successfully" };
};

// ── CREATE BOOKING ───────────────────────────────────
const createBookingService = async (showId, seatIds, userId) => {
  await redisClient.requireConnection();

  const show = await Show.findById(showId);
  if (!show) throw new ApiError(404, "Show not found");

  // verify user still holds all seats
  for (const seatId of seatIds) {
    const holdKey = `seat_hold:${seatId}`;
    const heldBy = await redisClient.get(holdKey);

    if (!heldBy || heldBy !== userId.toString()) {
      throw new ApiError(409, "Your hold has expired. Please select seats again");
    }
  }

  const totalAmount = show.ticketPrice * seatIds.length;

  // create booking with pending status
  const booking = await Booking.create({
    user: userId,
    show: showId,
    seats: seatIds,
    totalAmount,
    paymentStatus: "pending",
    bookingStatus: "pending",
  });

  return booking;
};

// ── CONFIRM BOOKING AFTER PAYMENT ────────────────────
const confirmBookingService = async (bookingId, paymentId, razorpayOrderId) => {
  await redisClient.requireConnection();

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, "Booking not found");

  // mark seats as booked in DB
  await Seat.updateMany(
    { _id: { $in: booking.seats } },
    { status: "booked", heldBy: null, bookedBy: booking.user }
  );

  // remove holds from Redis
  for (const seatId of booking.seats) {
    await redisClient.del(`seat_hold:${seatId}`);
  }

  // update show available seats
  await Show.findByIdAndUpdate(booking.show, {
    $inc: { availableSeats: -booking.seats.length }
  });

  // confirm booking
  const confirmedBooking = await Booking.findByIdAndUpdate(
    bookingId,
    {
      paymentStatus: "completed",
      bookingStatus: "confirmed",
      paymentId,
      razorpayOrderId,
    },
    { new: true }
  ).populate("show seats user");

  return confirmedBooking;
};

// ── CANCEL BOOKING ───────────────────────────────────
const cancelBookingService = async (bookingId, userId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, "Booking not found");

  if (booking.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only cancel your own bookings");
  }

  if (booking.bookingStatus === "cancelled") {
    throw new ApiError(400, "Booking is already cancelled");
  }

  // release seats back to available
  await Seat.updateMany(
    { _id: { $in: booking.seats } },
    { status: "available", bookedBy: null }
  );

  // update show available seats
  await Show.findByIdAndUpdate(booking.show, {
    $inc: { availableSeats: booking.seats.length }
  });

  // update booking
  const cancelledBooking = await Booking.findByIdAndUpdate(
    bookingId,
    {
      bookingStatus: "cancelled",
      paymentStatus: "refunded",
    },
    { new: true }
  );

  return cancelledBooking;
};

// ── GET USER BOOKINGS ────────────────────────────────
const getUserBookingsService = async (userId) => {
  const bookings = await Booking.find({ user: userId })
    .populate("show")
    .populate("seats")
    .sort({ createdAt: -1 });

  return bookings;
};

export {
  holdSeatsService,
  releaseHoldService,
  createBookingService,
  confirmBookingService,
  cancelBookingService,
  getUserBookingsService,
};
