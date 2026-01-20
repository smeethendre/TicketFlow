import connectDb from "./db/db.js";
import dotenv from "dotenv";
import {app} from "./app.js";
dotenv.config();


const startServer = async () => {
  try {
    await connectDb();
    app.listen(process.env.PORT || 8000, () => {
      console.log("server start successfull on http://localhost:6000");
    });
  } catch (error) {
    console.error("server not able to start", error);
    process.exit(1);
  }
};

startServer();