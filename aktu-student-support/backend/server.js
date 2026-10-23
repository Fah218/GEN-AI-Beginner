require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, getDatabaseStatus } = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Trust reverse proxy if running behind one (Render, Vercel, Nginx)
app.set('trust proxy', 1);

// Limit request body size to 50 KB to prevent payload flooding
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));

// CORS configuration supporting CLIENT_URL and localhost dev
const allowedOrigins = [
  CLIENT_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy: origin ${origin} is not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// GET /api/health - Server, database, and Gemini readiness status
app.get('/api/health', (req, res) => {
  const dbStatus = getDatabaseStatus();
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);

  const isHealthy = dbStatus.connected && hasGeminiKey;

  res.status(isHealthy ? 200 : 200).json({
    status: isHealthy ? 'healthy' : 'degraded',
    service: 'aktu-student-support-backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus.state,
      connected: dbStatus.connected,
    },
    aiService: {
      provider: 'Google Gemini',
      sdk: '@google/genai (Official SDK)',
      configured: hasGeminiKey,
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      mode: 'Phase 2 Non-RAG Advisory',
    },
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api', chatRoutes); // /api/conversations, /api/chat

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handler
app.use(errorHandler);

// Connect to MongoDB and start HTTP server
async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`[Server] AKTU Student Support Backend running on http://localhost:${PORT}`);
    console.log(`[Server] Allowed Client Origin: ${CLIENT_URL}`);
    console.log(`[Server] Gemini API Key configured: ${Boolean(process.env.GEMINI_API_KEY)}`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
