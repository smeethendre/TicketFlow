import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const movieSchema = new Schema(
  {
    movieName: {
      type: String,
      required: true,
      minLength: 1,
    },

    runtimeMinutes: {
      type: Number,
      required: true,
      min: 1,
    },

    movieDescription: {
      type: String,
      required: true,
      minLength: 10,
      maxLength: 500,
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
    },

    releaseDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

movieSchema.plugin(mongooseAggregatePaginate);

export const Movie = mongoose.model("Movie", movieSchema);
