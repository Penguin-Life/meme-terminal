/**
 * Analysis Routes
 * One-command deep analysis pipeline: token, wallet, market.
 */

const express = require('express');
const router = express.Router();
const { analyzeToken, analyzeWallet, analyzeMarket } = require('../services/analyzer');
const { createError } = require('../middleware/errorHandler');
const { DEMO_MODE, MOCK_TOKEN_ANALYSIS } = require('../services/mockData');

const VALID_CHAINS = ['solana', 'eth', 'bsc', 'base', 'arbitrum', 'polygon'];

// ─── POST /api/analyze/token ──────────────────────────────────────────────────

router.post('/token', async (req, res, next) => {
  try {
    const { query, chain = 'solana', address } = req.body;

    // Demo mode: return mock analysis with audit data for TokenDetail
    // (accept address field from TokenDetail page which sends {chain, address})
    if (DEMO_MODE) {
      const sec = MOCK_TOKEN_ANALYSIS.data.report.security || {};
      return res.json({
        success: true,
        data: {
          report: { ...MOCK_TOKEN_ANALYSIS.data.report, query: query ? query.trim() : (address || ''), chain },
          // Flat audit fields for TokenDetail page compatibility
          overallRisk: sec.isHoneypot ? 'CRITICAL' : sec.topHolderPct > 20 ? 'MEDIUM' : 'LOW',
          tokenInfo: {
            mintAuthority: sec.mintAuthority,
            freezeAuthority: sec.freezeAuthority,
            topHolderPercent: sec.topHolderPct,
          },
          scamDetection: { isHoneypot: sec.isHoneypot || false },
          verdict: MOCK_TOKEN_ANALYSIS.data.report.aiSummary,
        },
        meta: { source: 'demo', timestamp: new Date().toISOString(), demo: true }
      });
    }

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
