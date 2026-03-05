/**
 * Token Analysis Routes
 * Aggregates data from DexScreener, GeckoTerminal, and Pump.fun
 */

const express = require('express');
const router = express.Router();

const dex = require('../services/dexscreener');
const gecko = require('../services/gecko');
const pumpfun = require('../services/pumpfun');
const { createError } = require('../middleware/errorHandler');
const { DEMO_MODE, MOCK_TRENDING, MOCK_NEW_LISTINGS, MOCK_TOKEN_SEARCH, MOCK_TOKEN_ANALYSIS } = require('../services/mockData');
const { validateChain, validateAddress, sanitizeQuery } = require('../middleware/validate');

// ─── Chain normalization helpers ──────────────────────────────────────────────

const GECKO_CHAIN_MAP = {
  solana: 'solana',
  ethereum: 'eth',
  eth: 'eth',
  bsc: 'bsc',
  base: 'base',
  arbitrum: 'arbitrum',
  polygon: 'polygon_pos'
};

function toGeckoChain(chain) {
  return GECKO_CHAIN_MAP[chain.toLowerCase()] || chain.toLowerCase();
}

// ─── GET /api/token/search?q={query} ─────────────────────────────────────────

router.get('/search', async (req, res, next) => {
  try {
    let { q } = req.query;
    // Validate and sanitize query
    q = sanitizeQuery(q);

    // Demo mode: return mock data immediately
    if (DEMO_MODE) return res.json(MOCK_TOKEN_SEARCH(q));

    const warnings = [];

    // Run DexScreener search and GeckoTerminal search in parallel
    const [dexPairs, geckoPools] = await Promise.allSettled([
      dex.search(q),
      gecko.search(q)
    ]);

    const results = [];

    if (dexPairs.status === 'fulfilled') {
      dexPairs.value.slice(0, 20).forEach(pair => {
        const normalized = dex.normalizePair(pair);
        if (normalized) results.push(normalized);
      });
    } else {
      warnings.push(`DexScreener search unavailable: ${dexPairs.reason?.message}`);
    }

    // Merge GeckoTerminal results (avoid duplicates by pair address)
    if (geckoPools.status === 'fulfilled') {
      const existingPairs = new Set(results.map(r => r.meta.pairAddress?.toLowerCase()).filter(Boolean));
      geckoPools.value.slice(0, 10).forEach(pool => {
        const normalized = gecko.normalizePool(pool);
        if (normalized && normalized.meta.pairAddress && !existingPairs.has(normalized.meta.pairAddress.toLowerCase())) {
          results.push(normalized);
        }
      });
    } else {
      warnings.push(`GeckoTerminal search unavailable: ${geckoPools.reason?.message}`);
    }

    const response = {
      success: true,
      query: q,
      count: results.length,
      results,
      meta: {
        sources: ['dexscreener', 'geckoterminal'],
        timestamp: new Date().toISOString()
      }
    };
    if (warnings.length > 0) response.warnings = warnings;
    res.json(response);
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/token/trending ──────────────────────────────────────────────────

router.get('/trending', async (req, res, next) => {
  try {
    let { chain = 'solana' } = req.query;
    chain = validateChain(chain);

    // Demo mode: return mock data immediately
    if (DEMO_MODE) return res.json(MOCK_TRENDING);

    const geckoChain = toGeckoChain(chain);
    const warnings = [];

    const [dexBoosted, geckoTrending] = await Promise.allSettled([
      dex.getBoostedTokens(),
      gecko.getTrendingPools(geckoChain)
    ]);

    const results = [];

    // GeckoTerminal trending pools (most reliable trending data)
    if (geckoTrending.status === 'fulfilled') {
      geckoTrending.value.slice(0, 20).forEach(pool => {
        const normalized = gecko.normalizePool(pool, 'geckoterminal');
        if (normalized) results.push({ ...normalized, _rank: 'trending' });
      });
    } else {
      warnings.push(`GeckoTerminal trending unavailable: ${geckoTrending.reason?.message}`);
    }

    // DexScreener boosted tokens (active marketing signal)
    if (dexBoosted.status === 'fulfilled') {
      const boostedOnChain = dexBoosted.value.filter(t => t.chainId === chain).slice(0, 10);
      for (const boosted of boostedOnChain) {
        try {
          const pairs = await dex.getTokenPairs(chain, boosted.tokenAddress);
          if (pairs.length > 0) {
            const normalized = dex.normalizePair(pairs[0], 'dexscreener-boosted');
            if (normalized) results.push({ ...normalized, _rank: 'boosted' });
          }
        } catch (e) { /* skip */ }
      }
    } else {
      warnings.push(`DexScreener boosted tokens unavailable: ${dexBoosted.reason?.message}`);
    }

    const response = {
      success: true,
      chain,
      count: results.length,
      results,
      meta: {
        sources: ['geckoterminal', 'dexscreener'],
        timestamp: new Date().toISOString()
      }
    };
    if (warnings.length > 0) response.warnings = warnings;
    res.json(response);
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/token/new ───────────────────────────────────────────────────────

router.get('/new', async (req, res, next) => {
  try {
    let { chain = 'solana', limit = 20 } = req.query;
    chain = validateChain(chain);
    const parsedLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 100);

    // Demo mode: return mock data immediately
    if (DEMO_MODE) return res.json(MOCK_NEW_LISTINGS);

    const geckoChain = toGeckoChain(chain);
    const warnings = [];

    const [pfCoins, geckoNew] = await Promise.allSettled([
      chain === 'solana' ? pumpfun.getNewCoins({ limit: parsedLimit }) : Promise.resolve([]),
      gecko.getNewPools(geckoChain)
    ]);

    const results = [];

    // Pump.fun new coins (Solana only)
    if (pfCoins.status === 'fulfilled') {
      pfCoins.value.forEach(coin => {
        const normalized = pumpfun.normalizeCoin(coin, 'pumpfun');
        if (normalized) results.push(normalized);
      });
    } else {
      warnings.push(`Pump.fun unavailable: ${pfCoins.reason?.message}`);
    }

    // GeckoTerminal new pools
    if (geckoNew.status === 'fulfilled') {
      const geckoResults = geckoNew.value.slice(0, 20).map(pool =>
        gecko.normalizePool(pool, 'geckoterminal')
      ).filter(Boolean);
      results.push(...geckoResults);
    } else {
      warnings.push(`GeckoTerminal new pools unavailable: ${geckoNew.reason?.message}`);
    }

    const response = {
      success: true,
      chain,
      count: results.slice(0, parsedLimit).length,
      results: results.slice(0, parsedLimit),
      meta: {
        sources: chain === 'solana' ? ['pumpfun', 'geckoterminal'] : ['geckoterminal'],
        timestamp: new Date().toISOString()
      }
    };
    if (warnings.length > 0) response.warnings = warnings;
    res.json(response);
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/token/trending/:chain — filter trending by chain (path param) ──
// Must appear BEFORE /:chain/:address to avoid conflict

router.get('/trending/:chain', async (req, res, next) => {
  try {
    const { chain } = req.params;
    const VALID_CHAINS = ['solana', 'ethereum', 'eth', 'bsc', 'base', 'arbitrum', 'polygon'];
    if (!VALID_CHAINS.includes(chain.toLowerCase())) {
      throw createError(
        `Invalid chain "${chain}". Must be one of: ${VALID_CHAINS.join(', ')}`,
        400, 'INVALID_CHAIN'
      );
    }

    // Delegate to same logic as /trending?chain=...
    req.query.chain = chain.toLowerCase();

    // Demo mode: return mock data immediately
    if (DEMO_MODE) return res.json({ ...MOCK_TRENDING, chain: chain.toLowerCase() });

    const geckoChain = toGeckoChain(chain);
    const warnings = [];

    const [dexBoosted, geckoTrending] = await Promise.allSettled([
      dex.getBoostedTokens(),
      gecko.getTrendingPools(geckoChain)
    ]);

    const results = [];

    if (geckoTrending.status === 'fulfilled') {
      geckoTrending.value.slice(0, 20).forEach(pool => {
        const normalized = gecko.normalizePool(pool, 'geckoterminal');
        if (normalized) results.push({ ...normalized, _rank: 'trending' });
      });
    } else {
      warnings.push(`GeckoTerminal trending unavailable: ${geckoTrending.reason?.message}`);
    }

    if (dexBoosted.status === 'fulfilled') {
      const boostedOnChain = dexBoosted.value.filter(t => t.chainId === chain.toLowerCase()).slice(0, 10);
      for (const boosted of boostedOnChain) {
        try {
          const pairs = await dex.getTokenPairs(chain.toLowerCase(), boosted.tokenAddress);
          if (pairs.length > 0) {
            const normalized = dex.normalizePair(pairs[0], 'dexscreener-boosted');
            if (normalized) results.push({ ...normalized, _rank: 'boosted' });
          }
        } catch (e) { /* skip */ }
      }
    } else {
      warnings.push(`DexScreener boosted tokens unavailable: ${dexBoosted.reason?.message}`);
    }

    const response = {
      success: true,
      chain: chain.toLowerCase(),
      count: results.length,
      results,
      meta: {
        sources: ['geckoterminal', 'dexscreener'],
        timestamp: new Date().toISOString()
      }
    };
    if (warnings.length > 0) response.warnings = warnings;
    res.json(response);
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/token/:chain/:address ──────────────────────────────────────────

router.get('/:chain/:address', async (req, res, next) => {
  try {
    let { chain, address } = req.params;
    chain = validateChain(chain);
    address = validateAddress(address, chain);

    // Demo mode: return first trending token as mock
    if (DEMO_MODE) {
      const mockToken = MOCK_TRENDING.results[0];
      return res.json({
        success: true,
        chain,
        address,
        data: mockToken,
        meta: { sources: ['demo'], timestamp: new Date().toISOString(), demo: true }
      });
    }

    const geckoChain = toGeckoChain(chain);
    const isSolana = chain.toLowerCase() === 'solana';
    const warnings = [];

    // Fetch data from all sources in parallel
    const [dexPairs, geckoToken, pfInfo] = await Promise.allSettled([
      dex.getTokenPairs(chain, address),
      gecko.getTokenInfo(geckoChain, address),
      isSolana ? pumpfun.getCoinInfo(address) : Promise.resolve(null)
    ]);

    if (dexPairs.status === 'rejected') {
      warnings.push(`DexScreener unavailable: ${dexPairs.reason?.message}`);
    }
    if (geckoToken.status === 'rejected') {
      warnings.push(`GeckoTerminal unavailable: ${geckoToken.reason?.message}`);
    }

    // Start with DexScreener as primary source
    let result = null;
    const sources = [];

    if (dexPairs.status === 'fulfilled' && dexPairs.value.length > 0) {
      // Pick the most liquid pair
      const bestPair = dexPairs.value.sort((a, b) =>
        (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
      )[0];
      result = dex.normalizePair(bestPair, 'dexscreener');
      sources.push('dexscreener');
    }

    // Merge GeckoTerminal data
    if (geckoToken.status === 'fulfilled' && geckoToken.value?.data) {
      const gData = geckoToken.value.data;
      const attrs = gData.attributes || {};
      sources.push('geckoterminal');

      if (!result) {
        // Build from GeckoTerminal if DexScreener failed
        result = {
          token: {
            name: attrs.name || null,
            symbol: attrs.symbol || null,
            address,
            chain,
            image: attrs.image_url || null
          },
          market: {
            price: attrs.price_usd ? parseFloat(attrs.price_usd) : null,
            marketCap: attrs.market_cap_usd ? parseFloat(attrs.market_cap_usd) : null,
            volume24h: attrs.volume_usd?.h24 ? parseFloat(attrs.volume_usd.h24) : null,
            liquidity: null,
            priceChange: {
              '5m': attrs.price_change_percentage?.m5 || null,
              '1h': attrs.price_change_percentage?.h1 || null,
              '6h': attrs.price_change_percentage?.h6 || null,
              '24h': attrs.price_change_percentage?.h24 || null
            }
          },
          security: { mintAuthority: null, freezeAuthority: null, isHoneypot: null, topHolderPct: null },
          social: { websites: [], twitter: null, telegram: null },
          meta: { createdAt: null, pairAddress: null, dexId: null, source: 'geckoterminal' }
        };
      } else {
        // Enrich existing result
        if (!result.token.image && attrs.image_url) result.token.image = attrs.image_url;
        if (!result.market.marketCap && attrs.market_cap_usd) {
          result.market.marketCap = parseFloat(attrs.market_cap_usd);
        }
      }
    }

    // Merge Pump.fun data (Solana only)
    if (isSolana && pfInfo.status === 'fulfilled' && pfInfo.value) {
      const pf = pfInfo.value;
      sources.push('pumpfun');
      if (!result) {
        result = pumpfun.normalizeCoin(pf, 'pumpfun');
      } else {
        // Enrich with pumpfun metadata
        result.meta.bondingCurveProgress = pumpfun.getBondingCurveProgress(pf);
        result.meta.graduated = !!pf.complete;
        result.meta.kingOfTheHill = !!pf.king_of_the_hill_timestamp;
        result.meta.replies = pf.reply_count || 0;
        result.meta.source = sources.join('+');
        if (!result.social.twitter && pf.twitter) result.social.twitter = pf.twitter;
        if (!result.social.telegram && pf.telegram) result.social.telegram = pf.telegram;
        if (!result.token.image && pf.image_uri) result.token.image = pf.image_uri;
      }
    }

    if (!result) {
      throw createError(`Token not found: ${chain}/${address}`, 404, 'TOKEN_NOT_FOUND');
    }

    const response = {
      success: true,
      chain,
      address,
      data: result,
      meta: {
        sources,
        timestamp: new Date().toISOString()
      }
    };
    if (warnings.length > 0) response.warnings = warnings;
    res.json(response);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
