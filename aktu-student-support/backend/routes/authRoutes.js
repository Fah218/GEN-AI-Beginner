const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { createRateLimiter } = require('../middleware/rateLimiter');

// Rate limiter for authentication attempts (15 attempts per 15 minutes per IP)
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 15,
  message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
});

// POST /api/auth/signup
router.post('/signup', authLimiter, authController.signup);

// POST /api/auth/login
router.post('/login', authLimiter, authController.login);

// GET /api/auth/me
router.get('/me', authenticate, authController.getMe);

module.exports = router;
