import { User } from "../model/user.model.js";
import { Theatre } from "../model/theatre.model.js";
import { ApiError } from "../util/apiError.util.js";
import speakeasy from "speakeasy";

const registerUserService = async (userData) => {
  const { email, password, phoneNumber } = userData;

  if (!email || !password) {
    throw new ApiError(400, "email and password are required");
  }

  const alreadyExists = await User.findOne({ $or: [{ email }] });
  if (alreadyExists) {
    throw new ApiError(409, "User with this email oralready exists");
  }

  const user = await User.create({ email, password, phoneNumber });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );
  return createdUser;
};

const loginUserService = async (userData) => {
  const { email, password, mfaToken } = userData;

  if (!email || !password)
    throw new ApiError(400, "Email and password are required");

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) throw new ApiError(401, "Invalid credentials");

  // if MFA is enabled, verify token before issuing JWT
  if (user.mfaEnabled) {
    if (!mfaToken) throw new ApiError(400, "MFA token required");

    const isValidMFA = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: "base32",
      token: mfaToken,
      window: 1,
    });

    if (!isValidMFA) throw new ApiError(401, "Invalid MFA code");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -mfaSecret",
  );
  return { accessToken, refreshToken, user: loggedInUser };
};

const logoutUserService = async (userId) => {
  await User.findByIdAndUpdate(
    userId,
    { $set: { refreshToken: null } },
    { new: true },
  );
};

const getUserProfileService = async (userId) => {
  const user = await User.findById(userId).select("-password -refreshToken");
  if (!user) throw new ApiError(404, "User not found");
  return user;
};

// superadmin assigns admin to a theatre
const assignAdminToTheatreService = async (userId, theatreId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");
  if (user.role !== "admin") throw new ApiError(400, "User is not an admin");

  const theatre = await Theatre.findById(theatreId);
  if (!theatre) throw new ApiError(404, "Theatre not found");

  user.managedTheatre = theatreId;
  await user.save({ validateBeforeSave: false });

  theatre.managedBy = userId;
  await theatre.save();

  return { user, theatre };
};

// superadmin promotes user to admin
const promoteToAdminService = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");
  if (user.role === "superadmin")
    throw new ApiError(400, "Cannot change superadmin role");

  user.role = "admin";
  await user.save({ validateBeforeSave: false });

  return await User.findById(userId).select("-password -refreshToken");
};

export {
  registerUserService,
  loginUserService,
  logoutUserService,
  getUserProfileService,
  assignAdminToTheatreService,
  promoteToAdminService,
};
