const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies from incoming requests
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'LinkLens AI backend is running!'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
