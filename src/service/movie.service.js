import { Movie } from "../model/movie.model.js";
import { ApiError } from "../util/apiError.util.js";
import { invalidateCache } from "../middleware/cache.middleware.js";

const createMovieService = async (movieData) => {
  if (!movieData || Object.keys(movieData).length === 0) {
    throw new ApiError(400, "Movie data not received");
  }
  const movieCreated = await Movie.create(movieData);
  await invalidateCache("movies");
  return movieCreated;
};

const deleteMovieService = async (id) => {
  const response = await Movie.deleteOne({ _id: id });
  if (response.deletedCount === 0) throw new ApiError(404, "Movie not found");
  await invalidateCache("movies");
};

const getMovieByIdService = async (id) => {
  const movie = await Movie.findById(id);
  if (!movie) throw new ApiError(404, "Movie not found");
  return movie;
};

const updateMovieService = async (id, updateData) => {
  const movie = await Movie.findByIdAndUpdate(id, updateData, { new: true });
  if (!movie) throw new ApiError(404, "Movie not found");
  await invalidateCache("movies");
  return movie;
};

const fetchAllMoviesOrByFilterService = async (queryParams) => {
  let query = {};
  if (queryParams.movieName) query.movieName = queryParams.movieName;
  if (queryParams.movieLanguage) query.movieLanguage = queryParams.movieLanguage;
  if (queryParams.releaseDate) query.releaseDate = queryParams.releaseDate;
  const movies = await Movie.find(query);
  return movies;
};

export {
  createMovieService,
  deleteMovieService,
  getMovieByIdService,
  updateMovieService,
  fetchAllMoviesOrByFilterService,
};