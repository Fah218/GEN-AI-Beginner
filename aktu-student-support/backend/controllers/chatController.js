const Conversation = require('../models/Conversation');
const { generateGeminiReply } = require('../config/gemini');

/**
 * GET /api/conversations
 * List conversations belonging to the authenticated student
 */
async function listConversations(req, res, next) {
  try {
    const studentId = req.student._id;

    const conversations = await Conversation.find({ student: studentId })
      .select('title lastMessageAt createdAt updatedAt messages')
      .sort({ updatedAt: -1 })
      .lean();

    const formatted = conversations.map((conv) => {
      const lastMsg = conv.messages && conv.messages.length > 0
        ? conv.messages[conv.messages.length - 1]
        : null;

      const snippet = lastMsg
        ? lastMsg.content.slice(0, 90) + (lastMsg.content.length > 90 ? '...' : '')
        : 'What would you like to inquire about?';

      return {
        id: conv._id.toString(),
        title: conv.title,
        snippet,
        timestamp: conv.lastMessageAt || conv.updatedAt || conv.createdAt,
        messageCount: conv.messages ? conv.messages.length : 0,
      };
    });

    return res.status(200).json({
      success: true,
      conversations: formatted,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/conversations
 * Create a new conversation session
 */
async function createConversation(req, res, next) {
  try {
    const studentId = req.student._id;
    const { title } = req.body;

    const cleanTitle = (title && typeof title === 'string' && title.trim())
      ? title.trim().slice(0, 150)
      : 'New Student Consultation';

    // Initial greeting message for AKTU student assistant
    const welcomeMessage = {
      sender: 'bot',
      content: `Hello ${req.student.fullName || 'Student'}! I am ready to assist you. You can ask about B.Tech syllabi, grace marks, carry-over exam schedules, or university circulars.`,
      timestamp: new Date(),
      citations: [
        {
          title: 'AKTU University Guidelines',
          clause: 'Section 2024-25',
          category: 'regulations',
        },
      ],
      isGrounded: false,
    };

    const conversation = await Conversation.create({
      student: studentId,
      title: cleanTitle,
      messages: [welcomeMessage],
      lastMessageAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: 'Conversation created successfully.',
      conversation: {
        id: conversation._id.toString(),
        title: conversation.title,
        messages: conversation.messages,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/conversations/:id
 * Retrieve a specific conversation with ownership check
 */
async function getConversation(req, res, next) {
  try {
    const studentId = req.student._id;
    const { id } = req.params;

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found.',
      });
    }

    // Ownership check
    if (conversation.student.toString() !== studentId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You do not have permission to view this conversation.',
      });
    }

    return res.status(200).json({
      success: true,
      conversation: {
        id: conversation._id.toString(),
        title: conversation.title,
        messages: conversation.messages,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/conversations/:id
 * Delete an authorized conversation
 */
async function deleteConversation(req, res, next) {
  try {
    const studentId = req.student._id;
    const { id } = req.params;

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found.',
      });
    }

    // Ownership check
    if (conversation.student.toString() !== studentId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You do not have permission to delete this conversation.',
      });
    }

    await Conversation.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully.',
      deletedId: id,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/chat
 * Send a student's message to Gemini and return AI response.
 * If conversationId is supplied, persists messages to database with ownership validation.
 * If no conversationId is supplied, creates a new conversation or processes the query directly.
 */
async function chat(req, res, next) {
  try {
    const student = req.student;
    const { message, conversationId, history } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message content is required and cannot be empty.',
      });
    }

    if (message.length > 3000) {
      return res.status(400).json({
        success: false,
        error: 'Message is too long. Maximum allowed length is 3,000 characters.',
      });
    }

    let conversation = null;
    let conversationHistory = [];

    // If conversationId is provided, retrieve and verify ownership
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return res.status(404).json({
          success: false,
          error: 'Specified conversation session not found.',
        });
      }

      if (conversation.student.toString() !== student._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. You do not own this conversation.',
        });
      }

      // Extract existing messages as conversation history
      conversationHistory = conversation.messages.map((m) => ({
        sender: m.sender,
        content: m.content,
      }));
    } else if (Array.isArray(history)) {
      // Validate provided history array if client supplied it
      conversationHistory = history
        .filter((h) => h && typeof h.content === 'string')
        .slice(-10) // keep last 10 messages for context window
        .map((h) => ({
          sender: h.sender === 'user' ? 'user' : 'bot',
          content: h.content,
        }));
    }

    // Call Gemini API
    const replyText = await generateGeminiReply(conversationHistory, message.trim());

    // Save to conversation if active session exists
    let botMessageSaved = null;
    if (conversation) {
      const now = new Date();
      const userMsgObj = {
        sender: 'user',
        content: message.trim(),
        timestamp: now,
      };

      const botMsgObj = {
        sender: 'bot',
        content: replyText,
        timestamp: new Date(),
        citations: [],
        isGrounded: false,
      };

      conversation.messages.push(userMsgObj);
      conversation.messages.push(botMsgObj);
      conversation.lastMessageAt = new Date();

      // Update title if it's still default and there's user input
      if (conversation.title === 'New Student Consultation' || conversation.messages.length <= 4) {
        conversation.title = message.trim().slice(0, 40) + (message.trim().length > 40 ? '...' : '');
      }

      await conversation.save();
      botMessageSaved = conversation.messages[conversation.messages.length - 1];
    }

    return res.status(200).json({
      success: true,
      reply: replyText,
      conversationId: conversation ? conversation._id.toString() : null,
      messageId: botMessageSaved ? botMessageSaved._id.toString() : `bot-${Date.now()}`,
      citations: [],
      mode: 'non-rag-advisory',
    });
  } catch (error) {
    // Check for Gemini quota or rate limits
    if (
      error.status === 429 ||
      (typeof error.message === 'string' &&
        (error.message.includes('429') ||
          error.message.includes('RESOURCE_EXHAUSTED') ||
          error.message.toLowerCase().includes('quota')))
    ) {
      return res.status(429).json({
        success: false,
        error: 'Gemini API quota has been reached or rate limited. Please try again shortly.',
      });
    }

    if (error.message && error.message.includes('GEMINI_API_KEY')) {
      return res.status(500).json({
        success: false,
        error: 'Backend configuration error: GEMINI_API_KEY is missing.',
      });
    }

    next(error);
  }
}

module.exports = {
  listConversations,
  createConversation,
  getConversation,
  deleteConversation,
  chat,
};
