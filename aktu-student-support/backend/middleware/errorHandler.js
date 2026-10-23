/**
 * Safely redacts API keys and secrets from strings or error logs
 */
function redactSecrets(str) {
  if (!str || typeof str !== 'string') return str;
  let result = str;

  if (process.env.GEMINI_API_KEY) {
    result = result.split(process.env.GEMINI_API_KEY).join('[REDACTED_GEMINI_KEY]');
  }
  if (process.env.JWT_SECRET) {
    result = result.split(process.env.JWT_SECRET).join('[REDACTED_JWT_SECRET]');
  }
  if (process.env.MONGODB_URI) {
    result = result.replace(/mongodb(\+srv)?:\/\/[^@]+@/gi, 'mongodb$1://[REDACTED_CREDENTIALS]@');
  }

  return result;
}

/**
 * Global Express error handling middleware
 */
function errorHandler(err, req, res, next) {
  // Handle body size limit errors
  if (
    err.type === 'entity.too.large' ||
    err.status === 413 ||
    err.statusCode === 413 ||
    err.name === 'PayloadTooLargeError'
  ) {
    return res.status(413).json({
      success: false,
      error: 'Request payload too large. Maximum allowed size is 50 KB.',
    });
  }

  // Handle malformed JSON bodies
  if (
    err.type === 'entity.parse.failed' ||
    (err instanceof SyntaxError && (err.status === 400 || err.statusCode === 400))
  ) {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON format in request body.',
    });
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      error: messages.join(', '),
    });
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: `Invalid resource identifier format: ${err.value}`,
    });
  }

  // Handle duplicate key error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      error: `A record with this ${field} already exists.`,
    });
  }

  const statusCode = err.status || err.statusCode || 500;

  // Log error safely without exposing raw secrets
  console.error('[Server Error]:', {
    name: err.name,
    message: redactSecrets(err.message || ''),
    status: statusCode,
  });

  return res.status(statusCode).json({
    success: false,
    error: statusCode === 500 ? 'An internal server error occurred. Please try again later.' : err.message,
  });
}

module.exports = {
  redactSecrets,
  errorHandler,
};
