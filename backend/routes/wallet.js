/**
 * Wallet Watchlist & Portfolio Routes
 * Watchlist stored in backend/data/watchlist.json
 */

const express = require('express');
const router = express.Router();
const path = require('path');

const solana = require('../services/solana');
const dex = require('../services/dexscreener');
const { createError } = require('../middleware/errorHandler');
const { readJson, writeJson } = require('../utils/dataStore');
const { DEMO_MODE, MOCK_WALLET_PORTFOLIO } = require('../services/mockData');

const WATCHLIST_FILE = path.join(__dirname, '../data/watchlist.json');

// ─── Watchlist helpers ────────────────────────────────────────────────────────

function readWatchlist() {
  return readJson(WATCHLIST_FILE, []);
}

function writeWatchlist(data) {
  writeJson(WATCHLIST_FILE, data);
}

// ─── GET /api/wallet/watchlist ────────────────────────────────────────────────

router.get('/watchlist', (req, res) => {
  const watchlist = readWatchlist();
  res.json({
    success: true,
    count: watchlist.length,
    wallets: watchlist,
    meta: { timestamp: new Date().toISOString() }
  });
});

// ─── POST /api/wallet/watchlist ───────────────────────────────────────────────

router.post('/watchlist', (req, res, next) => {
  try {
    const { address, chain, label, notes } = req.body;
    if (!address || !chain) {
      throw createError('Fields "address" and "chain" are required', 400, 'BAD_REQUEST');
    }

    const watchlist = readWatchlist();

    // Check for duplicate
    const exists = watchlist.find(w => w.address.toLowerCase() === address.toLowerCase() && w.chain === chain);
    if (exists) {
      throw createError(`Wallet ${address} on ${chain} is already in watchlist`, 409, 'DUPLICATE');
    }

    const entry = {
      address,
      chain: chain.toLowerCase(),
      label: label || address.slice(0, 8) + '...',
      notes: notes || '',
      addedAt: new Date().toISOString()
    };

    watchlist.push(entry);
    writeWatchlist(watchlist);

    res.status(201).json({
      success: true,
      message: 'Wallet added to watchlist',
      wallet: entry,
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/wallet/watchlist/:address ────────────────────────────────────

router.delete('/watchlist/:address', (req, res, next) => {
  try {
    const { address } = req.params;
    const { chain } = req.query;

    let watchlist = readWatchlist();
    const before = watchlist.length;

    watchlist = watchlist.filter(w => {
      if (chain) {
        return !(w.address.toLowerCase() === address.toLowerCase() && w.chain === chain);
      }
      return w.address.toLowerCase() !== address.toLowerCase();
    });

    if (watchlist.length === before) {
      throw createError(`Wallet ${address} not found in watchlist`, 404, 'NOT_FOUND');
    }

    writeWatchlist(watchlist);
    res.json({
      success: true,
      message: 'Wallet removed from watchlist',
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/wallet/:chain/:address ─────────────────────────────────────────

router.get('/:chain/:address', async (req, res, next) => {
  try {
    const { chain, address } = req.params;

    // Demo mode: return mock portfolio
    if (DEMO_MODE) {
      return res.json({
        ...MOCK_WALLET_PORTFOLIO,
        chain,
        address,
        data: { ...MOCK_WALLET_PORTFOLIO.data, address, chain }
      });
    }

    if (chain.toLowerCase() === 'solana') {
      // Solana portfolio via RPC
      const warnings = [];
      let portfolio;
      try {
        portfolio = await solana.getPortfolio(address, async (mint) => {
          // Try to get price from DexScreener
          try {
            const pairs = await dex.getTokenPairs('solana', mint);
            if (pairs.length > 0 && pairs[0].priceUsd) {
              return parseFloat(pairs[0].priceUsd);
            }
          } catch (e) { /* best effort */ }
          return null;
        });
      } catch (err) {
        warnings.push(`Solana RPC error: ${err.message}`);
        portfolio = {
          address,
          chain: 'solana',
          nativeBalance: null,
          tokens: [],
          tokenCount: 0,
          updatedAt: new Date().toISOString()
        };
      }

      const response = {
        success: true,
        chain,
        address,
        data: portfolio,
        meta: { source: 'solana-rpc', timestamp: new Date().toISOString() }
      };
      if (warnings.length > 0) response.warnings = warnings;
      res.json(response);

    } else if (['ethereum', 'eth', 'bsc', 'base', 'arbitrum', 'polygon'].includes(chain.toLowerCase())) {
      res.json({
        success: true,
        chain,
        address,
        data: {
          address,
          chain,
          note: 'EVM portfolio requires block explorer API key (Etherscan/BSCscan). Configure in environment.',
          nativeBalance: null,
          tokens: [],
          tokenCount: 0,
          updatedAt: new Date().toISOString()
        },
        meta: { source: 'placeholder', timestamp: new Date().toISOString() }
      });
    } else {
      throw createError(`Unsupported chain: ${chain}`, 400, 'UNSUPPORTED_CHAIN');
    }
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/wallet/:chain/:address/trades ───────────────────────────────────

router.get('/:chain/:address/trades', async (req, res, next) => {
  try {
    const { chain, address } = req.params;
    const { limit = 20 } = req.query;
    const warnings = [];

    if (chain.toLowerCase() === 'solana') {
      let txs = [];
      try {
        txs = await solana.getRecentTransactions(address, parseInt(limit));
      } catch (err) {
        warnings.push(`Could not fetch transactions: ${err.message}`);
      }

      const response = {
        success: true,
        chain,
        address,
        count: txs.length,
        data: {
          trades: txs.map(tx => ({
            signature: tx.signature,
            timestamp: tx.timestamp,
            blockTime: tx.blockTime,
            status: tx.err ? 'failed' : 'success',
            memo: tx.memo,
            slot: tx.slot
          }))
        },
        meta: { source: 'solana-rpc', timestamp: new Date().toISOString() }
      };
      if (warnings.length > 0) response.warnings = warnings;
      res.json(response);
    } else {
      res.json({
        success: true,
        chain,
        address,
        count: 0,
        data: { trades: [] },
        warnings: ['EVM trade history requires block explorer API integration'],
        meta: { source: 'placeholder', timestamp: new Date().toISOString() }
      });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
