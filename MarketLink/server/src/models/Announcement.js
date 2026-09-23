import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 120 },
    message: { type: String, required: [true, 'Message is required'], trim: true, maxlength: 1000 },
    audience: { type: String, enum: ['all', 'customer', 'farmer'], default: 'all' },
    isActive: { type: Boolean, default: true }, // shown as a banner on the website
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Announcement', announcementSchema);
