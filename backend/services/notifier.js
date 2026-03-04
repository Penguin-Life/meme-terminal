/**
 * Notifier Service
 * Sends notifications via Telegram Bot API and/or generic webhooks.
 *
 * Config (via environment variables):
 *   TELEGRAM_BOT_TOKEN  — Telegram bot token from @BotFather
 *   TELEGRAM_CHAT_ID    — Target chat/user ID to send messages to
 *   WEBHOOK_URL         — Optional generic webhook endpoint (POST)
 */

const axios = require('axios');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID   = process.env.TELEGRAM_CHAT_ID   || '';
const WEBHOOK_URL        = process.env.WEBHOOK_URL         || '';

// ─── Internal helpers ─────────────────────────────────────────────────────────

function isTelegramConfigured() {
  return Boolean(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID);
}

function isWebhookConfigured() {
  return Boolean(WEBHOOK_URL);
}

/**
 * Send a raw text message via Telegram Bot API.
 * Uses MarkdownV2 parse_mode for formatting.
 */
async function sendTelegram(text, parseMode = 'HTML') {
  if (!isTelegramConfigured()) {
    throw new Error('Telegram not configured. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID env vars.');
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const payload = {
    chat_id: TELEGRAM_CHAT_ID,
    text,
    parse_mode: parseMode,
    disable_web_page_preview: true
  };

  const { data } = await axios.post(url, payload, { timeout: 10_000 });
  return data;
}

/**
 * Send a payload to a generic webhook endpoint.
 */
async function sendWebhook(payload) {
  if (!isWebhookConfigured()) {
    throw new Error('Webhook not configured. Set WEBHOOK_URL env var.');
  }

  const { data } = await axios.post(WEBHOOK_URL, payload, {
    timeout: 10_000,
    headers: { 'Content-Type': 'application/json' }
  });
  return data;
}

// ─── Message Formatters ───────────────────────────────────────────────────────

/**
 * Format an alert trigger into a Telegram-ready message.
 * @param {Object} alert - Triggered alert object
 * @returns {string} HTML-formatted message
 */
function formatAlertMessage(alert) {
  const typeEmoji = {
    price_above: '📈',
    price_below: '📉',
    new_listing: '🆕',
    large_tx:    '💸',
    new_buy:     '🛒'
  }[alert.type] || '🔔';

  const chain = (alert.chain || 'unknown').toUpperCase();
  const label = alert.label || alert.type;
  const currentValue = alert.currentValue != null
    ? `<b>Current:</b> ${typeof alert.currentValue === 'number' && alert.currentValue < 0.001
        ? alert.currentValue.toExponential(4)
        : Number(alert.currentValue).toLocaleString()}`
    : '';

  return [
    `${typeEmoji} <b>Alert Triggered!</b>`,
    ``,
    `<b>${label}</b>`,
    `<b>Type:</b> ${alert.type}`,
    `<b>Chain:</b> ${chain}`,
    currentValue,
    alert.details ? `<b>Detail:</b> ${alert.details}` : '',
    alert.tokenInfo ? `<b>Token:</b> ${alert.tokenInfo.name} (${alert.tokenInfo.symbol})` : '',
    ``,
    `<i>🕐 ${new Date().toISOString()}</i>`
  ].filter(Boolean).join('\n');
}

/**
 * Format a token data object into a concise Telegram token report.
 * @param {Object} tokenData - Token info (from DexScreener or search result)
 * @returns {string} HTML-formatted token summary
 */
function formatTokenReport(tokenData) {
  const symbol  = tokenData.symbol || tokenData.baseToken?.symbol || '???';
  const name    = tokenData.name   || tokenData.baseToken?.name   || '';
  const price   = tokenData.priceUsd || tokenData.price || 'N/A';
  const chain   = (tokenData.chainId || tokenData.chain || 'unknown').toUpperCase();

  const change1h  = tokenData.priceChange?.h1  ?? tokenData.h1Change  ?? null;
  const change24h = tokenData.priceChange?.h24 ?? tokenData.h24Change ?? null;

  const vol24h = tokenData.volume?.h24  ?? tokenData.volume24h ?? null;
  const liq    = tokenData.liquidity?.usd ?? tokenData.liquidity ?? null;
  const fdv    = tokenData.fdv ?? null;

  const changeEmoji = (v) => v == null ? '' : v > 0 ? '📈' : '📉';
  const fmtChange   = (v) => v == null ? 'N/A' : `${v > 0 ? '+' : ''}${v.toFixed(2)}%`;
  const fmtUsd      = (v) => v == null ? 'N/A' : `$${Number(v).toLocaleString()}`;

  return [
    `🪙 <b>${symbol}</b>${name ? ` — ${name}` : ''} <code>[${chain}]</code>`,
    ``,
    `<b>Price:</b> $${price}`,
    change1h  != null ? `<b>1h:</b>  ${changeEmoji(change1h)} ${fmtChange(change1h)}`  : '',
    change24h != null ? `<b>24h:</b> ${changeEmoji(change24h)} ${fmtChange(change24h)}` : '',
    ``,
    vol24h != null ? `<b>Vol 24h:</b>  ${fmtUsd(vol24h)}` : '',
    liq    != null ? `<b>Liquidity:</b> ${fmtUsd(liq)}`   : '',
    fdv    != null ? `<b>FDV:</b>       ${fmtUsd(fdv)}`   : '',
    ``,
    `<i>🕐 ${new Date().toISOString()}</i>`
  ].filter(Boolean).join('\n');
}

/**
 * Format wallet activity into a Telegram-ready alert.
 * @param {Object} activity - Wallet activity object
 * @returns {string} HTML-formatted wallet alert
 */
function formatWalletActivity(activity) {
  const address = activity.address || 'unknown';
  const chain   = (activity.chain   || 'unknown').toUpperCase();
  const label   = activity.label   || `Wallet ${address.slice(0, 8)}...`;

  const shortAddr = `${address.slice(0, 6)}...${address.slice(-4)}`;

  const lines = [
    `👛 <b>Wallet Activity: ${label}</b>`,
    `<code>${shortAddr}</code> <b>[${chain}]</b>`,
    ``
  ];

  if (activity.recentTrades?.length > 0) {
    lines.push(`<b>Recent Trades:</b>`);
    for (const trade of activity.recentTrades.slice(0, 5)) {
      const side = trade.type === 'buy' ? '🟢 BUY' : '🔴 SELL';
      lines.push(`  ${side} ${trade.symbol} — ${trade.amountUsd ? `$${Number(trade.amountUsd).toLocaleString()}` : ''}`);
    }
    lines.push('');
  }

  if (activity.portfolioValue != null) {
    lines.push(`<b>Portfolio:</b> $${Number(activity.portfolioValue).toLocaleString()}`);
  }

  if (activity.pnl != null) {
    const pnlEmoji = activity.pnl >= 0 ? '📈' : '📉';
    lines.push(`<b>PnL:</b> ${pnlEmoji} $${Number(Math.abs(activity.pnl)).toLocaleString()}`);
  }

  lines.push('');
  lines.push(`<i>🕐 ${new Date().toISOString()}</i>`);

  return lines.filter(Boolean).join('\n');
}

// ─── Main send function ───────────────────────────────────────────────────────

/**
 * Send a notification. Tries Telegram first, falls back to webhook if configured.
 * @param {string} text - Formatted text message
 * @param {Object} rawData - Optional raw data for webhook payload
 * @returns {Object} { telegram: result|null, webhook: result|null }
 */
async function send(text, rawData = {}) {
  const results = { telegram: null, webhook: null, errors: [] };

  if (isTelegramConfigured()) {
    try {
      results.telegram = await sendTelegram(text);
    } catch (err) {
      results.errors.push(`Telegram error: ${err.message}`);
    }
  }

  if (isWebhookConfigured()) {
    try {
      results.webhook = await sendWebhook({ text, data: rawData, timestamp: new Date().toISOString() });
    } catch (err) {
      results.errors.push(`Webhook error: ${err.message}`);
    }
  }

  return results;
}

// ─── Status ───────────────────────────────────────────────────────────────────

function getStatus() {
  return {
    telegram: {
      configured: isTelegramConfigured(),
      botTokenSet: Boolean(TELEGRAM_BOT_TOKEN),
      chatIdSet:   Boolean(TELEGRAM_CHAT_ID)
    },
    webhook: {
      configured: isWebhookConfigured(),
      url: WEBHOOK_URL ? `${WEBHOOK_URL.slice(0, 30)}...` : null
    }
  };
}

module.exports = {
  send,
  sendTelegram,
  sendWebhook,
  formatAlertMessage,
  formatTokenReport,
  formatWalletActivity,
  getStatus,
  isTelegramConfigured,
  isWebhookConfigured
};
