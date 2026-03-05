/**
 * Alert Engine
 * Evaluates alert rules against live market data.
 * Called on-demand (GET /api/alerts/check) or via external cron.
 */

const dex = require('./dexscreener');
const pumpfun = require('./pumpfun');
const path = require('path');
const { readJson, writeJson } = require('../utils/dataStore');

// Lazy-load notifier to avoid circular deps
let _notifier = null;
/** Lazy-load notifier to avoid circular dependency issues */
function getNotifier() {
  if (!_notifier) _notifier = require('./notifier');
  return _notifier;
}

const ALERTS_FILE = path.join(__dirname, '../data/alerts.json');

/**
 * Read all alert rules from persistent JSON storage.
 * @returns {Array} Array of alert rule objects
 */
function readAlerts() {
  return readJson(ALERTS_FILE, []);
}

/**
 * Persist alert rules to JSON storage.
 * @param {Array} alerts - Array of alert rule objects to save
 */
function writeAlerts(alerts) {
  writeJson(ALERTS_FILE, alerts);
}

/**
 * Fetch current price for a token (returns USD price or null)
 */
async function fetchTokenPrice(chain, address) {
  try {
    const pairs = await dex.getTokenPairs(chain, address);
    if (pairs.length > 0 && pairs[0].priceUsd) {
      return parseFloat(pairs[0].priceUsd);
    }
  } catch (e) { /* skip */ }
  return null;
}

/**
 * Check a single alert rule against live data.
 * Returns { triggered: true/false, details: {...} }
 */
async function checkAlertRule(alert) {
  const { type, target, chain, threshold } = alert;

  try {
    switch (type) {
      case 'price_above': {
        const price = await fetchTokenPrice(chain, target);
        if (price === null) return { triggered: false, reason: 'price unavailable' };
        if (price > threshold) {
          return {
            triggered: true,
            currentValue: price,
            details: `Price $${price.toFixed(6)} is above threshold $${threshold}`
          };
        }
        return { triggered: false, currentValue: price };
      }

      case 'price_below': {
        const price = await fetchTokenPrice(chain, target);
        if (price === null) return { triggered: false, reason: 'price unavailable' };
        if (price < threshold) {
          return {
            triggered: true,
            currentValue: price,
            details: `Price $${price.toFixed(6)} is below threshold $${threshold}`
          };
        }
        return { triggered: false, currentValue: price };
      }

      case 'new_listing': {
        // Check if a new token matching target (by symbol or partial name) appeared recently
        if (chain === 'solana') {
          const newCoins = await pumpfun.getNewCoins({ limit: 50 });
          const match = newCoins.find(c =>
            c.symbol?.toLowerCase().includes(target.toLowerCase()) ||
            c.name?.toLowerCase().includes(target.toLowerCase())
          );
          if (match) {
            return {
              triggered: true,
              currentValue: match.usd_market_cap,
              details: `New listing found: ${match.name} (${match.symbol}) — MC: $${match.usd_market_cap?.toFixed(0)}`,
              tokenInfo: {
                name: match.name,
                symbol: match.symbol,
                mint: match.mint,
                marketCap: match.usd_market_cap
              }
            };
          }
        }
        return { triggered: false };
      }

      case 'large_tx': {
        // Volume spike — check if 1h volume exceeds threshold (in USD)
        const pairs = await dex.getTokenPairs(chain, target);
        if (pairs.length === 0) return { triggered: false, reason: 'pairs unavailable' };
        const vol1h = pairs[0].volume?.h1 || 0;
        if (vol1h > threshold) {
          return {
            triggered: true,
            currentValue: vol1h,
            details: `1h volume $${vol1h.toLocaleString()} exceeds threshold $${threshold.toLocaleString()}`
          };
        }
        return { triggered: false, currentValue: vol1h };
      }

      case 'new_buy': {
        // Buy count in last hour exceeds threshold
        const pairs = await dex.getTokenPairs(chain, target);
        if (pairs.length === 0) return { triggered: false, reason: 'pairs unavailable' };
        const buys1h = pairs[0].txns?.h1?.buys || 0;
        if (buys1h > threshold) {
          return {
            triggered: true,
            currentValue: buys1h,
            details: `1h buy transactions (${buys1h}) exceeds threshold ${threshold}`
          };
        }
        return { triggered: false, currentValue: buys1h };
      }

      default:
        return { triggered: false, reason: `Unknown alert type: ${type}` };
    }
  } catch (err) {
    return { triggered: false, error: err.message };
  }
}

/**
 * Main alert check function — iterate all enabled alerts, return triggered ones.
 * @returns {Array} triggered alerts with details
 */
async function checkAlerts() {
  const alerts = readAlerts();
  const enabled = alerts.filter(a => a.enabled !== false);

  const results = await Promise.all(
    enabled.map(async (alert) => {
      const check = await checkAlertRule(alert);
      return {
        alert,
        ...check,
        checkedAt: new Date().toISOString()
      };
    })
  );

  const triggered = results.filter(r => r.triggered);

  // Mark triggered alerts with lastTriggeredAt
  if (triggered.length > 0) {
    const updatedAlerts = alerts.map(a => {
      const t = triggered.find(r => r.alert.id === a.id);
      if (t) {
        return { ...a, lastTriggeredAt: t.checkedAt, lastTriggerDetails: t.details };
      }
      return a;
    });
    writeAlerts(updatedAlerts);

    // Send Telegram notifications for alerts with notifyOnTrigger: true
    const notifier = getNotifier();
    if (notifier.isTelegramConfigured() || notifier.isWebhookConfigured()) {
      for (const r of triggered) {
        const alertRule = alerts.find(a => a.id === r.alert.id);
        if (alertRule?.notifyOnTrigger !== false) {
          // Fire-and-forget — don't block the response
          const notifyPayload = {
            ...r.alert,
            currentValue: r.currentValue,
            details: r.details,
            tokenInfo: r.tokenInfo || null
          };
          notifier.send(notifier.formatAlertMessage(notifyPayload), { type: 'alert_trigger', alert: notifyPayload })
            .catch(err => console.error(`[alertEngine] Notification error for alert ${r.alert.id}:`, err.message));
        }
      }
    }
  }

  return {
    checkedAt: new Date().toISOString(),
    total: enabled.length,
    triggered: triggered.map(r => ({
      id: r.alert.id,
      label: r.alert.label,
      type: r.alert.type,
      target: r.alert.target,
      chain: r.alert.chain,
      threshold: r.alert.threshold,
      currentValue: r.currentValue,
      details: r.details,
      tokenInfo: r.tokenInfo || null,
      triggeredAt: r.checkedAt
    }))
  };
}

module.exports = { checkAlerts, checkAlertRule, readAlerts, writeAlerts };
