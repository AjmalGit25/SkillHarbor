import { Course } from '../models/course.model.js';
import { Purchase } from '../models/purchase.model.js';
import { v2 as cloudinary } from 'cloudinary';
import stripe from "../config/stripe.js";

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
  const { title, description, price } = req.body;

  try {
    const course = await Course.findOne({ _id: courseId, adminId });
    if (!course) {
      return res.status(404).json({ success: false, message: "Can't update course! Created by other admin" });
    }

    const updateData = { title, description, price };

    if (req.files?.image) {
      const imageFile = req.files.image;
      const allowedFormat = ['image/jpg', 'image/jpeg', 'image/png'];
      if (!allowedFormat.includes(imageFile.mimetype)) {
        return res.status(400).json({ success: false, message: 'Only JPEG, PNG and JPG files are allowed' });
      }

      // Delete old image from Cloudinary
      if (course.image?.public_id) {
        await cloudinary.uploader.destroy(course.image.public_id);
      }

      const result = await cloudinary.uploader.upload(imageFile.tempFilePath);
      if (!result) {
        return res.status(500).json({ success: false, message: 'Failed to upload image' });
      }
      updateData.image = { public_id: result.public_id, url: result.secure_url };
    }

    const updated = await Course.findByIdAndUpdate(courseId, updateData, { new: true });
    return res.status(200).json({ message: 'Course updated successfully', course: updated });

  } catch (error) {
    console.log('Error in updating course', error);
    return res.status(500).json({ success: false, message: 'Failed to update course!' });
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

export const getAdminCourses = async (req, res) => {
  const adminId = req.adminId;
  try {
    const courses = await Course.find({ adminId });
    return res.status(200).json({ success: true, courses });
  } catch (error) {
    console.log("Error in retrieving admin courses", error);
    return res.status(500).json({ success: false, message: "Failed to retrieve courses" });
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

export const enrollFree = async (req, res) => {
  const { userId } = req;
  const { courseId } = req.params;

  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (course.price !== 0) return res.status(400).json({ success: false, message: 'This is a paid course' });

    const already = await Purchase.findOne({ userId, courseId });
    if (already) return res.status(400).json({ success: false, message: 'Already enrolled' });

    await Purchase.create({ userId, courseId });
    return res.status(201).json({ success: true, message: 'Enrolled successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Enrollment failed' });
  }
};

export const buyCourse = async (req, res) => {
  const { userId } = req;
  const { courseId } = req.params;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found", });
    }

    const isPurchased = await Purchase.findOne({ userId, courseId });
    if (isPurchased) {
      return res.status(400).json({ success: false, message: "Course already purchased", });
    }

    // Stripe payment code ...
    const amount = Math.round(course.price * 100);  // Stripe expects the amount in the smallest currency unit.
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "usd",
      payment_method_types: ["card"],
      metadata: {
        userId: userId.toString(),
        courseId: courseId.toString(),
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Payment initiated',
      clientSecret: paymentIntent.client_secret,
      course: course,
    });
  } catch (error) {
    console.error("ERROR OCCURRED:", error);
    return res.status(500).json({ success: false, message: "Failed to initiate payment", });
  }
}