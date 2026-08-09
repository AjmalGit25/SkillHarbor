import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

const port = process.env.PORT;

const DB_URI = process.env.MONGO_URI;


const connectDB = () => {
  await mongoose.connect(DB_URI);
  console.log("MongoDB connected");
}

export default connectDB;