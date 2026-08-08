import { Module } from '../models/module.model.js';
import { Lesson } from '../models/lesson.model.js';
import { Course } from '../models/course.model.js';

// ── MODULE ────────────────────────────────────────────────────────

export const createModule = async (req, res) => {
  const { courseId } = req.params;
  const { title, description, order } = req.body;

  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const module = await Module.create({ courseId, title, description, order });
    return res.status(201).json({ message: 'Module created successfully', module });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create module', error: error.message });
  }
};

export const updateModule = async (req, res) => {
  const { moduleId } = req.params;
  const { title, description, order } = req.body;

  try {
    const module = await Module.findByIdAndUpdate(
      moduleId,
      { title, description, order },
      { new: true }
    );
    if (!module) return res.status(404).json({ message: 'Module not found' });
    return res.status(200).json({ message: 'Module updated successfully', module });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update module', error: error.message });
  }
};

export const deleteModule = async (req, res) => {
  const { moduleId } = req.params;

  try {
    await Lesson.deleteMany({ moduleId });
    const module = await Module.findByIdAndDelete(moduleId);
    if (!module) return res.status(404).json({ message: 'Module not found' });
    return res.status(200).json({ message: 'Module and its lessons deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete module', error: error.message });
  }
};

export const getModulesByCourse = async (req, res) => {
  const { courseId } = req.params;

  try {
    const modules = await Module.find({ courseId }).sort({ order: 1 });
    return res.status(200).json({ modules });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch modules', error: error.message });
  }
};

// ── LESSON ────────────────────────────────────────────────────────

export const createLesson = async (req, res) => {
  const { moduleId } = req.params;
  const { courseId, title, description, contentType, videoUrl, content, duration, order } = req.body;

  try {
    const module = await Module.findById(moduleId);
    if (!module) return res.status(404).json({ message: 'Module not found' });

    const lesson = await Lesson.create({ courseId, moduleId, title, description, contentType, videoUrl, content, duration, order });
    return res.status(201).json({ message: 'Lesson created successfully', lesson });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create lesson', error: error.message });
  }
};

export const updateLesson = async (req, res) => {
  const { lessonId } = req.params;
  const { title, description, contentType, videoUrl, content, duration, order } = req.body;

  try {
    const lesson = await Lesson.findByIdAndUpdate(
      lessonId,
      { title, description, contentType, videoUrl, content, duration, order },
      { new: true }
    );
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    return res.status(200).json({ message: 'Lesson updated successfully', lesson });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update lesson', error: error.message });
  }
};

export const deleteLesson = async (req, res) => {
  const { lessonId } = req.params;

  try {
    const lesson = await Lesson.findByIdAndDelete(lessonId);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    return res.status(200).json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete lesson', error: error.message });
  }
};

export const getLessonsByModule = async (req, res) => {
  const { moduleId } = req.params;

  try {
    const lessons = await Lesson.find({ moduleId }).sort({ order: 1 });
    return res.status(200).json({ lessons });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch lessons', error: error.message });
  }
};
