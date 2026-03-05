/**
 * Alert Rules Routes
 * CRUD for alert rules + manual check trigger
 */

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { createError } = require('../middleware/errorHandler');
const { checkAlerts, readAlerts, writeAlerts } = require('../services/alertEngine');
const { DEMO_MODE, MOCK_ALERT_CHECK } = require('../services/mockData');

const VALID_TYPES = ['price_above', 'price_below', 'new_buy', 'large_tx', 'new_listing'];
const VALID_CHAINS = ['solana', 'eth', 'bsc', 'base', 'arbitrum', 'polygon'];

// ─── GET /api/alerts/check — manually trigger alert check ─────────────────────
// NOTE: Must be defined BEFORE /:id to avoid conflict

router.get('/check', async (req, res, next) => {
  try {
    // Demo mode: return mock alert check results
    if (DEMO_MODE) return res.json(MOCK_ALERT_CHECK);

    const result = await checkAlerts();
    res.json({
      success: true,
      data: result,
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/alerts ──────────────────────────────────────────────────────────

router.get('/', (req, res) => {
  const alerts = readAlerts();
  res.json({
    success: true,
    count: alerts.length,
    alerts,
    meta: { timestamp: new Date().toISOString() }
  });
});

// ─── POST /api/alerts ─────────────────────────────────────────────────────────

router.post('/', (req, res, next) => {
  try {
    const { type, target, chain, threshold, label, enabled = true, notifyOnTrigger = true } = req.body;

    if (!type || !target || !chain) {
      throw createError('Fields "type", "target", and "chain" are required', 400, 'BAD_REQUEST');
    }
    if (!VALID_TYPES.includes(type)) {
      throw createError(`Invalid alert type. Must be one of: ${VALID_TYPES.join(', ')}`, 400, 'INVALID_TYPE');
    }
    if (!VALID_CHAINS.includes(chain)) {
      throw createError(`Invalid chain. Must be one of: ${VALID_CHAINS.join(', ')}`, 400, 'INVALID_CHAIN');
    }
    if (['price_above', 'price_below', 'large_tx', 'new_buy'].includes(type) && threshold == null) {
      throw createError(`Alert type "${type}" requires a "threshold" value`, 400, 'MISSING_THRESHOLD');
    }

    const alerts = readAlerts();
    const alert = {
      id: uuidv4(),
      type,
      target,
      chain,
      threshold: threshold !== undefined ? parseFloat(threshold) : null,
      label: label || `${type} on ${target.slice(0, 8)}...`,
      enabled: Boolean(enabled),
      notifyOnTrigger: Boolean(notifyOnTrigger),
      createdAt: new Date().toISOString(),
      lastTriggeredAt: null,
      lastTriggerDetails: null
    };

    alerts.push(alert);
    writeAlerts(alerts);

    res.status(201).json({
      success: true,
      message: 'Alert created',
      alert,
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

// ─── PATCH /api/alerts/:id ────────────────────────────────────────────────────

router.patch('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const alerts = readAlerts();
    const idx = alerts.findIndex(a => a.id === id);
    if (idx === -1) {
      throw createError(`Alert ${id} not found`, 404, 'NOT_FOUND');
    }

    // Only allow updating specific fields
    const allowed = ['label', 'enabled', 'threshold', 'type', 'target', 'chain'];
    const patch = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) patch[key] = updates[key];
    }

    if (patch.type && !VALID_TYPES.includes(patch.type)) {
      throw createError(`Invalid alert type: ${patch.type}`, 400, 'INVALID_TYPE');
    }
    if (patch.chain && !VALID_CHAINS.includes(patch.chain)) {
      throw createError(`Invalid chain: ${patch.chain}`, 400, 'INVALID_CHAIN');
    }

    alerts[idx] = { ...alerts[idx], ...patch, updatedAt: new Date().toISOString() };
    writeAlerts(alerts);

    res.json({
      success: true,
      message: 'Alert updated',
      alert: alerts[idx],
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/alerts/:id ───────────────────────────────────────────────────

router.delete('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    let alerts = readAlerts();
    const before = alerts.length;
    alerts = alerts.filter(a => a.id !== id);

    if (alerts.length === before) {
      throw createError(`Alert ${id} not found`, 404, 'NOT_FOUND');
    }

    writeAlerts(alerts);
    res.json({
      success: true,
      message: 'Alert deleted',
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
