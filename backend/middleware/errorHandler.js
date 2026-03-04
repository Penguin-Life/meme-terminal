/**
 * Structured error handler middleware for Express.
 * Catches all unhandled errors and returns a consistent JSON response.
 * Logs errors to file via utils/logger.
 */

const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || 'INTERNAL_ERROR';

  logger.error(`${req.method} ${req.path} → ${statusCode} [${code}]: ${message}`, {
    ip: req.ip,
    body: statusCode < 500 ? undefined : req.body,
    stack: statusCode >= 500 ? err.stack : undefined
  });

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code,
      ...(process.env.NODE_ENV !== 'production' && err.stack && statusCode >= 500 && {
        stack: err.stack
      })
    }
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      message: `Route not found: ${req.method} ${req.path}`,
      code: 'NOT_FOUND'
    }
  });
}

/**
 * Helper: create an HTTP error with a custom status code
 */
function createError(message, statusCode = 500, code = 'ERROR') {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

module.exports = { errorHandler, notFoundHandler, createError };
