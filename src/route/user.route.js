import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  assignAdminToTheatre,
  promoteToAdmin,
} from "../controller/user.controller.js";
import { verifyUser, verifyRole } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { registerSchema, loginSchema } from "../validator/user.validator.js";

const router = Router();

// public
router.post("/user/register", validate(registerSchema), registerUser);
router.post("/user/login", validate(loginSchema), loginUser);

// logged in user
router.post("/user/logout", verifyUser, logoutUser);
router.get("/user/profile", verifyUser, getUserProfile);

// superadmin only
router.patch(
  "/user/:userId/promote",
  verifyUser,
  verifyRole("superadmin"),
  promoteToAdmin,
);
router.post(
  "/user/assign-theatre",
  verifyUser,
  verifyRole("superadmin"),
  assignAdminToTheatre,
);

export { router };
