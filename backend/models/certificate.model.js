import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const certificateSchema = new mongoose.Schema({
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
  certificateId: {
    type: String,
    default: () => uuidv4(),
    unique: true,
  },
  issuedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// One certificate per user per course
certificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const Certificate = mongoose.model('Certificate', certificateSchema);
