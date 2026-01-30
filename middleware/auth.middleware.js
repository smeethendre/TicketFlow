import User from "../model/user.model.js";
import { ApiError } from "../util/apiError.util.js";
import jwt from "jsonwebtoken";
import asyncHandler from "../util/asyncHandler.util.js";

const verifyUser = asyncHandler(async (req, res, next) => {
  const token =
    req.cookie?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) throw new ApiError(401, "Unauthorized access");

  const decodedToken = jwt.verify(token, process.env.accessToken);

  const user = await User.findById(decodedToken._id).select(
    "-password -refreshToken",
  );

  if (!user) throw new ApiError(401, "User doesn't exist");

  req.user = user;

  next();
});

export { verifyUser };
