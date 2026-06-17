import { Admin } from '../models/admin.model.js';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import config from '../config.js';

export const signup = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const adminSchema = z.object({
    firstName: z.string().min(3, "First name must be at least 3 characters").max(50),
    lastName: z.string().min(3, "Last name must be at least 3 characters").max(50),
    email: z.email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

  const parsedData = adminSchema.safeParse(req.body);

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

    const existingUser = await Admin.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const adminData = new Admin({
      firstName,
      lastName,
      email,
      password: hashPassword,
    });

    const admin = await Admin.create(adminData);

    return res.status(200).json({
      success: true,
      message: "Admin created successfully",
      admin,
    });
  } catch (error) {
    console.log("Error in creating admin", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create admin",
    });
  }
}

export const login = async (req, res) => {
  const { email, password } = req.body;

  const adminSchema = z.object({
    email: z.email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

  const parsedData = adminSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({
      success: false,
      message: parsedData.error.issues.map((err) => err.message),
    });
  }

  try {
    const admin = await Admin.findOne({ email: email });
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!admin || !isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // jwt token assignment
    const token = jwt.sign({ id: admin._id, }, config.JWT_ADMIN_PASSWORD, { expiresIn: "6h" });

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
      message: "Admin Login successful",
      admin,
      token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Admin login failed!",
    });
  }
}

export const logout = async (req, res) => {
  try {
    if (!req.cookies.jwt) {
      return res.status(400).json({
        success: false,
        message: "Kindly login first, Admin!",
      });
    }

    // Clear the cookie
    res.clearCookie("jwt");

    return res.status(200).json({
      success: true,
      message: "Admin Logout successful",
    });

  } catch (error) {
    console.log("Error in logging out", error);
    return res.status(500).json({
      success: false,
      message: "Admin logout failed!",
    });
  }
}