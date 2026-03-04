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
    const { q } = req.query;
    if (!q || q.trim().length < 1) {
      throw createError('Query parameter "q" is required', 400, 'BAD_REQUEST');
    }

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
    }

    res.json({
      success: true,
      query: q,
      count: results.length,
      results
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/token/trending ──────────────────────────────────────────────────

router.get('/trending', async (req, res, next) => {
  try {
    const { chain = 'solana' } = req.query;
    const geckoChain = toGeckoChain(chain);

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
    }

    res.json({
      success: true,
      chain,
      count: results.length,
      results
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/token/new ───────────────────────────────────────────────────────

router.get('/new', async (req, res, next) => {
  try {
    const { chain = 'solana', limit = 20 } = req.query;
    const geckoChain = toGeckoChain(chain);

    const [pfCoins, geckoNew] = await Promise.allSettled([
      chain === 'solana' ? pumpfun.getNewCoins({ limit: parseInt(limit) }) : Promise.resolve([]),
      gecko.getNewPools(geckoChain)
    ]);

    const results = [];

    // Pump.fun new coins (Solana only)
    if (pfCoins.status === 'fulfilled') {
      pfCoins.value.forEach(coin => {
        const normalized = pumpfun.normalizeCoin(coin, 'pumpfun');
        if (normalized) results.push(normalized);
      });
    }

    // GeckoTerminal new pools
    if (geckoNew.status === 'fulfilled') {
      const geckoResults = geckoNew.value.slice(0, 20).map(pool =>
        gecko.normalizePool(pool, 'geckoterminal')
      ).filter(Boolean);
      results.push(...geckoResults);
    }

    res.json({
      success: true,
      chain,
      count: results.length,
      results: results.slice(0, parseInt(limit))
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/token/:chain/:address ──────────────────────────────────────────

router.get('/:chain/:address', async (req, res, next) => {
  try {
    const { chain, address } = req.params;
    const geckoChain = toGeckoChain(chain);
    const isSolana = chain.toLowerCase() === 'solana';

    // Fetch data from all sources in parallel
    const [dexPairs, geckoToken, pfInfo] = await Promise.allSettled([
      dex.getTokenPairs(chain, address),
      gecko.getTokenInfo(geckoChain, address),
      isSolana ? pumpfun.getCoinInfo(address) : Promise.resolve(null)
    ]);

    // Start with DexScreener as primary source
    let result = null;
    if (dexPairs.status === 'fulfilled' && dexPairs.value.length > 0) {
      // Pick the most liquid pair
      const bestPair = dexPairs.value.sort((a, b) =>
        (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
      )[0];
      result = dex.normalizePair(bestPair, 'dexscreener');
    }

    // Merge GeckoTerminal data
    if (geckoToken.status === 'fulfilled' && geckoToken.value?.data) {
      const gData = geckoToken.value.data;
      const attrs = gData.attributes || {};
      
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
      if (!result) {
        result = pumpfun.normalizeCoin(pf, 'pumpfun');
      } else {
        // Enrich with pumpfun metadata
        result.meta.bondingCurveProgress = pumpfun.getBondingCurveProgress(pf);
        result.meta.graduated = !!pf.complete;
        result.meta.kingOfTheHill = !!pf.king_of_the_hill_timestamp;
        result.meta.replies = pf.reply_count || 0;
        result.meta.source = result.meta.source + '+pumpfun';
        if (!result.social.twitter && pf.twitter) result.social.twitter = pf.twitter;
        if (!result.social.telegram && pf.telegram) result.social.telegram = pf.telegram;
        if (!result.token.image && pf.image_uri) result.token.image = pf.image_uri;
      }
    }

    if (!result) {
      throw createError(`Token not found: ${chain}/${address}`, 404, 'TOKEN_NOT_FOUND');
    }

    res.json({
      success: true,
      chain,
      address,
      data: result
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
