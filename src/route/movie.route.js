import { Router } from "express";
import {
  createMovie,
  deleteMovie,
  getMovieById,
  updateMovie,
  fetchAllMoviesOrByFilter,
} from "../controller/movie.controller.js";
import { verifyUser, verifyRole } from "../middleware/auth.middleware.js";
import { cacheMiddleware } from "../middleware/cache.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { movieSchema } from "../validator/movie.validator.js";

const router = Router();

// public with cache
router.get("/movies", cacheMiddleware("movies"), fetchAllMoviesOrByFilter);
router.get("/movies/:id", cacheMiddleware("movies"), getMovieById);

// admin + superadmin
router.post(
  "/movies",
  verifyUser,
  verifyRole("admin", "superadmin"),
  validate(movieSchema),
  createMovie,
);

router.patch(
  "/movies/:id",
  verifyUser,
  verifyRole("admin", "superadmin"),
  updateMovie,
);
router.delete(
  "/movies/:id",
  verifyUser,
  verifyRole("admin", "superadmin"),
  deleteMovie,
);

export { router };
