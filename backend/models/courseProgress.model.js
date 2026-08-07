import mongoose from 'mongoose';

const courseProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  completedLessons: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
    },
  ],
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  lastAccessed: {
    type: Date,
    default: Date.now,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

// One progress doc per user per course
courseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const CourseProgress = mongoose.model('CourseProgress', courseProgressSchema);
