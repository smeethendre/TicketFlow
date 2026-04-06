import { z } from "zod";

const showSchema = z.object({
  movie: z.string().min(1, "Movie ID is required"),
  theatre: z.string().min(1, "Theatre ID is required"),
  showDate: z.string().min(1, "Show date is required"),
  showTime: z.string().min(1, "Show time is required"),
  totalSeats: z.number().min(1, "Total seats must be at least 1"),
  ticketPrice: z.number().min(1, "Ticket price must be at least 1"),
});

export { showSchema };