import express from 'express';
import {
  createModule, updateModule, deleteModule, getModulesByCourse,
  createLesson, updateLesson, deleteLesson, getLessonsByModule,
} from '../controllers/module.controller.js';
import adminMiddleware from '../middlewares/admin.mid.js';

const router = express.Router();

// Module routes
router.post('/course/:courseId/modules',        adminMiddleware, createModule);
router.put('/modules/:moduleId',                adminMiddleware, updateModule);
router.delete('/modules/:moduleId',             adminMiddleware, deleteModule);
router.get('/course/:courseId/modules',         adminMiddleware, getModulesByCourse);

// Lesson routes
router.post('/modules/:moduleId/lessons',       adminMiddleware, createLesson);
router.put('/lessons/:lessonId',                adminMiddleware, updateLesson);
router.delete('/lessons/:lessonId',             adminMiddleware, deleteLesson);
router.get('/modules/:moduleId/lessons',        adminMiddleware, getLessonsByModule);

export default router;
