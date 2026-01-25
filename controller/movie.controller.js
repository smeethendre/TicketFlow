import Movie from "../model/movie.model.js";
import { ApiError } from "../util/apiError.util.js";

const createMovie = async (req, res) => {
  const movieData = req.body;

  if (!movieData) {
    throw new ApiError(400, "movie data not received");
  }

  try {
    const movieCreated = await Movie.Create(movieData);
    res.send(201).json({
      success: true,
      message: "Successfully created new movie",
    });
    
  } catch (error) {
    res.send(500).json({
      success: false,
      message: "something went wrong while creating movie",
    });
  }
};
