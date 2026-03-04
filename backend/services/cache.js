/**
 * Simple in-memory cache with TTL (time-to-live).
 * Lightweight alternative to Redis for single-process use.
 */

class Cache {
  constructor() {
    this.store = new Map();
    // Sweep expired entries every 60 seconds
    this._sweepInterval = setInterval(() => this._sweep(), 60_000);
    this._sweepInterval.unref(); // don't block process exit
  }

  /**
   * Set a value with optional TTL in milliseconds (default: 30s)
   */
  set(key, value, ttlMs = 30_000) {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs
    });
  }

  /**
   * Get a value. Returns null if missing or expired.
   */
  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  /**
   * Check whether a key exists and is not expired
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Delete a key
   */
  delete(key) {
    this.store.delete(key);
  }

  /**
   * Clear all entries
   */
  clear() {
    this.store.clear();
  }

  /**
   * Get or compute a value. If the key is cached, return it.
   * Otherwise, call fn(), cache the result, and return it.
   */
  async getOrSet(key, fn, ttlMs = 30_000) {
    const cached = this.get(key);
    if (cached !== null) return cached;
    const value = await fn();
    this.set(key, value, ttlMs);
    return value;
  }

  /**
   * Remove expired entries
   */
  _sweep() {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  stats() {
    return {
      size: this.store.size,
      keys: Array.from(this.store.keys())
    };
  }
}

// Singleton instance shared across services
module.exports = new Cache();
