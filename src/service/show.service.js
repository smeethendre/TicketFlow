import { Show } from "../model/show.model.js";
import { Seat } from "../model/seat.model.js";
import { ApiError } from "../util/apiError.util.js";

const createShowService = async (showData) => {
  const { movie, theatre, showDate, showTime, totalSeats, ticketPrice } = showData;

  if (!movie || !theatre || !showDate || !showTime || !totalSeats || !ticketPrice) {
    throw new ApiError(400, "All show details are required");
  }

  const show = await Show.create({
    movie,
    theatre,
    showDate,
    showTime,
    totalSeats,
    availableSeats: totalSeats,
    ticketPrice,
  });

  // auto-generate seats for this show
  const seats = [];
  for (let i = 1; i <= totalSeats; i++) {
    seats.push({
      show: show._id,
      seatNumber: `S${i}`,
      status: "available",
    });
  }
  await Seat.insertMany(seats);

  return show;
};

const getShowByIdService = async (id) => {
  const show = await Show.findById(id)
    .populate("movie")
    .populate("theatre");
  if (!show) throw new ApiError(404, "Show not found");
  return show;
};

const getShowSeatsService = async (showId) => {
  const seats = await Seat.find({ show: showId }).sort({ seatNumber: 1 });
  if (!seats.length) throw new ApiError(404, "No seats found for this show");
  return seats;
};

const getShowsByMovieService = async (movieId) => {
  const shows = await Show.find({ movie: movieId, status: "scheduled" })
    .populate("theatre")
    .sort({ showDate: 1 });
  return shows;
};

const deleteShowService = async (id) => {
  const show = await Show.findById(id);
  if (!show) throw new ApiError(404, "Show not found");

  // delete all seats for this show too
  await Seat.deleteMany({ show: id });
  await Show.deleteOne({ _id: id });
};

export {
  createShowService,
  getShowByIdService,
  getShowSeatsService,
  getShowsByMovieService,
  deleteShowService,
};