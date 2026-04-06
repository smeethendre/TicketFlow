import {
  createShowService,
  getShowByIdService,
  getShowSeatsService,
  getShowsByMovieService,
  deleteShowService,
} from "../service/show.service.js";
import asyncHandler from "../util/asyncHandler.util.js";

const createShow = asyncHandler(async (req, res) => {
  const show = await createShowService(req.body);
  res.status(201).json({ success: true, message: "Show created", data: show });
});

const getShowById = asyncHandler(async (req, res) => {
  const show = await getShowByIdService(req.params.id);
  res.status(200).json({ success: true, message: "Show fetched", data: show });
});

const getShowSeats = asyncHandler(async (req, res) => {
  const seats = await getShowSeatsService(req.params.id);
  res.status(200).json({ success: true, message: "Seats fetched", data: seats });
});

const getShowsByMovie = asyncHandler(async (req, res) => {
  const shows = await getShowsByMovieService(req.params.movieId);
  res.status(200).json({ success: true, message: "Shows fetched", data: shows });
});

const deleteShow = asyncHandler(async (req, res) => {
  await deleteShowService(req.params.id);
  res.status(200).json({ success: true, message: "Show deleted" });
});

export { createShow, getShowById, getShowSeats, getShowsByMovie, deleteShow };