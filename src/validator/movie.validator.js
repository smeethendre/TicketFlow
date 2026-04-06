import { z } from "zod";

const movieSchema = z.object({
  movieName: z.string().min(1, "Movie name is required"),
  runtimeMinutes: z.number().min(1, "Runtime must be at least 1 minute"),
  movieDescription: z.string().min(10, "Description must be at least 10 characters").max(500),
  movieCast: z.array(z.string()).min(1, "At least one cast member required"),
  movieTrailerUrl: z.string().url("Invalid trailer URL"),
  movieLanguage: z.string().min(1, "Language is required"),
  releaseDate: z.string().min(1, "Release date is required"),
});

export { movieSchema };