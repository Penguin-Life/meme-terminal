/**
 * Spot Trading Routes
 * Place buy/sell orders via Binance Spot API (testnet + mainnet)
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const axios = require('axios');
const cache = require('../services/cache');
const logger = require('../utils/logger');

const TESTNET_BASE = 'https://testnet.binance.vision/api/v3';
const MAINNET_BASE = 'https://api.binance.com/api/v3';

function getBaseUrl() {
  return process.env.BINANCE_TESTNET === 'false' ? MAINNET_BASE : TESTNET_BASE;
}

function getKeys() {
  const apiKey = process.env.BINANCE_API_KEY;
  const secret = process.env.BINANCE_SECRET_KEY;
  if (!apiKey || !secret) return null;
  return { apiKey, secret };
}

function sign(params, secret) {
  const qs = new URLSearchParams(params).toString();
  const signature = crypto.createHmac('sha256', secret).update(qs).digest('hex');
  return `${qs}&signature=${signature}`;
}

async function binanceRequest(method, endpoint, params = {}, keys) {
  const base = getBaseUrl();
  params.timestamp = Date.now();
  params.recvWindow = 5000;
  const signed = sign(params, keys.secret);
  const url = `${base}${endpoint}?${signed}`;
  const config = { headers: { 'X-MBX-APIKEY': keys.apiKey }, timeout: 10000 };
  return method === 'POST' ? axios.post(url, null, config) : axios.get(url, config);
}

// Middleware: check API keys
function requireKeys(req, res, next) {
  const keys = getKeys();
  if (!keys) return res.status(403).json({ success: false, error: 'BINANCE_API_KEY and BINANCE_SECRET_KEY required', code: 'NO_API_KEYS' });
  req.binanceKeys = keys;
  next();
}

// POST /api/trade/buy
router.post('/buy', requireKeys, async (req, res, next) => {
  try {
    const { symbol, quantity, price, type = 'MARKET' } = req.body;
    if (!symbol || !quantity) return res.status(400).json({ success: false, error: 'symbol and quantity required', code: 'INVALID_INPUT' });

    const params = { symbol: symbol.toUpperCase(), side: 'BUY', type, quantity: String(quantity) };
    if (type === 'LIMIT' && price) { params.price = String(price); params.timeInForce = 'GTC'; }

    const { data } = await binanceRequest('POST', '/order', params, req.binanceKeys);
    logger.info(`Trade BUY: ${symbol} qty=${quantity}`, { orderId: data.orderId });
    res.json({ success: true, order: data });
  } catch (err) {
    logger.error(`Trade BUY error: ${err.response?.data?.msg || err.message}`);
    res.status(err.response?.status || 500).json({ success: false, error: err.response?.data?.msg || err.message, code: 'TRADE_ERROR' });
  }
});

// POST /api/trade/sell
router.post('/sell', requireKeys, async (req, res, next) => {
  try {
    const { symbol, quantity, price, type = 'MARKET' } = req.body;
    if (!symbol || !quantity) return res.status(400).json({ success: false, error: 'symbol and quantity required', code: 'INVALID_INPUT' });

    const params = { symbol: symbol.toUpperCase(), side: 'SELL', type, quantity: String(quantity) };
    if (type === 'LIMIT' && price) { params.price = String(price); params.timeInForce = 'GTC'; }

    const { data } = await binanceRequest('POST', '/order', params, req.binanceKeys);
    logger.info(`Trade SELL: ${symbol} qty=${quantity}`, { orderId: data.orderId });
    res.json({ success: true, order: data });
  } catch (err) {
    logger.error(`Trade SELL error: ${err.response?.data?.msg || err.message}`);
    res.status(err.response?.status || 500).json({ success: false, error: err.response?.data?.msg || err.message, code: 'TRADE_ERROR' });
  }
});

// GET /api/trade/orders?symbol=BONKUSDT
router.get('/orders', requireKeys, async (req, res, next) => {
  try {
    const params = {};
    if (req.query.symbol) params.symbol = req.query.symbol.toUpperCase();
    const { data } = await binanceRequest('GET', req.query.symbol ? '/openOrders' : '/openOrders', params, req.binanceKeys);
    res.json({ success: true, orders: data });
  } catch (err) {
    logger.error(`Trade orders error: ${err.response?.data?.msg || err.message}`);
    res.status(err.response?.status || 500).json({ success: false, error: err.response?.data?.msg || err.message, code: 'TRADE_ERROR' });
  }
});

// GET /api/trade/balance
router.get('/balance', requireKeys, async (req, res, next) => {
  try {
    const { data } = await binanceRequest('GET', '/account', {}, req.binanceKeys);
    const balances = (data.balances || []).filter(b => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0);
    res.json({ success: true, balances });
  } catch (err) {
    logger.error(`Trade balance error: ${err.response?.data?.msg || err.message}`);
    res.status(err.response?.status || 500).json({ success: false, error: err.response?.data?.msg || err.message, code: 'TRADE_ERROR' });
  }
});

// POST /api/trade/safe-buy — Audit → Signal check → Buy
router.post('/safe-buy', requireKeys, async (req, res, next) => {
  try {
    const { symbol, quantity, contractAddress, chainId = 'CT_501' } = req.body;
    if (!symbol || !quantity) return res.status(400).json({ success: false, error: 'symbol and quantity required', code: 'INVALID_INPUT' });

    const steps = { audit: null, signal: null, order: null };

    // Step 1: Token Audit (if contract address provided)
    if (contractAddress) {
      try {
        const auditRes = await axios.post('https://web3.binance.com/bapi/defi/v1/public/wallet-direct/security/token/audit', {
          binanceChainId: chainId, contractAddress, requestId: crypto.randomUUID()
        }, { headers: { 'Content-Type': 'application/json' }, timeout: 10000 });
        const risk = auditRes.data?.data?.overallRisk || 'UNKNOWN';
        steps.audit = { risk, safe: ['LOW', 'MEDIUM'].includes(risk), data: auditRes.data?.data };
        if (!steps.audit.safe) {
          return res.json({ success: false, error: `Token audit: ${risk} risk — trade blocked`, code: 'AUDIT_FAILED', steps });
        }
      } catch (e) {
        steps.audit = { risk: 'UNKNOWN', safe: true, warning: 'Audit API unavailable, proceeding with caution' };
      }
    }

    // Step 2: Check Smart Money Signals
    try {
      const sigRes = await axios.post('https://web3.binance.com/bapi/defi/v1/public/wallet-direct/buw/wallet/web/signal/smart-money', {
        smartSignalType: '', page: 1, pageSize: 5, chainId
      }, { headers: { 'Content-Type': 'application/json', 'Accept-Encoding': 'identity' }, timeout: 8000 });
      const signals = sigRes.data?.data?.signalList || [];
      const tokenSignals = signals.filter(s => s.tokenSymbol?.toUpperCase() === symbol.replace(/USDT$/, '').toUpperCase());
      steps.signal = { found: tokenSignals.length, signals: tokenSignals.slice(0, 3), bullish: tokenSignals.some(s => s.signalType === 'BUY') };
    } catch (e) {
      steps.signal = { found: 0, signals: [], bullish: false, warning: 'Signal API unavailable' };
    }

    // Step 3: Place Order
    const params = { symbol: symbol.toUpperCase(), side: 'BUY', type: 'MARKET', quantity: String(quantity), timestamp: Date.now(), recvWindow: 5000 };
    const { data } = await binanceRequest('POST', '/order', params, req.binanceKeys);
    steps.order = data;

    logger.info(`Safe BUY completed: ${symbol}`, { orderId: data.orderId, audit: steps.audit?.risk, signals: steps.signal?.found });
    res.json({ success: true, steps });
  } catch (err) {
    logger.error(`Safe BUY error: ${err.response?.data?.msg || err.message}`);
    res.status(err.response?.status || 500).json({ success: false, error: err.response?.data?.msg || err.message, code: 'TRADE_ERROR' });
  }
});

module.exports = router;
