import { Router } from "express";
import { createMovie } from "../controller/movie.controller.js";

const router = Router();

router.post("/movies", createMovie);

export { router };
