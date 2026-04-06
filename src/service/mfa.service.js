import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { User } from "../model/user.model.js";
import { ApiError } from "../util/apiError.util.js";

// Step 1 — generate secret and QR code for admin to scan
const generateMFASecretService = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");
  if (user.role === "user") throw new ApiError(403, "MFA is only for admin roles");

  const secret = speakeasy.generateSecret({
    name: `TicketFlow (${user.email})`,
    length: 20,
  });

  // save secret temporarily — not enabled yet until verified
  user.mfaSecret = secret.base32;
  await user.save({ validateBeforeSave: false });

  // generate QR code URL for Google Authenticator
  const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

  return {
    secret: secret.base32,
    qrCode: qrCodeUrl,
    message: "Scan this QR code with Google Authenticator then verify with a code",
  };
};

// Step 2 — verify the TOTP code and enable MFA
const verifyAndEnableMFAService = async (userId, token) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");
  if (!user.mfaSecret) throw new ApiError(400, "MFA setup not initiated");

  const isValid = speakeasy.totp.verify({
    secret: user.mfaSecret,
    encoding: "base32",
    token,
    window: 1, // allow 30 second window
  });

  if (!isValid) throw new ApiError(400, "Invalid MFA code");

  user.mfaEnabled = true;
  await user.save({ validateBeforeSave: false });

  return { message: "MFA enabled successfully" };
};

// Step 3 — verify MFA on login (called after password check)
const verifyMFATokenService = async (userId, token) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");
  if (!user.mfaEnabled) throw new ApiError(400, "MFA not enabled for this user");

  const isValid = speakeasy.totp.verify({
    secret: user.mfaSecret,
    encoding: "base32",
    token,
    window: 1,
  });

  if (!isValid) throw new ApiError(401, "Invalid MFA code");

  return { message: "MFA verified successfully" };
};

// disable MFA
const disableMFAService = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  user.mfaSecret = null;
  user.mfaEnabled = false;
  await user.save({ validateBeforeSave: false });

  return { message: "MFA disabled successfully" };
};

export {
  generateMFASecretService,
  verifyAndEnableMFAService,
  verifyMFATokenService,
  disableMFAService,
};