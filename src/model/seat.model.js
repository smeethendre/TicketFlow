import mongoose, { Schema } from "mongoose";

const seatSchema = new Schema(
  {
    show: {
      type: Schema.Types.ObjectId,
      ref: "Show",
      required: true,
    },
    seatNumber: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "held", "booked"],
      default: "available",
    },
    heldBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    bookedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

// compound index — seatNumber must be unique per show
seatSchema.index({ show: 1, seatNumber: 1 }, { unique: true });

export const Seat = mongoose.model("Seat", seatSchema);
