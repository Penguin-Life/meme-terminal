/**
 * Simple file + console logger.
 * Logs to backend/logs/app.log (daily rotation via date suffix).
 */

const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '../logs');

// Ensure log dir exists
try { fs.mkdirSync(LOG_DIR, { recursive: true }); } catch (_) {}

function getLogFile() {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return path.join(LOG_DIR, `app-${date}.log`);
}

function formatLine(level, message, meta) {
  const ts = new Date().toISOString();
  const metaStr = meta ? ' ' + JSON.stringify(meta) : '';
  return `[${ts}] [${level.toUpperCase()}] ${message}${metaStr}\n`;
}

function writeToFile(line) {
  try {
    fs.appendFileSync(getLogFile(), line, 'utf8');
  } catch (_) {
    // Silently fail — don't crash the server over logging
  }
}

const logger = {
  info(message, meta) {
    const line = formatLine('info', message, meta);
    process.stdout.write(line);
    writeToFile(line);
  },

  warn(message, meta) {
    const line = formatLine('warn', message, meta);
    process.stdout.write(line);
    writeToFile(line);
  },

  error(message, meta) {
    const line = formatLine('error', message, meta);
    process.stderr.write(line);
    writeToFile(line);
  },

  debug(message, meta) {
    if (process.env.NODE_ENV !== 'production') {
      const line = formatLine('debug', message, meta);
      process.stdout.write(line);
    }
  }
};

module.exports = logger;
