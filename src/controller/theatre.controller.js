import {
  createTheatreService,
  deleteTheatreService,
  getTheatreService,
  fetchAllTheatresOrByFilterService,
  updateMoviesInTheatreService,
  getMoviesInTheatreService,
  findTheatreByMovieService,
} from "../service/theatre.service.js";
import asyncHandler from "../util/asyncHandler.util.js";

const createTheatre = asyncHandler(async (req, res) => {
  const theatreCreated = await createTheatreService(req.body);
  res
    .status(201)
    .json({
      success: true,
      message: "Successfully added theatre",
      data: theatreCreated,
    });
});

const deleteTheatre = asyncHandler(async (req, res) => {
  await deleteTheatreService(req.params.id);
  res
    .status(200)
    .json({ success: true, message: "Successfully deleted the theatre" });
});

const getTheatre = asyncHandler(async (req, res) => {
  const theatre = await getTheatreService(req.params.id);
  res
    .status(200)
    .json({ success: true, message: "Theatre found", data: theatre });
});

const fetchAllTheatresOrByFilter = asyncHandler(async (req, res) => {
  const theatres = await fetchAllTheatresOrByFilterService(req.query);
  res
    .status(200)
    .json({
      success: true,
      message: "Successfully fetched theatre(s)",
      data: theatres,
    });
});

const updateMoviesInTheatre = asyncHandler(async (req, res) => {
  const theatre = await updateMoviesInTheatreService(
    req.params.id,
    req.body.movieIds,
    req.user,
  );
  res
    .status(200)
    .json({ success: true, message: "Movies added to theatre", data: theatre });
});

const getMovies = asyncHandler(async (req, res) => {
  const movies = await getMoviesInTheatreService(req.params.id);
  res
    .status(200)
    .json({
      success: true,
      message: "Successfully fetched movies in theatre",
      data: movies,
    });
});

const findTheatreByMovie = asyncHandler(async (req, res) => {
  const theatres = await findTheatreByMovieService(req.params.movieId);
  res
    .status(200)
    .json({
      success: true,
      message: "Successfully fetched theatres showing this movie",
      data: theatres,
    });
});

export {
  createTheatre,
  deleteTheatre,
  getTheatre,
  fetchAllTheatresOrByFilter,
  updateMoviesInTheatre,
  getMovies,
  findTheatreByMovie,
};
