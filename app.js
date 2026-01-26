import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { router } from "./route/movie.route.js";

const app = express();

app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:6000",
    credentials: true,
  }),
);

app.use(
  // data from the frontend is converted to json i.e understandable to backend
  express.json({
    limit: "16kb",
  }),
);

app.use(express.urlencoded()); // when data is sent fron frontend using the url and not using json,
// backend doesn't understand it well so it converts into understandable format like json.

app.use(express.static("public"));

app.get("/login", (req, res) => {
  res
    .send("Welcome back, Smeet")
    .setHeader("Access-Control-Allow-Origin", "http://localhost:6000");
});

app.use("/ta/api/v1", router);

//
export { app };
