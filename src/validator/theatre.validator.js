import { z } from "zod";

const theatreSchema = z.object({
  theatreName: z.string().min(1, "Theatre name is required"),
  theatreCapacity: z.number().min(1, "Capacity must be at least 1"),
  theatreCity: z.string().min(1, "City is required"),
  theatrePincode: z.number().min(100000, "Invalid pincode").max(999999, "Invalid pincode"),
  theatreLocationUrl: z.string().url("Invalid location URL"),
});

export { theatreSchema };