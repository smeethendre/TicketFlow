import {
  createMovieService,
  deleteMovieService,
  getMovieByIdService,
  updateMovieService,
  fetchAllMoviesOrByFilterService,
} from "../service/movie.service.js";
import asyncHandler from "../util/asyncHandler.util.js";

const createMovie = asyncHandler(async (req, res) => {
  const movieCreated = await createMovieService(req.body);
  res
    .status(201)
    .json({
      success: true,
      message: "Successfully created new movie",
      data: movieCreated,
    });
});

const deleteMovie = asyncHandler(async (req, res) => {
  await deleteMovieService(req.params.id);
  res
    .status(200)
    .json({ success: true, message: "Successfully deleted the movie" });
});

const getMovieById = asyncHandler(async (req, res) => {
  const movie = await getMovieByIdService(req.params.id);
  res
    .status(200)
    .json({
      success: true,
      message: "Successfully fetched the movie",
      data: movie,
    });
});

const updateMovie = asyncHandler(async (req, res) => {
  const movie = await updateMovieService(req.params.id, req.body);
  res
    .status(200)
    .json({
      success: true,
      message: "Successfully updated the movie",
      data: movie,
    });
});

const fetchAllMoviesOrByFilter = asyncHandler(async (req, res) => {
  const movies = await fetchAllMoviesOrByFilterService(req.query);
  res
    .status(200)
    .json({
      success: true,
      message: "Successfully fetched movie(s)",
      data: movies,
    });
});

export {
  createMovie,
  getMovieById,
  deleteMovie,
  updateMovie,
  fetchAllMoviesOrByFilter,
};
