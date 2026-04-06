import {
  generateMFASecretService,
  verifyAndEnableMFAService,
  verifyMFATokenService,
  disableMFAService,
} from "../service/mfa.service.js";
import asyncHandler from "../util/asyncHandler.util.js";

const generateMFASecret = asyncHandler(async (req, res) => {
  const result = await generateMFASecretService(req.user._id);
  res.status(200).json({ success: true, message: result.message, data: result });
});

const verifyAndEnableMFA = asyncHandler(async (req, res) => {
  const result = await verifyAndEnableMFAService(req.user._id, req.body.token);
  res.status(200).json({ success: true, message: result.message });
});

const verifyMFAToken = asyncHandler(async (req, res) => {
  const result = await verifyMFATokenService(req.user._id, req.body.token);
  res.status(200).json({ success: true, message: result.message });
});

const disableMFA = asyncHandler(async (req, res) => {
  const result = await disableMFAService(req.user._id);
  res.status(200).json({ success: true, message: result.message });
});

export { generateMFASecret, verifyAndEnableMFA, verifyMFAToken, disableMFA };