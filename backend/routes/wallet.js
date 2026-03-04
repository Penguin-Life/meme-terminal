/**
 * Wallet Watchlist & Portfolio Routes
 * Watchlist stored in backend/data/watchlist.json
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const solana = require('../services/solana');
const dex = require('../services/dexscreener');
const { createError } = require('../middleware/errorHandler');

const WATCHLIST_FILE = path.join(__dirname, '../data/watchlist.json');

// ─── Watchlist helpers ────────────────────────────────────────────────────────

function readWatchlist() {
  try {
    const raw = fs.readFileSync(WATCHLIST_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeWatchlist(data) {
  fs.writeFileSync(WATCHLIST_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ─── GET /api/wallet/watchlist ────────────────────────────────────────────────

router.get('/watchlist', (req, res) => {
  const watchlist = readWatchlist();
  res.json({
    success: true,
    count: watchlist.length,
    wallets: watchlist
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
      wallet: entry
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
    res.json({ success: true, message: 'Wallet removed from watchlist' });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/wallet/:chain/:address ─────────────────────────────────────────

router.get('/:chain/:address', async (req, res, next) => {
  try {
    const { chain, address } = req.params;

    if (chain.toLowerCase() === 'solana') {
      // Solana portfolio via RPC
      const portfolio = await solana.getPortfolio(address, async (mint) => {
        // Try to get price from DexScreener
        try {
          const pairs = await dex.getTokenPairs('solana', mint);
          if (pairs.length > 0 && pairs[0].priceUsd) {
            return parseFloat(pairs[0].priceUsd);
          }
        } catch (e) { /* best effort */ }
        return null;
      });

      res.json({
        success: true,
        chain,
        address,
        portfolio
      });
    } else if (['ethereum', 'eth', 'bsc', 'base', 'arbitrum', 'polygon'].includes(chain.toLowerCase())) {
      // EVM portfolio — use DexScreener for recent activity
      // For now, return a placeholder with instructions
      // Production: use Etherscan/BSCscan/BaseScan API or Moralis
      res.json({
        success: true,
        chain,
        address,
        portfolio: {
          address,
          chain,
          note: 'EVM portfolio requires block explorer API key (Etherscan/BSCscan). Configure in environment.',
          nativeBalance: null,
          tokens: [],
          tokenCount: 0,
          updatedAt: new Date().toISOString()
        }
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

    if (chain.toLowerCase() === 'solana') {
      const txs = await solana.getRecentTransactions(address, parseInt(limit));
      res.json({
        success: true,
        chain,
        address,
        count: txs.length,
        trades: txs.map(tx => ({
          signature: tx.signature,
          timestamp: tx.timestamp,
          blockTime: tx.blockTime,
          status: tx.err ? 'failed' : 'success',
          memo: tx.memo,
          slot: tx.slot
        }))
      });
    } else {
      res.json({
        success: true,
        chain,
        address,
        count: 0,
        note: 'EVM trade history requires block explorer API integration',
        trades: []
      });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
