import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
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

  stripeSessionId: {
    type: String,
  },
  stripePaymentIntentId: {
    type: String,
  },

  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },

  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Payment = mongoose.model('Payment', paymentSchema);
