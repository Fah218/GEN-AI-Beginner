const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full student name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    rollNumber: {
      type: String,
      required: [true, 'AKTU Roll Number is required'],
      unique: true,
      trim: true,
      index: true,
      match: [/^\d{10,14}$/, 'Roll number must be between 10 and 14 digits'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email address'],
    },
    branch: {
      type: String,
      required: [true, 'Engineering branch is required'],
      trim: true,
      default: 'Computer Science & Engineering',
    },
    semester: {
      type: String,
      required: [true, 'Current semester is required'],
      trim: true,
      default: 'Semester 5 (3rd Year)',
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false, // Don't return password hash by default in queries
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify password securely
studentSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.passwordHash);
};

// Static helper to hash passwords safely
studentSchema.statics.hashPassword = async function (plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
};

// Return a safe representation without sensitive fields
studentSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    fullName: this.fullName,
    rollNumber: this.rollNumber,
    email: this.email,
    branch: this.branch,
    semester: this.semester,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model('Student', studentSchema);
