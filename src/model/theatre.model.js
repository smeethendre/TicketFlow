import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const theatreSchema = new Schema(
  {
    theatreName: {
      type: String,
      required: true,
      minLength: 1,
    },
    theatreCapacity: {
      type: Number,
      required: true,
    },
    theatreCity: {
      type: String,
      required: true,
    },
    theatrePincode: {
      type: Number,
      required: true,
    },
    theatreLocationUrl: {
      type: String,
      required: true,
    },

    theatreManagedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    
    theatreRunningMovies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Movie",
      },
    ],
  },
  { timestamps: true },
);

theatreSchema.plugin(mongooseAggregatePaginate);

export const Theatre = mongoose.model("Theatre", theatreSchema);
