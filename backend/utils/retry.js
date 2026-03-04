/**
 * Retry wrapper with exponential backoff.
 * Wraps any async function to retry on failure.
 *
 * @param {Function} fn       - Async function to retry
 * @param {Object}   opts
 * @param {number}   opts.attempts  - Max attempts (default: 3)
 * @param {number}   opts.baseMs    - Base delay in ms (default: 300)
 * @param {Function} opts.onRetry   - Optional callback(attempt, error)
 * @returns {Promise<any>}
 */
async function withRetry(fn, opts = {}) {
  const { attempts = 3, baseMs = 300, onRetry } = opts;

  let lastError;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < attempts) {
        const delay = baseMs * Math.pow(2, i - 1); // 300, 600, 1200...
        if (onRetry) onRetry(i, err);
        await sleep(delay);
      }
    }
  }
  throw lastError;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { withRetry };
