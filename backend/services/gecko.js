/**
 * GeckoTerminal API wrapper.
 * Base URL: https://api.geckoterminal.com/api/v2
 * Free tier — no API key. Rate limit: ~30 req/min.
 */

const axios = require('axios');
const cache = require('./cache');
const { withRetry } = require('../utils/retry');

const BASE_URL = 'https://api.geckoterminal.com/api/v2';
const TTL = {
  TRENDING: 60_000,    // 60s
  NEW_POOLS: 30_000,   // 30s
  TOKEN_INFO: 30_000,  // 30s
  POOL_INFO: 20_000,   // 20s
  SEARCH: 30_000       // 30s
};

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: { 'Accept': 'application/json' }
});

/**
 * Internal: resilient GET with retry
 */
async function get(url, config = {}) {
  return withRetry(() => client.get(url, config), { attempts: 3, baseMs: 300 });
}

/**
 * Get trending pools on a network
 */
async function getTrendingPools(network = 'solana', page = 1) {
  const key = `gecko:trending:${network}:${page}`;
  return cache.getOrSet(key, async () => {
    try {
      const { data } = await get(`/networks/${network}/trending_pools`, { params: { page } });
      return data?.data || [];
    } catch (err) {
      return [];
    }
  }, TTL.TRENDING);
}

/**
 * Get new pools on a network
 */
async function getNewPools(network = 'solana', page = 1) {
  const key = `gecko:new_pools:${network}:${page}`;
  return cache.getOrSet(key, async () => {
    try {
      const { data } = await get(`/networks/${network}/new_pools`, { params: { page } });
      return data?.data || [];
    } catch (err) {
      return [];
    }
  }, TTL.NEW_POOLS);
}

/**
 * Get token info by network + address
 */
async function getTokenInfo(network, address) {
  const key = `gecko:token:${network}:${address.toLowerCase()}`;
  return cache.getOrSet(key, async () => {
    try {
      const { data } = await get(`/networks/${network}/tokens/${address}`, {
        params: { include: 'top_pools' }
      });
      return data;
    } catch (err) {
      return null;
    }
  }, TTL.TOKEN_INFO);
}

/**
 * Get pool info by network + pool address
 */
async function getPoolInfo(network, poolAddress) {
  const key = `gecko:pool:${network}:${poolAddress.toLowerCase()}`;
  return cache.getOrSet(key, async () => {
    try {
      const { data } = await get(`/networks/${network}/pools/${poolAddress}`);
      return data?.data || null;
    } catch (err) {
      return null;
    }
  }, TTL.POOL_INFO);
}

/**
 * Search pools/tokens across all networks
 */
async function search(query, network = null) {
  const key = `gecko:search:${query.toLowerCase()}:${network || 'all'}`;
  return cache.getOrSet(key, async () => {
    try {
      const params = { query };
      if (network) params.network = network;
      const { data } = await get('/search/pools', { params });
      return data?.data || [];
    } catch (err) {
      return [];
    }
  }, TTL.SEARCH);
}

/**
 * Map GeckoTerminal chain IDs to DexScreener/internal chain IDs
 */
const CHAIN_MAP = {
  solana: 'solana',
  eth: 'ethereum',
  bsc: 'bsc',
  base: 'base',
  arbitrum: 'arbitrum',
  polygon_pos: 'polygon',
  avalanche: 'avalanche'
};

/**
 * Normalize a GeckoTerminal pool into our standard token format
 */
function normalizePool(pool, source = 'geckoterminal') {
  if (!pool) return null;
  const attrs = pool.attributes || {};
  const chainId = pool.id?.split('_')[0] || null;

  return {
    token: {
      name: attrs.name?.split(' / ')[0] || null,
      symbol: attrs.name?.split(' / ')[0] || null,
      address: attrs.base_token_price_usd ? null : null, // no address in pool list response
      chain: CHAIN_MAP[chainId] || chainId,
      image: null
    },
    market: {
      price: attrs.base_token_price_usd ? parseFloat(attrs.base_token_price_usd) : null,
      marketCap: attrs.market_cap_usd ? parseFloat(attrs.market_cap_usd) : null,
      volume24h: attrs.volume_usd?.h24 ? parseFloat(attrs.volume_usd.h24) : null,
      liquidity: attrs.reserve_in_usd ? parseFloat(attrs.reserve_in_usd) : null,
      priceChange: {
        '5m': attrs.price_change_percentage?.m5 || null,
        '1h': attrs.price_change_percentage?.h1 || null,
        '6h': attrs.price_change_percentage?.h6 || null,
        '24h': attrs.price_change_percentage?.h24 || null
      }
    },
    security: {
      mintAuthority: null,
      freezeAuthority: null,
      isHoneypot: null,
      topHolderPct: null
    },
    social: {
      websites: [],
      twitter: null,
      telegram: null
    },
    meta: {
      createdAt: attrs.pool_created_at || null,
      pairAddress: pool.id?.split('_')[1] || null,
      dexId: attrs.dex_id || null,
      source
    }
  };
}

module.exports = { getTrendingPools, getNewPools, getTokenInfo, getPoolInfo, search, normalizePool, CHAIN_MAP };
