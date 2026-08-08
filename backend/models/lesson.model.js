import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  contentType: {
    type: String,
    enum: ['video', 'image', 'document', 'text'],
    default: 'video',
  },
  videoUrl: {
    type: String,
  },
  content: {
    type: String, // text/notes content or document URL
  },
  duration: {
    type: Number, // in seconds
  },
  order: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

export const Lesson = mongoose.model('Lesson', lessonSchema);
