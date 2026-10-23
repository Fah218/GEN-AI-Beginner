const Student = require('../models/Student');
const { generateToken } = require('../middleware/auth');

/**
 * POST /api/auth/signup
 * Register a new student account
 */
async function signup(req, res, next) {
  try {
    const { fullName, rollNumber, email, branch, semester, password } = req.body;

    // Validation
    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      return res.status(400).json({ success: false, error: 'Full student name is required.' });
    }

    if (!rollNumber || typeof rollNumber !== 'string' || !rollNumber.trim()) {
      return res.status(400).json({ success: false, error: 'AKTU Roll Number is required.' });
    }

    const cleanRoll = rollNumber.trim();
    if (!/^\d{10,14}$/.test(cleanRoll)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid university roll number (10-14 digits).',
      });
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ success: false, error: 'Email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!/\S+@\S+\.\S+/.test(cleanEmail)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password is required and must be at least 6 characters.',
      });
    }

    // Check if roll number or email already exists
    const existing = await Student.findOne({
      $or: [{ rollNumber: cleanRoll }, { email: cleanEmail }],
    });

    if (existing) {
      if (existing.rollNumber === cleanRoll) {
        return res.status(409).json({
          success: false,
          error: 'An account with this AKTU Roll Number already exists. Please log in.',
        });
      }
      return res.status(409).json({
        success: false,
        error: 'An account with this email address already exists. Please log in.',
      });
    }

    // Hash password securely
    const passwordHash = await Student.hashPassword(password);

    // Create student
    const student = await Student.create({
      fullName: fullName.trim(),
      rollNumber: cleanRoll,
      email: cleanEmail,
      branch: branch ? branch.trim() : 'Computer Science & Engineering',
      semester: semester ? semester.trim() : 'Semester 5 (3rd Year)',
      passwordHash,
    });

    // Generate token
    const token = generateToken(student._id);

    return res.status(201).json({
      success: true,
      message: 'Student account created successfully.',
      token,
      student: student.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/login
 * Authenticate student using rollNumber/email and password
 */
async function login(req, res, next) {
  try {
    const { rollNumberOrEmail, password } = req.body;

    if (!rollNumberOrEmail || typeof rollNumberOrEmail !== 'string' || !rollNumberOrEmail.trim()) {
      return res.status(400).json({
        success: false,
        error: 'AKTU Roll Number or University Email is required.',
      });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Password is required.',
      });
    }

    const identifier = rollNumberOrEmail.trim().toLowerCase();

    // Query by either rollNumber or email, including passwordHash for verification
    const student = await Student.findOne({
      $or: [{ rollNumber: identifier }, { email: identifier }],
    }).select('+passwordHash');

    if (!student) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. No student account found matching this identifier.',
      });
    }

    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. Incorrect password.',
      });
    }

    const token = generateToken(student._id);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      student: student.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me
 * Return currently authenticated student's profile
 */
async function getMe(req, res, next) {
  try {
    // req.student is populated by the authenticate middleware
    return res.status(200).json({
      success: true,
      student: req.student.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  signup,
  login,
  getMe,
};
