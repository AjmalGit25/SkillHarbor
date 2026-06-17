import { Course } from '../models/course.model.js';
import { Purchase } from '../models/purchase.model.js';
import { v2 as cloudinary } from 'cloudinary';

export const createCourse = async (req, res) => {
  const adminId = req.adminId;
  const { title, description, price } = req.body;

  try {
    if (!title || !description || !price) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const imageFile = req.files.image;
    if (req.files === null) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const allowedFormat = ["image/jpg", "image/jpeg", "image/png"];

    if (!allowedFormat.includes(imageFile.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Only JPEG, PNG and JPG files are allowed",
      });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(imageFile.tempFilePath);
    if (!result) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload image",
      });
    }

    const courseData = new Course({
      adminId,
      title,
      description,
      price,
      image: {
        public_id: result.public_id,
        url: result.secure_url,
      }
    });

    const course = await Course.create(courseData);
    console.log("Course created successfully", course);

    return res.status(200).json({
      success: true,
      message: "Course created successfully",
      course,
    });

  } catch (error) {
    console.log("Error in creating course", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create course",
    });
  }
};

export const updateCourse = async (req, res) => {
  const adminId = req.adminId;
  const { courseId } = req.params;
  const { title, description, price, image } = req.body;

  try {
    const course = await Course.findOneAndUpdate({
      _id: courseId,
      adminId,
    }, {
      title,
      description,
      price,
      image: {
        public_id: image?.public_id,
        url: image?.url,
      }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Can't update course! Created by other admin",
      });
    }

    return res.status(200).json({ message: "Course updated successfully", course });

  } catch (error) {
    console.log("Error in updating course", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update course!",
    });
  }
}

export const deleteCourse = async (req, res) => {
  const adminId = req.adminId;
  const { courseId } = req.params;

  try {
    const course = await Course.findOneAndDelete({
      _id: courseId,
      adminId: adminId
    });


    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Can't delete course! Created by other admin",
      });
    }

    return res.status(200).json({ message: "Course deleted successfully" });

  } catch (error) {
    console.log("Error in deleting course", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete course!",
    });
  }
}

export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({});
    return res.status(200).json({
      success: true,
      message: "Courses retrieved successfully",
      courses,
    });
  } catch (error) {
    console.log("Error in retrieving courses", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve courses",
    });
  }
}

export const getCourseDetails = async (req, res) => {
  const { courseId } = req.params;

  try {
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Course retrieved successfully",
      course,
    });
  } catch (error) {
    console.log("Error in retrieving course", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve course details",
    });
  }
}


import Stripe from 'stripe';
import config from '../config.js';
const stripe = new Stripe(config.STRIPE_SECRET_KEY);

export const buyCourse = async (req, res) => {
  const { userId } = req;
  const { courseId } = req.params;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const isPurchased = await Purchase.findOne({ userId, courseId });
    if (isPurchased) {
      return res.status(400).json({
        success: true,
        message: "Course already purchased",
      });
    }

    // Stripe payment code ...
    const amount = course.price;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "usd",
      payment_method_types: ["card"]
    });

    const purchase = new Purchase({ userId, courseId });
    await purchase.save();

    return res.status(201).json({
      success: true,
      message: "Course purchased successfully",
      course,
      purchase,
      clientSecret: paymentIntent.client_secret,
    });

  } catch (error) {
    console.error("ERROR OCCURRED:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to buy course",
    });
  }
}