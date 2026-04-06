import { Router } from "express";
import {
  createTheatre,
  deleteTheatre,
  getTheatre,
  fetchAllTheatresOrByFilter,
  updateMoviesInTheatre,
  getMovies,
  findTheatreByMovie,
} from "../controller/theatre.controller.js";
import { verifyUser, verifyRole } from "../middleware/auth.middleware.js";
import { cacheMiddleware } from "../middleware/cache.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { theatreSchema } from "../validator/theatre.validator.js";

const router = Router();

// public with cache
router.get("/theatre", cacheMiddleware("theatres"), fetchAllTheatresOrByFilter);
router.get("/theatre/:id", cacheMiddleware("theatres"), getTheatre);
router.get("/theatre/:id/movies", cacheMiddleware("theatres"), getMovies);
router.get("/theatre/movie/:movieId", findTheatreByMovie);

// admin + superadmin
router.patch(
  "/theatre/:id/movies",
  verifyUser,
  verifyRole("admin", "superadmin"),
  updateMoviesInTheatre,
);

// superadmin only
router.post(
  "/theatre",
  verifyUser,
  verifyRole("superadmin"),
  validate(theatreSchema),
  createTheatre,
);
router.delete(
  "/theatre/:id",
  verifyUser,
  verifyRole("superadmin"),
  deleteTheatre,
);

export { router };
