import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { router } from "./route/movie.route.js";

const app = express();

app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(

  express.json({
    limit: "16kb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
  }),
); 

app.use(express.static("public"));

app.get("/login", (req, res) => {
  res
    .setHeader("Access-Control-Allow-Origin", "http://localhost:3000")
    .send("Welcome back, Smeet");
});

app.use("/ta/api/v1", router);

//
export { app };
