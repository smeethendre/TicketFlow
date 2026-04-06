import { Router } from "express";
import {
  holdSeats,
  releaseHold,
  createBooking,
  confirmBooking,
  cancelBooking,
  getUserBookings,
} from "../controller/booking.controller.js";
import { verifyUser, verifyRole } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { holdSchema, createBookingSchema } from "../validator/booking.validator.js";

const router = Router();

router.post("/booking/hold", verifyUser, validate(holdSchema), holdSeats);
router.post("/booking/create", verifyUser, validate(createBookingSchema), createBooking);
router.post("/booking/release", verifyUser, releaseHold);
router.post("/booking/confirm", verifyUser, confirmBooking);
router.delete("/booking/:bookingId/cancel", verifyUser, cancelBooking);
router.get("/booking/my-bookings", verifyUser, getUserBookings);

export { router };