/**
 * Pump.fun API wrapper.
 * Base URL: https://frontend-api-v3.pump.fun
 * Free, no API key needed.
 */

const axios = require('axios');
const cache = require('./cache');
const { withRetry } = require('../utils/retry');

const BASE_URL = 'https://frontend-api-v3.pump.fun';
const TTL = {
  NEW_COINS: 15_000,    // 15s
  COIN_INFO: 30_000,    // 30s
  KING: 60_000,         // 60s
  TRADES: 20_000        // 20s
};

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: {
    'Accept': 'application/json',
    'User-Agent': 'meme-terminal/1.0'
  }
});

/**
 * Internal: resilient GET with retry
 */
async function get(url, config = {}) {
  return withRetry(() => client.get(url, config), { attempts: 3, baseMs: 400 });
}

/**
 * Get new coin launches, sorted by creation time
 */
async function getNewCoins({ limit = 20, offset = 0, sort = 'created_timestamp', order = 'DESC' } = {}) {
  const key = `pf:new:${limit}:${offset}:${sort}:${order}`;
  return cache.getOrSet(key, async () => {
    try {
      const { data } = await get('/coins', {
        params: { offset, limit, sort, order, includeNsfw: false }
      });
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return [];
    }
  }, TTL.NEW_COINS);
}

/**
 * Get info for a specific token by mint address
 */
async function getCoinInfo(mint) {
  const key = `pf:coin:${mint}`;
  return cache.getOrSet(key, async () => {
    try {
      const { data } = await get(`/coins/${mint}`);
      return data || null;
    } catch (err) {
      return null;
    }
  }, TTL.COIN_INFO);
}

/**
 * Get King of the Hill token (highest bonding curve progress not yet graduated)
 */
async function getKingOfTheHill() {
  const key = 'pf:king';
  return cache.getOrSet(key, async () => {
    try {
      const { data } = await get('/coins/king-of-the-hill', {
        params: { includeNsfw: false }
      });
      return data || null;
    } catch (err) {
      return null;
    }
  }, TTL.KING);
}

/**
 * Get recent trades for a token
 */
async function getTrades(mint, { limit = 50 } = {}) {
  const key = `pf:trades:${mint}:${limit}`;
  return cache.getOrSet(key, async () => {
    try {
      const { data } = await get(`/trades/${mint}`, {
        params: { limit }
      });
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return [];
    }
  }, TTL.TRADES);
}

/**
 * Calculate bonding curve progress percentage
 * Pump.fun graduates at ~85 SOL (793100000 lamports)
 */
function getBondingCurveProgress(coin) {
  if (!coin) return null;
  if (coin.complete) return 100;
  const solReserves = coin.virtual_sol_reserves || 0;
  const GRADUATION_THRESHOLD = 793100000; // ~85 SOL in lamports
  return Math.min(100, Math.round((solReserves / GRADUATION_THRESHOLD) * 100));
}

/**
 * Normalize a Pump.fun coin into our standard format
 */
function normalizeCoin(coin, source = 'pumpfun') {
  if (!coin) return null;
  return {
    token: {
      name: coin.name || null,
      symbol: coin.symbol || null,
      address: coin.mint || null,
      chain: 'solana',
      image: coin.image_uri || null
    },
    market: {
      price: coin.usd_market_cap && coin.total_supply
        ? coin.usd_market_cap / coin.total_supply
        : null,
      marketCap: coin.usd_market_cap || null,
      volume24h: null,
      liquidity: null,
      priceChange: { '5m': null, '1h': null, '6h': null, '24h': null }
    },
    security: {
      mintAuthority: null,
      freezeAuthority: null,
      isHoneypot: false,
      topHolderPct: null
    },
    social: {
      websites: coin.website ? [coin.website] : [],
      twitter: coin.twitter || null,
      telegram: coin.telegram || null
    },
    meta: {
      createdAt: coin.created_timestamp
        ? new Date(coin.created_timestamp).toISOString()
        : null,
      pairAddress: coin.raydium_pool || coin.bonding_curve || null,
      dexId: coin.complete ? 'raydium' : 'pumpfun',
      source,
      bondingCurveProgress: getBondingCurveProgress(coin),
      graduated: !!coin.complete,
      kingOfTheHill: !!coin.king_of_the_hill_timestamp,
      replies: coin.reply_count || 0
    }
  };
}

module.exports = { getNewCoins, getCoinInfo, getKingOfTheHill, getTrades, getBondingCurveProgress, normalizeCoin };
