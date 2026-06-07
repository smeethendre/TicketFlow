import "dotenv/config";
import connectDb from "./db/db.js";
import { app } from "./app.js";

const startServer = async () => {
  try {
    await connectDb();
    app.listen(process.env.PORT || 8000, () => {
      console.log(
        `Server started on http://localhost:${process.env.PORT || 8000}`,
      );
    });
  } catch (error) {
    console.error("Server failed to start", error);
    process.exit(1);
  }
};

startServer();
