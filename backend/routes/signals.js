/**
 * Smart Money Signal Routes
 * Fetch and stream Binance Trading Signals.
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const cache = require('../services/cache');
const logger = require('../utils/logger');
const { DEMO_MODE, MOCK_SIGNALS } = require('../services/mockData');

const SIGNAL_API = 'https://web3.binance.com/bapi/defi/v1/public/wallet-direct/buw/wallet/web/signal/smart-money';
const HEADERS = { 'Content-Type': 'application/json', 'Accept-Encoding': 'identity', 'clienttype': 'web', 'clientversion': '1.2.0' };

function normalizeSignal(s) {
  return {
    tokenSymbol: s.tokenSymbol || '',
    tokenName: s.tokenName || s.tokenSymbol || '',
    contractAddress: s.contractAddress || '',
    chainId: s.chainId || '',
    signalType: s.signalType || s.smartSignalType || '',
    triggerPrice: s.triggerPrice ? parseFloat(s.triggerPrice) : null,
    currentPrice: s.currentPrice ? parseFloat(s.currentPrice) : null,
    maxGainPercent: s.maxGainPercent != null ? parseFloat(s.maxGainPercent) : null,
    exitRate: s.exitRate != null ? parseFloat(s.exitRate) : null,
    signalTime: s.signalTime || s.createTime || Date.now(),
    walletAddress: s.walletAddress || s.address || '',
    tags: s.tags || [],
    logoUrl: s.logoUrl || s.imageUrl || null
  };
}

// GET /api/signals
router.get('/', async (req, res, next) => {
  try {
    const { chainId = '', type = '', page = 1, pageSize = 20 } = req.query;

    // Demo mode: return mock data immediately
    if (DEMO_MODE) return res.json(MOCK_SIGNALS);

    const cacheKey = `signals:${chainId}:${type}:${page}`;
    const cached = cache.get(cacheKey);
    if (cached) return res.json({ ...cached, meta: { ...cached.meta, cached: true } });

    const body = { smartSignalType: type, page: parseInt(page), pageSize: parseInt(pageSize) };
    if (chainId) body.chainId = chainId;

    const { data } = await axios.post(SIGNAL_API, body, { headers: HEADERS, timeout: 10000 });
    const list = data?.data?.signalList || data?.data?.list || [];
    const signals = list.map(normalizeSignal);

    const result = {
      success: true,
      count: signals.length,
      signals,
      meta: { source: 'binance-smart-money', timestamp: new Date().toISOString(), cached: false }
    };

    cache.set(cacheKey, result, 30);
    res.json(result);
  } catch (err) {
    logger.error(`Signals fetch error: ${err.message}`);
    res.json({ success: false, count: 0, signals: [], error: 'Signal API unavailable', meta: { timestamp: new Date().toISOString() } });
  }
});

// GET /api/signals/subscribe — SSE
router.get('/subscribe', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });

  let lastFetch = 0;
  const interval = setInterval(async () => {
    try {
      const { data } = await axios.post(SIGNAL_API, { smartSignalType: '', page: 1, pageSize: 10, chainId: req.query.chainId || '' }, { headers: HEADERS, timeout: 8000 });
      const list = (data?.data?.signalList || []).map(normalizeSignal);
      const newSignals = list.filter(s => s.signalTime > lastFetch);
      if (newSignals.length > 0) {
        lastFetch = Math.max(...newSignals.map(s => s.signalTime));
        res.write(`data: ${JSON.stringify({ type: 'signals', signals: newSignals })}\n\n`);
      }
    } catch (e) { /* skip this cycle */ }
  }, 30000);

  // Send initial batch
  (async () => {
    try {
      const { data } = await axios.post(SIGNAL_API, { smartSignalType: '', page: 1, pageSize: 10 }, { headers: HEADERS, timeout: 8000 });
      const list = (data?.data?.signalList || []).map(normalizeSignal);
      lastFetch = list.length > 0 ? Math.max(...list.map(s => s.signalTime)) : Date.now();
      res.write(`data: ${JSON.stringify({ type: 'snapshot', signals: list })}\n\n`);
    } catch (e) {
      res.write(`data: ${JSON.stringify({ type: 'error', message: 'Initial fetch failed' })}\n\n`);
    }
  })();

  const heartbeat = setInterval(() => res.write(`: heartbeat\n\n`), 30000);
  req.on('close', () => { clearInterval(interval); clearInterval(heartbeat); });
});

// POST /api/signals/filter
router.post('/filter', async (req, res, next) => {
  try {
    const { chainId, type, minGain } = req.body;

    // Validate minGain if provided
    if (minGain != null && (isNaN(parseFloat(minGain)) || parseFloat(minGain) < 0)) {
      return res.status(400).json({ success: false, error: 'minGain must be a non-negative number', code: 'INVALID_INPUT', meta: { timestamp: new Date().toISOString() } });
    }

    const body = { smartSignalType: type || '', page: 1, pageSize: 50 };
    if (chainId) body.chainId = chainId;

    const { data } = await axios.post(SIGNAL_API, body, { headers: HEADERS, timeout: 10000 });
    let signals = (data?.data?.signalList || []).map(normalizeSignal);

    if (minGain) signals = signals.filter(s => s.maxGainPercent != null && s.maxGainPercent >= parseFloat(minGain));

    res.json({ success: true, count: signals.length, signals, meta: { filters: { chainId, type, minGain }, timestamp: new Date().toISOString() } });
  } catch (err) {
    logger.error(`Signals filter error: ${err.message}`);
    // Consistent with GET / — graceful fallback instead of 500
    res.json({ success: false, count: 0, signals: [], error: 'Signal filter API unavailable', meta: { timestamp: new Date().toISOString() } });
  }
});

module.exports = router;
