/**
 * Analysis Routes
 * One-command deep analysis pipeline: token, wallet, market.
 */

const express = require('express');
const router = express.Router();
const { analyzeToken, analyzeWallet, analyzeMarket } = require('../services/analyzer');
const { createError } = require('../middleware/errorHandler');

const VALID_CHAINS = ['solana', 'eth', 'bsc', 'base', 'arbitrum', 'polygon'];

// ─── POST /api/analyze/token ──────────────────────────────────────────────────

router.post('/token', async (req, res, next) => {
  try {
    const { query, chain = 'solana' } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      throw createError('Request body must include "query" (token symbol, name, or address)', 400, 'BAD_REQUEST');
    }

    if (chain && !VALID_CHAINS.includes(chain) && chain !== 'all') {
      throw createError(`Invalid chain "${chain}". Must be one of: ${VALID_CHAINS.join(', ')}, all`, 400, 'INVALID_CHAIN');
    }

    const report = await analyzeToken(query.trim(), chain);

    res.json({
      success: true,
      data: { report },
      meta: {
        source: 'multi',
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/analyze/wallet ─────────────────────────────────────────────────

router.post('/wallet', async (req, res, next) => {
  try {
    const { address, chain = 'solana' } = req.body;

    if (!address || typeof address !== 'string' || address.trim().length < 10) {
      throw createError('Request body must include "address" (wallet address, min 10 chars)', 400, 'BAD_REQUEST');
    }

    if (chain && !VALID_CHAINS.includes(chain)) {
      throw createError(`Invalid chain "${chain}". Must be one of: ${VALID_CHAINS.join(', ')}`, 400, 'INVALID_CHAIN');
    }

    const report = await analyzeWallet(address.trim(), chain);

    res.json({
      success: true,
      data: { report },
      meta: {
        source: 'multi',
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/analyze/market ─────────────────────────────────────────────────

router.post('/market', async (req, res, next) => {
  try {
    const report = await analyzeMarket();

    const response = {
      success: true,
      data: { report },
      meta: {
        source: 'multi',
        timestamp: new Date().toISOString()
      }
    };

    // Surface any internal errors as warnings (not failures — report still has data)
    if (report.errors && report.errors.length > 0) {
      response.warnings = report.errors;
    }

    res.json(response);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
