/**
 * CEX-DEX Arbitrage Scanner Routes
 * Compares Binance spot prices vs on-chain DEX prices to detect spread opportunities.
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const cache = require('../services/cache');
const logger = require('../utils/logger');

const BINANCE_SPOT_BASE = 'https://api.binance.com/api/v3';
const BINANCE_WEB3_SEARCH = 'https://web3.binance.com/bapi/defi/v5/public/wallet-direct/buw/wallet/market/token/search';

const WEB3_HEADERS = {
  'Accept-Encoding': 'identity',
  'clienttype': 'web',
  'clientversion': '1.2.0',
  'User-Agent': 'Mozilla/5.0 (compatible; MemeTerminal/1.2.0)'
};

// Popular meme coins for the default scan
const DEFAULT_SYMBOLS = [
  { cex: 'BONKUSDT', keyword: 'BONK', chainId: 'CT_501' },
  { cex: 'WIFUSDT',  keyword: 'WIF',  chainId: 'CT_501' },
  { cex: 'PEPEUSDT', keyword: 'PEPE', chainId: '1'      },
  { cex: 'FLOKIUSDT',keyword: 'FLOKI',chainId: '1'      },
  { cex: 'DOGEUSDT', keyword: 'DOGE', chainId: '1'      },
  { cex: 'SHIBUSDT', keyword: 'SHIB', chainId: '1'      },
];

/**
 * Fetch Binance CEX spot price for a symbol.
 * @param {string} symbol e.g. "BONKUSDT"
 * @returns {number|null} price in USD
 */
async function fetchCexPrice(symbol) {
  try {
    const { data } = await axios.get(`${BINANCE_SPOT_BASE}/ticker/price`, {
      params: { symbol },
      timeout: 6000
    });
    return data?.price ? parseFloat(data.price) : null;
  } catch (err) {
    logger.warn(`CEX price fetch failed for ${symbol}: ${err.message}`);
    return null;
  }
}

/**
 * Fetch DEX price via Binance Web3 token search API.
 * @param {string} keyword  Token symbol keyword
 * @param {string} chainId  Binance chain ID
 * @returns {number|null} price in USD
 */
async function fetchDexPrice(keyword, chainId) {
  try {
    const { data } = await axios.get(BINANCE_WEB3_SEARCH, {
      params: { keyword, chainIds: chainId, orderBy: 'volume24h' },
      headers: WEB3_HEADERS,
      timeout: 8000
    });
    const list = data?.data || [];
    const first = Array.isArray(list) ? list[0] : null;
    return first?.price ? parseFloat(first.price) : null;
  } catch (err) {
    logger.warn(`DEX price fetch failed for ${keyword} on chain ${chainId}: ${err.message}`);
    return null;
  }
}

/**
 * Calculate spread and direction from CEX/DEX prices.
 * @param {number|null} cexPrice
 * @param {number|null} dexPrice
 * @returns {{ spreadPercent: number|null, direction: string, opportunity: boolean }}
 */
function calcSpread(cexPrice, dexPrice) {
  if (!cexPrice || !dexPrice) {
    return { spreadPercent: null, direction: 'unknown', opportunity: false };
  }
  const spread = ((dexPrice - cexPrice) / cexPrice) * 100;
  return {
    spreadPercent: parseFloat(spread.toFixed(4)),
    direction: spread > 0 ? 'dex_premium' : spread < 0 ? 'cex_premium' : 'parity',
    opportunity: Math.abs(spread) >= 1.5
  };
}

// ─── GET /api/arbitrage/scan?symbol=BONKUSDT ──────────────────────────────────

router.get('/scan', async (req, res, next) => {
  try {
    const { symbol } = req.query;

    // Single symbol scan
    if (symbol) {
      const upperSymbol = symbol.toUpperCase();
      const keyword = upperSymbol.replace(/USDT$|BTC$|ETH$|BNB$/, '');
      const cacheKey = `arb:scan:${upperSymbol}`;
      const TTL = 15;

      const cached = cache.get(cacheKey);
      if (cached) return res.json({ ...cached, cached: true });

      const [cexPrice, dexPrice] = await Promise.all([
        fetchCexPrice(upperSymbol),
        fetchDexPrice(keyword, 'CT_501') // try Solana first
      ]);

      const { spreadPercent, direction, opportunity } = calcSpread(cexPrice, dexPrice);

      const result = {
        success: true,
        symbol: upperSymbol,
        cexPrice,
        dexPrice,
        spreadPercent,
        direction,
        opportunity,
        meta: {
          cexSource: 'binance-spot',
          dexSource: 'binance-web3-dex',
          timestamp: new Date().toISOString()
        }
      };
      cache.set(cacheKey, result, TTL);
      return res.json(result);
    }

    // ─── Bulk scan of popular meme coins ──────────────────────────────────────

    const cacheKey = 'arb:scan:bulk';
    const TTL = 20;

    const cached = cache.get(cacheKey);
    if (cached) return res.json({ ...cached, cached: true });

    const results = await Promise.all(
      DEFAULT_SYMBOLS.map(async ({ cex, keyword, chainId }) => {
        const [cexPrice, dexPrice] = await Promise.all([
          fetchCexPrice(cex),
          fetchDexPrice(keyword, chainId)
        ]);
        const { spreadPercent, direction, opportunity } = calcSpread(cexPrice, dexPrice);
        return {
          symbol: cex,
          keyword,
          cexPrice,
          dexPrice,
          spreadPercent,
          direction,
          opportunity
        };
      })
    );

    // Sort by absolute spread descending
    results.sort((a, b) => Math.abs(b.spreadPercent || 0) - Math.abs(a.spreadPercent || 0));

    const response = {
      success: true,
      count: results.length,
      opportunities: results.filter(r => r.opportunity).length,
      results,
      meta: {
        cexSource: 'binance-spot',
        dexSource: 'binance-web3-dex',
        timestamp: new Date().toISOString()
      }
    };

    cache.set(cacheKey, response, TTL);
    logger.info(`Arbitrage scan: ${results.length} pairs, ${response.opportunities} opportunities`);
    res.json(response);
  } catch (err) {
    logger.error(`Arbitrage scan error: ${err.message}`);
    next(err);
  }
});

// ─── GET /api/arbitrage/pairs ─────────────────────────────────────────────────
// Returns list of supported symbols for UI dropdowns

router.get('/pairs', (req, res) => {
  res.json({
    success: true,
    pairs: DEFAULT_SYMBOLS.map(s => ({
      symbol: s.cex,
      keyword: s.keyword,
      chainId: s.chainId
    })),
    meta: { timestamp: new Date().toISOString() }
  });
});

module.exports = router;
