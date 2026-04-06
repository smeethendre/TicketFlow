import { Theatre } from "../model/theatre.model.js";
import { ApiError } from "../util/apiError.util.js";
import { invalidateCache } from "../middleware/cache.middleware.js";

const createTheatreService = async (theatreData) => {
  if (!theatreData || Object.keys(theatreData).length === 0) {
    throw new ApiError(400, "Theatre data not provided");
  }

  const { theatreName, theatreCity } = theatreData;
  const alreadyExists = await Theatre.findOne({ theatreName, theatreCity });
  if (alreadyExists) throw new ApiError(409, "Theatre already exists");

  const theatreCreated = await Theatre.create(theatreData);
  await invalidateCache("theatres");
  return theatreCreated;
};

const deleteTheatreService = async (id) => {
  const response = await Theatre.deleteOne({ _id: id });
  if (response.deletedCount === 0) throw new ApiError(404, "Theatre not found");
  await invalidateCache("theatres");
};

const getTheatreService = async (id) => {
  const theatre = await Theatre.findById(id);
  if (!theatre) throw new ApiError(404, "Theatre not found");
  return theatre;
};

const fetchAllTheatresOrByFilterService = async (queryParams) => {
  let query = {};
  if (queryParams.theatreName) query.theatreName = queryParams.theatreName;
  if (queryParams.theatreCity) query.theatreCity = queryParams.theatreCity;
  const theatres = await Theatre.find(query);
  return theatres;
};

const updateMoviesInTheatreService = async (id, movieIds, requestingUser) => {
  if (requestingUser.role === "admin") {
    if (requestingUser.managedTheatre?.toString() !== id) {
      throw new ApiError(403, "You can only manage your own theatre");
    }
  }

  const theatre = await Theatre.findByIdAndUpdate(
    id,
    { $push: { theatreRunningMovies: { $each: movieIds } } },
    { new: true },
  ).populate({ path: "theatreRunningMovies" });

  if (!theatre) throw new ApiError(404, "Theatre not found");
  await invalidateCache("theatres");
  return theatre;
};

const getMoviesInTheatreService = async (id) => {
  const theatre = await Theatre.findById(id).populate({
    path: "theatreRunningMovies",
  });
  if (!theatre) throw new ApiError(404, "Theatre not found");
  return theatre.theatreRunningMovies;
};

const findTheatreByMovieService = async (movieId) => {
  const theatres = await Theatre.find({
    theatreRunningMovies: movieId,
  }).populate("theatreRunningMovies");
  if (!theatres || theatres.length === 0) {
    throw new ApiError(404, "No theatres found for this movie");
  }
  return theatres;
};

export {
  createTheatreService,
  deleteTheatreService,
  getTheatreService,
  fetchAllTheatresOrByFilterService,
  updateMoviesInTheatreService,
  getMoviesInTheatreService,
  findTheatreByMovieService,
};
