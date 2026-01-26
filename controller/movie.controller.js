import {Movie} from "../model/movie.model.js";
import { ApiError } from "../util/apiError.util.js";
import asyncHandler from "../util/asyncHandler.util.js";

const createMovie = asyncHandler(async (req, res, next) => {
  const movieData = req.body;

  if (!movieData || Object.keys(movieData.length === 0)) {
    throw new ApiError(400, "movie data not received");
  }

  const movieCreated = await Movie.create(movieData);
  res.send(201).json({
    success: true,
    message: "Successfully created new movie",
  });
});

export { createMovie };
