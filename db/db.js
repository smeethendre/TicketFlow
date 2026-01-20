import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({
  path:'./env'
})

const connectDb = async () => {
  try {
    const connection = await mongoose.connect(process.env.DB_CONNECTION);
    console.log("connection successful with DB");
  } catch (error) {
    console.error("connection failed", error.message);
    process.exit(1);
  }
};

export default connectDb;