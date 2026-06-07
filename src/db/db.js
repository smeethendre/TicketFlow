import mongoose from "mongoose";

const connectDb = async () => {
  try {
    if (!process.env.DB_CONNECTION) {
      throw new Error("DB_CONNECTION is not configured");
    }

    const connectionInstance = await mongoose.connect(process.env.DB_CONNECTION, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB connected: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  }
};

export default connectDb;
