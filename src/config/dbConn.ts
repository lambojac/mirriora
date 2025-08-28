import mongoose from "mongoose";

mongoose.set("strictQuery", false);

const connectDB = async (): Promise<void> => {
  try {
    const dbUrl = process.env.DB_URL;

    if (!dbUrl) {
      throw new Error("DB_URL is not defined in environment variables.");
    }

    const conn = await mongoose.connect(dbUrl);
    console.log(`Database Running!!! ${conn.connection.host}`);
  } catch (err) {
    if (err instanceof Error) {
      console.error("Database connection error:", err.message);
    } else {
      console.error("Unknown error occurred during DB connection.");
    }
  }
};

export default connectDB;
