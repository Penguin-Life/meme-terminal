/**
 * DexScreener API wrapper with caching.
 * Docs: https://docs.dexscreener.com/api/reference
 * Free API — no key required. Rate limit: ~30 req/min.
 */

const axios = require('axios');
const cache = require('./cache');

const BASE_URL = 'https://api.dexscreener.com';
const TTL = {
  SEARCH: 30_000,        // 30s
  TOKEN_PAIRS: 20_000,   // 20s
  TRENDING: 60_000,      // 60s
  NEW: 15_000,           // 15s
  BOOSTED: 120_000       // 2m
};

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: { 'Accept': 'application/json' }
});

/**
 * Search tokens/pairs by keyword or contract address
 */
async function search(query) {
  const key = `dex:search:${query.toLowerCase()}`;
  return cache.getOrSet(key, async () => {
    const { data } = await client.get(`/latest/dex/search?q=${encodeURIComponent(query)}`);
    return data.pairs || [];
  }, TTL.SEARCH);
}

/**
 * Get all pairs for a token on a specific chain
 */
async function getTokenPairs(chain, address) {
  const key = `dex:pairs:${chain}:${address.toLowerCase()}`;
  return cache.getOrSet(key, async () => {
    const { data } = await client.get(`/tokens/v1/${chain}/${address}`);
    return Array.isArray(data) ? data : [];
  }, TTL.TOKEN_PAIRS);
}

/**
 * Get specific pair by chain + pair address
 */
async function getPair(chain, pairAddress) {
  const key = `dex:pair:${chain}:${pairAddress.toLowerCase()}`;
  return cache.getOrSet(key, async () => {
    const { data } = await client.get(`/latest/dex/pairs/${chain}/${pairAddress}`);
    return data.pairs?.[0] || null;
  }, TTL.TOKEN_PAIRS);
}

/**
 * Get trending / boosted tokens (latest boosted = signal of active promotion)
 */
async function getBoostedTokens() {
  const key = 'dex:boosted';
  return cache.getOrSet(key, async () => {
    const { data } = await client.get('/token-boosts/latest/v1');
    return Array.isArray(data) ? data : [];
  }, TTL.BOOSTED);
}

/**
 * Get top boosted tokens (all-time leaders)
 */
async function getTopBoosted() {
  const key = 'dex:top_boosted';
  return cache.getOrSet(key, async () => {
    const { data } = await client.get('/token-boosts/top/v1');
    return Array.isArray(data) ? data : [];
  }, TTL.BOOSTED);
}

/**
 * Normalize a DexScreener pair object into our standard token format
 */
function normalizePair(pair, source = 'dexscreener') {
  if (!pair) return null;
  return {
    token: {
      name: pair.baseToken?.name || null,
      symbol: pair.baseToken?.symbol || null,
      address: pair.baseToken?.address || null,
      chain: pair.chainId || null,
      image: pair.info?.imageUrl || null
    },
    market: {
      price: pair.priceUsd ? parseFloat(pair.priceUsd) : null,
      marketCap: pair.marketCap || pair.fdv || null,
      volume24h: pair.volume?.h24 || null,
      liquidity: pair.liquidity?.usd || null,
      priceChange: {
        '5m': pair.priceChange?.m5 || null,
        '1h': pair.priceChange?.h1 || null,
        '6h': pair.priceChange?.h6 || null,
        '24h': pair.priceChange?.h24 || null
      }
    },
    security: {
      mintAuthority: null,
      freezeAuthority: null,
      isHoneypot: null,
      topHolderPct: null
    },
    social: {
      websites: pair.info?.websites?.map(w => w.url) || [],
      twitter: pair.info?.socials?.find(s => s.type === 'twitter')?.url || null,
      telegram: pair.info?.socials?.find(s => s.type === 'telegram')?.url || null
    },
    meta: {
      createdAt: pair.pairCreatedAt ? new Date(pair.pairCreatedAt).toISOString() : null,
      pairAddress: pair.pairAddress || null,
      dexId: pair.dexId || null,
      source
    }
  };
}

module.exports = { search, getTokenPairs, getPair, getBoostedTokens, getTopBoosted, normalizePair };
