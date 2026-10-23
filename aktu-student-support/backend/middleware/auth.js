const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

const JWT_SECRET = process.env.JWT_SECRET || 'aktu_default_jwt_secret_change_me';

/**
 * Middleware to authenticate requests using JWT Bearer token
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Missing or malformed Bearer token.',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Token is missing.',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Authentication token has expired. Please log in again.',
        });
      }
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication token.',
      });
    }

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token payload.',
      });
    }

    // Attach student to request (excluding password)
    const student = await Student.findById(decoded.id).select('-passwordHash');
    if (!student) {
      return res.status(401).json({
        success: false,
        error: 'Student account associated with this token no longer exists.',
      });
    }

    req.student = student;
    next();
  } catch (error) {
    console.error('[Auth Middleware] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred during authentication.',
    });
  }
}

/**
 * Helper to generate JWT token for a student
 */
function generateToken(studentId) {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id: studentId }, JWT_SECRET, { expiresIn });
}

module.exports = {
  authenticate,
  generateToken,
};
