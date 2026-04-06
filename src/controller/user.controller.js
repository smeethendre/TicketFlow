import {
  registerUserService,
  loginUserService,
  logoutUserService,
  getUserProfileService,
  assignAdminToTheatreService,
  promoteToAdminService,
} from "../service/user.service.js";
import asyncHandler from "../util/asyncHandler.util.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
};

const registerUser = asyncHandler(async (req, res) => {
  const user = await registerUserService(req.body);
  res.status(201).json({ success: true, message: "User registered successfully", data: user });
});

const loginUser = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken, user } = await loginUserService(req.body);
  res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json({ success: true, message: "Login successful", data: { user, accessToken } });
});

const logoutUser = asyncHandler(async (req, res) => {
  await logoutUserService(req.user._id);
  res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json({ success: true, message: "Logged out successfully" });
});

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await getUserProfileService(req.user._id);
  res.status(200).json({ success: true, message: "User profile fetched", data: user });
});

const assignAdminToTheatre = asyncHandler(async (req, res) => {
  const { userId, theatreId } = req.body;
  const result = await assignAdminToTheatreService(userId, theatreId);
  res.status(200).json({ success: true, message: "Admin assigned to theatre", data: result });
});

const promoteToAdmin = asyncHandler(async (req, res) => {
  const user = await promoteToAdminService(req.params.userId);
  res.status(200).json({ success: true, message: "User promoted to admin", data: user });
});

export { registerUser, loginUser, logoutUser, getUserProfile, assignAdminToTheatre, promoteToAdmin };