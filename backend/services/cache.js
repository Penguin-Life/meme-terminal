/**
 * Simple in-memory cache with TTL (time-to-live).
 * Lightweight alternative to Redis for single-process use.
 *
 * Recommended TTLs:
 *   DexScreener searches  : 60s
 *   Token analysis         : 120s
 *   Trending               : 30s
 *   Wallet portfolio       : 60s
 */

class Cache {
  constructor() {
    this.store = new Map();
    this._hits = 0;
    this._misses = 0;
    this._sets = 0;
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
      expiresAt: Date.now() + ttlMs,
      createdAt: Date.now()
    });
    this._sets++;
  }

  /**
   * Get a value. Returns null if missing or expired.
   */
  get(key) {
    const entry = this.store.get(key);
    if (!entry) {
      this._misses++;
      return null;
    }
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this._misses++;
      return null;
    }
    this._hits++;
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

  /**
   * Return cache statistics
   */
  stats() {
    const now = Date.now();
    let expiredCount = 0;
    const entries = [];
    for (const [key, entry] of this.store) {
      const expired = now > entry.expiresAt;
      if (expired) expiredCount++;
      entries.push({
        key,
        expired,
        ttlRemaining: Math.max(0, entry.expiresAt - now),
        ageMs: now - entry.createdAt
      });
    }
    const total = this._hits + this._misses;
    return {
      size: this.store.size,
      activeEntries: this.store.size - expiredCount,
      expiredEntries: expiredCount,
      hits: this._hits,
      misses: this._misses,
      sets: this._sets,
      hitRate: total > 0 ? ((this._hits / total) * 100).toFixed(1) + '%' : 'N/A',
      entries
    };
  }
}

// Singleton instance shared across services
module.exports = new Cache();
