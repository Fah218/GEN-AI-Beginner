const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');
const { createRateLimiter } = require('../middleware/rateLimiter');

// Rate limiter for chat endpoint (20 messages per minute per IP)
const chatLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 20,
  message: 'Chat rate limit reached. Please wait a moment before sending another query.',
});

// All conversation routes require authenticated student
router.use(authenticate);

// GET /api/conversations - list student conversations
router.get('/conversations', chatController.listConversations);

// POST /api/conversations - create a new conversation
router.post('/conversations', chatController.createConversation);

// GET /api/conversations/:id - get specific conversation
router.get('/conversations/:id', chatController.getConversation);

// DELETE /api/conversations/:id - delete a conversation
router.delete('/conversations/:id', chatController.deleteConversation);

// POST /api/chat - send query to Gemini with non-RAG boundaries
router.post('/chat', chatLimiter, chatController.chat);

module.exports = router;
