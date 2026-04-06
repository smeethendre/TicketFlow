import { Router } from "express";
import {
  createShow,
  getShowById,
  getShowSeats,
  getShowsByMovie,
  deleteShow,
} from "../controller/show.controller.js";
import { verifyUser, verifyRole } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { showSchema } from "../validator/show.validator.js";

const router = Router();

// public
router.get("/show/:id", getShowById);
router.get("/show/:id/seats", getShowSeats);
router.get("/show/movie/:movieId", getShowsByMovie);

// admin + superadmin
router.post("/show", verifyUser, verifyRole("admin", "superadmin"), validate(showSchema), createShow);
router.delete("/show/:id", verifyUser, verifyRole("admin", "superadmin"), deleteShow);

export { router };