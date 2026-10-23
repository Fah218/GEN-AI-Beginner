const mongoose = require('mongoose');

const messageCitationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    clause: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: 'regulations',
    },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ['user', 'bot', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: [10000, 'Message cannot exceed 10,000 characters'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    citations: [messageCitationSchema],
    isGrounded: {
      type: Boolean,
      default: false,
    },
    helpful: {
      type: Boolean,
      default: null,
    },
  },
  { _id: true }
);

const conversationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
      default: 'New Student Consultation',
    },
    messages: [messageSchema],
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast queries sorting conversations for a specific student
conversationSchema.index({ student: 1, updatedAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
