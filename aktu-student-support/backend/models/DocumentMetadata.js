const mongoose = require('mongoose');

const documentMetadataSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
      index: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    category: {
      type: String,
      required: [true, 'Document category is required'],
      enum: ['syllabus', 'regulations', 'calendar', 'circulars', 'results'],
      index: true,
    },
    sourceUrl: {
      type: String,
      trim: true,
      default: '',
    },
    academicYear: {
      type: String,
      trim: true,
      default: '2024-25',
      index: true,
    },
    processingStatus: {
      type: String,
      enum: ['pending', 'processed', 'indexed', 'failed'],
      default: 'pending',
      index: true,
    },
    course: {
      type: String,
      trim: true,
      default: 'B.Tech',
    },
    branch: {
      type: String,
      trim: true,
    },
    semester: {
      type: String,
      trim: true,
    },
    fileType: {
      type: String,
      enum: ['PDF', 'DOCX', 'CIRCULAR'],
      default: 'PDF',
    },
    fileSize: {
      type: String,
      default: '',
    },
    officialCode: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

documentMetadataSchema.index({ category: 1, academicYear: 1 });

module.exports = mongoose.model('DocumentMetadata', documentMetadataSchema);
