import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({
  path:'./env'
})

const connectDb = async () => {
  try {
    const connection = await mongoose.connect(process.env.db_connection_string);
    console.log("connection successful with DB");
  } catch (error) {
    console.error("connection failed", error.message);
    process.exit(1);
  }
};

export default connectDb;