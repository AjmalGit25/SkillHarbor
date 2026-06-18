import express from 'express';

import mongoose from 'mongoose';
import fileUpload from 'express-fileupload';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";
dotenv.config();

import courseRouter from './routes/course.route.js';
import userRouter from './routes/user.route.js';
import adminRouter from './routes/admin.route.js';
import orderRouter from './routes/order.route.js';

import cookieParser from 'cookie-parser';
import cors from 'cors';

const port = process.env.PORT || 5000;
const DB_URI = process.env.MONGO_URI;

const app = express();

// Middlwares ======================

// JSON parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// File upload
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
  }));

// Cors origin allow
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true, // <-- REQUIRED backend setting
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // <-- REQUIRED backend setting
  allowedHeaders: ['Content-Type', 'Authorization'], // <-- REQUIRED backend setting
}));

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


console.log("Stripe Key:", process.env.STRIPE_SECRET_KEY);

try {
  console.log('Connecting to MongoDB...', DB_URI ? 'URI exists' : 'URI MISSING');
  await mongoose.connect(DB_URI);
  console.log('Database connected to MongoDB');
} catch (error) {
  console.log('Database not connected to MongoDB', error.message);
}

// base routes
app.use("/api/v1/course", courseRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/order", orderRouter);

app.get("/", (req, res)=> {
  res.send("Ajmal Hussain's Express Server! Hello, Welcome!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});