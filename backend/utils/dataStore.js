/**
 * Atomic data store helper.
 * Provides safe read/write for JSON data files with:
 * - Auto-creation of data directory
 * - Atomic writes (write .tmp → rename)
 * - Backup before overwrite (.bak)
 * - Corruption recovery (reset to empty array with warning)
 */

const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const DATA_DIR = path.join(__dirname, '../data');

/**
 * Ensure data directory exists
 */
function ensureDataDir() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    logger.error(`Failed to create data directory: ${err.message}`);
  }
}

// Always ensure on module load
ensureDataDir();

/**
 * Safely read a JSON file. Returns defaultValue if missing or corrupted.
 * @param {string} filePath - Absolute path to JSON file
 * @param {*} defaultValue  - Value to return on failure (default: [])
 */
function readJson(filePath, defaultValue = []) {
  try {
    if (!fs.existsSync(filePath)) {
      // File doesn't exist — initialize with defaultValue
      writeJson(filePath, defaultValue);
      return defaultValue;
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    // Corrupted JSON — reset and warn
    logger.warn(`[dataStore] Corrupted JSON in ${path.basename(filePath)}, resetting to default. Error: ${err.message}`);
    try {
      // Save corrupted file for debugging
      const corruptPath = filePath + '.corrupt.' + Date.now();
      fs.copyFileSync(filePath, corruptPath);
      logger.warn(`[dataStore] Saved corrupt file to ${path.basename(corruptPath)}`);
    } catch (_) { /* ignore */ }
    writeJson(filePath, defaultValue);
    return defaultValue;
  }
}

/**
 * Atomically write JSON to a file.
 * 1. Backup current file to .bak
 * 2. Write to .tmp
 * 3. Rename .tmp → target
 * @param {string} filePath - Absolute path to JSON file
 * @param {*} data          - Data to serialize and write
 */
function writeJson(filePath, data) {
  ensureDataDir();
  const tmpPath = filePath + '.tmp';
  const bakPath = filePath + '.bak';

  try {
    // Backup current file
    if (fs.existsSync(filePath)) {
      try {
        fs.copyFileSync(filePath, bakPath);
      } catch (bakErr) {
        logger.warn(`[dataStore] Could not create backup for ${path.basename(filePath)}: ${bakErr.message}`);
      }
    }

    // Write to temp file
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');

    // Atomic rename
    fs.renameSync(tmpPath, filePath);
  } catch (err) {
    logger.error(`[dataStore] Failed to write ${path.basename(filePath)}: ${err.message}`);
    // Clean up tmp file if it exists
    try { if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath); } catch (_) {}
    throw err;
  }
}

module.exports = { readJson, writeJson, ensureDataDir, DATA_DIR };
