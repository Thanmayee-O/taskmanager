import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
    },
    period: {
      type: String,
      enum: ['week', 'month'],
      required: [true, 'Goal period (week or month) is required'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Goal', goalSchema);
