/**
 * Binance Alpha Token Routes
 * Fetches Binance Alpha-curated tokens via Crypto Market Rank API
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const cache = require('../services/cache');
const logger = require('../utils/logger');

const BINANCE_WEB3_BASE = 'https://web3.binance.com/bapi/defi/v1/public/wallet-direct/buw/wallet/market/token/rank/unified';

const COMMON_HEADERS = {
  'Accept-Encoding': 'identity',
  'clienttype': 'web',
  'clientversion': '1.2.0',
  'User-Agent': 'Mozilla/5.0 (compatible; MemeTerminal/1.2.0)'
};

/**
 * Normalize a Binance Alpha token entry to a consistent shape.
 * @param {Object} item - Raw token from Binance API
 * @returns {Object} Normalized token
 */
function normalizeAlphaToken(item) {
  return {
    symbol: item.symbol || '',
    name: item.name || item.symbol || '',
    contractAddress: item.contractAddress || item.tokenAddress || '',
    chainId: item.chainId || '',
    price: item.price ? parseFloat(item.price) : null,
    priceChange24h: item.priceChange24h != null ? parseFloat(item.priceChange24h) : null,
    volume24h: item.volume24h ? parseFloat(item.volume24h) : null,
    marketCap: item.marketCap ? parseFloat(item.marketCap) : null,
    holders: item.holders || null,
    rank: item.rank || null,
    logoUrl: item.logoUrl || item.imageUrl || null,
    tags: item.tags || [],
    isAlpha: true,
    source: 'binance-alpha'
  };
}

// ─── GET /api/token/binance-alpha ─────────────────────────────────────────────

router.get('/', async (req, res, next) => {
  const cacheKey = 'binance:alpha:list';
  const TTL = 60; // 60 seconds

  try {
    // Serve from cache if fresh
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({ ...cached, meta: { ...cached.meta, cached: true } });
    }

    // Binance Alpha tokens use rankType=20
    const response = await axios.get(BINANCE_WEB3_BASE, {
      params: {
        rankType: 20,
        pageSize: 20,
        page: 1
      },
      headers: COMMON_HEADERS,
      timeout: 10000
    });

    const raw = response.data;
    const rankList = raw?.data?.rankList || raw?.data?.list || [];

    const tokens = rankList.map(normalizeAlphaToken);

    const result = {
      success: true,
      count: tokens.length,
      tokens,
      meta: {
        rankType: 20,
        description: 'Binance Alpha curated tokens',
        source: 'binance-web3-api',
        timestamp: new Date().toISOString(),
        cached: false
      }
    };

    cache.set(cacheKey, result, TTL);
    logger.info(`Binance Alpha: fetched ${tokens.length} tokens`);
    res.json(result);
  } catch (err) {
    logger.error(`Binance Alpha fetch error: ${err.message}`);
    // Return a graceful fallback instead of 500
    res.json({
      success: false,
      count: 0,
      tokens: [],
      error: 'Binance Alpha API unavailable — try again shortly',
      meta: {
        rankType: 20,
        source: 'binance-web3-api',
        timestamp: new Date().toISOString(),
        cached: false
      }
    });
  }
});

// ─── GET /api/token/binance-alpha/trending ────────────────────────────────────

router.get('/trending', async (req, res, next) => {
  const cacheKey = 'binance:alpha:trending';
  const TTL = 45; // 45 seconds — trending data is time-sensitive

  try {
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({ ...cached, meta: { ...cached.meta, cached: true } });
    }

    // Trending Alpha tokens — rankType=20 sorted by volume / trending rank
    const [alphaRes, trendingRes] = await Promise.allSettled([
      axios.get(BINANCE_WEB3_BASE, {
        params: { rankType: 20, pageSize: 10, page: 1 },
        headers: COMMON_HEADERS,
        timeout: 8000
      }),
      axios.get(BINANCE_WEB3_BASE, {
        params: { rankType: 10, pageSize: 10, page: 1 }, // rankType 10 = overall trending
        headers: COMMON_HEADERS,
        timeout: 8000
      })
    ]);

    const alphaList = alphaRes.status === 'fulfilled'
      ? (alphaRes.value.data?.data?.rankList || []).map(t => ({ ...normalizeAlphaToken(t), category: 'alpha' }))
      : [];

    const trendingList = trendingRes.status === 'fulfilled'
      ? (trendingRes.value.data?.data?.rankList || []).slice(0, 5).map(t => ({ ...normalizeAlphaToken(t), isAlpha: false, category: 'trending' }))
      : [];

    const result = {
      success: true,
      alpha: alphaList,
      trending: trendingList,
      total: alphaList.length + trendingList.length,
      meta: {
        sources: ['binance-alpha-rank', 'binance-trending-rank'],
        timestamp: new Date().toISOString(),
        cached: false
      }
    };

    cache.set(cacheKey, result, TTL);
    logger.info(`Binance Alpha Trending: ${alphaList.length} alpha + ${trendingList.length} trending`);
    res.json(result);
  } catch (err) {
    logger.error(`Binance Alpha Trending error: ${err.message}`);
    next(err);
  }
});

module.exports = router;
