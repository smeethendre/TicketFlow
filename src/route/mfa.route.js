import { Router } from "express";
import {
  generateMFASecret,
  verifyAndEnableMFA,
  verifyMFAToken,
  disableMFA,
} from "../controller/mfa.controller.js";
import { verifyUser, verifyRole } from "../middleware/auth.middleware.js";

const router = Router();

// all MFA routes require login + admin/superadmin role
router.post(
  "/mfa/setup",
  verifyUser,
  verifyRole("admin", "superadmin"),
  generateMFASecret,
);
router.post(
  "/mfa/verify-setup",
  verifyUser,
  verifyRole("admin", "superadmin"),
  verifyAndEnableMFA,
);
router.post(
  "/mfa/verify",
  verifyUser,
  verifyRole("admin", "superadmin"),
  verifyMFAToken,
);
router.post(
  "/mfa/disable",
  verifyUser,
  verifyRole("admin", "superadmin"),
  disableMFA,
);

export { router };
