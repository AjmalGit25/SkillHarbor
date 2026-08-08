import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  certificateId: {
    type: String,
    unique: true,
    required: true,
  },
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
  studentName: {
    type: String,
    required: true,
  },
  courseName: {
    type: String,
    required: true,
  },
  issuedAt: {
    type: Date,
    required: true,
  },
  certificateUrl: {
    type: String, // Cloudinary URL — used for future verification
  },
}, { timestamps: true });

// One certificate per user per course
certificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const Certificate = mongoose.model('Certificate', certificateSchema);
