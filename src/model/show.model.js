import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const showSchema = new Schema({
  movie: {
    type: Schema.Types.ObjectId,
    ref: "Movie",
    required: true,
  },
  theatre: {
    type: Schema.Types.ObjectId,
    ref: "Theatre",
    required: true,
  },
  showDate: {
    type: Date,
    required: true,
  },
  showTime: {
    type: String,
    required: true,
  },
  totalSeats: {
    type: Number,
    required: true,
  },
  availableSeats: {
    type: Number,
    required: true,
  },
  ticketPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["scheduled", "cancelled", "completed"],
    default: "scheduled",
  },
}, { timestamps: true });

showSchema.plugin(mongooseAggregatePaginate);
export const Show = mongoose.model("Show", showSchema);