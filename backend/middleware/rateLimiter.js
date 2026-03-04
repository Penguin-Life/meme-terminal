/**
 * Tiered rate limiting middleware.
 * Different limits for different endpoint groups.
 */

const rateLimit = require('express-rate-limit');

/**
 * Factory: creates a rate limiter with proper 429 + Retry-After headers
 */
function createLimiter({ max, windowMs, name }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,   // sets RateLimit-* headers
    legacyHeaders: false,
    handler(req, res) {
      const retryAfter = Math.ceil(windowMs / 1000);
      res.set('Retry-After', retryAfter);
      res.status(429).json({
        success: false,
        error: {
          message: `Too many requests to ${name} endpoints. Please slow down.`,
          code: 'RATE_LIMIT_EXCEEDED',
          details: {
            limit: max,
            windowMs,
            retryAfterSeconds: retryAfter
          }
        }
      });
    }
  });
}

// ─── Tier definitions ─────────────────────────────────────────────────────────

/** Search + trending: 60 req/min */
const searchLimiter = createLimiter({
  name: 'search/trending',
  max: 60,
  windowMs: 60_000
});

/** Analysis (heavy): 20 req/min */
const analysisLimiter = createLimiter({
  name: 'analysis',
  max: 20,
  windowMs: 60_000
});

/** Alerts CRUD: 30 req/min */
const alertsLimiter = createLimiter({
  name: 'alerts',
  max: 30,
  windowMs: 60_000
});

/** Notify: 10 req/min */
const notifyLimiter = createLimiter({
  name: 'notify',
  max: 10,
  windowMs: 60_000
});

/** General fallback: 100 req/min */
const globalLimiter = createLimiter({
  name: 'global',
  max: 100,
  windowMs: 60_000
});

module.exports = {
  searchLimiter,
  analysisLimiter,
  alertsLimiter,
  notifyLimiter,
  globalLimiter
};
