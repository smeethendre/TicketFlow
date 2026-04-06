import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { auditLogger } from "./middleware/audit.middleware.js";
import { router as movieRouter } from "./route/movie.route.js";
import { router as theatreRouter } from "./route/theatre.route.js";
import { router as userRouter } from "./route/user.route.js";
import { router as showRouter } from "./route/show.route.js";
import { router as bookingRouter } from "./route/booking.route.js";
import { router as paymentRouter } from "./route/payment.route.js";
import { router as mfaRouter } from "./route/mfa.route.js";
import errorHandler from "./middleware/errorhandler.middleware.js";

const app = express();
app.use(helmet());
app.use(auditLogger);
// ── MIDDLEWARE ──
app.use(cookieParser());
app.use(
  cors(
  //   {
  //   origin: "http://localhost:3000",
  //   credentials: true,
  // }
),
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// ── RATE LIMITING ──
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many requests from this IP, please try again after 15 minutes",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many login attempts, please try again after 15 minutes",
  },
});

app.use(limiter);
app.use("/ta/api/v1/user/login", authLimiter);
app.use("/ta/api/v1/user/register", authLimiter);

// ── ROUTES ──
app.use("/ta/api/v1", mfaRouter);
app.use("/ta/api/v1", movieRouter);
app.use("/ta/api/v1", theatreRouter);
app.use("/ta/api/v1", userRouter);
app.use("/ta/api/v1", showRouter);
app.use("/ta/api/v1", bookingRouter);
app.use("/ta/api/v1", paymentRouter);
app.get("/", (req, res) => {
  res.send({ message: "Welcome back" });
});

app.use(errorHandler);

export { app };
