import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 80 },
    email: { type: String, required: [true, 'E-mail is required'], trim: true, lowercase: true, maxlength: 120 },
    subject: { type: String, trim: true, maxlength: 150 },
    message: { type: String, required: [true, 'Message is required'], trim: true, maxlength: 2000 },
    status: { type: String, enum: ['new', 'read'], default: 'new' },
  },
  { timestamps: true }
);

export default mongoose.model('ContactMessage', contactMessageSchema);
