/**
 * In-memory sliding-window rate limiter
 * Factory allows creating different limiters (e.g. for chat, auth, or general APIs)
 */
function createRateLimiter({ windowMs = 60 * 1000, maxRequests = 30, message = 'Too many requests. Please slow down and try again later.' }) {
  const rateLimitMap = new Map();

  // Periodic cleanup of stale IPs every 5 minutes
  const interval = setInterval(() => {
    const now = Date.now();
    for (const [ip, timestamps] of rateLimitMap.entries()) {
      const active = timestamps.filter((time) => now - time < windowMs);
      if (active.length === 0) {
        rateLimitMap.delete(ip);
      } else {
        rateLimitMap.set(ip, active);
      }
    }
  }, 5 * 60 * 1000);

  if (interval.unref) {
    interval.unref();
  }

  return function rateLimiterMiddleware(req, res, next) {
    const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();

    const timestamps = rateLimitMap.get(clientIp) || [];
    const recentTimestamps = timestamps.filter((time) => now - time < windowMs);

    if (recentTimestamps.length >= maxRequests) {
      const oldestTimestamp = recentTimestamps[0];
      const retryAfterSec = Math.max(1, Math.ceil((oldestTimestamp + windowMs - now) / 1000));
      res.setHeader('Retry-After', retryAfterSec.toString());

      return res.status(429).json({
        success: false,
        error: message,
      });
    }

    recentTimestamps.push(now);
    rateLimitMap.set(clientIp, recentTimestamps);
    next();
  };
}

module.exports = {
  createRateLimiter,
};
