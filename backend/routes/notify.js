/**
 * Notification Routes
 * Push token reports, alerts, and test messages to Telegram / webhooks.
 */

const express = require('express');
const router = express.Router();
const notifier = require('../services/notifier');
const { createError } = require('../middleware/errorHandler');

// ─── GET /api/notify/status ───────────────────────────────────────────────────

router.get('/status', (req, res) => {
  const status = notifier.getStatus();
  res.json({
    success: true,
    data: {
      notification: status,
      anyConfigured: status.telegram.configured || status.webhook.configured
    },
    meta: { timestamp: new Date().toISOString() }
  });
});

// ─── POST /api/notify/test ────────────────────────────────────────────────────

router.post('/test', async (req, res, next) => {
  try {
    const status = notifier.getStatus();
    if (!status.telegram.configured && !status.webhook.configured) {
      throw createError(
        'No notification channels configured. Set TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID or WEBHOOK_URL.',
        503,
        'NOT_CONFIGURED'
      );
    }

    const text = [
      `🐧 <b>Meme Terminal — Test Notification</b>`,
      ``,
      `If you're reading this, notifications are working!`,
      ``,
      `<b>Channels active:</b>`,
      status.telegram.configured ? `✅ Telegram` : `❌ Telegram (not configured)`,
      status.webhook.configured  ? `✅ Webhook`  : `❌ Webhook (not configured)`,
      ``,
      `<i>🕐 ${new Date().toISOString()}</i>`
    ].join('\n');

    const result = await notifier.send(text, { type: 'test' });

    res.json({
      success: true,
      message: 'Test notification sent',
      data: { result },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/notify/token-report ───────────────────────────────────────────

router.post('/token-report', async (req, res, next) => {
  try {
    const { tokenData } = req.body;
    if (!tokenData) {
      throw createError('Request body must include "tokenData"', 400, 'BAD_REQUEST');
    }

    const status = notifier.getStatus();
    if (!status.telegram.configured && !status.webhook.configured) {
      throw createError(
        'No notification channels configured.',
        503,
        'NOT_CONFIGURED'
      );
    }

    const text = notifier.formatTokenReport(tokenData);
    const result = await notifier.send(text, { type: 'token_report', tokenData });

    res.json({
      success: true,
      message: 'Token report sent',
      data: { formatted: text, result },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/notify/alert ───────────────────────────────────────────────────

router.post('/alert', async (req, res, next) => {
  try {
    const { alert } = req.body;
    if (!alert) {
      throw createError('Request body must include "alert"', 400, 'BAD_REQUEST');
    }

    const status = notifier.getStatus();
    if (!status.telegram.configured && !status.webhook.configured) {
      throw createError(
        'No notification channels configured.',
        503,
        'NOT_CONFIGURED'
      );
    }

    const text = notifier.formatAlertMessage(alert);
    const result = await notifier.send(text, { type: 'alert', alert });

    res.json({
      success: true,
      message: 'Alert notification sent',
      data: { formatted: text, result },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
