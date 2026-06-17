import express from 'express';
import {
  createCourse,
  updateCourse,
  deleteCourse,
  getAllCourses,
  getCourseDetails,
  buyCourse
} from '../controllers/course.controller.js';
import userMiddleware from '../middlewares/user.mid.js';
import adminMiddleware from '../middlewares/admin.mid.js';

const router = express.Router();

router.post("/create", adminMiddleware, createCourse);
router.put("/update/:courseId", adminMiddleware, updateCourse);
router.delete("/delete/:courseId", adminMiddleware, deleteCourse);
router.get("/courses", getAllCourses);
router.get("/:courseId", getCourseDetails);

router.post("/buy/:courseId", userMiddleware, buyCourse);

export default router;