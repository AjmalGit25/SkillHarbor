import { User } from '../models/user.model.js';
import { Purchase } from '../models/purchase.model.js';
import { Course } from '../models/course.model.js';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import config from '../config.js';

export const signup = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const userSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters").max(50),
    lastName: z.string().min(3, "Last name must be at least 3 characters").max(50),
    email: z.email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

  const parsedData = userSchema.safeParse(req.body);

  if (!parsedData.success) {
    return res.status(400).json({
      success: false,
      message: parsedData.error.issues.map((err) => err.message),
    });
  }

  try {
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const userData = new User({
      firstName,
      lastName,
      email,
      password: hashPassword,
    });

    const user = await User.create(userData);
    console.log("User created successfully", user);

    return res.status(200).json({
      success: true,
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.log("Error in creating user", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create user",
    });
  }
}

export const login = async (req, res) => {
  const { email, password } = req.body;

  const userSchema = z.object({
    email: z.email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

  const parsedData = userSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({
      success: false,
      message: parsedData.error.issues.map((err) => err.message),
    });
  }

  try {
    const user = await User.findOne({ email: email });
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!user || !isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // jwt token assignment
    const token = jwt.sign({ id: user._id, }, config.JWT_USER_PASSWORD, { expiresIn: "6h" });

    // cookie assignment
    const cookieOptions = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),    // 1 day
      httpOnly: true,                                         // Can't be accessed by client side scripts (JavaScript)
      secure: process.env.NODE_ENV === "production",          // true for production (http), false for development (https only)
      sameSite: "Strict",                                     // CSRF protection
    };
    res.cookie("jwt", token, cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    // if login fails
    res.clearCookie("jwt");
    console.log("Error in logging in", error);
    return res.status(500).json({
      success: false,
      message: "Failed to login",
    });
  }
}

export const logout = async (req, res) => {
  try {
    if (!req.cookies.jwt) {
      return res.status(400).json({
        success: false,
        message: "Kindly login first",
      });
    }

    res.clearCookie("jwt");
    
    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });

  } catch (error) {
    console.log("Error in logging out", error);
    return res.status(500).json({
      success: false,
      message: "Failed to logout",
    });
  }
}

export const getPurchase = async (req, res) => {
  const userId = req.userId;

  try {
    const purchases = await Purchase.find({ userId });

    let purchasedCourseId = [];

    for (let i = 0; i < purchases.length; i++) {
      purchasedCourseId.push(purchases[i].courseId);
    }

    const courseData = await Course.find({
      _id: { $in: purchasedCourseId },
    });

    res.status(200).json({
      success: true,
      message: "Purchases retrieved successfully",
      purchases,
      courseData,
    });
  } catch (error) {
    console.log("Error in retrieving purchase", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve purchase",
    });
  }
}