import { User } from "../model/user.model.js";
import { ApiError } from "../util/apiError.util.js";
import jwt from "jsonwebtoken";
import asyncHandler from "../util/asyncHandler.util.js";

const verifyUser = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) throw new ApiError(401, "Unauthorized — no token provided");

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    throw new ApiError(401, "Unauthorized — token is invalid or expired");
  }

  const user = await User.findById(decodedToken._id).select(
    "-password -refreshToken",
  );

  if (!user) throw new ApiError(401, "User not found");

  req.user = user;
  next();
});

const verifyRole = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) throw new ApiError(401, "Unauthorized — please login");
      if (!roles.includes(req.user.role)) {
        throw new ApiError(403, "Forbidden — insufficient permissions");
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};

export { verifyUser, verifyRole };
