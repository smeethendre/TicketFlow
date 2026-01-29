import mongoose, { Schema } from "mongoose";

const movieSchema = new Schema({
  movieName: {
    type: String,
    required: true,
  },

  runtimeMinutes: {
    type: Number,
    required: true,
    min: 1,
  },

  movieDescription: {
    type: String,
    required: true,
  },

  movieCast: [
    {
      type: String,
      required: true,
    },
  ],

  movieTrailerUrl: {
    type: String,
    required: true,
  },

  movieLanguage: {
    type: String,
    required: true,
    default: "ENGLISH",
  },

  releaseDate: {
    type: Date,
    required: true,
  },
});

export const Movie = mongoose.model("Movie", movieSchema);
