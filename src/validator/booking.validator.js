import { z } from "zod";

const holdSchema = z.object({
  showId: z.string().min(1, "Show ID is required"),
  seatIds: z.array(z.string()).min(1, "At least one seat must be selected"),
});

const createBookingSchema = z.object({
  showId: z.string().min(1, "Show ID is required"),
  seatIds: z.array(z.string()).min(1, "At least one seat must be selected"),
});

export { holdSchema, createBookingSchema };